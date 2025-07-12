
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { p_user_id, p_amount, p_transaction_type, p_source, p_description, p_reference_id } = await req.json()

    // Get current user tokens or create if doesn't exist
    let { data: userTokens, error: fetchError } = await supabaseClient
      .from('user_tokens')
      .select('*')
      .eq('user_id', p_user_id)
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      // Create new user tokens record
      const { data: newTokens, error: insertError } = await supabaseClient
        .from('user_tokens')
        .insert({
          user_id: p_user_id,
          balance: 0,
          total_earned: 0,
          total_spent: 0
        })
        .select()
        .single()

      if (insertError) throw insertError
      userTokens = newTokens
    } else if (fetchError) {
      throw fetchError
    }

    // Calculate new balances
    let newBalance = userTokens.balance
    let newTotalEarned = userTokens.total_earned
    let newTotalSpent = userTokens.total_spent

    if (p_transaction_type === 'earn') {
      newBalance += p_amount
      newTotalEarned += p_amount
    } else if (p_transaction_type === 'spend' || p_transaction_type === 'stake') {
      newBalance -= p_amount
      newTotalSpent += p_amount
    }

    // Update user tokens
    const { error: updateError } = await supabaseClient
      .from('user_tokens')
      .update({
        balance: newBalance,
        total_earned: newTotalEarned,
        total_spent: newTotalSpent
      })
      .eq('user_id', p_user_id)

    if (updateError) throw updateError

    // Create transaction record
    const { error: transactionError } = await supabaseClient
      .from('token_transactions')
      .insert({
        user_id: p_user_id,
        transaction_type: p_transaction_type,
        amount: p_amount,
        source: p_source,
        description: p_description,
        reference_id: p_reference_id
      })

    if (transactionError) throw transactionError

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

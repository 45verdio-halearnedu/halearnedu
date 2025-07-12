
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { phone_number, amount, account_reference = 'Payment', transaction_desc = 'Payment' } = await req.json()

    // Get M-Pesa credentials from Supabase secrets
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')
    
    if (!consumerKey || !consumerSecret) {
      throw new Error('M-Pesa credentials not configured')
    }

    // Get access token
    const auth = btoa(`${consumerKey}:${consumerSecret}`)
    const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    })

    const tokenData = await tokenResponse.json()
    if (!tokenData.access_token) {
      throw new Error('Failed to get M-Pesa access token')
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization')
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    )

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Initiate STK Push
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)
    const shortcode = '174379' // Sandbox shortcode
    const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919' // Sandbox passkey
    const password = btoa(`${shortcode}${passkey}${timestamp}`)

    const stkPushPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone_number,
      PartyB: shortcode,
      PhoneNumber: phone_number,
      CallBackURL: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-callback`,
      AccountReference: account_reference,
      TransactionDesc: transaction_desc,
    }

    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPushPayload),
    })

    const stkData = await stkResponse.json()

    if (stkData.ResponseCode === '0') {
      // Store transaction in database
      const { data: transactionData, error: dbError } = await supabase
        .from('mpesa_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'stk_push',
          amount: amount,
          phone_number: phone_number,
          merchant_request_id: stkData.MerchantRequestID,
          checkout_request_id: stkData.CheckoutRequestID,
          status: 'pending'
        })
        .select()
        .single()

      if (dbError) {
        throw new Error('Failed to store transaction')
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'STK Push sent successfully. Please complete payment on your phone.',
        transaction_id: transactionData.id,
        checkout_request_id: stkData.CheckoutRequestID
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      throw new Error(stkData.errorMessage || 'STK Push failed')
    }

  } catch (error) {
    console.error('M-Pesa STK Push error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

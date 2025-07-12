
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

    const callbackData = await req.json()
    console.log('M-Pesa callback received:', callbackData)

    const stkCallback = callbackData.Body?.stkCallback
    if (!stkCallback) {
      throw new Error('Invalid callback format')
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = stkCallback
    let mpesaReceiptNumber = null

    // Extract M-Pesa receipt number if payment was successful
    if (ResultCode === 0 && stkCallback.CallbackMetadata?.Item) {
      const receiptItem = stkCallback.CallbackMetadata.Item.find(
        (item: any) => item.Name === 'MpesaReceiptNumber'
      )
      mpesaReceiptNumber = receiptItem?.Value || null
    }

    // Find the transaction using merchant_request_id or checkout_request_id
    const { data: transaction, error: findError } = await supabase
      .from('mpesa_transactions')
      .select('*')
      .or(`merchant_request_id.eq.${MerchantRequestID},checkout_request_id.eq.${CheckoutRequestID}`)
      .single()

    if (findError || !transaction) {
      console.error('Transaction not found:', findError)
      throw new Error('Transaction not found')
    }

    // Process the callback using the existing function
    const { data: result, error: callbackError } = await supabase.rpc('process_mpesa_callback', {
      p_transaction_id: transaction.id,
      p_result_code: ResultCode,
      p_result_desc: ResultDesc,
      p_mpesa_receipt_number: mpesaReceiptNumber,
      p_callback_data: callbackData
    })

    if (callbackError) {
      throw new Error('Failed to process callback')
    }

    console.log('Callback processed successfully:', result)

    return new Response(JSON.stringify({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('M-Pesa callback error:', error)
    return new Response(JSON.stringify({
      ResultCode: 1,
      ResultDesc: error.message
    }), {
      status: 200, // M-Pesa expects 200 even for errors
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

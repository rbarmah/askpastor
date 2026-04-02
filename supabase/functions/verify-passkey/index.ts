import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { passkey } = await req.json()

    if (!passkey || typeof passkey !== 'string') {
      return new Response(
        JSON.stringify({ valid: false, error: 'Passkey is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const validPasskeys = (Deno.env.get('PASTOR_PASSKEYS') ?? '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)

    if (validPasskeys.length === 0) {
      console.error('PASTOR_PASSKEYS environment variable is not set or empty')
      return new Response(
        JSON.stringify({ valid: false, error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const isValid = validPasskeys.includes(passkey)

    return new Response(
      JSON.stringify({ valid: isValid }),
      {
        status: isValid ? 200 : 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in verify-passkey function:', error)
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

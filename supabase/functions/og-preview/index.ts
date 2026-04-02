import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const url = new URL(req.url)
  const q = url.searchParams.get('q')

  const fallbackUrl = 'https://ask.pastorstefan.org'

  if (!q) {
    return new Response(`<meta http-equiv="refresh" content="0; url=${fallbackUrl}" />`, {
      headers: { 'Content-Type': 'text/html' }
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: question, error } = await supabaseClient
      .from('questions')
      .select('text')
      .eq('id', q)
      .single()

    if (error || !question) {
      return new Response(`<meta http-equiv="refresh" content="0; url=${fallbackUrl}/?page=questions&q=${q}" />`, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    const cleanText = question.text.replace(/<[^>]*>?/gm, ''); // strip html tags
    const questionPreview = cleanText.substring(0, 150).replace(/"/g, '&quot;') + (cleanText.length > 150 ? '...' : '')
    const targetUrl = `${fallbackUrl}/?page=questions&q=${q}`

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>A question on Ask Pastor Stefan</title>
  <meta property="og:title" content="A question on Ask Pastor Stefan" />
  <meta property="og:description" content="${questionPreview}" />
  <meta property="og:url" content="${targetUrl}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="A question on Ask Pastor Stefan" />
  <meta name="twitter:description" content="${questionPreview}" />
  <meta http-equiv="refresh" content="0; url=${targetUrl}" />
</head>
<body>
  <script>window.location.replace("${targetUrl}");</script>
  <p>Redirecting to question...</p>
</body>
</html>
    `

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  } catch (err) {
    return new Response(`<meta http-equiv="refresh" content="0; url=${fallbackUrl}/?page=questions&q=${q}" />`, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
})

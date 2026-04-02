import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export default async (request: Request) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  
  const fallbackUrl = "https://ask.pastorstefan.org";

  if (!q) {
    return new Response(`<meta http-equiv="refresh" content="0; url=${fallbackUrl}" />`, {
      headers: { "content-type": "text/html" },
    });
  }

  // Use the Netlify environment variables that power the Vite app
  const supabaseUrl = Netlify.env.get("VITE_SUPABASE_URL");
  const supabaseKey = Netlify.env.get("VITE_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseKey) {
     const targetUrl = `${fallbackUrl}/?page=questions&q=${q}`;
     return new Response(`<meta http-equiv="refresh" content="0; url=${targetUrl}" />`, {
      headers: { "content-type": "text/html" },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: question, error } = await supabase
      .from("questions")
      .select("text")
      .eq("id", q)
      .single();

    if (error || !question) throw new Error("Not found");

    const cleanText = question.text.replace(/<[^>]*>?/gm, '');
    const questionPreview = cleanText.substring(0, 150).replace(/"/g, '&quot;') + (cleanText.length > 150 ? '...' : '');
    const targetUrl = `${fallbackUrl}/?page=questions&q=${q}`;

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
    `;

    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    const targetUrl = `${fallbackUrl}/?page=questions&q=${q}`;
    return new Response(`<meta http-equiv="refresh" content="0; url=${targetUrl}" />`, {
      headers: { "content-type": "text/html" },
    });
  }
};

export const config = { path: "/share" };

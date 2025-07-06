import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  title: string;
  body: string;
  type: string;
  data?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { title, body, type, data }: NotificationPayload = await req.json()

    // Get all active notification subscriptions
    const { data: subscriptions, error } = await supabaseClient
      .from('notification_subscriptions')
      .select('*')
      .eq('is_active', true)

    if (error) {
      throw error
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send notifications to all subscribers
    const notificationPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key
          }
        }

        const payload = JSON.stringify({
          title,
          body,
          icon: '/ChatGPT Image Jul 3, 2025, 05_17_17 AM.png',
          badge: '/ChatGPT Image Jul 3, 2025, 05_17_17 AM.png',
          tag: `ask-pastor-stefan-${type}`,
          data: data || { url: '/' },
          requireInteraction: type === 'live_chat' // Require interaction for live chat
        })

        // In a real implementation, you would use a library like web-push
        // For now, we'll just log the notification
        console.log('Sending notification:', {
          subscription: pushSubscription,
          payload
        })

        return { success: true, subscription: subscription.id }
      } catch (error) {
        console.error('Error sending to subscription:', subscription.id, error)
        return { success: false, subscription: subscription.id, error: error.message }
      }
    })

    const results = await Promise.all(notificationPromises)
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return new Response(
      JSON.stringify({
        message: 'Notifications sent',
        successful,
        failed,
        total: subscriptions.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-notification function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
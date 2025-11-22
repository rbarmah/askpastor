import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailNotificationPayload {
  type: 'question_answered' | 'new_blog_post' | 'new_story';
  questionId?: string;
  questionText?: string;
  answerText?: string;
  blogTitle?: string;
  storyTitle?: string;
  authorName?: string;
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

    const payload: EmailNotificationPayload = await req.json()
    console.log('Email notification payload:', payload)

    // Get all active email subscribers for the notification type
    const { data: subscriptions, error } = await supabaseClient
      .from('email_notification_subscriptions')
      .select('*')
      .eq('is_active', true)
      .contains('notification_types', [payload.type])

    if (error) {
      console.error('Error fetching subscriptions:', error)
      throw error
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active subscriptions found for type:', payload.type)
      return new Response(
        JSON.stringify({ message: 'No active subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${subscriptions.length} subscribers`)

    // Prepare email content based on notification type
    let subject = ''
    let htmlContent = ''
    let textContent = ''

    switch (payload.type) {
      case 'question_answered':
        subject = '✨ Pastor Stefan answered a question!'
        const questionPreview = payload.questionText?.substring(0, 100) + (payload.questionText && payload.questionText.length > 100 ? '...' : '')
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 16px; margin-bottom: 20px;">
              <h1 style="color: #1e293b; font-size: 24px; margin: 0 0 10px 0; font-weight: 300;">Pastor Stefan answered a question!</h1>
              <p style="color: #64748b; margin: 0; font-size: 16px;">Someone asked a question and Pastor Stefan provided a thoughtful answer.</p>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
              <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">Question:</h3>
              <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0; font-style: italic;">"${questionPreview}"</p>
              
              <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">Pastor Stefan's Answer:</h3>
              <p style="color: #475569; line-height: 1.6; margin: 0;">${payload.answerText?.substring(0, 200)}${payload.answerText && payload.answerText.length > 200 ? '...' : ''}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SITE_URL') || 'https://ask-pastor-stefan.netlify.app'}/questions" 
                 style="background: #1e293b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; display: inline-block;">
                Read Full Answer
              </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 10px 0;">
                You're receiving this because you subscribed to notifications from Ask Pastor Stefan.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                <a href="${Deno.env.get('SITE_URL') || 'https://ask-pastor-stefan.netlify.app'}" style="color: #64748b;">Visit Ask Pastor Stefan</a> | 
                <a href="${Deno.env.get('SITE_URL') || 'https://ask-pastor-stefan.netlify.app'}/unsubscribe" style="color: #64748b;">Unsubscribe</a>
              </p>
            </div>
          </div>
        `
        textContent = `Pastor Stefan answered a question!\n\nQuestion: "${questionPreview}"\n\nAnswer: ${payload.answerText?.substring(0, 200)}${payload.answerText && payload.answerText.length > 200 ? '...' : ''}\n\nRead the full answer at: ${Deno.env.get('SITE_URL') || 'https://ask-pastor-stefan.netlify.app'}/questions`
        break

      default:
        subject = 'New update from Ask Pastor Stefan'
        htmlContent = '<p>There\'s a new update on Ask Pastor Stefan!</p>'
        textContent = 'There\'s a new update on Ask Pastor Stefan!'
    }

    // Send emails using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    const emailPromises = subscriptions.map(async (subscription) => {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Pastor Stefan <notifications@askpastorstefan.com>',
            to: [subscription.email],
            subject: subject,
            html: htmlContent,
            text: textContent,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Resend API error: ${response.status} - ${errorText}`)
        }

        const result = await response.json()
        console.log(`Email sent successfully to ${subscription.email}:`, result.id)
        
        return { 
          success: true, 
          email: subscription.email, 
          messageId: result.id 
        }
      } catch (error) {
        console.error(`Error sending email to ${subscription.email}:`, error)
        return { 
          success: false, 
          email: subscription.email, 
          error: error.message 
        }
      }
    })

    const results = await Promise.all(emailPromises)
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    console.log(`Email notification results: ${successful} successful, ${failed} failed`)

    return new Response(
      JSON.stringify({
        message: 'Email notifications sent',
        successful,
        failed,
        total: subscriptions.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-email-notification function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
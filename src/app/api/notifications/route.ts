import { NextResponse } from 'next/server'
import { Resend } from 'resend'
// import { createServerSideClient } from '@/lib/supabase.server'
import { createServerSideClient, createAdminClient } from '@/lib/supabase.server'

const resend = new Resend(process.env.RESEND_API_KEY)

// This route checks all active bursaries and sends deadline
// reminder emails to students who have saved them
// In production this would be triggered by a cron job
// For now we can trigger it manually or via a button
export async function POST() {
    
  console.log('Notifications route hit')
  console.log('RESEND KEY exists:', !!process.env.RESEND_API_KEY)
  console.log('SERVICE ROLE KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('SUPABASE URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  
  try {
    //const supabase = await createServerSideClient()
         const supabase = createAdminClient()

    const today = new Date()

    // Find bursaries closing in exactly 7, 3, or 1 days
    // We check these three windows and send appropriate reminders
    const reminderWindows = [7, 3, 1]

    let totalSent = 0

    for (const daysAhead of reminderWindows) {
      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() + daysAhead)

      // Format as YYYY-MM-DD to match our date column
      const dateStr = targetDate.toISOString().split('T')[0]

      // Find bursaries closing on this exact date
      const { data: bursaries } = await supabase
        .from('bursaries')
        .select('id, title, provider, deadline')
        .eq('deadline', dateStr)
        .eq('is_active', true)

      if (!bursaries || bursaries.length === 0) continue

      for (const bursary of bursaries) {
        // Find all students who saved or applied to this bursary
        // and have email notifications enabled
        const { data: applications } = await supabase
          .from('applications')
          .select(`
            id,
            user_id,
            status,
            profiles (
              full_name,
              notifications_email
            )
          `)
          .eq('bursary_id', bursary.id)
          .in('status', ['saved', 'applied'])

        if (!applications || applications.length === 0) continue

        for (const application of applications) {
  const profile = application.profiles as any

  console.log('Processing application:', application.user_id)
  console.log('Profile:', profile)
  console.log('notifications_email:', profile?.notifications_email)

  // Skip if student disabled email notifications
  if (!profile?.notifications_email) {
    console.log('Skipping — notifications disabled')
    continue
  }

          // Check if we already sent this exact notification
          // to prevent duplicate emails
          const notifType = `deadline_${daysAhead}days` as
            'deadline_7days' | 'deadline_3days' | 'deadline_1day'

          const { data: existing } = await supabase
            .from('notifications_log')
            .select('id')
            .eq('user_id', application.user_id)
            .eq('bursary_id', bursary.id)
            .eq('type', notifType)
            .eq('channel', 'email')
            .single()

          // Already sent — skip
          if (existing) continue

          // Get user email from auth
          const { data: { user } } = await supabase.auth.admin
            .getUserById(application.user_id)

          if (!user?.email) continue

          // Send the email via Resend
          console.log('Sending email to:', 'catherine.muindi@strathmore.edu')
console.log('Bursary:', bursary.title)

const { error: emailError } = await resend.emails.send({
  from: 'Elimisha <onboarding@resend.dev>',
  to: 'catherine.muindi@strathmore.edu',
            subject: `⏰ ${daysAhead} day${daysAhead === 1 ? '' : 's'} left — ${bursary.title}`,
            html: `
              <!DOCTYPE html>
              <html>
              <body style="font-family: sans-serif; max-width: 600px; 
              margin: 0 auto; padding: 20px; color: #111;">
                
                <div style="margin-bottom: 24px;">
                  <span style="color: #16a34a; font-weight: 700; 
                  font-size: 20px;">Elimisha</span>
                </div>

                <h2 style="margin: 0 0 8px;">
                  ${daysAhead === 1 ? '🚨 Last day!' : `⏰ ${daysAhead} days left`}
                </h2>
                
                <p style="color: #6b7280; margin: 0 0 24px;">
                  Hey ${profile?.full_name?.split(' ')[0] || 'there'}, 
                  don't miss this deadline.
                </p>

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; 
                border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                  <h3 style="margin: 0 0 4px; font-size: 16px;">
                    ${bursary.title}
                  </h3>
                  <p style="color: #6b7280; margin: 0 0 12px; font-size: 14px;">
                    ${bursary.provider}
                  </p>
                  <p style="margin: 0; font-size: 14px;">
                    <strong>Deadline:</strong> 
                    ${new Date(bursary.deadline).toLocaleDateString('en-KE', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <a href="https://elimisha-xi.vercel.app/bursaries/${bursary.id}"
                  style="display: inline-block; background: #16a34a; 
                  color: white; padding: 12px 24px; border-radius: 8px; 
                  text-decoration: none; font-weight: 500; font-size: 14px;">
                  View bursary →
                </a>

                <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
                  You're receiving this because you saved this bursary on Elimisha.
                  <br/>
                  <a href="https://elimisha-xi.vercel.app/onboarding" 
                  style="color: #9ca3af;">
                    Update notification preferences
                  </a>
                </p>

              </body>
              </html>
            `
          })

          if (emailError) {
            console.error('Email send error:', emailError)
            continue
          }

          // Log the notification so we never send it twice
          await supabase
            .from('notifications_log')
            .insert({
              user_id: application.user_id,
              bursary_id: bursary.id,
              type: notifType,
              channel: 'email'
            })

          totalSent++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${totalSent} notification emails`
    })

  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}
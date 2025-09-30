import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Import Resend dynamically to avoid module issues
const { Resend } = await import("https://esm.sh/resend@4.0.0");
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  ownerEmail: string;
  ownerName: string;
  listingTitle: string;
  listingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ownerEmail, ownerName, listingTitle, listingId }: ApprovalEmailRequest = await req.json();

    console.log(`Sending approval email for listing: ${listingTitle} to ${ownerEmail}`);

    const emailResponse = await resend.emails.send({
      from: "GearShare <onboarding@resend.dev>",
      to: [ownerEmail],
      subject: `🎉 Your listing "${listingTitle}" has been approved!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Congratulations ${ownerName}!</h1>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Great news! Your gear listing "<strong>${listingTitle}</strong>" has been approved and is now live on our platform.
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">What happens next?</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Your listing is now visible to potential renters</li>
              <li>You'll receive notifications when someone wants to book your gear</li>
              <li>You can manage your listing anytime from your dashboard</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://your-app.lovable.app'}/gear/${listingId}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Your Listing
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Thank you for being part of our gear sharing community!<br>
            The GearShare Team
          </p>
        </div>
      `,
    });

    console.log("Approval email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-listing-approval-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApprovalRequest {
  listingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { listingId }: ApprovalRequest = await req.json();

    console.log(`Approving listing: ${listingId}`);

    // Call the approval function
    const { data, error } = await supabase
      .rpc("approve_listing", { listing_id: listingId });

    if (error) {
      console.error("Error approving listing:", error);
      throw error;
    }

    // Get listing and owner details for email
    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .select(`
        id,
        title,
        users!owner_id (
          email,
          first_name
        )
      `)
      .eq("id", listingId)
      .single();

    if (listingError) {
      console.error("Error fetching listing details:", listingError);
      throw listingError;
    }

    // Send approval email
    if (listingData?.users && Array.isArray(listingData.users) && listingData.users.length > 0) {
      const owner = listingData.users[0];
      const emailResponse = await supabase.functions.invoke("send-listing-approval-email", {
        body: {
          ownerEmail: owner.email,
          ownerName: owner.first_name || "User",
          listingTitle: listingData.title,
          listingId: listingData.id,
        },
      });

      if (emailResponse.error) {
        console.error("Error sending approval email:", emailResponse.error);
        // Don't fail the approval if email fails
      }
    }

    console.log("Listing approved successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in approve-listing function:", error);
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
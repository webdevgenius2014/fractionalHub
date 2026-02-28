import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.10.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req: Request) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`Processing webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const { error } = await supabase
          .from("transactions")
          .update({
            status: "charge_succeeded",
            stripe_charge_id: paymentIntent.latest_charge as string,
            charge_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (error) {
          console.error("Error updating transaction on payment_intent.succeeded:", error);
        } else {
          // Notify the candidate that payment was received
          const { data: txData } = await supabase
            .from("transactions")
            .select("candidate_id, candidate:candidate_profiles(user_id)")
            .eq("stripe_payment_intent_id", paymentIntent.id)
            .single();

          if (txData) {
            await supabase.from("notifications").insert({
              user_id: (txData.candidate as any).user_id,
              type: "payment_received",
              title: "Payment Received",
              message: "Great news! Payment has been received for your engagement. You will be paid once you complete the work.",
              related_entity_type: "transaction",
            });
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const { error } = await supabase
          .from("transactions")
          .update({
            status: "charge_failed",
            notes: paymentIntent.last_payment_error?.message ?? "Payment failed",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (error) {
          console.error("Error updating transaction on payment_intent.payment_failed:", error);
        }
        break;
      }

      case "payment_intent.created": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const { error } = await supabase
          .from("transactions")
          .update({
            status: "charge_initiated",
            stripe_payment_intent_id: paymentIntent.id,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (error) {
          console.error("Error on payment_intent.created:", error);
        }
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;

        const { error } = await supabase
          .from("transactions")
          .update({
            status: "payout_initiated",
            stripe_transfer_id: transfer.id,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_transfer_id", transfer.id);

        if (error) {
          console.error("Error on transfer.created:", error);
        }
        break;
      }

      case "transfer.paid": {
        const transfer = event.data.object as Stripe.Transfer;

        const { error } = await supabase
          .from("transactions")
          .update({
            status: "payout_succeeded",
            payout_date: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_transfer_id", transfer.id);

        if (error) {
          console.error("Error on transfer.paid:", error);
        } else {
          // Notify candidate of successful payout
          const { data: txData } = await supabase
            .from("transactions")
            .select("candidate_payout_amount, candidate:candidate_profiles(user_id)")
            .eq("stripe_transfer_id", transfer.id)
            .single();

          if (txData) {
            const amount = (txData.candidate_payout_amount / 100).toLocaleString("en-US", {
              style: "currency", currency: "USD",
            });
            await supabase.from("notifications").insert({
              user_id: (txData.candidate as any).user_id,
              type: "payout_sent",
              title: "Payout Sent!",
              message: `${amount} has been transferred to your Stripe account. It may take 1-2 business days to appear.`,
              related_entity_type: "transaction",
            });
          }
        }
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;

        const { error } = await supabase
          .from("transactions")
          .update({
            status: "dispute_raised",
            notes: `Dispute created: ${dispute.reason}`,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_charge_id", dispute.charge as string);

        if (error) {
          console.error("Error on charge.dispute.created:", error);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;

        const { error } = await supabase
          .from("transactions")
          .update({
            status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_charge_id", charge.id);

        if (error) {
          console.error("Error on charge.refunded:", error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response(JSON.stringify({ error: "Processing failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

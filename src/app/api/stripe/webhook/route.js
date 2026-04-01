import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

    if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const email =
      session.customer_details?.email ||
      session.customer_email ||
      null;

    if (!email) {
      return Response.json({ received: true, warning: "E-mail não encontrado." });
    }

    const { data: usersData, error: usersError } =
      await supabase.auth.admin.listUsers();

    if (usersError) {
      return new Response(`Supabase Auth Error: ${usersError.message}`, { status: 500 });
    }

    const matchedUser = usersData.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (!matchedUser) {
      return Response.json({ received: true, warning: "Usuário não encontrado no Auth." });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_premium: true })
      .eq("id", matchedUser.id);

    if (error) {
      return new Response(`Supabase Error: ${error.message}`, { status: 500 });
    }
  }

  return Response.json({ received: true });
}

"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import Stripe from "stripe";
import { getGuestUserId } from "./guestAuth";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export const createCheckoutSession = action({
  args: {},
  returns: v.object({ url: v.string() }),
  handler: async (ctx) => {
    const userId = await getGuestUserId(ctx);

    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) throw new Error("STRIPE_PRO_PRICE_ID is not set");

    const stripe = getStripe();

    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/account?upgraded=true`,
      cancel_url: `${origin}/pricing`,
      client_reference_id: userId,
      metadata: { userId },
    });

    if (!session.url) throw new Error("Failed to create checkout session");
    return { url: session.url };
  },
});

export const createBillingPortalSession = action({
  args: {},
  returns: v.object({ url: v.string() }),
  handler: async (ctx): Promise<{ url: string }> => {
    const userId = await getGuestUserId(ctx);

    const subscription = await ctx.runQuery(
      internal.internalFunctions.getSubscriptionByUserId,
      { userId }
    ) as { stripeCustomerId: string } | null;
    if (!subscription) throw new Error("No subscription found");

    const stripe = getStripe();
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${origin}/account`,
    });

    return { url: portalSession.url };
  },
});

"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

/** Extract current period timestamps (ms) from subscription items. */
function extractPeriod(sub: Stripe.Subscription): {
  currentPeriodStart: number;
  currentPeriodEnd: number;
} {
  const item = sub.items.data[0];
  if (item) {
    return {
      currentPeriodStart: item.current_period_start * 1000,
      currentPeriodEnd: item.current_period_end * 1000,
    };
  }
  // Fallback: use billing_cycle_anchor and created
  return {
    currentPeriodStart: sub.created * 1000,
    currentPeriodEnd: (sub.cancel_at ?? sub.created) * 1000,
  };
}

/** Safely extract customer ID string from customer field. */
function getCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer
): string {
  return typeof customer === "string" ? customer : customer.id;
}

export const handleWebhookEvent = internalAction({
  args: {
    body: v.string(),
    signature: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const event = stripe.webhooks.constructEvent(
      args.body,
      args.signature,
      webhookSecret
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        if (!userId) {
          console.error("No client_reference_id in checkout session");
          break;
        }
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (!subscriptionId) {
          console.error("No subscription in checkout session");
          break;
        }
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        const period = extractPeriod(subscription);
        await ctx.runMutation(
          internal.internalFunctions.upsertSubscription,
          {
            userId,
            stripeCustomerId: getCustomerId(subscription.customer),
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id ?? "",
            status: subscription.status,
            currentPeriodStart: period.currentPeriodStart,
            currentPeriodEnd: period.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data
          .object as Stripe.Subscription;
        const customerId = getCustomerId(subscription.customer);
        // Fetch fresh subscription data from Stripe
        const freshSub =
          await stripe.subscriptions.retrieve(subscription.id);
        // Look up existing subscription to get userId
        const existingSub = await ctx.runQuery(
          internal.internalFunctions.getSubscriptionByStripeSubscriptionId,
          { stripeSubscriptionId: subscription.id }
        );
        const userId =
          existingSub?.userId ??
          freshSub.metadata?.userId ??
          "";
        if (!userId) {
          console.error(
            "Cannot determine userId for subscription update:",
            subscription.id
          );
          break;
        }
        const period = extractPeriod(freshSub);
        await ctx.runMutation(
          internal.internalFunctions.upsertSubscription,
          {
            userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: freshSub.id,
            stripePriceId:
              freshSub.items.data[0]?.price.id ?? "",
            status: freshSub.status,
            currentPeriodStart: period.currentPeriodStart,
            currentPeriodEnd: period.currentPeriodEnd,
            cancelAtPeriodEnd: freshSub.cancel_at_period_end,
          }
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data
          .object as Stripe.Subscription;
        const customerId = getCustomerId(subscription.customer);
        const existingDelSub = await ctx.runQuery(
          internal.internalFunctions.getSubscriptionByStripeSubscriptionId,
          { stripeSubscriptionId: subscription.id }
        );
        const delUserId =
          existingDelSub?.userId ??
          subscription.metadata?.userId ??
          "";
        if (!delUserId) {
          console.error(
            "Cannot determine userId for subscription deletion:",
            subscription.id
          );
          break;
        }
        const delPeriod = extractPeriod(subscription);
        await ctx.runMutation(
          internal.internalFunctions.upsertSubscription,
          {
            userId: delUserId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            stripePriceId:
              subscription.items.data[0]?.price.id ?? "",
            status: "canceled",
            currentPeriodStart: delPeriod.currentPeriodStart,
            currentPeriodEnd: delPeriod.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }
        );
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // In Stripe v20, subscription ID comes from the raw event data
        const rawData = event.data.object as unknown as Record<string, unknown>;
        const subscriptionId =
          typeof rawData.subscription === "string"
            ? rawData.subscription
            : null;
        if (!subscriptionId) break;
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        const customerId = getCustomerId(subscription.customer);
        const existingFailSub = await ctx.runQuery(
          internal.internalFunctions.getSubscriptionByStripeSubscriptionId,
          { stripeSubscriptionId: subscription.id }
        );
        const failUserId =
          existingFailSub?.userId ??
          subscription.metadata?.userId ??
          "";
        if (!failUserId) {
          console.error(
            "Cannot determine userId for payment failure:",
            subscription.id
          );
          break;
        }
        const failPeriod = extractPeriod(subscription);
        await ctx.runMutation(
          internal.internalFunctions.upsertSubscription,
          {
            userId: failUserId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            stripePriceId:
              subscription.items.data[0]?.price.id ?? "",
            status: "past_due",
            currentPeriodStart: failPeriod.currentPeriodStart,
            currentPeriodEnd: failPeriod.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return null;
  },
});

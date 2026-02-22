/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accessories from "../accessories.js";
import type * as affiliateConfig from "../affiliateConfig.js";
import type * as affiliateLinks from "../affiliateLinks.js";
import type * as buildAdvisor from "../buildAdvisor.js";
import type * as buildFilters from "../buildFilters.js";
import type * as buildRequests from "../buildRequests.js";
import type * as builds from "../builds.js";
import type * as components_ from "../components.js";
import type * as conversations from "../conversations.js";
import type * as glossary from "../glossary.js";
import type * as groupBuyPartnerships from "../groupBuyPartnerships.js";
import type * as groupBuys from "../groupBuys.js";
import type * as http from "../http.js";
import type * as imageGeneration from "../imageGeneration.js";
import type * as internalFunctions from "../internalFunctions.js";
import type * as keyboards from "../keyboards.js";
import type * as keycaps from "../keycaps.js";
import type * as productValidator from "../productValidator.js";
import type * as products from "../products.js";
import type * as prompts from "../prompts.js";
import type * as savedBuilds from "../savedBuilds.js";
import type * as seed from "../seed.js";
import type * as sponsorships from "../sponsorships.js";
import type * as stripe from "../stripe.js";
import type * as stripeWebhook from "../stripeWebhook.js";
import type * as subscriptions from "../subscriptions.js";
import type * as switches from "../switches.js";
import type * as usage from "../usage.js";
import type * as userPreferences from "../userPreferences.js";
import type * as vendorLinks from "../vendorLinks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accessories: typeof accessories;
  affiliateConfig: typeof affiliateConfig;
  affiliateLinks: typeof affiliateLinks;
  buildAdvisor: typeof buildAdvisor;
  buildFilters: typeof buildFilters;
  buildRequests: typeof buildRequests;
  builds: typeof builds;
  components: typeof components_;
  conversations: typeof conversations;
  glossary: typeof glossary;
  groupBuyPartnerships: typeof groupBuyPartnerships;
  groupBuys: typeof groupBuys;
  http: typeof http;
  imageGeneration: typeof imageGeneration;
  internalFunctions: typeof internalFunctions;
  keyboards: typeof keyboards;
  keycaps: typeof keycaps;
  productValidator: typeof productValidator;
  products: typeof products;
  prompts: typeof prompts;
  savedBuilds: typeof savedBuilds;
  seed: typeof seed;
  sponsorships: typeof sponsorships;
  stripe: typeof stripe;
  stripeWebhook: typeof stripeWebhook;
  subscriptions: typeof subscriptions;
  switches: typeof switches;
  usage: typeof usage;
  userPreferences: typeof userPreferences;
  vendorLinks: typeof vendorLinks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

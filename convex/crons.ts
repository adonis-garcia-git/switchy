import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Weekly product sync — every Monday at 8:00 AM UTC
crons.weekly(
  "nia-weekly-product-sync",
  { dayOfWeek: "monday", hourUTC: 8, minuteUTC: 0 },
  internal.niaCron.weeklyProductSync
);

// Weekly trending analysis — every Friday at 18:00 UTC
crons.weekly(
  "nia-weekly-trending",
  { dayOfWeek: "friday", hourUTC: 18, minuteUTC: 0 },
  internal.niaCron.weeklyTrendingAnalysis
);

export default crons;

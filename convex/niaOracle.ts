"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import {
  niaOracleRun,
  niaOracleJob,
  niaOracleJobStatus,
  hashQuery,
  type NiaOracleResult,
} from "./niaClient";

const ORACLE_CACHE_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours for research

/**
 * Run a deep Oracle research query (synchronous).
 * Used when the AI advisor encounters a complex question.
 */
export const research = action({
  args: {
    query: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<NiaOracleResult> => {
    const cacheKey = hashQuery(args.query, "oracle");

    // Check cache
    const cached = await ctx.runQuery(
      internal.internalFunctions.getNiaCacheByHash,
      { queryHash: cacheKey }
    );
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result as NiaOracleResult;
    }

    try {
      const result = await niaOracleRun(args.query);

      await ctx.runMutation(internal.internalFunctions.insertNiaCache, {
        queryHash: cacheKey,
        result,
        source: "oracle",
        createdAt: Date.now(),
        expiresAt: Date.now() + ORACLE_CACHE_TTL_MS,
      });

      return result;
    } catch (e) {
      console.error("Nia Oracle research failed:", e);
      return {
        answer: "Research could not be completed at this time.",
        sources: [],
      };
    }
  },
});

/**
 * Start an async Oracle research job. Returns a job ID to poll later.
 */
export const startResearchJob = action({
  args: {
    query: v.string(),
  },
  returns: v.string(),
  handler: async (_ctx, args): Promise<string> => {
    try {
      return await niaOracleJob(args.query);
    } catch (e) {
      console.error("Nia Oracle job start failed:", e);
      throw new Error("Failed to start research job");
    }
  },
});

/**
 * Check the status of an async Oracle research job.
 */
export const checkResearchJob = action({
  args: {
    jobId: v.string(),
  },
  returns: v.any(),
  handler: async (
    ctx,
    args
  ): Promise<{ status: string; result?: NiaOracleResult }> => {
    try {
      const status = await niaOracleJobStatus(args.jobId);

      // Cache completed results
      if (status.status === "completed" && status.result) {
        const cacheKey = hashQuery(args.jobId, "oracle-job");
        await ctx.runMutation(internal.internalFunctions.insertNiaCache, {
          queryHash: cacheKey,
          result: status.result,
          source: "oracle-job",
          createdAt: Date.now(),
          expiresAt: Date.now() + ORACLE_CACHE_TTL_MS,
        });
      }

      return status;
    } catch (e) {
      console.error("Nia Oracle job status check failed:", e);
      return { status: "error" };
    }
  },
});

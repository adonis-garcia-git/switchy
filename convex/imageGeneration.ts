"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const generateBuildImage = action({
  args: { buildId: v.id("builds") },
  returns: v.any(),
  handler: async (ctx, args): Promise<{ imageUrl: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const buildResult = await ctx.runQuery(
      internal.internalFunctions.getBuildById,
      { id: args.buildId }
    );
    if (!buildResult) throw new Error("Build not found");
    const build: Record<string, any> = buildResult;

    if (build.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const components: Record<string, any> = build.components;

    // Construct a detailed prompt from build components
    const keyboardName: string =
      components?.keyboardKit?.name || "custom mechanical keyboard";
    const switchName: string = components?.switches?.name || "";
    const keycapName: string = components?.keycaps?.name || "";

    const prompt: string = `Photorealistic top-down product photography of a ${keyboardName} mechanical keyboard. ${keycapName ? `With ${keycapName} keycaps.` : "PBT keycaps."} ${switchName ? `Visible ${switchName} switches.` : ""} On a clean wooden desk surface, warm studio lighting, shallow depth of field, 4K resolution, professional product shot.`;

    const REPLICATE_API_TOKEN: string | undefined = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN not configured");
    }

    // Create prediction via Replicate API
    const createResponse: Response = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/imagen-3",
          input: {
            prompt,
            aspect_ratio: "16:9",
            safety_filter_level: "block_only_high",
          },
        }),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Replicate API error: ${error}`);
    }

    const prediction: any = await createResponse.json();
    const predictionUrl: string =
      prediction.urls?.get ||
      `https://api.replicate.com/v1/predictions/${prediction.id}`;

    // Poll for completion (max 60 seconds)
    let result: any = prediction;
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      if (result.status === "succeeded") break;
      if (result.status === "failed" || result.status === "canceled") {
        throw new Error(
          `Image generation ${result.status}: ${result.error || "Unknown error"}`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const pollResponse = await fetch(predictionUrl, {
        headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
      });
      result = await pollResponse.json();
    }

    if (result.status !== "succeeded") {
      throw new Error("Image generation timed out");
    }

    // Get the output URL
    const imageUrl: string = Array.isArray(result.output)
      ? result.output[0]
      : result.output;

    // Save the image URL to the build
    await ctx.runMutation(internal.internalFunctions.setBuildImageUrl, {
      id: args.buildId,
      imageUrl,
    });

    return { imageUrl };
  },
});

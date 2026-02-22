"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";

export const askGlossary = action({
  args: {
    question: v.string(),
    history: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Fetch all glossary terms for context
    const allTerms = await ctx.runQuery(
      internal.internalFunctions.getAllGlossaryTerms
    );

    // Build glossary reference block
    const glossaryBlock = allTerms
      .map(
        (t: {
          term: string;
          definition: string;
          category: string;
          relatedTerms?: string[];
        }) => {
          const related =
            t.relatedTerms && t.relatedTerms.length > 0
              ? ` (Related: ${t.relatedTerms.join(", ")})`
              : "";
          return `**${t.term}** [${t.category}]: ${t.definition}${related}`;
        }
      )
      .join("\n");

    const systemPrompt: string = `You are Switchy's glossary assistant — a concise, friendly expert on mechanical keyboard terminology.

Rules:
- Keep responses to 1-3 sentences. Aim for 30-50 words. Never exceed 75 words.
- When you mention a glossary term by name, use its exact name as written in the glossary so the UI can link it.
- Reference glossary definitions when available. Quote them accurately.
- If asked about a term not in the glossary, give a brief general answer and note it's not in the glossary yet.
- Stay on topic: mechanical keyboards, switches, keycaps, mods, and related terminology.
- Use a warm, approachable tone. You can be slightly playful but stay informative.

## Glossary Reference (${allTerms.length} terms)
${glossaryBlock}`;

    // Only send last 6 message pairs to keep context small
    const recentHistory = args.history.slice(-12);

    const messages: Anthropic.MessageParam[] = [
      ...recentHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: args.question },
    ];

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const response: Anthropic.Message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 180,
      system: systemPrompt,
      messages,
    });

    const textBlock = response.content.find(
      (b: Anthropic.ContentBlock) => b.type === "text"
    );
    return textBlock && textBlock.type === "text"
      ? textBlock.text.trim()
      : "Sorry, I couldn't generate a response. Please try again.";
  },
});

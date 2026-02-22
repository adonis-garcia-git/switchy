export interface PopularBuild {
  id: string;
  name: string;
  tagline: string;
  price: string;
  difficulty: "beginner-friendly" | "intermediate" | "advanced";
  keyComponents: string[];
  prompt: string;
}

export const POPULAR_BUILDS: PopularBuild[] = [
  {
    id: "budget-thock",
    name: "Budget Thock",
    tagline: "Deep, satisfying sound without breaking the bank",
    price: "~$150",
    difficulty: "beginner-friendly",
    keyComponents: ["Gasket mount", "PBT keycaps", "Linear switches"],
    prompt: "I want a thocky keyboard build under $150. Prefer gasket mount, PBT keycaps, and smooth linear switches. 65% or 75% layout.",
  },
  {
    id: "silent-office",
    name: "Silent Office",
    tagline: "Whisper-quiet for shared workspaces",
    price: "~$250",
    difficulty: "beginner-friendly",
    keyComponents: ["Silent switches", "Sound dampening", "Wireless"],
    prompt: "I need a silent keyboard for my office. Budget around $250. Must be wireless and as quiet as possible. TKL or 75% preferred.",
  },
  {
    id: "premium-endgame",
    name: "Premium Endgame",
    tagline: "The forever board — no compromises",
    price: "~$500",
    difficulty: "advanced",
    keyComponents: ["Aluminum case", "Custom stabs", "Lubed switches"],
    prompt: "Build me an endgame keyboard, budget $400-600. Premium aluminum case, best possible sound, gasket mount. 65% or 75%. I want to lube switches and mod stabs.",
  },
  {
    id: "first-build",
    name: "My First Build",
    tagline: "Perfect starting point for newcomers",
    price: "~$120",
    difficulty: "beginner-friendly",
    keyComponents: ["Hot-swap PCB", "Pre-lubed", "Beginner-friendly"],
    prompt: "I'm building my first mechanical keyboard. Budget around $100-150. Must be hot-swap and beginner friendly. I don't want to solder. Prefer a nice typing feel.",
  },
];

export const SWITCH_TYPE_COLORS = {
  linear: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", hex: "#E74C3C" },
  tactile: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30", hex: "#E67E22" },
  clicky: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", hex: "#3498DB" },
} as const;

export const SOUND_CHARACTER_LABELS: Record<string, string> = {
  thocky: "Thocky",
  clacky: "Clacky",
  creamy: "Creamy",
  poppy: "Poppy",
  muted: "Muted",
  crisp: "Crisp",
};

export const LOADING_MESSAGES = [
  "Lubing the switches...",
  "Testing the plate flex...",
  "Foam modding the case...",
  "Sound testing your build...",
  "Comparing spring weights...",
  "Checking group buy status...",
  "Measuring actuation force...",
  "Tuning the stabilizers...",
  "Applying band-aid mod...",
  "Filming the switches...",
];

export const PLACEHOLDER_QUERIES = [
  "I want a deep thocky 65% board for office use, under $300",
  "Best budget first custom keyboard for a college student who games",
  "Something that sounds like rain on a wooden desk, very quiet",
  "Clacky and loud 75% for maximum typing satisfaction",
  "I have a Keychron Q1 and want to make it sound more creamy",
  "What's a good tactile switch that isn't mushy? I type a lot of code",
];

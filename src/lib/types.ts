// Build component types
export interface BuildComponentDetail {
  name: string;
  price: number;
  reason: string;
  quantity?: number;
  priceEach?: number;
}

export interface BuildComponents {
  keyboardKit: BuildComponentDetail;
  switches: BuildComponentDetail & { quantity: number; priceEach: number };
  keycaps: BuildComponentDetail;
  stabilizers: BuildComponentDetail;
}

export interface RecommendedMod {
  mod: string;
  cost: number;
  effect: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface BuildData {
  buildName: string;
  summary: string;
  components: BuildComponents;
  recommendedMods: RecommendedMod[];
  estimatedTotal: number;
  soundProfileExpected: string;
  buildDifficulty: "beginner-friendly" | "intermediate" | "advanced";
  notes: string;
  // New v2 fields
  isPublic?: boolean;
  shareSlug?: string;
  imageUrl?: string;
  conversationId?: string;
}

// Conversation types
export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Conversation {
  _id?: string;
  userId: string;
  messages: ConversationMessage[];
  activeBuildResult?: BuildData;
  createdAt: number;
}

// User preference types
export interface UserPreferences {
  _id?: string;
  userId: string;
  experienceLevel: "beginner" | "intermediate" | "expert";
  preferredSound?: string;
  budgetRange?: { min: number; max: number };
  preferredSize?: string;
  hasCompletedOnboarding: boolean;
}

// Product data types
export interface SwitchData {
  _id?: string;
  brand: string;
  name: string;
  type: "linear" | "tactile" | "clicky";
  actuationForceG: number;
  bottomOutForceG: number;
  actuationMm: number;
  totalTravelMm: number;
  stemMaterial: string;
  housingMaterial: string;
  springType: string;
  factoryLubed: boolean;
  longPole: boolean;
  soundPitch: "low" | "mid" | "high";
  soundCharacter: "thocky" | "clacky" | "creamy" | "poppy" | "muted" | "crisp";
  soundVolume: "quiet" | "medium" | "loud";
  pricePerSwitch: number;
  communityRating: number;
  popularFor: string[];
  notes: string;
  commonlyComparedTo: string[];
  imageUrl?: string;
  productUrl?: string;
  soundSampleUrl?: string;
}

export interface KeyboardData {
  _id?: string;
  brand: string;
  name: string;
  size: string;
  mountingStyle: string;
  plateMaterial: string;
  caseMaterial: string;
  hotSwap: boolean;
  wireless: boolean;
  rgb: boolean;
  priceUsd: number;
  inStock: boolean;
  notes: string;
  imageUrl?: string;
  productUrl?: string;
}

export interface ComponentData {
  _id?: string;
  category: "plate" | "case" | "keycapProfile" | "keycapMaterial" | "mountingStyle" | "mod";
  name: string;
  soundEffect: string;
  priceRange: "budget" | "mid" | "premium";
  notes: string;
  compatibilityNotes: string;
}

// Glossary types
export interface GlossaryTerm {
  _id?: string;
  term: string;
  definition: string;
  category: string;
  relatedTerms: string[];
}

// Vendor link types
export interface VendorLink {
  _id?: string;
  productType: "switch" | "keyboard" | "keycaps" | "stabilizer" | "accessory";
  productName: string;
  vendor: string;
  url: string;
  price?: number;
  lastVerified?: string;
}

// Sound sample types
export interface SoundSample {
  _id?: string;
  switchName: string;
  audioUrl: string;
  plateType?: string;
  recordingNotes?: string;
}

// Wizard types
export type WizardUseCase = "gaming" | "programming" | "office" | "content-creation" | "all-around";
export type WizardSoundPref = "thocky" | "clacky" | "creamy" | "poppy" | "silent" | "no-preference";
export type WizardBudget = "under-100" | "100-200" | "200-350" | "350-500" | "500-plus";
export type WizardSize = "60" | "65" | "75" | "tkl" | "full";
export type WizardPriority = "sound-quality" | "typing-feel" | "build-quality" | "wireless" | "rgb" | "budget-friendly" | "easy-build";

export interface WizardFormData {
  useCases: WizardUseCase[];
  soundPreference: WizardSoundPref | null;
  budget: WizardBudget | null;
  size: WizardSize | null;
  priorities: WizardPriority[];
}

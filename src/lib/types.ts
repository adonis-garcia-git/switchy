// Build component types
export interface BuildComponentDetail {
  name: string;
  price: number;
  reason: string;
  quantity?: number;
  priceEach?: number;
  matchedId?: string;
  imageUrl?: string;
  detailUrl?: string;    // internal link: /switches/{id} or /keyboards/{id}
  productUrl?: string;   // external vendor link
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
  slug?: string;
  type: "linear" | "tactile" | "clicky";
  actuationForceG: number;
  bottomOutForceG?: number;
  actuationMm: number;
  totalTravelMm: number;
  stemMaterial?: string;
  housingMaterial?: string;
  springType?: string;
  factoryLubed?: boolean;
  longPole?: boolean;
  soundPitch?: "low" | "mid" | "high";
  soundCharacter?: "thocky" | "clacky" | "creamy" | "poppy" | "muted" | "crisp";
  soundVolume?: "quiet" | "medium" | "loud";
  pricePerSwitch: number;
  communityRating?: number;
  popularFor?: string[];
  notes?: string;
  commonlyComparedTo?: string[];
  imageUrl?: string;
  productUrl?: string;
  soundSampleUrl?: string;
  fabricated?: boolean;
}

export interface KeyboardData {
  _id?: string;
  brand: string;
  name: string;
  slug?: string;
  size: string;
  mountingStyle?: string;
  plateMaterial?: string;
  caseMaterial: string;
  hotSwap: boolean;
  wireless: boolean;
  rgb: boolean;
  priceUsd: number;
  inStock?: boolean;
  notes?: string;
  imageUrl?: string;
  productUrl?: string;
  connectivityType?: string;
  batteryCapacity?: string;
  weight?: string;
  knob?: boolean;
  qmkVia?: boolean;
  hallEffect?: boolean;
  pollingRate?: string;
  fabricated?: boolean;
}

export interface ProductData {
  _id?: string;
  category: string;
  brand: string;
  name: string;
  slug: string;
  priceUsd?: number;
  originalPrice?: number;
  imageUrl?: string;
  imageUrls?: string[];
  productUrl?: string;
  tags?: string[];
  specs?: Record<string, unknown>;
  inStock?: boolean;
  sourceUrl?: string;
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
  productType: "switch" | "keyboard" | "keycaps" | "stabilizer" | "accessory" | "mouse" | "deskmat" | "cable" | "pcb" | "lubricant" | "artisan" | "wrist-rest";
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

// Builder types (unified advisor + wizard)
export type BuilderPhase = "landing" | "questions" | "generating" | "result";

export type BuilderQuestionType = "single-choice" | "multi-choice" | "color-picker" | "slider";

export interface BuilderQuestionOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface BuilderQuestion {
  id: string;
  type: BuilderQuestionType;
  question: string;
  subtitle?: string;
  options?: BuilderQuestionOption[];
  sliderConfig?: {
    min: number;
    max: number;
    step: number;
    unit: string;
    labels?: { value: number; label: string }[];
  };
  viewerUpdate?: Partial<import("./keyboard3d").KeyboardViewerConfig>;
}

export interface BuilderAnswer {
  questionId: string;
  value: string | string[] | number;
}

export interface BuilderState {
  phase: BuilderPhase;
  initialPrompt: string;
  questions: BuilderQuestion[];
  answers: BuilderAnswer[];
  currentQuestionIndex: number;
  buildResult: BuildData | null;
  isGenerating: boolean;
}

// Custom Builder types
export type CustomBuilderStep =
  | "keyboard"
  | "switches"
  | "keycaps"
  | "stabilizers"
  | "mods"
  | "review";

export interface StabilizerPreset {
  name: string;
  price: number;
  type: "screw-in" | "clip-in" | "plate-mount";
}

export interface KeycapSelection {
  profile: string | null;
  material: string | null;
  setName: string;
  price: number;
}

export interface StabilizerSelection {
  name: string;
  price: number;
  isCustom: boolean;
}

export interface CustomBuildSelections {
  keyboard: KeyboardData | null;
  switches: SwitchData | null;
  keycaps: KeycapSelection;
  stabilizer: StabilizerSelection | null;
  mods: ComponentData[];
}

export type CustomBuilderAction =
  | { type: "SET_STEP"; step: CustomBuilderStep }
  | { type: "SELECT_KEYBOARD"; keyboard: KeyboardData }
  | { type: "SELECT_SWITCHES"; switches: SwitchData }
  | { type: "SELECT_KEYCAP_PROFILE"; profile: string }
  | { type: "SELECT_KEYCAP_MATERIAL"; material: string }
  | { type: "SET_KEYCAP_DETAILS"; setName: string; price: number }
  | { type: "SET_STABILIZER"; stabilizer: StabilizerSelection }
  | { type: "TOGGLE_MOD"; mod: ComponentData }
  | { type: "RESET" };

export interface CustomBuilderState {
  step: CustomBuilderStep;
  selections: CustomBuildSelections;
}

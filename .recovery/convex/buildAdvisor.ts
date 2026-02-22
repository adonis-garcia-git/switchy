interface QuestionDef {
  id: string;
  type: string;
  question: string;
  subtitle?: string;
  options?: {
    id: string;
    label: string;
    description?: string;
    color?: string;
  }[];
  sliderConfig?: {
    min: number;
    max: number;
    step: number;
    unit: string;
    labels?: { value: number; label: string }[];
  };
  viewerUpdate?: Record<string, unknown>;
  /** Returns true if the user's prompt already covers this question. */
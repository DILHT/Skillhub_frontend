export type DocumentType = "passport" | "national_id" | "drivers_license";

export interface DocumentOption {
  value: DocumentType;
  label: string;
  icon: string;
}

export interface SlotDef {
  key: string;
  label: string;
  description: string;
  required: boolean;
}

export interface UploadSlot extends SlotDef {
  uri: string | null;
}

export const DOCUMENT_TYPES: DocumentOption[] = [
  { value: "national_id", label: "National ID", icon: "card-outline" },
  { value: "passport", label: "Passport", icon: "book-outline" },
  { value: "drivers_license", label: "License", icon: "car-outline" },
];

const SELFIE_SLOT: SlotDef = {
  key: "selfie",
  label: "Selfie with document",
  description: "Hold your document next to your face",
  required: true,
};

export const SLOT_DEFS: Record<DocumentType, SlotDef[]> = {
  national_id: [
    {
      key: "idFront",
      label: "ID front",
      description: "Clear photo of the front",
      required: true,
    },
    {
      key: "idBack",
      label: "ID back",
      description: "Clear photo of the back",
      required: false,
    },
    SELFIE_SLOT,
  ],
  drivers_license: [
    {
      key: "idFront",
      label: "License front",
      description: "Clear photo of the front",
      required: true,
    },
    {
      key: "idBack",
      label: "License back",
      description: "Clear photo of the back",
      required: false,
    },
    SELFIE_SLOT,
  ],
  passport: [
    {
      key: "idFront",
      label: "Photo page",
      description: "Page with your photo and details",
      required: true,
    },
    SELFIE_SLOT,
  ],
};

export const KYC_TIPS = [
  "Document must not be expired",
  "All text clearly readable",
  "No glare or shadows",
  "Full document visible in frame",
];

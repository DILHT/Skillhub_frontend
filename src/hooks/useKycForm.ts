import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { showImageSourceChooser } from "@/utils/imagePicker";
import { DocumentType, SLOT_DEFS, UploadSlot } from "@/constants/kyc";

type ImageMap = Record<string, string | null>;

export function useKycForm(onSuccess: () => void) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentType>("national_id");
  const [images, setImages] = useState<ImageMap>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slots: UploadSlot[] = useMemo(
    () =>
      SLOT_DEFS[selectedDoc].map((d) => ({ ...d, uri: images[d.key] ?? null })),
    [selectedDoc, images],
  );

  const requiredTotal = useMemo(
    () => slots.filter((s) => s.required).length,
    [slots],
  );
  const requiredDone = useMemo(
    () => slots.filter((s) => s.required && s.uri).length,
    [slots],
  );
  const canSubmit = requiredDone === requiredTotal;

  // Changing document type invalidates the document photos; selfie stays valid
  const handleSelectDoc = useCallback((doc: DocumentType) => {
    setSelectedDoc(doc);
    setImages(({ selfie }) => ({ selfie: selfie ?? null }));
  }, []);

  const handleUpload = useCallback((key: string) => {
    showImageSourceChooser((img) => {
      if (img) setImages((prev) => ({ ...prev, [key]: img.uri }));
    });
  }, []);

  const handleRemove = useCallback((key: string) => {
    setImages((prev) => ({ ...prev, [key]: null }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      Alert.alert(
        "Submitted Successfully",
        "Your documents have been submitted for review. We will notify you within 24 hours.",
        [{ text: "OK", onPress: onSuccess }],
      );
    } catch (e: any) {
      Alert.alert("Submission Failed", e?.message ?? "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, isSubmitting, onSuccess]);

  return {
    selectedDoc,
    slots,
    requiredTotal,
    requiredDone,
    canSubmit,
    isSubmitting,
    handleSelectDoc,
    handleUpload,
    handleRemove,
    handleSubmit,
  };
}

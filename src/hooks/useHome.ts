import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native";

type RefetchHome = () => Promise<unknown>;

type CategoryLayout = { x: number; width: number };

const ALL_ID = "all";

export function useHomeControls(refetchHome: RefetchHome) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categoriesScrollRef = useRef<ScrollView | null>(null);
  const categoriesContainerWidth = useRef(0);
  const categoriesContentWidth = useRef(0);
  const categoryLayoutsRef = useRef<Record<string, CategoryLayout>>({});

  const scrollToCategory = useCallback((categoryId: string) => {
    const scrollView = categoriesScrollRef.current;
    const containerWidth = categoriesContainerWidth.current;

    if (!scrollView || !containerWidth) return;

    const layout = categoryLayoutsRef.current[categoryId];

    if (categoryId === ALL_ID || !layout) {
      scrollView.scrollTo({ x: 0, animated: true });
      return;
    }

    // Center the active chip within the visible track.
    const itemCenter = layout.x + layout.width / 2;
    const rawTarget = itemCenter - containerWidth / 2;

    const contentWidth = categoriesContentWidth.current;
    const maxScrollX = Math.max(0, contentWidth - containerWidth);
    const targetX = Math.min(Math.max(rawTarget, 0), maxScrollX);

    scrollView.scrollTo({ x: targetX, animated: true });
  }, []);

  const handleCategoryLayout = useCallback(
    (categoryId: string, x: number, width: number) => {
      categoryLayoutsRef.current[categoryId] = { x, width };
    },
    [],
  );

  const handleCategoriesLayout = useCallback((width: number) => {
    categoriesContainerWidth.current = width;
  }, []);

  const handleCategoriesContentSizeChange = useCallback((width: number) => {
    categoriesContentWidth.current = width;
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedCategoryId(null);
  }, []);

  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategoryId((current) =>
      current === categoryId ? current : categoryId,
    );
  }, []);

  // Fires on every selection change (including re-tapping "All"), and
  // relies on layouts already captured by the time selection can change —
  // no fragile "wait for onLayout to refire" matching needed.
  useEffect(() => {
    const id = selectedCategoryId ?? ALL_ID;
    const frame = requestAnimationFrame(() => scrollToCategory(id));
    return () => cancelAnimationFrame(frame);
  }, [selectedCategoryId, scrollToCategory]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchHome();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchHome]);

  return {
    selectedCategoryId,
    isRefreshing,
    categoriesScrollRef,
    handleCategoryLayout,
    handleCategoriesLayout,
    handleCategoriesContentSizeChange,
    handleCategoryPress,
    handleSelectAll,
    handleRefresh,
  };
}

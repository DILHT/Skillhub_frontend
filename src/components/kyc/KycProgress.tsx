import React, { memo } from "react";
import { View, Text } from "react-native";
import { makeProgressStyles } from "@/styles/auth/kyc.styles";
import { useThemedStyles } from "./useThemedStyles";

interface Props {
  done: number;
  total: number;
}

function KycProgress({ done, total }: Props) {
  const styles = useThemedStyles(makeProgressStyles);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: done }}
    >
      <View style={styles.row}>
        <Text style={styles.label}>Required uploads</Text>
        <Text style={styles.count}>
          {done} of {total}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

export default memo(KycProgress);

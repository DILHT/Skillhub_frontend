import * as ExpoHaptics from 'expo-haptics';

export const haptics = {
  success: () =>
    ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success),
  error: () =>
    ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error),
  impact: () =>
    ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium),
};

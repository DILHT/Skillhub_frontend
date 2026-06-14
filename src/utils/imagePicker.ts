// src/utils/imagePicker.ts
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface PickedImage {
  uri: string;
  fileName: string;
  type: string;
}

// Requests permission and lets the user pick an image from their library.
// Returns null if cancelled or permission denied.
export async function pickImageFromLibrary(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      'Permission needed',
      'Please allow photo access in your settings to upload an image.'
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7, // compress for slower connections
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  const uriParts = asset.uri.split('.');
  const ext = uriParts[uriParts.length - 1];

  return {
    uri: asset.uri,
    fileName: asset.fileName ?? `image_${Date.now()}.${ext}`,
    type: asset.mimeType ?? `image/${ext}`,
  };
}

// Lets the user take a photo with the camera (used for KYC selfie).
export async function takePhotoWithCamera(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      'Permission needed',
      'Please allow camera access in your settings to take a photo.'
    );
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  const uriParts = asset.uri.split('.');
  const ext = uriParts[uriParts.length - 1];

  return {
    uri: asset.uri,
    fileName: asset.fileName ?? `photo_${Date.now()}.${ext}`,
    type: asset.mimeType ?? `image/${ext}`,
  };
}

// Shows a chooser: take photo or pick from library.
export function showImageSourceChooser(
  onPick: (image: PickedImage | null) => void
) {
  Alert.alert('Add Photo', 'Choose a source', [
    {
      text: 'Take Photo',
      onPress: async () => onPick(await takePhotoWithCamera()),
    },
    {
      text: 'Choose from Library',
      onPress: async () => onPick(await pickImageFromLibrary()),
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
}
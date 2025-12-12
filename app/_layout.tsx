import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { setStatusBarHidden } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      setStatusBarHidden(true, "none");
      SystemUI.setBackgroundColorAsync("transparent");
    }
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
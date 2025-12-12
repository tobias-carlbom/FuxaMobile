import { View, TouchableOpacity, Modal, TextInput, Text, Pressable, Alert, Platform, StatusBar, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";

const STORAGE_KEYS = {
  URL: "fuxa_url",
  PASSWORD: "fuxa_master_password",
};

const DEFAULT_URL = "http://172.31.0.30:1881";

export default function Index() {
  const [webKey, setWebKey] = useState(0);
  const [url, setUrl] = useState(DEFAULT_URL);
  const [tempUrl, setTempUrl] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  const hideNavBar = () => {
    if (Platform.OS === "android") {
      StatusBar.setHidden(true);
      NavigationBar.setPositionAsync("absolute");
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
    }
  };

  useEffect(() => {
    loadSettings();
    hideNavBar();
  }, []);

  // Re-hide nav bar whenever modals change
  useEffect(() => {
    if (!modalVisible && !showPasswordPrompt) {
      const timer = setTimeout(hideNavBar, 100);
      return () => clearTimeout(timer);
    }
  }, [modalVisible, showPasswordPrompt]);

  const loadSettings = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem(STORAGE_KEYS.URL);
      const savedPassword = await AsyncStorage.getItem(STORAGE_KEYS.PASSWORD);
      if (savedUrl) setUrl(savedUrl);
      if (savedPassword) setMasterPassword(savedPassword);
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.URL, tempUrl);
      if (newPassword) {
        await AsyncStorage.setItem(STORAGE_KEYS.PASSWORD, newPassword);
        setMasterPassword(newPassword);
      }
      setUrl(tempUrl);
      setWebKey((k) => k + 1);
      closeSettingsModal();
      setNewPassword("");
      Alert.alert("Saved", "Settings have been saved.");
    } catch (e) {
      console.error("Failed to save settings:", e);
      Alert.alert("Error", "Failed to save settings.");
    }
  };

  const openSettings = () => {
    setTempUrl(url);
    setNewPassword("");
    setPasswordInput("");
    
    if (masterPassword) {
      setShowPasswordPrompt(true);
      setIsUnlocked(false);
    } else {
      setIsUnlocked(true);
      setModalVisible(true);
    }
  };

  const closeSettingsModal = () => {
    setModalVisible(false);
    setIsUnlocked(false);
    hideNavBar();
  };

  const closePasswordPrompt = () => {
    setShowPasswordPrompt(false);
    hideNavBar();
  };

  const verifyPassword = () => {
    if (passwordInput === masterPassword) {
      setIsUnlocked(true);
      setShowPasswordPrompt(false);
      setModalVisible(true);
      setPasswordInput("");
    } else {
      Alert.alert("Error", "Incorrect password.");
    }
  };

  const clearPassword = async () => {
    Alert.alert(
      "Clear Password",
      "Are you sure you want to remove the master password?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEYS.PASSWORD);
            setMasterPassword("");
            Alert.alert("Done", "Master password has been cleared.");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <WebView key={webKey} source={{ uri: url }} style={styles.webview} />

      {/* Floating Settings Button */}
      <TouchableOpacity onPress={openSettings} style={styles.fab}>
        <Ionicons name="menu" size={24} color="white" />
      </TouchableOpacity>

      {/* Password Prompt Modal */}
      <Modal
        visible={showPasswordPrompt}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closePasswordPrompt}
      >
        <Pressable style={styles.modalOverlay} onPress={closePasswordPrompt}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Enter Master Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Password"
              value={passwordInput}
              onChangeText={setPasswordInput}
              onSubmitEditing={verifyPassword}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={closePasswordPrompt} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={verifyPassword} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Unlock</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeSettingsModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeSettingsModal}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Settings</Text>

            <Text style={styles.label}>URL</Text>
            <TextInput
              style={styles.input}
              placeholder="http://example.com:1881"
              value={tempUrl}
              onChangeText={setTempUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={styles.label}>
              {masterPassword ? "Change Master Password" : "Set Master Password"}
            </Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder={masterPassword ? "Leave empty to keep current" : "Enter new password"}
              value={newPassword}
              onChangeText={setNewPassword}
            />

            {masterPassword && (
              <TouchableOpacity onPress={clearPassword} style={styles.clearPassword}>
                <Text style={styles.clearPasswordText}>Clear Master Password</Text>
              </TouchableOpacity>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={closeSettingsModal} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveSettings} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelButton: {
    padding: 10,
  },
  cancelText: {
    color: "#666",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  primaryButtonText: {
    color: "white",
  },
  clearPassword: {
    marginBottom: 15,
  },
  clearPasswordText: {
    color: "#FF3B30",
  },
});
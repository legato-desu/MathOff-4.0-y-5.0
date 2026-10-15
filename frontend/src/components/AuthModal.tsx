import React from "react";
import { Modal, View, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import LoginScreen from "../screens/LoginScreen";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../theme/ThemeContext";

export default function AuthModal() {
  const { showLogin, closeLogin } = useAuthStore();
  const { colors } = useTheme();

  return (
    <Modal
      visible={showLogin}
      transparent
      animationType="fade"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "center",
          alignItems: "center"
        }}
      >

        <TouchableOpacity
          onPress={closeLogin}
          style={{
            position: "absolute",
            top: 50,
            right: 20,
            zIndex: 10
          }}
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <View
          style={{
            width: "90%",
            height: "80%", 
            backgroundColor: colors.background,
            borderRadius: 20,
            overflow: "hidden",
            justifyContent: "center"
          }}
        >
          <LoginScreen />
        </View>

      </KeyboardAvoidingView>
    </Modal>
  );
}
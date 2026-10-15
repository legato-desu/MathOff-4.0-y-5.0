import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../theme/ThemeContext";
import { useAuthStore } from "../store/authStore";
import { getRoleStyles  } from "../styles/roles.Styles"

import AdminDashboard from "./AdminDashboard";
import ProfesorDashboard from "./ProfesorDashboard";
import EstudianteDashboard from "./EstudianteDashboard";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);

  const roleStyle = getRoleStyles(user?.role ?? null);

  if (!user) {
  return null;
}

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      <View
        style={{
          backgroundColor: colors.card,
          padding: 20,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          alignItems: "center"
        }}
      >
        <Ionicons
          name={roleStyle.icon as any}
          size={50}
          color={roleStyle.accent}
        />

        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: "bold",
            marginTop: 10
          }}
        >
          {user?.username}
        </Text>

        <View
          style={{
            marginTop: 8,
            backgroundColor: roleStyle.accent,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 10
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {roleStyle.label}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {user?.role === "Administrador" && <AdminDashboard />}
        {user?.role === "Docente" && <ProfesorDashboard />}
        {user?.role === "Estudiante" && <EstudianteDashboard />}
      </View>

    </SafeAreaView>
  );
}
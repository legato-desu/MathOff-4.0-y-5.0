import React from "react";

import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { useNavigation } from "@react-navigation/native";

export default function AdminDashboard() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 25,
          color: colors.text,
        }}
      >
        Panel de Administrador
      </Text>

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 18,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10, color: colors.text }}>
          Gestión de Usuarios
        </Text>

        <Text style={{ marginBottom: 15, color: colors.textSecondary }}>
          Administrar estudiantes, docentes y permisos.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("Usuarios")}
          style={{
            backgroundColor: colors.primary,
            padding: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Ver Usuarios
          </Text>
        </TouchableOpacity>
      </View>

      {/* Roles */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 18,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10, color: colors.text }}>
          Gestión de Roles
        </Text>

        <Text style={{ marginBottom: 15, color: colors.textSecondary }}>
          Control de permisos y asignación de roles.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("Roles")}
          style={{
            backgroundColor: colors.secondary,
            padding: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Ver Roles
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reportes */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 18,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10, color: colors.text }}>
          Reportes Generales
        </Text>

        <Text style={{ marginBottom: 15, color: colors.textSecondary }}>
          Estadísticas del sistema y seguimiento académico.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("Reportes")}
          style={{
            backgroundColor: colors.accent,
            padding: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Ver Reportes
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
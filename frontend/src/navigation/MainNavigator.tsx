
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomTabs from "./BottomTabs";
import LoginScreen from "../screens/LoginScreen";
import LibraryScreen from "../screens/LibraryScreen";
import LearnDetailScreen from "../screens/LearnDetailScreen";
import UsuariosScreen from "../screens/UsuariosScreen";
import RolesScreen from "../screens/RolesScreen";
import ReportesScreen from "../screens/ReportesScreen";
import RespuestasScreen from "../screens/RespuestasScreen";
import { useAuthStore } from "../store/authStore";

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  const canManageUsers = [
    "Root",
    "Administrador",
    "Docente",
  ].includes(role ?? "");

  const isRoot = role === "Root";
  const isAdmin = role === "Administrador";

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Tabs" component={BottomTabs} />

      <Stack.Screen
        name="Libreria"
        component={LibraryScreen}
      />

      <Stack.Screen
        name="LearnDetail"
        component={LearnDetailScreen}
      />

      <Stack.Screen
        name="Respuestas"
        component={RespuestasScreen}
      />

      {!isAuthenticated && (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
      )}

      {isAuthenticated && canManageUsers && (
        <Stack.Screen
          name="Usuarios"
          component={UsuariosScreen}
        />
      )}

      {isAuthenticated && (isRoot || isAdmin) && (
  <Stack.Screen
    name="Roles"
    component={RolesScreen}
  />
)}

      {isAuthenticated && (isRoot || isAdmin) && (
        <Stack.Screen
          name="Reportes"
          component={ReportesScreen}
        />
      )}
    </Stack.Navigator>
  );
}

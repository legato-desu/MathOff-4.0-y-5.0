import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./BottomTabs";
import LoginScreen from "../screens/LoginScreen";
import LibraryScreen from "../screens/LibraryScreen";
import LearnDetailScreen from "../screens/LearnDetailScreen";
import UsuariosScreen from "../screens/UsuariosScreen";
import RolesScreen from "../screens/RolesScreen";
import ReportesScreen from "../screens/ReportesScreen";
import { useAuthStore } from "../store/authStore";
import RespuestasScreen from "../screens/RespuestasScreen";

const Stack = createNativeStackNavigator();

export default function MainNavigator() {

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const user = useAuthStore(
    (state) => state.user
  );

  return (

    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >

      <Stack.Screen
        name="Tabs"
        component={BottomTabs}
      />

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

      {isAuthenticated &&
        user?.role === "Administrador" && (
          <>
            <Stack.Screen
              name="Usuarios"
              component={UsuariosScreen}
            />

            <Stack.Screen
              name="Roles"
              component={RolesScreen}
            />

            <Stack.Screen
              name="Reportes"
              component={ReportesScreen}
            />
          </>
        )}

    </Stack.Navigator>
  );
}
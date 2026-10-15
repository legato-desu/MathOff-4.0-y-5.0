import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { useTheme } from "../theme/ThemeContext";
import { useAuthStore } from "../store/authStore";

import GraphScreen from "../screens/GraphScreen";
import ScanScreen from "../screens/ScanScreen";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {

  const { colors } = useTheme();

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({

        headerShown: false,

        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          height: 70,
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,

        tabBarIcon: ({ color, focused }) => {

          let iconName: any;

          if (route.name === "Inicio") {
            iconName = focused
              ? "home"
              : "home-outline";
          }

          else if (route.name === "Escaner") {
            iconName = focused
              ? "scan"
              : "scan-outline";
          }

          else if (route.name === "Grafico") {
            iconName = focused
              ? "stats-chart"
              : "stats-chart-outline";
          }

          else if (route.name === "Opciones") {
            iconName = focused
              ? "settings"
              : "settings-outline";
          }

          else if (route.name === "Perfil") {
            iconName = focused
              ? "person"
              : "person-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={22}
              color={color}
            />
          );
        },
      })}
    >

      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Escaner"
        component={ScanScreen}
        options={{
          tabBarIcon: () => (
            <View
              style={{
                backgroundColor: colors.primary,
                width: 50,
                height: 50,
                borderRadius: 40,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 30,
              }}
            >
              <Ionicons
                name="scan"
                size={30}
                color={colors.background}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Grafico"
        component={GraphScreen}
      />

      {isAuthenticated && (
        <Tab.Screen
          name="Perfil"
          component={ProfileScreen}
        />
      )}

      <Tab.Screen
        name="Opciones"
        component={SettingsScreen}
      />

    </Tab.Navigator>
  );
}
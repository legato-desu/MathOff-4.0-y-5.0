import 'react-native-gesture-handler';

import React from "react";

import { NavigationContainer } from "@react-navigation/native";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  SafeAreaProvider,
} from "react-native-safe-area-context";

import { ThemeProvider } from "./src/theme/ThemeContext";

import MainNavigator from "./src/navigation/MainNavigator";

import AuthModal from "./src/components/AuthModal";

export default function App() {

  return (

    <GestureHandlerRootView style={{ flex: 1 }}>

      <SafeAreaProvider>

        <ThemeProvider>

          <NavigationContainer>

            <MainNavigator />

            <AuthModal />

          </NavigationContainer>

        </ThemeProvider>

      </SafeAreaProvider>

    </GestureHandlerRootView>
  );
}
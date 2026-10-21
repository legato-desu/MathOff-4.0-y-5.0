import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { darkColors, lightColors } from "./colors";

type ThemeType = typeof darkColors | typeof lightColors;

interface ThemeContextType {
  colors: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "APP_THEME";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {

  const [isDark, setIsDark] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          setIsDark(saved === "dark");
        }
      } catch (e) {
        console.log("Error loading theme", e);
      } finally {
        setLoaded(true);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newValue = !isDark;
      setIsDark(newValue);
      await AsyncStorage.setItem(STORAGE_KEY, newValue ? "dark" : "light");
    } catch (e) {
      console.log("Error saving theme", e);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return context;
};
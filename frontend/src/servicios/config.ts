import { Platform } from "react-native";

// En un teléfono físico, configura EXPO_PUBLIC_API_URL con la IP LAN del equipo.
const defaultHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || `http://${defaultHost}:8000/api`
).replace(/\/$/, "");

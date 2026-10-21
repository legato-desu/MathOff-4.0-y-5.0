import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  logo: TextStyle;
  heroCard: ViewStyle;
  heroImage: ImageStyle;
  overlay: ViewStyle;
  functionBox: ViewStyle;
  functionText: TextStyle;
  content: ViewStyle;
  title: TextStyle;
  primary: TextStyle;
  subtitle: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
}

export default (colors: any, isDark: boolean): Styles =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 50,
      paddingHorizontal: 20,
      backgroundColor: colors.background,
    },

    header: {
      marginBottom: 20,
    },

    logo: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.primary,
    },

    heroCard: {
      borderRadius: 25,
      height: 200,
      overflow: "hidden",
      marginBottom: 25,

      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.6 : 0.2,
      shadowRadius: 25,
      elevation: 10,
    },

    heroImage: {
      width: "100%",
      height: "100%",
      position: "absolute",
    },

    overlay: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: isDark
        ? "rgba(7,26,36,0.6)"
        : "rgba(255,255,255,0.4)",
    },

    functionBox: {
      position: "absolute",
      top: 15,
      left: 15,
      backgroundColor: isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.05)",
      padding: 10,
      borderRadius: 10,
    },

    functionText: {
      color: colors.primary,
      fontSize: 14,
    },

    content: {
      alignItems: "center",
    },

    title: {
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 15,
      color: colors.text,
    },

    primary: {
      color: colors.primary,
    },

    subtitle: {
      fontSize: 15,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 20,
      color: colors.textSecondary,
    },

    button: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: "center",
      backgroundColor: colors.primary,

      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.5 : 0.2,
      shadowRadius: 20,
      elevation: 10,
    },

    buttonText: {
      color: isDark ? "#071A24" : "#FFFFFF",
      fontWeight: "bold",
      fontSize: 16,
    },
  });

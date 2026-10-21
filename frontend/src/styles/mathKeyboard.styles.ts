import { StyleSheet } from "react-native";

export const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      marginTop: 20,
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },

    key: {
      backgroundColor: colors.button,
      padding: 15,
      borderRadius: 10,
      width: "18%",
      alignItems: "center",
    },

    keyClear: {
      backgroundColor: colors.error,
    },

    keyDelete: {
      backgroundColor: colors.accent,
    },

    keyEqual: {
      backgroundColor: colors.primary,
      transform: [{ scale: 1.05 }],
    },

    text: {
      color: colors.text,
    },

    textDark: {
      color: colors.background,
      fontWeight: "bold",
    },
  });
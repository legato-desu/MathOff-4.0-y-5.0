import { StyleSheet } from "react-native";

export const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },

    title: {
      color: colors.text,
      fontSize: 22,
      marginBottom: 10,
    },

    input: {
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 10,
      color: colors.text,
      marginBottom: 10,
    },

    errorText: {
      color: colors.error,
      marginBottom: 10,
    },
  });
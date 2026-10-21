import { StyleSheet } from "react-native";

export const createStyles = (colors: any) =>
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },

    header: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "600",
      marginBottom: 20,
    },

    profileCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 25,
    },

    profileLeft: {
      flexDirection: "row",
      alignItems: "center",
    },

    avatar: {
      width: 50,
      height: 50,
      borderRadius: 15,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
    },

    name: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "500",
    },

    plan: {
      color: colors.primary,
      marginTop: 2,
    },

    section: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 10,
      marginTop: 10,
      letterSpacing: 1,
    },

    card: {
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: 15,
      marginBottom: 20,
    },

    item: {
      color: colors.text,
      marginLeft: 10,
    },

    value: {
      color: colors.textSecondary,
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },

    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
    },

    logout: {
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 14,
      padding: 15,
      alignItems: "center",
    },

    logoutText: {
      color: colors.error,
      fontWeight: "600",
    },

    button: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 10,
    },

    buttonText: {
      color: colors.background,
      fontWeight: "bold",
    },

    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 10,
    },

    input: {
      flex: 1,
      color: colors.text,
      paddingVertical: 12,
      marginLeft: 10,
    },

  });
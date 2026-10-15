import { StyleSheet } from "react-native";

export const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 25,
      justifyContent: "center",
    },

    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 15,
    },

    logoBox: {
      width: 70,
      height: 70,
      backgroundColor: colors.card,
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      marginBottom: 15,
    },

    logoImage: {
      width: 60,
      height: 60,
      resizeMode: "contain",
    },

    title: {
      color: colors.text,
      fontSize: 24,
      textAlign: "center",
    },

    subtitle: {
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 30,
    },

    input: {
      flex: 1,
      color: colors.text,
      paddingVertical: 15,
      marginLeft: 10,
    },

    forgot: {
      color: colors.primary,
      textAlign: "right",
      marginBottom: 20,
    },

    button: {
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 12,
      alignItems: "center",
    },

    buttonText: {
      color: colors.background,
      fontWeight: "bold",
    },

    or: {
      color: colors.textSecondary,
      textAlign: "center",
      marginVertical: 20,
    },

    socialRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    socialBtn: {
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 12,
      width: "48%",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },

    socialText: {
      color: colors.text,
    },

    footer: {
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 30,
    },

    link: {
      color: colors.primary,
    },
  });
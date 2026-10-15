import { StyleSheet } from "react-native";

export const getStyles = (colors: any) =>
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 20,
    },

    scrollContent: {
      alignItems: "center", 
      paddingBottom: 40
    },

    content: {
      width: "100%",
      maxWidth: 420, 
      alignSelf: "center",
      paddingHorizontal: 10
    },

    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },

    header: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "bold",
      marginLeft: 10
    },

    tabsContainer: {
      flexDirection: "row",
      marginBottom: 20,
    },

    activeTab: {
      color: colors.primary,
      marginRight: 20,
      fontWeight: "bold",
    },

    inactiveTab: {
      color: colors.text,
      opacity: 0.6,
    },

    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
      marginTop: 10
    },

    sectionTitle: {
      color: colors.text,
      fontWeight: "bold",
    },

    viewAll: {
      color: colors.primary,
    },

    quickLearnTitle: {
      color: colors.text,
      fontSize: 20,
      marginBottom: 15,
      marginTop: 10,
      fontWeight: "bold",
    },

    card: {
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 12,
      marginBottom: 12,

      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3
    },

    cardTitle: {
      color: colors.text,
      fontWeight: "bold",
      marginBottom: 5,
    },

    cardSubtitle: {
      color: colors.text,
      fontSize: 12,
      opacity: 0.7
    },

  });
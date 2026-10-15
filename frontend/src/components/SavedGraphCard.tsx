import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../theme/ThemeContext";

type Props = {
  title: string;
};

export default function SavedGraphCard({ title }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        width: 150,
        height: 120,
        backgroundColor: colors.card,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
      }}
    >
      <Text style={{ color: colors.text }}>{title}</Text>
    </View>
  );
}
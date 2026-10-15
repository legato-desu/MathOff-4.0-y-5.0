import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export default function CustomAlert({
  visible,
  title,
  message,
  type = "info",
  onClose,
}: Props) {
  const { colors } = useTheme();

  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      default:
        return "information-circle";
    }
  };

  const getColor = () => {
    switch (type) {
      case "success":
        return "#22c55e";
      case "error":
        return "#ef4444";
      default:
        return colors.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
            padding: 25,
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                width: "100%",
                backgroundColor: colors.card,
                borderRadius: 22,
                padding: 25,
                alignItems: "center",
              }}
            >
              <Ionicons
                name={getIcon() as any}
                size={65}
                color={getColor()}
              />

              <Text
                style={{
                  color: colors.text,
                  fontSize: 22,
                  fontWeight: "bold",
                  marginTop: 15,
                }}
              >
                {title}
              </Text>

              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 16,
                  textAlign: "center",
                  marginTop: 12,
                  lineHeight: 24,
                }}
              >
                {message}
              </Text>

              <TouchableOpacity
                onPress={onClose}
                style={{
                  marginTop: 25,
                  backgroundColor: getColor(),
                  paddingVertical: 14,
                  paddingHorizontal: 40,
                  borderRadius: 14,
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  ENTENDIDO
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
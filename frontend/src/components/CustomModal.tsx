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

  type?: "success" | "error" | "warning";

  onClose: () => void;
}

export default function CustomModal({
  visible,
  title,
  message,
  type = "success",
  onClose,
}: Props) {

  const { colors } = useTheme();

  const getColor = () => {

    switch (type) {

      case "success":
        return colors.success;

      case "warning":
        return colors.warning;

      case "error":
        return colors.error;

      default:
        return colors.primary;
    }
  };

  const getIcon = () => {

    switch (type) {

      case "success":
        return "checkmark-circle";

      case "warning":
        return "warning";

      case "error":
        return "alert-circle";

      default:
        return "information-circle";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <TouchableWithoutFeedback
        onPress={onClose}
      >
        <View
          style={{
            flex: 1,

            backgroundColor:
              "rgba(0,0,0,0.6)",

            justifyContent: "center",

            alignItems: "center",

            padding: 20,
          }}
        >

          <TouchableWithoutFeedback>

            <View
              style={{
                width: "90%",

                backgroundColor:
                  colors.card,

                borderRadius: 22,

                padding: 25,

                alignItems: "center",

                borderWidth: 1,

                borderColor:
                  colors.border,
              }}
            >

              <Ionicons
                name={getIcon() as any}
                size={70}
                color={getColor()}
              />

              <Text
                style={{
                  color: colors.text,

                  fontSize: 24,

                  fontWeight: "bold",

                  marginTop: 15,
                }}
              >
                {title}
              </Text>

              <Text
                style={{
                  color:
                    colors.textSecondary,

                  textAlign: "center",

                  marginTop: 12,

                  fontSize: 16,

                  lineHeight: 24,
                }}
              >
                {message}
              </Text>

              <TouchableOpacity
                onPress={onClose}
                style={{
                  marginTop: 25,

                  backgroundColor:
                    getColor(),

                  paddingVertical: 13,

                  paddingHorizontal: 45,

                  borderRadius: 14,
                }}
              >
                <Text
                  style={{
                    color: "#fff",

                    fontWeight: "bold",

                    fontSize: 16,
                  }}
                >
                  Entendido
                </Text>
              </TouchableOpacity>

            </View>

          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
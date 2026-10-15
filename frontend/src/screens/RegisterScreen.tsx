import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { createStyles } from "../styles/login.styles";
import { registerRequest } from "../servicios/api";
import CustomModal from "../components/CustomModal";

type Props = {
  onBack: () => void;
};

export default function RegisterScreen({
  onBack,
}: Props) {

  const { colors } = useTheme();

  const styles = createStyles(colors);

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  // MODAL
  const [showModal, setShowModal] =
    useState(false);

  const [modalTitle, setModalTitle] =
    useState("");

  const [modalMessage, setModalMessage] =
    useState("");

  const [modalType, setModalType] =
    useState<
      "success" | "error" | "warning"
    >("success");

  const openSuccessModal = (
    message: string
  ) => {

    setModalTitle("Éxito");

    setModalMessage(message);

    setModalType("success");

    setShowModal(true);
  };

  const openErrorModal = (
    message: string
  ) => {

    setModalTitle("Error");

    setModalMessage(message);

    setModalType("error");

    setShowModal(true);
  };

  const handleRegister = async () => {

    if (
      !username ||
      !email ||
      !password
    ) {

      openErrorModal(
        "Completa todos los campos"
      );

      return;
    }

    try {

      await registerRequest(
        username,
        email,
        password
      );

      openSuccessModal(
        "Cuenta creada correctamente"
      );

      setTimeout(() => {
        onBack();
      }, 1500);

    } catch (error: any) {

      openErrorModal(
        error.message ||
          "No se pudo crear la cuenta"
      );
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Crear cuenta
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name="person-outline"
          size={18}
          color={colors.textSecondary}
        />

        <TextInput
          placeholder="Usuario"
          placeholderTextColor={
            colors.textSecondary
          }
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="mail-outline"
          size={18}
          color={colors.textSecondary}
        />

        <TextInput
          placeholder="Correo"
          placeholderTextColor={
            colors.textSecondary
          }
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color={colors.textSecondary}
        />

        <TextInput
          placeholder="Contraseña"
          placeholderTextColor={
            colors.textSecondary
          }
          secureTextEntry={!showPassword}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          onPress={() =>
            setShowPassword(
              !showPassword
            )
          }
        >
          <Ionicons
            name={
              showPassword
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>
          REGISTRAR
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onBack}
      >
        <Text style={styles.link}>
          Volver al login
        </Text>
      </TouchableOpacity>

      {/* MODAL */}
      <CustomModal
        visible={showModal}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() =>
          setShowModal(false)
        }
      />

    </View>
  );
}
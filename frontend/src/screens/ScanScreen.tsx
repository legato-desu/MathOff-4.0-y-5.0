import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scanEquationRequest } from "../servicios/api";
import { useAuthStore } from "../store/authStore";
import { useGraphStore } from "../store/graphStore";
import { useScanStore } from "../store/scanStore";
import { useTheme } from "../theme/ThemeContext";
import { evaluateExpression } from "../utils/math.utils";

export default function ScanScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const openLogin = useAuthStore((state) => state.openLogin);
  const addImage = useScanStore((state) => state.addImage);
  const sendToGraph = useGraphStore((state) => state.sendToGraph);
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [expression, setExpression] = useState("");
  const [rawText, setRawText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token && permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission?.granted, permission?.canAskAgain, token]);

  const capture = async () => {
    if (!camera.current || busy) return;
    try {
      setError("");
      const photo = await camera.current.takePictureAsync({ quality: 0.75 });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setExpression("");
        setRawText("");
      }
    } catch {
      setError("No se pudo tomar la foto. Intenta de nuevo.");
    }
  };

  const recognize = async () => {
    if (!photoUri || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await scanEquationRequest(photoUri);
      setRawText(result.raw_text);
      setExpression(result.expression);
      if (!result.expression) setError("No se detectó una ecuación. Toma otra foto o escríbela abajo.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo conectar con el servidor local.");
    } finally {
      setBusy(false);
    }
  };

  const graph = () => {
    const candidate = expression.trim();
    const validation = evaluateExpression(candidate);
    if (validation.error) {
      setError("Corrige la expresión. Ejemplo: x^2+2*x+1");
      return;
    }
    if (photoUri && user?.user_id) addImage(user.user_id, photoUri);
    sendToGraph(candidate);
    setPhotoUri(null);
    setExpression("");
    setRawText("");
    setError("");
    navigation.navigate("Grafico");
  };

  const button = (label: string, onPress: () => void, secondary = false, disabled = false) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{ backgroundColor: secondary ? colors.surface : colors.primary, padding: 15,
        borderRadius: 12, alignItems: "center", marginTop: 12, opacity: disabled ? 0.5 : 1 }}
    >
      <Text style={{ color: secondary ? colors.text : "#fff", fontWeight: "bold" }}>{label}</Text>
    </TouchableOpacity>
  );

  if (!token) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center" }}>
      <Text style={{ color: colors.text, textAlign: "center" }}>Inicia sesión para escanear ecuaciones.</Text>
      {button("Iniciar sesión", openLogin)}
    </SafeAreaView>;
  }

  if (!permission) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center" }}>
      <ActivityIndicator color={colors.primary} />
    </SafeAreaView>;
  }

  if (!permission.granted) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center" }}>
      <Text style={{ color: colors.text, textAlign: "center" }}>MathOff necesita permiso de cámara para leer la ecuación.</Text>
      {permission.canAskAgain && button("Permitir cámara", requestPermission)}
      {!permission.canAskAgain && <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 12 }}>Activa el permiso desde los ajustes del dispositivo.</Text>}
    </SafeAreaView>;
  }

  if (!photoUri) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, textAlign: "center", padding: 16, fontSize: 16 }}>
        Enfoca una ecuación clara sobre un fondo uniforme.
      </Text>
      <CameraView ref={camera} style={{ flex: 1 }} facing="back" />
      <SafeAreaView style={{ padding: 16 }}>
        {error ? <Text style={{ color: colors.error, textAlign: "center" }}>{error}</Text> : null}
        {button("Tomar foto", capture, false, busy)}
      </SafeAreaView>
    </SafeAreaView>;
  }

  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: "bold" }}>Escáner de ecuaciones</Text>
      <Image source={{ uri: photoUri }} resizeMode="contain" style={{ width: "100%", height: 240, marginTop: 16 }} />
      {button(busy ? "Reconociendo…" : "Reconocer ecuación", recognize, false, busy)}
      {busy && <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />}
      {rawText ? <Text style={{ color: colors.textSecondary, marginTop: 20 }}>Texto detectado: {rawText}</Text> : null}
      <Text style={{ color: colors.text, marginTop: 20, marginBottom: 8 }}>Revisa la expresión antes de graficar</Text>
      <TextInput
        value={expression}
        onChangeText={setExpression}
        placeholder="Ejemplo: x^2+2*x+1"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        style={{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border,
          borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 18 }}
      />
      {error ? <Text style={{ color: colors.error, marginTop: 12 }}>{error}</Text> : null}
      {button("Graficar expresión", graph, false, busy)}
      {button("Tomar otra foto", () => { setPhotoUri(null); setExpression(""); setRawText(""); setError(""); }, true, busy)}
    </ScrollView>
  </SafeAreaView>;
}

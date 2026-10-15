import React, {
  useState,
  useEffect,
  useRef
} from "react";

import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Animated
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import GraphView from "../components/GraphView";
import MathKeyboard from "../components/MathKeyboard";
import { useTheme } from "../theme/ThemeContext";
import { createStyles } from "../styles/graph.styles";
import { evaluateExpression } from "../utils/math.utils";
import { useGraphStore } from "../store/graphStore";

export default function GraphScreen() {

  const { colors } = useTheme();

  const styles = createStyles(colors);

  const token =
    useAuthStore((state) => state.token);

  const openLogin =
    useAuthStore((state) => state.openLogin);

  const [expression, setExpression] =
    useState("");

  const [functions, setFunctions] =
    useState<any[]>([]);

  const [error, setError] =
    useState<string | null>(null);
  const pendingExpression = useGraphStore((state) => state.pendingExpression);
  const clearPending = useGraphStore((state) => state.clearPending);

  useEffect(() => {
    if (pendingExpression) {
      const result = evaluateExpression(pendingExpression);
      if (result.fn) {
        setFunctions((previous) => [{
          fn: result.fn!, color: "#00C2FF", expr: pendingExpression, active: true,
        }, ...previous]);
        setExpression("");
        setError(null);
      } else {
        setExpression(pendingExpression);
        setError(result.error);
      }
      clearPending();
    }
  }, [pendingExpression, clearPending]);

  const shakeAnim =
    useRef(new Animated.Value(0)).current;

  const INPUT_AREA_HEIGHT = 110;

  const triggerShake = () => {

    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true
      }),

      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true
      }),

      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true
      }),

      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true
      }),
    ]).start();
  };

  useEffect(() => {

    if (!token) {
      openLogin();
    }

  }, [token]);

  useEffect(() => {

    if (!token) {

      setFunctions([]);
      setExpression("");
      setError(null);

    }

  }, [token]);

  if (!token) {

    return (

      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center"
          }
        ]}
      >

        <Text
          style={{
            color: colors.text,
            marginBottom: 20,
            textAlign: "center"
          }}
        >
          Debes iniciar sesión para usar el graficador
        </Text>

        <Animated.View
          style={{
            transform: [
              {
                translateX: shakeAnim
              }
            ]
          }}
        >

          <TouchableOpacity
            onPress={() => {

              triggerShake();
              openLogin();

            }}
            style={{
              backgroundColor: colors.primary,
              padding: 12,
              borderRadius: 10
            }}
          >

            <Text
              style={{
                color: "#fff",
                fontWeight: "bold"
              }}
            >
              Iniciar sesión
            </Text>

          </TouchableOpacity>

        </Animated.View>

      </View>
    );
  }

  const getRandomColor = () => {

    const palette = [
      "#00C2FF",
      "#FF6B6B",
      "#FFD93D",
      "#6BCB77",
      "#A66CFF",
      "#FF9F1C",
      "#2EC4B6",
      "#E71D36",
      "#8338EC",
      "#3A86FF"
    ];

    return palette[
      Math.floor(
        Math.random() * palette.length
      )
    ];
  };

  const handleInput = (
    value: string
  ) => {

    if (value === "=") {

      const result =
        evaluateExpression(expression);

      if (result.error) {

        setError(result.error);

        return;
      }

      const newFn = {
        fn: result.fn!,
        color: getRandomColor(),
        expr: expression,
        active: true
      };

      setFunctions((prev) => [
        newFn,
        ...prev
      ]);

      setExpression("");
      setError(null);

      return;
    }

    setExpression(
      (prev) => prev + value
    );
  };

  const handleDelete = () => {

    setExpression(
      (prev) => prev.slice(0, -1)
    );
  };

  const handleClear = () => {

    setExpression("");
    setError(null);
  };

  const removeFunction = (
    index: number
  ) => {

    setFunctions((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const toggleFunction = (
    index: number
  ) => {

    setFunctions((prev) =>
      prev.map((f, i) =>
        i === index
          ? {
              ...f,
              active: !f.active
            }
          : f
      )
    );
  };

  return (

    <SafeAreaView style={styles.container}>

      <View
        style={{
          position: "absolute",
          top: 10,
          left: 16,
          right: 16,
          zIndex: 999
        }}
      >

        <Text style={styles.title}>
          Graficador
        </Text>

        <TextInput
          style={styles.input}
          placeholder="f(x) = ..."
          placeholderTextColor={
            colors.textMuted
          }
          value={expression}
          onChangeText={setExpression}
        />

        {error && (

          <Text style={styles.errorText}>
            {error}
          </Text>

        )}

      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: INPUT_AREA_HEIGHT,
          paddingBottom: 40
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <GraphView
          fns={functions.filter(
            (f) => f.active
          )}
        />

        <View
          style={{
            marginTop: 10,
            height: 120,
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 8
          }}
        >

          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >

            {functions.length === 0 ? (

              <Text
                style={{
                  color: colors.textMuted,
                  textAlign: "center",
                  marginTop: 35
                }}
              >
                No hay funciones agregadas
              </Text>

            ) : (

              functions.map((f, i) => (

                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor:
                      colors.background,
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    marginBottom: 6,
                    opacity: f.active
                      ? 1
                      : 0.4
                  }}
                >

                  <TouchableOpacity
                    onPress={() =>
                      toggleFunction(i)
                    }
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center"
                    }}
                  >

                    <Text
                      numberOfLines={1}
                      style={{
                        color: f.color,
                        flex: 1,
                        fontWeight: "600"
                      }}
                    >
                      {f.expr}
                    </Text>

                    <Text
                      style={{
                        color: f.active
                          ? "#00FFAA"
                          : colors.textMuted,
                        fontWeight: "bold",
                        marginHorizontal: 10
                      }}
                    >
                      {f.active
                        ? "ON"
                        : "OFF"}
                    </Text>

                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      removeFunction(i)
                    }
                  >

                    <Text
                      style={{
                        color: colors.error,
                        fontWeight: "bold",
                        fontSize: 18
                      }}
                    >
                      ✕
                    </Text>

                  </TouchableOpacity>

                </View>

              ))
            )}

          </ScrollView>

        </View>

        <View
          style={{
            marginTop: 14
          }}
        >

          <MathKeyboard
            onInput={handleInput}
            onDelete={handleDelete}
            onClear={handleClear}
          />

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

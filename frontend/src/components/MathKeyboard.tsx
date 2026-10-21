import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { useTheme } from "../theme/ThemeContext";
import { createStyles } from "../styles/mathKeyboard.styles";

type Props = {
  onInput: (value: string) => void;
  onDelete: () => void;
  onClear: () => void;
};

const keys = [
  ["C","⌫"],
  ["sin(","cos(","tan(","log(","ln("],
  ["π","√(","e","^","/"],
  ["x","7","8","9","+"],
  ["y","4","5","6","*"],
  ["("," )","1","2","3"],
  ["0",".","-","="]
];

export default function MathKeyboard({ onInput, onDelete, onClear }: Props) {

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const getKeyStyle = (key: string) => {
    if (key === "C") return [styles.key, styles.keyClear];
    if (key === "⌫") return [styles.key, styles.keyDelete];
    if (key === "=") return [styles.key, styles.keyEqual];
    return styles.key;
  };

  const getTextStyle = (key: string) => {
    if (key === "=") return [styles.text, styles.textDark];
    return styles.text;
  };

  return (
    <View style={styles.container}>

      {keys.map((row, i) => (
        <View key={i} style={styles.row}>

          {row.map((k) => (
            <TouchableOpacity
              key={k}
              style={getKeyStyle(k)}
              onPress={() => {
                if (k === "⌫") return onDelete();
                if (k === "C") return onClear();
                onInput(k);
              }}
            >
              <Text style={getTextStyle(k)}>{k}</Text>
            </TouchableOpacity>
          ))}

        </View>
      ))}

    </View>
  );
}
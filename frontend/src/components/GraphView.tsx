import React, {
  useState,
  useRef,
  useMemo
} from "react";

import { View } from "react-native";

import Svg, {
  Path,
  Line,
  Text as SvgText
} from "react-native-svg";

import {
  Gesture,
  GestureDetector
} from "react-native-gesture-handler";

import { useTheme } from "../theme/ThemeContext";

import { styles } from "../styles/graphView.styles";

type FnType = {
  fn: (x: number) => number;
  color: string;
};

type Props = {
  fns: FnType[];
};

export default function GraphView({
  fns
}: Props) {

  const { colors } = useTheme();

  const width = 400;
  const height = 220;

  const [scale, setScale] =
    useState(20);

  const [offset, setOffset] =
    useState({
      x: 0,
      y: 0
    });

  // ✅ refs reales
  const scaleRef = useRef(20);

  const offsetRef = useRef({
    x: 0,
    y: 0
  });

  const centerX =
    width / 2 + offset.x;

  const centerY =
    height / 2 + offset.y;

  // ✅ PINCH SEGURO
  const pinchScale = useRef(20);

const pinchGesture = Gesture.Pinch()

  .onUpdate((e) => {

    pinchScale.current =
      Math.max(
        5,
        Math.min(
          100,
          scaleRef.current * e.scale
        )
      );
  })

  .onEnd(() => {

    scaleRef.current =
      pinchScale.current;

    setScale(
      pinchScale.current
    );
  });

const panOffset = useRef({
  x: 0,
  y: 0
});

const panGesture = Gesture.Pan()

  .minDistance(1)

  .onUpdate((e) => {

    panOffset.current = {

      x:
        offsetRef.current.x +
        e.translationX,

      y:
        offsetRef.current.y +
        e.translationY,
    };
  })

  .onEnd(() => {

    offsetRef.current =
      panOffset.current;

    setOffset(
      panOffset.current
    );
  });

  // ✅ GESTO COMBINADO
  const gesture =
    Gesture.Simultaneous(
      pinchGesture,
      panGesture
    );

  // ✅ PATHS MEMO
  const paths = useMemo(() => {

    return fns.map(
      ({ fn, color }) => {

        let path = "";
        let first = true;

        for (
          let px = 0;
          px < width;
          px++
        ) {

          const x =
            (px - centerX) / scale;

          let y;

          try {

            y = fn(x);

          } catch {

            continue;
          }

          // ✅ evita infinitos
          if (
            typeof y !== "number" ||
            isNaN(y) ||
            !isFinite(y)
          ) {
            continue;
          }

          const py =
            centerY - y * scale;

          // ✅ evita valores gigantes
          if (
            py < -5000 ||
            py > 5000
          ) {
            continue;
          }

          if (first) {

            path += `M ${px} ${py}`;

            first = false;

          } else {

            path += ` L ${px} ${py}`;
          }
        }

        return {
          path,
          color
        };
      }
    );

  }, [
    fns,
    scale,
    offset
  ]);

  // ✅ GRID
  const drawGrid = () => {

    const lines = [];

    const step = scale;

    for (
      let x = centerX % step;
      x < width;
      x += step
    ) {

      lines.push(

        <Line
          key={`v-${x}`}
          x1={x}
          y1="0"
          x2={x}
          y2={height}
          stroke={colors.border}
          strokeWidth="0.5"
        />
      );
    }

    for (
      let y = centerY % step;
      y < height;
      y += step
    ) {

      lines.push(

        <Line
          key={`h-${y}`}
          x1="0"
          y1={y}
          x2={width}
          y2={y}
          stroke={colors.border}
          strokeWidth="0.5"
        />
      );
    }

    return lines;
  };

  // ✅ LABELS
  const drawAxisLabels = () => {

    const labels = [];

    let step = scale;

    if (scale < 15)
      step = scale * 2;

    if (scale < 10)
      step = scale * 4;

    for (
      let px = centerX % step;
      px < width;
      px += step
    ) {

      const value =
        (px - centerX) / scale;

      if (
        Math.abs(value) < 0.001
      ) {
        continue;
      }

      labels.push(

        <SvgText
          key={`x-${px}`}
          x={px}
          y={centerY + 15}
          fontSize="10"
          fill={colors.text}
          textAnchor="middle"
        >
          {
            scale > 30
              ? value.toFixed(1)
              : Math.round(value)
          }
        </SvgText>
      );
    }

    for (
      let py = centerY % step;
      py < height;
      py += step
    ) {

      const value =
        (centerY - py) / scale;

      if (
        Math.abs(value) < 0.001
      ) {
        continue;
      }

      labels.push(

        <SvgText
          key={`y-${py}`}
          x={centerX + 5}
          y={py}
          fontSize="10"
          fill={colors.text}
        >
          {
            scale > 30
              ? value.toFixed(1)
              : Math.round(value)
          }
        </SvgText>
      );
    }

    return labels;
  };

  return (

    <View style={styles.container}>

      <GestureDetector
        gesture={gesture}
      >

        <View>

          <Svg
            height={height}
            width={width}
          >

            {drawGrid()}

            {drawAxisLabels()}

            {/* eje X */}
            <Line
              x1="0"
              y1={centerY}
              x2={width}
              y2={centerY}
              stroke={
                colors.textSecondary
              }
            />

            {/* eje Y */}
            <Line
              x1={centerX}
              y1="0"
              x2={centerX}
              y2={height}
              stroke={
                colors.textSecondary
              }
            />

            {/* funciones */}
            {paths.map((p, i) => (

              <Path
                key={i}
                d={p.path}
                stroke={p.color}
                strokeWidth="2"
                fill="none"
              />

            ))}

          </Svg>

        </View>

      </GestureDetector>

    </View>
  );
}
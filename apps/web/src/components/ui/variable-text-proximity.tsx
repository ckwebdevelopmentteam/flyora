// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MutableRefObject,
} from "react";

/* Roboto Flex is a variable font with `wght` + `opsz` axes — the whole effect
   depends on it. Load it once via a stylesheet <link> (was next/font, which the
   sandbox can't build). */
const FONT_ID = "hpx-roboto-flex-font";
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,100..1000&display=swap";
const FONT_STACK = '"Roboto Flex", ui-sans-serif, system-ui, sans-serif';

export function useRobotoFlex() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(FONT_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_ID;
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);
}

function useAnimationFrame(callback: () => void) {
  useEffect(() => {
    let frameId: number;
    const loop = () => {
      callback();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [callback]);
}

function usePointerPositionRef(
  containerRef: MutableRefObject<HTMLElement | null>,
) {
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        positionRef.current = { x: x - rect.left, y: y - rect.top };
      } else {
        positionRef.current = { x, y };
      }
    };

    const handleMouseMove = (ev: MouseEvent) =>
      updatePosition(ev.clientX, ev.clientY);
    const handleTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0];
      if (touch) updatePosition(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [containerRef]);

  return positionRef;
}

export type Falloff = "linear" | "exponential" | "gaussian";

export interface ProximityLettersProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  containerRef: MutableRefObject<HTMLElement | null>;
  radius?: number;
  falloff?: Falloff;
  className?: string;
  style?: CSSProperties;
  wordColors?: Record<string, string>;
}

/**
 * The reveal engine: splits `label` into per-letter spans and, on every frame,
 * interpolates each letter's `font-variation-settings` between the `from` and
 * `to` strings based on its distance from the (smoothed) pointer.
 */
export const ProximityLetters = forwardRef<
  HTMLSpanElement,
  ProximityLettersProps
>((props, ref) => {
  const {
    label,
    fromFontVariationSettings,
    toFontVariationSettings,
    containerRef,
    radius = 50,
    falloff = "linear",
    className = "",
    style,
    wordColors,
    ...restProps
  } = props;

  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const interpolatedSettingsRef = useRef<string[]>([]);
  const mousePositionRef = usePointerPositionRef(containerRef);
  const smoothedPositionRef = useRef({ x: 0, y: 0 });
  const lastPositionRef = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });
  const reducedMotionRef = useRef(false);
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      reducedMotionRef.current = mediaQuery.matches;
    };
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const done = () => {
      if (!cancelled) setFontReady(true);
    };
    // Explicitly load the Roboto Flex faces (the <link> is injected async, so
    // document.fonts.ready alone can resolve before the webfont registers and
    // letters get measured in the fallback font).
    if (typeof document !== "undefined" && document.fonts?.load) {
      Promise.all([
        document.fonts.load("1em 'Roboto Flex'"),
        document.fonts.load("italic 1em 'Roboto Flex'"),
      ])
        .then(() => document.fonts.ready)
        .then(done)
        .catch(done);
    } else {
      done();
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // Lock each letter to the wider of its from/to widths so heavier glyphs
  // don't reflow the paragraph.
  useEffect(() => {
    if (!fontReady) return;
    letterRefs.current.forEach((letterRef) => {
      if (!letterRef) return;
      const prevSettings = letterRef.style.fontVariationSettings;

      letterRef.style.fontVariationSettings = fromFontVariationSettings;
      const fromWidth = letterRef.getBoundingClientRect().width;

      letterRef.style.fontVariationSettings = toFontVariationSettings;
      const toWidth = letterRef.getBoundingClientRect().width;

      letterRef.style.fontVariationSettings = prevSettings;
      letterRef.style.display = "inline-block";
      letterRef.style.textAlign = "center";
      letterRef.style.width = `${Math.max(fromWidth, toWidth)}px`;
    });
  }, [fromFontVariationSettings, toFontVariationSettings, label, fontReady]);

  const parsedSettings = useMemo(() => {
    const parseSettings = (settingsStr: string) =>
      new Map(
        settingsStr
          .split(",")
          .map((s) => s.trim())
          .map((s) => {
            const [name, value] = s.split(" ");
            return [name.replace(/['"]/g, ""), parseFloat(value)];
          }),
      );

    const fromSettings = parseSettings(fromFontVariationSettings);
    const toSettings = parseSettings(toFontVariationSettings);

    return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: toSettings.get(axis) ?? fromValue,
    }));
  }, [fromFontVariationSettings, toFontVariationSettings]);

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  const calculateFalloff = (distance: number) => {
    const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
    switch (falloff) {
      case "exponential":
        return norm ** 2;
      case "gaussian":
        return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
      case "linear":
      default:
        return norm;
    }
  };

  useAnimationFrame(() => {
    if (!containerRef?.current) return;
    const target = mousePositionRef.current;
    const smoothed = smoothedPositionRef.current;

    if (reducedMotionRef.current) {
      smoothed.x = target.x;
      smoothed.y = target.y;
    } else {
      const lerpFactor = 0.18;
      smoothed.x += (target.x - smoothed.x) * lerpFactor;
      smoothed.y += (target.y - smoothed.y) * lerpFactor;
    }

    if (
      lastPositionRef.current.x !== null &&
      Math.abs(smoothed.x - lastPositionRef.current.x) < 0.01 &&
      Math.abs(smoothed.y - (lastPositionRef.current.y as number)) < 0.01
    ) {
      return;
    }
    lastPositionRef.current = { x: smoothed.x, y: smoothed.y };
    const containerRect = containerRef.current.getBoundingClientRect();

    letterRefs.current.forEach((letterRef, index) => {
      if (!letterRef) return;

      const rect = letterRef.getBoundingClientRect();
      const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
      const letterCenterY = rect.top + rect.height / 2 - containerRect.top;

      const distance = calculateDistance(
        smoothed.x,
        smoothed.y,
        letterCenterX,
        letterCenterY,
      );

      if (distance >= radius) {
        letterRef.style.fontVariationSettings = fromFontVariationSettings;
        return;
      }

      const falloffValue = calculateFalloff(distance);
      const newSettings = parsedSettings
        .map(({ axis, fromValue, toValue }) => {
          const interpolatedValue =
            fromValue + (toValue - fromValue) * falloffValue;
          return `'${axis}' ${interpolatedValue}`;
        })
        .join(", ");

      interpolatedSettingsRef.current[index] = newSettings;
      letterRef.style.fontVariationSettings = newSettings;
    });
  });

  const words = label.split(" ");
  let letterIndex = 0;

  return (
    <span
      ref={ref}
      style={{ display: "inline", ...style }}
      className={className}
      {...restProps}
    >
      {words.map((word, wordIndex) => {
        const cleanWord = word.replace(/[^a-zA-Z]/g, "").toUpperCase();
        const wordColor = wordColors?.[cleanWord];

        return (
          <span
            key={wordIndex}
            style={{
              display: "inline-block",
              whiteSpace: "nowrap",
            }}
          >
            {word.split("").map((letter) => {
              const currentLetterIndex = letterIndex++;
              const isLetterChar = /[a-zA-Z0-9]/.test(letter);
              return (
                <span
                  key={currentLetterIndex}
                  ref={(el) => {
                    letterRefs.current[currentLetterIndex] = el;
                  }}
                  style={{
                    display: "inline-block",
                    color: isLetterChar && wordColor ? wordColor : undefined,
                    fontVariationSettings:
                      interpolatedSettingsRef.current[currentLetterIndex],
                  }}
                  aria-hidden="true"
                >
                  {letter}
                </span>
              );
            })}
            {wordIndex < words.length - 1 && (
              <span style={{ display: "inline-block" }}>&nbsp;</span>
            )}
          </span>
        );
      })}
      <span className="sr-only">{label}</span>
    </span>
  );
});
ProximityLetters.displayName = "ProximityLetters";

export interface VariableTextProximityProps {
  /** Paragraph rendered letter-by-letter. */
  text?: string;
  /** Pointer influence radius, in pixels. */
  radius?: number;
  /** How the effect fades with distance from the pointer. */
  falloff?: Falloff;
  /** `wght` axis value away from the pointer. */
  baseWeight?: number;
  /** `wght` axis value nearest the pointer. */
  hoverWeight?: number;
  /** `opsz` axis value away from the pointer. */
  baseOpticalSize?: number;
  /** `opsz` axis value nearest the pointer. */
  hoverOpticalSize?: number;
  /** Slant nearby letters toward italic on proximity. */
  italic?: boolean;
  /** Paragraph font size, in pixels (clamped down on narrow viewports). */
  fontSize?: number;
  /** Paragraph line height. */
  lineHeight?: number;
  /** Minimum paragraph width, in pixels. */
  minWidth?: number;
  /** Maximum paragraph width, in pixels. */
  maxWidth?: number;
  /** Override the themed background (defaults to `background`). */
  backgroundColor?: string;
  /** Override the themed text color (defaults to `foreground`). */
  textColor?: string;
  className?: string;
}

const DEFAULT_TEXT =
  "Every letter keeps its own distance from the cursor. Drift across the paragraph and the nearest glyphs gain weight first, then the surrounding words settle back into place.";

export default function VariableTextProximity({
  text = DEFAULT_TEXT,
  radius = 100,
  falloff = "linear",
  baseWeight = 300,
  hoverWeight = 800,
  baseOpticalSize = 9,
  hoverOpticalSize = 40,
  italic = false,
  fontSize = 55,
  lineHeight = 1.18,
  minWidth = 920,
  maxWidth = 1040,
  backgroundColor,
  textColor,
  className = "",
}: VariableTextProximityProps) {
  useRobotoFlex();
  const stageRef = useRef<HTMLDivElement | null>(null);

  const fromFontVariationSettings = `'wght' ${baseWeight}, 'opsz' ${baseOpticalSize}, 'slnt' 0`;
  const toFontVariationSettings = `'wght' ${hoverWeight}, 'opsz' ${hoverOpticalSize}, 'slnt' ${
    italic ? -10 : 0
  }`;

  const rootStyle: CSSProperties = {};
  if (backgroundColor) rootStyle.background = backgroundColor;
  if (textColor) rootStyle.color = textColor;

  return (
    <section
      className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-6 text-foreground ${className}`}
      style={rootStyle}
    >
      <div
        ref={stageRef}
        className="relative z-10 mx-auto text-center"
        style={{
          width: `min(${maxWidth}px, calc(100vw - 2rem))`,
          minWidth: `min(${minWidth}px, ${maxWidth}px, calc(100vw - 2rem))`,
          maxWidth: `min(${maxWidth}px, calc(100vw - 2rem))`,
        }}
      >
        <ProximityLetters
          label={text}
          fromFontVariationSettings={fromFontVariationSettings}
          toFontVariationSettings={toFontVariationSettings}
          containerRef={stageRef}
          radius={radius}
          falloff={falloff}
          style={{
            position: "relative",
            zIndex: 1,
            color: "inherit",
            fontFamily: FONT_STACK,
            fontSize: `clamp(28px, 6.5vw, ${fontSize}px)`,
            lineHeight,
            letterSpacing: 0,
          }}
        />
      </div>
    </section>
  );
}

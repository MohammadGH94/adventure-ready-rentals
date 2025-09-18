import type { CSSProperties } from "react";

export type Style = Record<string, unknown>;
export type StyleInput = Style | Style[] | null | undefined | false;

type ShadowConfig = {
  color?: string;
  opacity?: number;
  radius?: number;
  offset?: { width?: number; height?: number };
  elevation?: number;
};

const isStyleObject = (value: unknown): value is Style =>
  typeof value === "object" && value !== null;

const appendPx = (value: string | number | undefined) =>
  typeof value === "number" ? `${value}px` : value;

const flattenStyle = (input: StyleInput): Style => {
  if (!input) {
    return {};
  }

  if (Array.isArray(input)) {
    return input.reduce<Style>((accumulator, item) => {
      const entry = flattenStyle(item);
      return Object.assign(accumulator, entry);
    }, {});
  }

  if (isStyleObject(input)) {
    return { ...input };
  }

  return {};
};

const shadowToBoxShadow = ({ color, opacity, radius, offset, elevation }: ShadowConfig) => {
  if (!color && !radius && !offset && !elevation) {
    return undefined;
  }

  const resolvedOpacity = opacity ?? 0.25;
  const { width = 0, height = elevation ?? 0 } = offset ?? {};
  const blur = radius ?? Math.max(8, elevation ?? 0);

  return `${width}px ${height}px ${blur}px rgba(0,0,0,${resolvedOpacity})`;
};

const transformToCss = (value: Array<Record<string, unknown>>) =>
  value
    .map((entry) => {
      const [key, raw] = Object.entries(entry)[0] ?? [];
      if (!key) return "";

      switch (key) {
        case "scale":
          return `scale(${raw})`;
        case "scaleX":
          return `scaleX(${raw})`;
        case "scaleY":
          return `scaleY(${raw})`;
        case "translateX":
          return `translateX(${appendPx(raw as number | string)})`;
        case "translateY":
          return `translateY(${appendPx(raw as number | string)})`;
        case "rotate":
          return `rotate(${typeof raw === "number" ? `${raw}deg` : raw})`;
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join(" ");

const convertStyle = (style: Style): CSSProperties => {
  const result: CSSProperties = {};
  const shadow: ShadowConfig = {};

  Object.entries(style).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    switch (key) {
      case "paddingHorizontal":
        if (typeof value === "number") {
          result.paddingLeft = value;
          result.paddingRight = value;
        }
        break;
      case "paddingVertical":
        if (typeof value === "number") {
          result.paddingTop = value;
          result.paddingBottom = value;
        }
        break;
      case "marginHorizontal":
        if (typeof value === "number") {
          result.marginLeft = value;
          result.marginRight = value;
        }
        break;
      case "marginVertical":
        if (typeof value === "number") {
          result.marginTop = value;
          result.marginBottom = value;
        }
        break;
      case "shadowColor":
        shadow.color = value as string;
        break;
      case "shadowOpacity":
        shadow.opacity = Number(value);
        break;
      case "shadowRadius":
        shadow.radius = Number(value);
        break;
      case "shadowOffset":
        shadow.offset = value as ShadowConfig["offset"];
        break;
      case "elevation":
        shadow.elevation = Number(value);
        break;
      case "transform":
        if (Array.isArray(value)) {
          const transform = transformToCss(value as Array<Record<string, unknown>>);
          if (transform) {
            result.transform = transform;
          }
        }
        break;
      case "textAlignVertical":
        break;
      default:
        (result as Record<string, unknown>)[key] = value;
    }
  });

  const boxShadow = shadowToBoxShadow(shadow);
  if (boxShadow) {
    result.boxShadow = boxShadow;
  }

  return result;
};

export const resolveStyle = (style: StyleInput, base: CSSProperties = {}): CSSProperties => ({
  ...base,
  ...convertStyle(flattenStyle(style)),
});

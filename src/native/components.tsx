import React, {
  CSSProperties,
  ReactNode,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from "react";
import { resolveStyle, type StyleInput } from "./styles";
type PressableChildren = ReactNode | ((state: { pressed: boolean }) => ReactNode);

type PressableStyle = StyleInput | ((state: { pressed: boolean }) => StyleInput);

type ViewProps = React.HTMLAttributes<HTMLDivElement> & { style?: StyleInput };

type TextProps = React.HTMLAttributes<HTMLSpanElement> & { style?: StyleInput };

type ScrollViewProps = React.HTMLAttributes<HTMLDivElement> & {
  style?: StyleInput;
  contentContainerStyle?: StyleInput;
  horizontal?: boolean;
  children?: ReactNode;
};

type ImageSource = string | { uri: string };

type ImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "style" | "src"> & {
  source: ImageSource;
  style?: StyleInput;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
};

type PressableProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style" | "children" | "onClick"> & {
  style?: PressableStyle;
  children?: PressableChildren;
  onPress?: (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void;
};

type SafeAreaViewProps = ViewProps;

type SwitchProps = Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "style" | "onChange"> & {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  trackColor?: { false?: string; true?: string };
  style?: StyleInput;
};

type BaseInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "style" | "value" | "onChange" | "children">;

type BaseTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "style" | "value" | "onChange" | "children"
>;

type TextInputProps = BaseInputProps &
  BaseTextareaProps & {
    value?: string;
    onChangeText?: (value: string) => void;
    multiline?: boolean;
    keyboardType?: "default" | "numeric" | "email-address";
    placeholderTextColor?: string;
    style?: StyleInput;
  };

export const View = forwardRef<HTMLDivElement, ViewProps>(({ style, children, ...rest }, ref) => (
  <div
    ref={ref}
    style={resolveStyle(style, {
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
    })}
    {...rest}
  >
    {children}
  </div>
));
View.displayName = "View";

export const Text = forwardRef<HTMLSpanElement, TextProps>(({ style, children, ...rest }, ref) => (
  <span
    ref={ref}
    style={resolveStyle(style, {
      display: "inline",
      boxSizing: "border-box",
      fontFamily: "inherit",
    })}
    {...rest}
  >
    {children}
  </span>
));
Text.displayName = "Text";

export const ScrollView = forwardRef<HTMLDivElement, ScrollViewProps>(
  ({ style, contentContainerStyle, horizontal, children, ...rest }, ref) => (
    <div
      ref={ref}
      style={resolveStyle(style, {
        display: "flex",
        flexDirection: horizontal ? "row" : "column",
        overflowX: horizontal ? "auto" : "hidden",
        overflowY: horizontal ? "hidden" : "auto",
        boxSizing: "border-box",
      })}
      {...rest}
    >
      <div
        style={resolveStyle(contentContainerStyle, {
          display: "flex",
          flexDirection: horizontal ? "row" : "column",
          flex: 1,
          boxSizing: "border-box",
        })}
      >
        {children}
      </div>
    </div>
  ),
);
ScrollView.displayName = "ScrollView";

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ source, style, resizeMode = "cover", ...rest }, ref) => {
    const uri = typeof source === "string" ? source : source?.uri;

    return (
      <img
        ref={ref}
        src={uri}
        style={resolveStyle(style, {
          display: "block",
          objectFit:
            resizeMode === "contain"
              ? "contain"
              : resizeMode === "stretch"
              ? "fill"
              : resizeMode === "center"
              ? "contain"
              : "cover",
          width: "100%",
          height: "auto",
        })}
        {...rest}
      />
    );
  },
);
Image.displayName = "Image";

const basePressableStyle: CSSProperties = {
  border: "none",
  background: "none",
  padding: 0,
  margin: 0,
  font: "inherit",
  textAlign: "inherit",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxSizing: "border-box",
};

export const Pressable = ({ onPress, style, children, disabled, ...rest }: PressableProps) => {
  const [pressed, setPressed] = useState(false);

  const resolvedStyle = useMemo(() => {
    const computed = typeof style === "function" ? style({ pressed }) : style;
    return resolveStyle(computed, basePressableStyle);
  }, [style, pressed]);

  const content = typeof children === "function" ? children({ pressed }) : children;

  return (
    <button
      type="button"
      onClick={(event) => {
        if (disabled) return;
        onPress?.(event);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      disabled={disabled}
      style={{ ...resolvedStyle, cursor: disabled ? "default" : resolvedStyle.cursor ?? "pointer" }}
      {...rest}
    >
      {content}
    </button>
  );
};

export const SafeAreaView: React.FC<SafeAreaViewProps> = ({ style, children, ...rest }) => (
  <View
    style={resolveStyle(style, {
      width: "100%",
      minHeight: "100%",
    })}
    {...rest}
  >
    {children}
  </View>
);

export const StatusBar: React.FC<{ barStyle?: string }> = () => null;

export const Switch: React.FC<SwitchProps> = ({ value, onValueChange, disabled, trackColor, style, ...rest }) => {
  const checked = Boolean(value);
  const resolvedStyle = resolveStyle(style, { display: "inline-flex", alignItems: "center" });
  const background = checked ? trackColor?.true ?? "#4ade80" : trackColor?.false ?? "#d1d5db";

  return (
    <label style={resolvedStyle} {...rest}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onValueChange?.(event.target.checked)}
        disabled={disabled}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
      />
      <span
        style={{
          width: 44,
          height: 26,
          borderRadius: 999,
          background,
          position: "relative",
          transition: "background 0.2s ease",
          display: "inline-block",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 22 : 4,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s ease",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        />
      </span>
    </label>
  );
};

const PLACEHOLDER_STYLE_ID = "rn-text-input-placeholder-style";

const ensurePlaceholderStyles = () => {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(PLACEHOLDER_STYLE_ID)) {
    return;
  }

  const styleElement = document.createElement("style");
  styleElement.id = PLACEHOLDER_STYLE_ID;
  styleElement.textContent = `
    .rn-text-input::placeholder {
      color: var(--placeholder-color, inherit);
      opacity: 1;
    }
  `;
  document.head.appendChild(styleElement);
};

type TextInputStyle = CSSProperties & { "--placeholder-color"?: string };

export const TextInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextInputProps>(
  (
    {
      value,
      onChangeText,
      multiline,
      keyboardType = "default",
      style,
      placeholderTextColor,
      ...rest
    },
    ref,
  ) => {
    const { placeholder, className, ...inputRest } = rest;

    const resolvedStyle = resolveStyle(style, {
      border: "none",
      outline: "none",
      font: "inherit",
      width: "100%",
      boxSizing: "border-box",
      background: "transparent",
    });

    useEffect(() => {
      if (placeholderTextColor) {
        ensurePlaceholderStyles();
      }
    }, [placeholderTextColor]);

    const inputStyle: TextInputStyle = {
      ...resolvedStyle,
      color: resolvedStyle.color ?? "inherit",
      caretColor: resolvedStyle.color ?? undefined,
    };

    if (placeholderTextColor) {
      inputStyle["--placeholder-color"] = placeholderTextColor;
    }

    const combinedClassName = className ? `${className} rn-text-input` : "rn-text-input";

    const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
      onChangeText?.(event.target.value);
    };

    if (multiline) {
      return (
        <textarea
          {...(inputRest as BaseTextareaProps)}
          value={value}
          onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>}
          placeholder={placeholder}
          className={combinedClassName}
          style={inputStyle}
          ref={ref as React.Ref<HTMLTextAreaElement>}
        />
      );
    }

    const type = keyboardType === "numeric" ? "number" : keyboardType === "email-address" ? "email" : "text";
    return (
      <input
        {...(inputRest as BaseInputProps)}
        type={type}
        value={value}
        onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
        placeholder={placeholder}
        className={combinedClassName}
        style={inputStyle}
        ref={ref as React.Ref<HTMLInputElement>}
      />
    );
  },
);
TextInput.displayName = "TextInput";


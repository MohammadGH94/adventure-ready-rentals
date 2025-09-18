declare module "react-native" {
  import * as React from "react";

  export type Style = Record<string, unknown>;
  export type StyleProp = Style | Style[] | null | undefined | false;

  export interface ViewProps extends React.HTMLAttributes<HTMLDivElement> {
    style?: StyleProp;
  }

  export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
    style?: StyleProp;
  }

  export interface ScrollViewProps extends React.HTMLAttributes<HTMLDivElement> {
    style?: StyleProp;
    contentContainerStyle?: StyleProp;
    horizontal?: boolean;
    children?: React.ReactNode;
  }

  export type ImageSource = string | { uri: string };

  export interface ImageProps
    extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "style" | "src"> {
    source: ImageSource;
    style?: StyleProp;
    resizeMode?: "cover" | "contain" | "stretch" | "center";
  }

  export type PressableState = { pressed: boolean };
  export type PressableStyle = StyleProp | ((state: PressableState) => StyleProp);
  export type PressableChildren = React.ReactNode | ((state: PressableState) => React.ReactNode);

  export interface PressableProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style" | "children" | "onClick"> {
    style?: PressableStyle;
    children?: PressableChildren;
    onPress?: (
      event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
    ) => void;
  }

  export type SafeAreaViewProps = ViewProps;

  export interface SwitchProps
    extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "style" | "onChange"> {
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    disabled?: boolean;
    trackColor?: { false?: string; true?: string };
    style?: StyleProp;
  }

  export interface TextInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "style" | "value" | "onChange" | "children">,
      Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "style" | "value" | "onChange" | "children"> {
    value?: string;
    onChangeText?: (value: string) => void;
    multiline?: boolean;
    keyboardType?: "default" | "numeric" | "email-address";
    placeholderTextColor?: string;
    style?: StyleProp;
  }

  export const View: React.ForwardRefExoticComponent<ViewProps & React.RefAttributes<HTMLDivElement>>;
  export const Text: React.ForwardRefExoticComponent<TextProps & React.RefAttributes<HTMLSpanElement>>;
  export const ScrollView: React.ForwardRefExoticComponent<
    ScrollViewProps & React.RefAttributes<HTMLDivElement>
  >;
  export const Image: React.ForwardRefExoticComponent<ImageProps & React.RefAttributes<HTMLImageElement>>;
  export const Pressable: React.ComponentType<PressableProps>;
  export const SafeAreaView: React.ComponentType<SafeAreaViewProps>;
  export const StatusBar: React.ComponentType<{ barStyle?: string }>;
  export const Switch: React.ComponentType<SwitchProps>;
  export const TextInput: React.ForwardRefExoticComponent<
    TextInputProps &
      React.RefAttributes<HTMLInputElement | HTMLTextAreaElement>
  >;

  export const StyleSheet: {
    create<T extends Record<string, Style>>(styles: T): T;
    hairlineWidth: number;
  };

  export const Platform: {
    OS: string;
  };

  export function useWindowDimensions(): {
    width: number;
    height: number;
    scale: number;
    fontScale: number;
  };

  export const AppRegistry: {
    registerComponent(
      appKey: string,
      componentProvider: () => React.ComponentType<Record<string, unknown>>,
    ): void;
    runApplication(
      appKey: string,
      parameters: { initialProps?: Record<string, unknown>; rootTag: HTMLElement | null },
    ): void;
  };
}

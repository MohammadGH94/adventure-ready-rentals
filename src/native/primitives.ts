import { createElement, type ComponentType, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Style } from "./styles";

type ComponentProvider = () => ComponentType<Record<string, unknown>>;

export const StyleSheet = {
  create<T extends Record<string, Style>>(styles: T): T {
    return styles;
  },
  hairlineWidth: 1,
};

export const Platform = {
  OS: "web",
};

export const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
    scale: typeof window !== "undefined" ? window.devicePixelRatio ?? 1 : 1,
    fontScale: 1,
  }));

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
        scale: window.devicePixelRatio ?? 1,
        fontScale: 1,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
};

const registry = new Map<string, ComponentProvider>();

export const AppRegistry = {
  registerComponent(appKey: string, componentProvider: ComponentProvider) {
    registry.set(appKey, componentProvider);
  },
  runApplication(
    appKey: string,
    parameters: { initialProps?: Record<string, unknown>; rootTag: HTMLElement | null },
  ) {
    const component = registry.get(appKey);
    if (!component || !parameters.rootTag) {
      return;
    }

    const RootComponent = component();
    const root = createRoot(parameters.rootTag);
    root.render(createElement(RootComponent, parameters.initialProps ?? {}));
  },
};

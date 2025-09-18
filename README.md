# Adventure Ready Rentals

Adventure Ready Rentals is a React application that mimics a React Native project so the same component layer can serve web and future native targets.  The UI has been rebuilt using React Native primitives such as `View`, `Text`, and `ScrollView`, all powered by a lightweight custom implementation that renders to the DOM.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development server

```bash
npm run dev
```

The dev server runs on [http://localhost:8080](http://localhost:8080/) by default.

### Linting and build

```bash
npm run lint
npm run build
```

`npm run lint` must pass without warnings before creating a build.

## Project Structure

- `src/native/` – Custom React Native runtime for the web.  Components live in `components.tsx`, platform utilities in `primitives.ts`, and styling helpers in `styles.ts`.  The directory is aliased to `react-native` in `vite.config.ts` so application code can `import { View, StyleSheet } from "react-native"`.
- `types/react-native.d.ts` – Ambient module declarations describing the API exposed by `src/native`.
- `src/components/` – Shared UI building blocks composed with React Native primitives.
- `src/pages/` – Route-level screens rendered by the React Router configuration in `src/navigation`.
- `src/main.tsx` – Entry point that registers the app with the custom `AppRegistry` and boots React Query and routing providers.

## Styling Notes

- Use `StyleSheet.create` to organise style objects; styles accept standard React Native style keys and fall back to DOM equivalents.
- `TextInput` supports `placeholderTextColor`; the component injects the appropriate CSS so placeholder colours render in the browser.
- The shim implements `Pressable`, `ScrollView`, `Switch`, `Image`, and layout primitives with web-friendly behaviour.  When writing new components rely on these abstractions instead of HTML tags to keep the codebase portable.

## Testing and Platform Behaviour

Automated tests are not included.  When adding features pay attention to:

- Pressable `style` functions and disabled state handling.
- Horizontal `ScrollView` behaviour in both desktop and mobile layouts.
- `Switch` transitions and keyboard interaction.
- `TextInput` support for `multiline` and `keyboardType`.
- Routing fallbacks supplied by the memory router (for non-web platforms) inside `src/navigation/AppRouter.tsx`.

## Documentation Updates

If you extend the React Native layer or add new primitives, update both `src/native` and the type stubs in `types/react-native.d.ts` to keep the runtime and typing experience in sync.

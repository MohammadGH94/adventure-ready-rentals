import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";

import AppRouter from "./navigation/AppRouter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <AppRouter />
    </SafeAreaView>
  </QueryClientProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f5",
  },
});

export default App;

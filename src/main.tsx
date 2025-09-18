import { AppRegistry } from "react-native";
import App from "./App";

const APP_NAME = "AdventureReadyRentals";

AppRegistry.registerComponent(APP_NAME, () => App);

if (typeof document !== "undefined") {
  AppRegistry.runApplication(APP_NAME, {
    initialProps: {},
    rootTag: document.getElementById("root"),
  });
}

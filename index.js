import "react-native-gesture-handler";
import React from "react";
import { registerRootComponent } from "expo";

import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import App from "./App";
import { ReducedMotionProvider } from "./utils/motion";

function Root() {
  return (
    <ReducedMotionProvider>
      <App />
    </ReducedMotionProvider>
  );
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(gestureHandlerRootHOC(Root));

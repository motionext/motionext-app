import { useCallback, useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import "../global.css"

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls in this block
        //TODO: Load fonts
        console.log("[SplashScreen] Preparing");
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);


  if (appIsReady) {
    console.log("[SplashScreen] Hiding splash screen");
    // This tells the splash screen to hide immediately!
    SplashScreen.hideAsync();
  }

  if (!appIsReady) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" />
    </Stack>
  );
}

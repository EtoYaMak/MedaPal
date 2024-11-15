import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useColorScheme, StatusBar } from "react-native";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { ThemeProvider as CustomThemeProvider } from "@/hooks/useTheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "auth",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();

  // Monitor auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CustomThemeProvider>
        <NavigationThemeProvider
          value={
            colorScheme === "dark" ? NavigationDarkTheme : NavigationDefaultTheme
          }
        >
          <Stack
            screenOptions={{
              animation: "fade_from_bottom",
              headerShown: false,
              contentStyle: {
                backgroundColor: 'transparent',
              },
            }}
          >
            <Stack.Screen 
              name="auth" 
              options={{
                animation: "fade",
              }} 
            />
            <Stack.Screen 
              name="(tabs)" 
              options={{
                animation: "fade",
              }}
            />
          </Stack>
        </NavigationThemeProvider>
      </CustomThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav({ session }: { session: Session | null }) {
  return (
    <Stack>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

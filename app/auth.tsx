import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  AppState,
  TouchableOpacity,
  TextInput,
  Text,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Fontisto } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import colors from "@/constants/Colors";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors } = useAppTheme();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    else router.replace("/(tabs)");
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    else if (session) router.replace("/(tabs)");
    else Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <Fontisto name="pills" size={30} color="black" />
          <Text style={styles.title}>MedPal</Text>
        </View>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <TextInput
            placeholder="Email"
            onChangeText={(text) => setEmail(text)}
            value={email}
            autoCapitalize={"none"}
            style={{
              padding: 10,
              borderRadius: 5,
              borderBottomWidth: 1,
              borderBottomColor: "#F0F0F0",
            }}
          />
        </View>
        <View style={styles.verticallySpaced}>
          <TextInput
            placeholder="Password"
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            autoCapitalize={"none"}
            style={{
              padding: 10,
              borderRadius: 5,
              borderBottomWidth: 1,
              borderBottomColor: "#F0F0F0",
            }}
          />
        </View>
        <View style={styles.bottomContainer}>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TouchableOpacity
              disabled={loading}
              onPress={() => signInWithEmail()}
              style={{
                backgroundColor: "black",
                padding: 10,
                borderRadius: 5,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.verticallySpaced}>
            <TouchableOpacity
              disabled={loading}
              onPress={() => signUpWithEmail()}
              style={{
                backgroundColor: "#F0F0F0",
                padding: 10,
                borderRadius: 5,
              }}
            >
              <Text
                style={{
                  color: "black",
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    marginTop: 40,
    padding: 12,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 60,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
});

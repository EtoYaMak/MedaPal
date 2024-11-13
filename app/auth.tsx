import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Text,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Fontisto, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";

const { width } = Dimensions.get("window");

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  async function handleAuth() {
    setLoading(true);
    try {
      if (isSignUp) {
        const {
          data: { session },
          error,
        } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (session) router.replace("/(tabs)");
        else
          Alert.alert("Success", "Please check your inbox for verification!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 24,
    },
    header: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingVertical: 16,
    },
    heroSection: {
      alignItems: "center",
      marginTop: 40,
      marginBottom: 60,
    },
    logoContainer: {
      backgroundColor: colors.primary,
      padding: 20,
      borderRadius: 24,
      marginBottom: 24,
    },
    appName: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 12,
    },
    tagline: {
      fontSize: 16,
      color: colors.subText,
      textAlign: "center",
      maxWidth: width * 0.8,
    },
    form: {
      gap: 16,
    },
    inputContainer: {
      gap: 8,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      gap: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
    },
    input: {
      flex: 1,
      height: 48,
      color: colors.text,
      fontSize: 16,
      paddingLeft: 8,
    },
    iconContainer: {
      padding: 8,
    },
    mainButton: {
      backgroundColor: colors.primary,
      height: 56,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 24,
    },
    mainButtonText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "600",
    },
    switchButton: {
      marginTop: 16,
      alignItems: "center",
    },
    switchText: {
      color: colors.primary,
      fontSize: 16,
    },
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.header}>
            <ThemeToggle />
          </View>

          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Fontisto name="pills" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>MedPal</Text>
            <Text style={styles.tagline}>
              Your personal medication tracking assistant
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={24}
                  color={colors.subText}
                />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor={colors.subText}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={24}
                  color={colors.subText}
                />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor={colors.subText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={styles.input}
                />
                <TouchableOpacity
                  style={styles.iconContainer}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color={colors.subText}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.mainButton, loading && { opacity: 0.7 }]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.mainButtonText}>
                {loading
                  ? "Please wait..."
                  : isSignUp
                  ? "Create Account"
                  : "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchText}>
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "New here? Create Account"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

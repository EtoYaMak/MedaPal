import { useState, useEffect } from "react";
import { StyleSheet, Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { Text, View } from "@/components/Themed";
import { Session } from "@supabase/supabase-js";
import { TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Account() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSession(session);
          if (session) {
            await getProfile(session);
          }
        }
      } catch (error) {
        console.error("Error getting session:", error);
      }
    }

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        getProfile(session);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function getProfile(currentSession: Session) {
    try {
      setLoading(true);
      const { user } = currentSession;

      if (!user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, avatar_url`)
        .eq("id", user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session.user.id,
        username,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;
      Alert.alert("Profile updated!");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/auth");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      <View style={styles.formContainer}>
        <View style={styles.verticallySpaced}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={session?.user?.email ?? ""}
            editable={false}
          />
        </View>

        <View style={styles.verticallySpaced}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username || ""}
            onChangeText={(text) => setUsername(text)}
            placeholder="Enter a username"
          />
        </View>

        <View style={styles.verticallySpaced}>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => updateProfile()}
              disabled={loading}
            >
              <Text style={styles.buttonTextIn}>
                {loading ? "Loading ..." : "Update"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.verticallySpaced}>
            <TouchableOpacity
              style={[styles.button, styles.signOutButton]}
              onPress={signOut}
            >
              <Text style={styles.buttonTextOut}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  formContainer: {
    width: "90%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 40,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  signOutButton: {
    backgroundColor: "red",
    marginTop: 10,
  },
  buttonTextIn: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonTextOut: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

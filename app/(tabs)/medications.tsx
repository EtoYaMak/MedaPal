import { View, Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "@/components/PageHeader";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { VoiceAssistant } from "@/components/ai/voice-assistant";
import { useTheme } from "@/hooks/useTheme";

type TimeOfDay = "morning" | "afternoon" | "evening" | "bedtime";

interface MedicationDetails {
  medication_name: string;
  dosage: string;
  dosage_unit: string;
  frequency: string;
  times_per_frequency: number;
  preferred_time: TimeOfDay[];
  remaining_quantity?: string;
  notes?: string;
}

export default function MedicationsScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [isAssistantVisible, setIsAssistantVisible] = useState(true);

  useEffect(() => {
    // Check session on component mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        Alert.alert(
          "Authentication Required",
          "Please log in to add medications",
          [
            {
              text: "OK",
              onPress: () => router.push("/auth"),
            },
          ]
        );
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleMedicationComplete = async (
    medicationDetails: MedicationDetails
  ) => {
    try {
      if (!session) {
        Alert.alert(
          "Authentication Required",
          "Please log in to add medications",
          [{ text: "OK", onPress: () => router.push("/auth") }]
        );
        return;
      }

      // Format the data for Supabase
      const formattedData = {
        user_id: session.user.id,
        medication_name: medicationDetails.medication_name,
        dosage: medicationDetails.dosage,
        dosage_unit: medicationDetails.dosage_unit,
        frequency: medicationDetails.frequency,
        times_per_frequency: Number(medicationDetails.times_per_frequency),
        preferred_time: Array.isArray(medicationDetails.preferred_time)
          ? medicationDetails.preferred_time
          : [medicationDetails.preferred_time],
        remaining_quantity: medicationDetails.remaining_quantity
          ? parseInt(medicationDetails.remaining_quantity)
          : null,
        notes: medicationDetails.notes || null,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("medications")
        .insert(formattedData);

      if (error) {
        if (error.message.includes("JWT")) {
          Alert.alert("Session Expired", "Please log in again", [
            { text: "OK", onPress: () => router.push("/auth") },
          ]);
          return;
        }
        throw error;
      }

      Alert.alert("Success", "Medication added successfully!");
      router.push("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Failed to add medication. Please try again later.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <PageHeader title="AI Assistant" showBack />
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        <VoiceAssistant
          isVisible={isAssistantVisible}
          onClose={() => setIsAssistantVisible(false)}
          onMedicationComplete={handleMedicationComplete}
          theme={theme}
          colors={colors}
        />
      </View>
    </SafeAreaView>
  );
}

import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";

// Define the time slots enum to match your Supabase enum
type TimeOfDay = "morning" | "afternoon" | "evening" | "bedtime";

export default function AddMedicationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    medication_name: "",
    dosage: "",
    dosage_unit: "mg",
    frequency: "daily",
    times_per_frequency: 1,
    preferred_time: ["morning"] as TimeOfDay[], // Default to morning
    remaining_quantity: "",
    notes: "",
    refill_reminder: false,
    refill_reminder_threshold: "",
  });

  async function addMedication() {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        Alert.alert("Error", "Not authenticated");
        return;
      }

      const { error } = await supabase.from("medications").insert({
        user_id: session.user.id,
        ...formData,
        remaining_quantity: parseInt(formData.remaining_quantity) || null,
        refill_reminder_threshold:
          parseInt(formData.refill_reminder_threshold) || null,
      });

      if (error) throw error;

      Alert.alert("Success", "Medication added successfully");
      router.back();
    } catch (error) {
      console.error("Error adding medication:", error);
      Alert.alert("Error", "Failed to add medication");
    } finally {
      setLoading(false);
    }
  }

  const handleTimeSelection = (time: TimeOfDay) => {
    const currentTimes = [...formData.preferred_time];
    const timeIndex = currentTimes.indexOf(time);

    if (timeIndex >= 0) {
      // Remove time if already selected
      currentTimes.splice(timeIndex, 1);
    } else {
      // Add time if not selected
      currentTimes.push(time);
    }

    setFormData({ ...formData, preferred_time: currentTimes });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Add New Medication</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medication Name</Text>
            <TextInput
              style={styles.input}
              value={formData.medication_name}
              onChangeText={(text) =>
                setFormData({ ...formData, medication_name: text })
              }
              placeholder="Enter medication name"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                style={styles.input}
                value={formData.dosage}
                onChangeText={(text) =>
                  setFormData({ ...formData, dosage: text })
                }
                keyboardType="numeric"
                placeholder="Enter dosage"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Unit</Text>
              <Picker
                selectedValue={formData.dosage_unit}
                onValueChange={(value) =>
                  setFormData({ ...formData, dosage_unit: value })
                }
                style={styles.picker}
              >
                <Picker.Item label="mg" value="mg" />
                <Picker.Item label="ml" value="ml" />
                <Picker.Item label="pills" value="pills" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Frequency</Text>
            <Picker
              selectedValue={formData.frequency}
              onValueChange={(value) =>
                setFormData({ ...formData, frequency: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Daily" value="daily" />
              <Picker.Item label="Weekly" value="weekly" />
              <Picker.Item label="Monthly" value="monthly" />
            </Picker>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Time</Text>
            <View style={styles.timeButtons}>
              {(
                ["morning", "afternoon", "evening", "bedtime"] as TimeOfDay[]
              ).map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    formData.preferred_time.includes(time) &&
                      styles.timeButtonSelected,
                  ]}
                  onPress={() => handleTimeSelection(time)}
                >
                  <Text
                    style={[
                      styles.timeButtonText,
                      formData.preferred_time.includes(time) &&
                        styles.timeButtonTextSelected,
                    ]}
                  >
                    {time === "bedtime" ? "Bedtime" : time.charAt(0).toUpperCase() + time.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Times per {formData.frequency}</Text>
            <TextInput
              style={styles.input}
              value={formData.times_per_frequency.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  times_per_frequency: parseInt(text) || 1,
                })
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Remaining Quantity</Text>
            <TextInput
              style={styles.input}
              value={formData.remaining_quantity}
              onChangeText={(text) =>
                setFormData({ ...formData, remaining_quantity: text })
              }
              keyboardType="numeric"
              placeholder="Optional"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
              numberOfLines={4}
              placeholder="Optional notes"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={addMedication}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Adding..." : "Add Medication"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "white",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  picker: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  timeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 5,
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
  timeButtonSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  timeButtonText: {
    color: "#666",
  },
  timeButtonTextSelected: {
    color: "white",
  },
});

import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  View,
  Text,
  Platform,
  Dimensions,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { PageHeader } from "@/components/PageHeader";

const { width } = Dimensions.get("window");

type TimeOfDay = "morning" | "afternoon" | "evening" | "bedtime";

export default function AddMedicationScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    medication_name: "",
    dosage: "",
    dosage_unit: "mg",
    frequency: "daily",
    times_per_frequency: 1,
    preferred_time: ["morning"] as TimeOfDay[],
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
      currentTimes.splice(timeIndex, 1);
    } else {
      currentTimes.push(time);
    }

    setFormData({ ...formData, preferred_time: currentTimes });
  };

  function getTimeStyle(time: TimeOfDay, isSelected: boolean) {
    const isDark = theme === "dark";

    switch (time) {
      case "morning":
        return {
          background: isSelected
            ? isDark
              ? "#FF9800"
              : "#FF9800"
            : isDark
            ? "#433327"
            : "#FFF3E0",
          text: isSelected ? "#FFFFFF" : isDark ? "#FF9800" : "#E65100",
          icon: "weather-sunny" as const,
        };
      case "afternoon":
        return {
          background: isSelected
            ? isDark
              ? "#FFC107"
              : "#FFC107"
            : isDark
            ? "#443D27"
            : "#FFF8E1",
          text: isSelected ? "#FFFFFF" : isDark ? "#FFC107" : "#FF8F00",
          icon: "weather-partly-cloudy" as const,
        };
      case "evening":
        return {
          background: isSelected
            ? isDark
              ? "#2196F3"
              : "#2196F3"
            : isDark
            ? "#273844"
            : "#E3F2FD",
          text: isSelected ? "#FFFFFF" : isDark ? "#2196F3" : "#0D47A1",
          icon: "weather-sunset" as const,
        };
      case "bedtime":
        return {
          background: isSelected
            ? isDark
              ? "#673AB7"
              : "#673AB7"
            : isDark
            ? "#342D44"
            : "#EDE7F6",
          text: isSelected ? "#FFFFFF" : isDark ? "#673AB7" : "#4527A0",
          icon: "bed" as const,
        };
    }
  }

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: 20,
      flex: 1,
      paddingBottom: 100,
    },

    section: {
      marginBottom: 24,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      shadowColor: theme === "dark" ? "#000" : "#666",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      color: colors.subText,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pickerContainer: {
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      ...Platform.select({
        android: {
          width: "100%",
        },
      }),
    },
    picker: {
      height: Platform.OS === "ios" ? 150 : 50,
      width: "100%",
      color: colors.text,
      marginLeft: Platform.OS === "android" ? -8 : 0,
    },
    row: {
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
    },
    timeButtons: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    timeButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      gap: 6,
    },
    timeButtonText: {
      fontSize: 14,
      fontWeight: "500",
    },
    textArea: {
      height: 100,
      textAlignVertical: "top",
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginTop: 24,
      marginBottom: 24,
    },
    submitButtonText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "600",
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    backButtonText: {
      color: colors.text,
      fontSize: 16,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader title="Add Medication" showBack />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medication Name</Text>
            <TextInput
              style={styles.input}
              value={formData.medication_name}
              onChangeText={(text) =>
                setFormData({ ...formData, medication_name: text })
              }
              placeholder="Enter medication name"
              placeholderTextColor={colors.subText}
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
                placeholder="Amount"
                placeholderTextColor={colors.subText}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Unit</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.dosage_unit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, dosage_unit: value })
                  }
                  dropdownIconColor={colors.text}
                  mode="dropdown"
                  style={[
                    styles.picker,
                    Platform.OS === "android" && {
                      width: "100%",
                      backgroundColor: colors.background,
                      color: colors.text,
                    },
                  ]}
                  itemStyle={Platform.OS === "ios" ? {
                    fontSize: 16,
                    color: colors.text,
                    backgroundColor: colors.card,
                  } : {}}
                  dropdownIconRippleColor="transparent"
                >
                  <Picker.Item
                    label="mg"
                    value="mg"
                    style={{
                      backgroundColor: colors.card,
                      color: colors.text,
                      fontSize: 16,
                    }}
                  />
                  <Picker.Item
                    label="ml"
                    value="ml"
                    style={{
                      backgroundColor: colors.card,
                      color: colors.text,
                      fontSize: 16,
                    }}
                  />
                  <Picker.Item
                    label="Pills"
                    value="pills"
                    style={{
                      backgroundColor: colors.card,
                      color: colors.text,
                      fontSize: 16,
                    }}
                  />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.frequency}
                onValueChange={(value) =>
                  setFormData({ ...formData, frequency: value })
                }
                dropdownIconColor={colors.text}
                mode="dropdown"
                style={[
                  styles.picker,
                  Platform.OS === "android" && {
                    backgroundColor: colors.background,
                    color: colors.text,
                  },
                ]}
                itemStyle={
                  Platform.OS === "ios"
                    ? {
                        fontSize: 16,
                        color: colors.text,
                        backgroundColor: colors.card,
                      }
                    : {}
                }
              >
                <Picker.Item
                  label="Daily"
                  value="daily"
                  style={{
                    backgroundColor: colors.card,
                    color: colors.text,
                  }}
                />
                <Picker.Item
                  label="Weekly"
                  value="weekly"
                  style={{
                    backgroundColor: colors.card,
                    color: colors.text,
                  }}
                />
                <Picker.Item
                  label="Monthly"
                  value="monthly"
                  style={{
                    backgroundColor: colors.card,
                    color: colors.text,
                  }}
                />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Time</Text>
            <View style={styles.timeButtons}>
              {(
                ["morning", "afternoon", "evening", "bedtime"] as TimeOfDay[]
              ).map((time) => {
                const isSelected = formData.preferred_time.includes(time);
                const timeStyle = getTimeStyle(time, isSelected);

                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeButton,
                      {
                        backgroundColor: timeStyle.background,
                        borderWidth: 1,
                        borderColor: timeStyle.background,
                      },
                    ]}
                    onPress={() => handleTimeSelection(time)}
                  >
                    <MaterialCommunityIcons
                      name={timeStyle.icon}
                      size={18}
                      color={timeStyle.text}
                    />
                    <Text
                      style={[styles.timeButtonText, { color: timeStyle.text }]}
                    >
                      {time.charAt(0).toUpperCase() + time.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
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
              placeholderTextColor={colors.subText}
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
              placeholder="Add any additional notes here"
              placeholderTextColor={colors.subText}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && { opacity: 0.7 }]}
          onPress={addMedication}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Adding..." : "Add Medication"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

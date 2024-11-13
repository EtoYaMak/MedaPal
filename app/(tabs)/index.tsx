import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { PageHeader } from "@/components/PageHeader";

interface Medication {
  id: string;
  medication_name: string;
  dosage: string;
  dosage_unit: string;
  frequency: string;
  times_per_frequency: number;
  preferred_time: string[];
  remaining_quantity?: number;
  notes?: string;
}

export default function DashboardScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const { colors } = useTheme();

  const getUserMedications = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setMedications(data);
    } catch (error) {
      console.error("Error fetching medications:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getUserMedications();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    getUserMedications();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const getTimeIcon = (time: string) => {
    const colors = getTimeBackgroundColor(time);

    switch (time) {
      case "morning":
        return <MaterialIcons name="wb-sunny" size={16} color={colors.text} />;
      case "afternoon":
        return <MaterialIcons name="wb-sunny" size={16} color={colors.text} />;
      case "evening":
        return (
          <MaterialIcons name="wb-twilight" size={16} color={colors.text} />
        );
      case "bedtime":
        return <MaterialIcons name="bedtime" size={16} color={colors.text} />;
      default:
        return null;
    }
  };

  function getTimeBackgroundColor(time: string): { bg: string; text: string } {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    switch (time) {
      case "morning":
        return {
          bg: isDark ? "#FF9800" : "#FFF3E0",
          text: isDark ? "#FFFFFF" : "#E65100",
        };
      case "afternoon":
        return {
          bg: isDark ? "#FFC107" : "#FFF8E1",
          text: isDark ? "#000000" : "#FF8F00",
        };
      case "evening":
        return {
          bg: isDark ? "#2196F3" : "#E3F2FD",
          text: isDark ? "#FFFFFF" : "#0D47A1",
        };
      case "bedtime":
        return {
          bg: isDark ? "#673AB7" : "#EDE7F6",
          text: isDark ? "#FFFFFF" : "#4527A0",
        };
      default:
        return {
          bg: isDark ? "#424242" : "#F5F5F5",
          text: isDark ? "#FFFFFF" : "#212121",
        };
    }
  }

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 8,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: "transparent",
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.text,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      marginTop: 100,
      backgroundColor: "transparent",
    },
    emptyText: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
      color: colors.text,
      backgroundColor: "transparent",
    },
    emptySubText: {
      fontSize: 16,
      color: colors.subText,
      textAlign: "center",
      backgroundColor: "transparent",
    },
    medicationGrid: {
      padding: 15,
      paddingTop: 10,
      backgroundColor: "transparent",
    },
    medicationCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 15,
      marginBottom: 12,
      shadowColor: colors.text,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.08,
      shadowRadius: 2.5,
      elevation: 2,
    },
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      backgroundColor: "transparent",
    },
    nameContainer: {
      flex: 1,
      backgroundColor: "transparent",
    },
    medicationName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    dosageText: {
      fontSize: 14,
      color: colors.subText,
    },
    frequencyBadge: {
      backgroundColor: colors.badge.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    frequencyText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.badge.text,
    },
    timeBadgesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      backgroundColor: "transparent",
      marginBottom: 8,
    },
    timeBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      gap: 4,
    },
    timeBadgeText: {
      fontSize: 12,
    },
    remainingStrip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.border,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: "flex-start",
    },
    remainingText: {
      fontSize: 12,
      color: colors.text,
    },
    fab: {
      position: "absolute",
      right: 20,
      bottom: 20,
      backgroundColor: colors.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader title="My Medications" />

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {medications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No medications added yet</Text>
            <Text style={styles.emptySubText}>
              Tap the + button below to add your first medication
            </Text>
          </View>
        ) : (
          <View style={styles.medicationGrid}>
            {medications.map((med) => (
              <TouchableOpacity
                key={med.id}
                style={styles.medicationCard}
                onPress={() => {
                  // Handle card press - maybe navigate to detail view
                }}
              >
                <View style={styles.cardTop}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.medicationName} numberOfLines={1}>
                      {med.medication_name}
                    </Text>
                    <Text style={styles.dosageText}>
                      {med.dosage} {med.dosage_unit}
                    </Text>
                  </View>

                  <View style={styles.frequencyBadge}>
                    <Text style={styles.frequencyText}>
                      {med.times_per_frequency}x
                    </Text>
                  </View>
                </View>

                <View style={styles.timeBadgesContainer}>
                  {med.preferred_time.map((time, index) => {
                    const timeColors = getTimeBackgroundColor(time);
                    return (
                      <View
                        key={index}
                        style={[
                          styles.timeBadge,
                          { backgroundColor: timeColors.bg },
                        ]}
                      >
                        {getTimeIcon(time)}
                        <Text
                          style={[
                            styles.timeBadgeText,
                            { color: timeColors.text },
                          ]}
                        >
                          {time.charAt(0).toUpperCase() + time.slice(1)}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {med.remaining_quantity && (
                  <View style={styles.remainingStrip}>
                    <MaterialIcons name="medication" size={14} color="#666" />
                    <Text style={styles.remainingText}>
                      {med.remaining_quantity} remaining
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          router.push("/add");
        }}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

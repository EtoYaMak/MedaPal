import { StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { Text, View } from "@/components/Themed";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const getUserMedications = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

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
    switch (time) {
      case "morning":
        return <MaterialIcons name="wb-sunny" size={16} color="#FFB800" />;
      case "afternoon":
        return <MaterialIcons name="wb-sunny" size={16} color="#FF9800" />;
      case "evening":
        return <MaterialIcons name="wb-twilight" size={16} color="#4A90E2" />;
      case "bedtime":
        return <MaterialIcons name="bedtime" size={16} color="#2C3E50" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.headerTitle}>Your Medications</Text>
        
        {medications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No medications added yet</Text>
            <Text style={styles.emptySubText}>
              Tap the + button below to add your first medication
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.medicationList}
          >
            {medications.map((med) => (
              <View key={med.id} style={styles.medicationCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.medicationName}>{med.medication_name}</Text>
                  <View style={styles.dosageContainer}>
                    <Text style={styles.dosageText}>
                      {med.dosage} {med.dosage_unit}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.frequencyText}>
                    {med.times_per_frequency}x {med.frequency}
                  </Text>
                  
                  <View style={styles.timeContainer}>
                    {med.preferred_time.map((time, index) => (
                      <View key={index} style={styles.timeItem}>
                        {getTimeIcon(time)}
                        <Text style={styles.timeText}>
                          {time.charAt(0).toUpperCase() + time.slice(1)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {med.remaining_quantity !== null && (
                    <View style={styles.remainingContainer}>
                      <Text style={styles.remainingText}>
                        {med.remaining_quantity} remaining
                      </Text>
                    </View>
                  )}

                  {med.notes && (
                    <Text style={styles.notes} numberOfLines={2}>
                      {med.notes}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    padding: 20,
    paddingBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  medicationList: {
    padding: 20,
    paddingTop: 10,
    gap: 15,
  },
  medicationCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 15,
  },
  medicationName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  dosageContainer: {
    backgroundColor: "#E8F5E9",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dosageText: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  cardBody: {
    gap: 10,
  },
  frequencyText: {
    fontSize: 16,
    color: "#666",
  },
  timeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#666",
  },
  remainingContainer: {
    marginTop: 5,
  },
  remainingText: {
    color: "#666",
    fontSize: 14,
  },
  notes: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#2196F3",
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

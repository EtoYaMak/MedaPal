import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AntDesign } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';

interface Medication {
  id: string;
  medication_name: string;
  dosage: string;
  dosage_unit: string;
  frequency: string;
  times_per_frequency: number;
  preferred_time: string[];
  remaining_quantity?: number;
}

export default function DashboardScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    getUserMedications();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  async function getUserMedications() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setMedications(data);
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {medications.length === 0 ? (
        // Empty state with add button
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No medications added yet</Text>
          <Text style={styles.emptySubText}>
            Tap the + button below to add your first medication
          </Text>
        </View>
      ) : (
        // List of medications (placeholder for now)
        <View style={styles.medicationList}>
          <Text style={styles.title}>Your Medications</Text>
          {medications.map((med) => (
            <View key={med.id} style={styles.medicationCard}>
              <Text style={styles.medicationName}>{med.medication_name}</Text>
              <Text style={styles.medicationDetails}>
                {med.dosage} {med.dosage_unit} • {med.frequency}
              </Text>
              {med.remaining_quantity !== null && (
                <Text style={styles.remainingQuantity}>
                  Remaining: {med.remaining_quantity}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          // TODO: Navigate to add medication screen
          console.log('Add medication');
        }}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // For FAB positioning
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  medicationList: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  medicationCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  medicationDetails: {
    fontSize: 14,
    color: '#666',
  },
  remainingQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
  },
});

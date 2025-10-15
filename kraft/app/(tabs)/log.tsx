import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import WorkoutModal from "@/app/components/WorkoutModal";

export default function LogWorkout() {
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

  const startEmptyWorkout = () => {
    setShowWorkoutModal(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logo}>
              <Ionicons name="flash" size={24} color="#34C759" />
              <Text style={styles.logoText}>Kraft</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Ny økt</Text>
          <Text style={styles.subtitle}>
            Start en tom økt, eller bruk en mal du har laget
          </Text>
        </View>

        {/* Start Empty Workout Button */}
        <TouchableOpacity style={styles.primaryButton} onPress={startEmptyWorkout}>
          <Ionicons name="play" size={24} color="#fff" />
          <Text style={styles.primaryButtonText}>Start en tom økt</Text>
        </TouchableOpacity>

        {/* Create Template Card */}
        <TouchableOpacity style={styles.card} onPress={startEmptyWorkout}>
          <Ionicons name="grid-outline" size={24} color="#34C759" />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Lag ny mal</Text>
            <Text style={styles.cardSubtitle}>
              Sett opp øvelser og lagre som template
            </Text>
          </View>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>Ny</Text>
          </View>
        </TouchableOpacity>

        {/* Templates Section */}
        <Text style={styles.sectionTitle}>Dine maler</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Ingen maler ennå</Text>
          <Text style={styles.emptyStateSubtext}>
            Lag din første mal for å spare tid
          </Text>
        </View>
      </ScrollView>

      {/* Workout Modal */}
      <WorkoutModal
        visible={showWorkoutModal}
        onClose={() => setShowWorkoutModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#000',
  },
  settingsButton: {
    padding: 8,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  primaryButton: {
    backgroundColor: '#34C759',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  newBadge: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

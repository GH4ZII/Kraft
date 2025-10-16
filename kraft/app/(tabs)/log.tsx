import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import WorkoutModal from "@/app/components/WorkoutModal";
import { WorkoutTemplate, getUserWorkoutTemplates, deleteWorkoutTemplate } from "@/services/database";
import { auth } from "@/services/firebase";

export default function LogWorkout() {
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | undefined>();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // Last inn maler når komponenten mounter
  useEffect(() => {
    loadTemplates();
  }, []);

  // Last inn maler på nytt når WorkoutModal lukkes (i tilfelle en ny mal ble laget)
  const handleCloseWorkoutModal = () => {
    setShowWorkoutModal(false);
    loadTemplates(); // Last inn maler på nytt
  };

  const loadTemplates = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      const userTemplates = await getUserWorkoutTemplates(auth.currentUser.uid);
      setTemplates(userTemplates);
    } catch (error) {
      console.error("Kunne ikke laste maler:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEmptyWorkout = () => {
    setSelectedTemplate(undefined);
    setShowWorkoutModal(true);
  };

  const handleSelectTemplate = (template: WorkoutTemplate) => {
    setSelectedTemplate(template);
    setShowWorkoutModal(true);
  };

  const handleDeleteTemplate = (template: WorkoutTemplate) => {
    Alert.alert(
      "Slett mal",
      `Er du sikker på at du vil slette "${template.name}"?`,
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Slett",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWorkoutTemplate(template.id);
              loadTemplates(); // Reload templates
              Alert.alert("Suksess", "Mal slettet");
            } catch (error) {
              Alert.alert("Feil", "Kunne ikke slette mal");
            }
          }
        }
      ]
    );
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
          <Ionicons name="document-text-outline" size={24} color="#34C759" />
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
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Laster maler...</Text>
          </View>
        ) : templates.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>Ingen maler ennå</Text>
            <Text style={styles.emptyStateSubtext}>
              Lag din første mal for å spare tid
            </Text>
          </View>
        ) : (
          templates.map((template) => (
            <View key={template.id} style={styles.templateCard}>
              <TouchableOpacity 
                style={styles.templateContent}
                onPress={() => handleSelectTemplate(template)}
              >
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateExercises}>
                    {template.exercises.length} øvelse{template.exercises.length !== 1 ? 'r' : ''}
                  </Text>
                  <Text style={styles.templateDate}>
                    Opprettet {template.createdAt.toLocaleDateString('no-NO')}
                  </Text>
                </View>
                <View style={styles.templateActions}>
                  <TouchableOpacity
                    style={styles.useButton}
                    onPress={() => handleSelectTemplate(template)}
                  >
                    <Ionicons name="play" size={20} color="#34C759" />
                    <Text style={styles.useButtonText}>Bruk</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteTemplate(template)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Workout Modal */}
      <WorkoutModal
        visible={showWorkoutModal}
        onClose={handleCloseWorkoutModal}
        initialTemplate={selectedTemplate}
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
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  // Nye stiler for template cards
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  templateContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  templateExercises: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  templateDate: {
    fontSize: 12,
    color: '#999',
  },
  templateActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  useButton: {
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  useButtonText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 8,
  },
});

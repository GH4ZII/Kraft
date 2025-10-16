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

  const handleTemplateMenu = (template: WorkoutTemplate) => {
    Alert.alert(
      template.name,
      "Hva vil du gjøre med denne malen?",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Start økt",
          onPress: () => handleSelectTemplate(template)
        },
        {
          text: "Slett mal",
          style: "destructive",
          onPress: () => handleDeleteTemplate(template)
        }
      ]
    );
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

  // Funksjon for å formatere dato
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "I går";
    if (diffDays < 7) return `${diffDays} dager siden`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} uker siden`;
    return date.toLocaleDateString('no-NO');
  };

  // Render funksjon for template grid items
  const renderTemplateItem = (template: WorkoutTemplate) => (
    <View key={template.id} style={styles.templateGridItem}>
      <View style={styles.templateCard}>
        <View style={styles.templateHeader}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => handleTemplateMenu(template)}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.templateContent}
          onPress={() => handleSelectTemplate(template)}
        >
          <Text style={styles.templateName} numberOfLines={2}>
            {template.name}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.templateFooter}>
          <View style={styles.templateStat}>
            <Ionicons name="list" size={14} color="#666" />
            <Text style={styles.templateStatText}>
              {template.exercises.length} øvelse{template.exercises.length !== 1 ? 'r' : ''}
            </Text>
          </View>
          
          <View style={styles.templateStat}>
            <Ionicons name="time" size={14} color="#666" />
            <Text style={styles.templateStatText}>
              {template.lastUsed ? formatDate(template.lastUsed) : 'Aldri brukt'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

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
          <View style={styles.templateGrid}>
            {templates.map((template) => renderTemplateItem(template))}
          </View>
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
  // Nye stiler for grid layout
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  templateGridItem: {
    width: '47%', // To kolonner med litt spacing
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  menuButton: {
    padding: 4,
  },
  templateContent: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  templateFooter: {
    gap: 6,
  },
  templateStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  templateStatText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
});

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

type ExerciseTemplate = {
  id: string;
  name: string;
  muscleGroup: string;
  icon: string;
};

const EXERCISE_TEMPLATES: ExerciseTemplate[] = [
  { id: "1", name: "Benkpress", muscleGroup: "Bryst", icon: "barbell" },
  { id: "2", name: "Knebøy", muscleGroup: "Bein", icon: "fitness" },
  { id: "3", name: "Markløft", muscleGroup: "Rygg • Bein", icon: "ellipsis-horizontal" },
  { id: "4", name: "Skulderpress", muscleGroup: "Skuldre", icon: "arrow-up" },
  { id: "5", name: "Roing med kabel", muscleGroup: "Rygg", icon: "pulse" },
  { id: "6", name: "Bicepscurl", muscleGroup: "Armer", icon: "bicep" },
  { id: "7", name: "Triceps dips", muscleGroup: "Armer", icon: "bicep" },
  { id: "8", name: "Pull-ups", muscleGroup: "Rygg", icon: "pulse" },
  { id: "9", name: "Push-ups", muscleGroup: "Bryst", icon: "barbell" },
  { id: "10", name: "Lunges", muscleGroup: "Bein", icon: "fitness" },
  { id: "11", name: "Deadlift", muscleGroup: "Rygg • Bein", icon: "ellipsis-horizontal" },
  { id: "12", name: "Overhead press", muscleGroup: "Skuldre", icon: "arrow-up" },
];

const MUSCLE_GROUPS = ["Alle", "Bryst", "Rygg", "Bein", "Skuldre", "Armer"];

interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exerciseName: string) => void;
}

export default function ExercisePickerModal({ visible, onClose, onSelectExercise }: ExercisePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("Alle");

  const filteredExercises = EXERCISE_TEMPLATES.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscleGroup = selectedMuscleGroup === "Alle" || exercise.muscleGroup.includes(selectedMuscleGroup);
    return matchesSearch && matchesMuscleGroup;
  });

  const getExerciseIcon = (iconName: string) => {
    switch (iconName) {
      case "barbell":
        return "barbell-outline";
      case "fitness":
        return "fitness-outline";
      case "ellipsis-horizontal":
        return "ellipsis-horizontal";
      case "arrow-up":
        return "arrow-up-outline";
      case "pulse":
        return "pulse-outline";
      case "bicep":
        return "fitness-outline";
      default:
        return "fitness-outline";
    }
  };

  const handleSelectExercise = (exercise: ExerciseTemplate) => {
    onSelectExercise(exercise.name);
    setSearchQuery("");
    setSelectedMuscleGroup("Alle");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.exercisePickerContainer} edges={['top']}>
        {/* Header */}
        <View style={styles.exercisePickerHeader}>
          <View>
            <Text style={styles.exercisePickerTitle}>Legg til styrkeøvelse</Text>
            <Text style={styles.exercisePickerSubtitle}>
              Søk blant styrkeøvelser og filtrer etter muskelgruppe
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <View style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#000" />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.exercisePickerContent}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Søk etter styrkeøvelse"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Muscle Group Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleGroupContainer}>
            {MUSCLE_GROUPS.map((group) => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.muscleGroupButton,
                  selectedMuscleGroup === group && styles.muscleGroupButtonActive
                ]}
                onPress={() => setSelectedMuscleGroup(group)}
              >
                <Text style={[
                  styles.muscleGroupText,
                  selectedMuscleGroup === group && styles.muscleGroupTextActive
                ]}>
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Recent Exercises Section */}
          <View style={styles.recentSection}>
            <View style={styles.recentSectionHeader}>
              <Text style={styles.recentSectionTitle}>Nylige styrkeøvelser</Text>
              <Text style={styles.recentSectionCount}>{filteredExercises.length}</Text>
            </View>

            {filteredExercises.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseListItem}>
                <View style={styles.exerciseListItemIcon}>
                  <Ionicons name={getExerciseIcon(exercise.icon)} size={24} color="#34C759" />
                </View>
                <View style={styles.exerciseListItemContent}>
                  <Text style={styles.exerciseListItemName}>{exercise.name}</Text>
                  <Text style={styles.exerciseListItemMuscle}>{exercise.muscleGroup}</Text>
                </View>
                <TouchableOpacity
                  style={styles.exerciseListItemButton}
                  onPress={() => {
                  handleSelectExercise(exercise);
                  onClose();
                  }}
                >
                  <Text style={styles.exerciseListItemButtonText}>Legg til</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.exercisePickerFooter}>
          <TouchableOpacity style={styles.addFromTemplateButton}>
            <Ionicons name="list-outline" size={20} color="#000" />
            <Text style={styles.addFromTemplateButtonText}>Legg til fra mal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.doneButtonText}>Ferdig</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  exercisePickerContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  exercisePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  exercisePickerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  exercisePickerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exercisePickerContent: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  muscleGroupContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  muscleGroupButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  muscleGroupButtonActive: {
    backgroundColor: '#34C759',
  },
  muscleGroupText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  muscleGroupTextActive: {
    color: '#fff',
  },
  recentSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  recentSectionCount: {
    fontSize: 14,
    color: '#666',
  },
  exerciseListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseListItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseListItemContent: {
    flex: 1,
  },
  exerciseListItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  exerciseListItemMuscle: {
    fontSize: 14,
    color: '#666',
  },
  exerciseListItemButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  exerciseListItemButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  exercisePickerFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  addFromTemplateButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addFromTemplateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});


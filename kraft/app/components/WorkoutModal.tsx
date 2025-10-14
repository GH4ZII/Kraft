import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { auth } from "@/services/firebase";
import { createWorkout, createActivity } from "@/services/database";
import { router } from "expo-router";
import ExercisePickerModal from "./ExercisePickerModal";

type Exercise = {
  name: string;
  sets: Array<{ reps: number; weight: number }>;
};

interface WorkoutModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function WorkoutModal({ visible, onClose }: WorkoutModalProps) {
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);

  const saveAsTemplate = () => {
    Alert.alert("Lagre som mal", "Denne funksjonen kommer snart!");
  };

  const startWorkout = async () => {
    if (!auth.currentUser) return;

    if (exercises.length === 0) {
      Alert.alert("Feil", "Legg til minst én øvelse før du starter");
      return;
    }

    setSaving(true);
    try {
      await createWorkout({
        userId: auth.currentUser.uid,
        name: workoutName.trim() || "Tom økt",
        duration: 0,
        exercises: exercises,
        date: new Date(),
      });

      await createActivity({
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Bruker",
        type: "workout",
        workoutName: workoutName.trim() || "Tom økt",
        duration: 0,
        message: `startet ${workoutName || "en økt"}`,
        timestamp: new Date(),
      });

      Alert.alert("Suksess", "Økt startet!");
      onClose();
      resetWorkout();
      router.replace("/(tabs)/");
    } catch (error: any) {
      Alert.alert("Feil", error.message || "Kunne ikke starte økt");
    } finally {
      setSaving(false);
    }
  };

  const resetWorkout = () => {
    setWorkoutName("");
    setExercises([]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const addExerciseFromPicker = (exerciseName: string) => {
    setExercises([...exercises, { name: exerciseName, sets: [{ reps: 0, weight: 0 }] }]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer} edges={['top']}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Tom økt</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalSubtitle}>
            Legg til øvelser og start når du er klar
          </Text>

          {/* Workout Name Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="pencil-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Navn på økt (valgfritt)"
              value={workoutName}
              onChangeText={setWorkoutName}
            />
          </View>

          {/* Exercises Section */}
          <View style={styles.exercisesSection}>
            <Text style={styles.exercisesTitle}>Øvelser</Text>
            
            {exercises.length === 0 ? (
              <TouchableOpacity style={styles.emptyExercisesCard} onPress={() => setShowExercisePicker(true)}>
                <Text style={styles.emptyExercisesText}>Ingen øvelser enda</Text>
                <Text style={styles.emptyExercisesSubtext}>
                  Trykk for å legge til fra øvelsesliste
                </Text>
                <TouchableOpacity style={styles.addButtonSmall}>
                  <Text style={styles.addButtonText}>Legg til</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ) : (
              exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <TouchableOpacity onPress={() => removeExercise(index)}>
                      <Ionicons name="trash-outline" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.setsContainer}>
                    {exercise.sets.map((set, i) => (
                      <View key={i} style={styles.setRow}>
                        <Text style={styles.setNumber}>Sett {i + 1}</Text>
                        <Text style={styles.setInfo}>
                          {set.reps} reps @ {set.weight} kg
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}

            {/* Add Exercise Button */}
            <TouchableOpacity style={styles.addExerciseButton} onPress={() => setShowExercisePicker(true)}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addExerciseButtonText}>+ Øvelse</Text>
            </TouchableOpacity>
          </View>

          {/* Rest Timer Section */}
          <View style={styles.restTimerSection}>
            <Text style={styles.restTimerTitle}>Hviletimer</Text>
            <Text style={styles.restTimerSubtitle}>Valgfritt • Alarm og vibrasjon</Text>
            <Text style={styles.restTimerValue}>00:30</Text>
          </View>
        </ScrollView>

        {/* Modal Footer */}
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.saveTemplateButton} onPress={saveAsTemplate}>
            <Ionicons name="document-text-outline" size={20} color="#000" />
            <Text style={styles.saveTemplateButtonText}>Lagre som mal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.startWorkoutButton, saving && styles.startWorkoutButtonDisabled]}
            onPress={startWorkout}
            disabled={saving}
          >
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.startWorkoutButtonText}>
              {saving ? "Starter..." : "Start økt"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Exercise Picker Modal */}
      <ExercisePickerModal
        visible={showExercisePicker}
        onClose={() => setShowExercisePicker(false)}
        onSelectExercise={addExerciseFromPicker}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  exercisesSection: {
    marginBottom: 24,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  emptyExercisesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyExercisesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  emptyExercisesSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  addButtonSmall: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  setsContainer: {
    gap: 8,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  setNumber: {
    fontSize: 14,
    color: '#666',
  },
  setInfo: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  addExerciseButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addExerciseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  restTimerSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  restTimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  restTimerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  restTimerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveTemplateButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveTemplateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  startWorkoutButton: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startWorkoutButtonDisabled: {
    opacity: 0.5,
  },
  startWorkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});


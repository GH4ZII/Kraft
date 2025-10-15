import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { auth } from "@/services/firebase";
import { createWorkout, createActivity } from "@/services/database";
import { router } from "expo-router";
import ExercisePickerModal from "./ExercisePickerModal";
import { Swipeable } from 'react-native-gesture-handler';

type Exercise = {
  name: string;
  sets: Array<{ reps: number; weight: number; restTime: number }>;
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

  // For å lagre som mal
  const saveAsTemplate = () => {
    Alert.alert("Lagre som mal", "Denne funksjonen kommer snart!");
  };

  // For å starte økt
  const startWorkout = async () => {
    if (!auth.currentUser) return;

    if (exercises.length === 0) {
      Alert.alert("Feil", "Legg til minst én øvelse før du starter");
      return;
    }

    // Lagrer økta i db
    setSaving(true);
    try {
      await createWorkout({
        userId: auth.currentUser.uid,
        name: workoutName.trim() || "Tom økt",
        duration: 0,
        exercises: exercises,
        date: new Date(),
      });

      // Lagrer aktiviteten i db
      await createActivity({
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Bruker",
        type: "workout",
        workoutName: workoutName.trim() || "Tom økt",
        duration: 0,
        message: `startet ${workoutName || "en økt"}`,
        timestamp: new Date(),
      });

      
      Alert.alert("Suksess", "Økt startet!"); // Viser suksessmelding
      onClose(); // Lukker modalen
      resetWorkout(); // Nullstiller feltene
      router.replace("/(tabs)"); // går til dashboard
    } catch (error: any) {
      Alert.alert("Feil", error.message || "Kunne ikke starte økt");
    } finally {
      setSaving(false);
    }
  };

  // For å nullstille feltene
  const resetWorkout = () => {
    setWorkoutName("");
    setExercises([]);
  };

  // For å fjerne en øvelse
  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  // For å oppdatere reps
  const updateSetReps = (exerciseIndex: number, setIndex: number, reps: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex].reps = reps;
    setExercises(updatedExercises);
  };

  // For å oppdatere vekt
  const updateSetWeight = (exerciseIndex: number, setIndex: number, weight: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex].weight = weight;
    setExercises(updatedExercises);
  };
  
  // For å legge til et sett
  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.push({ reps: 0, weight: 0, restTime: 90 });
    setExercises(updatedExercises);
  };
  
  // For å fjerne et sett
  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    if (updatedExercises[exerciseIndex].sets.length > 1) {
      updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
      setExercises(updatedExercises);
    }
  };

  // For å legge til en øvelse fra øvelsesliste
  const addExerciseFromPicker = (exerciseName: string) => {
    setExercises([...exercises, { name: exerciseName, sets: [{ reps: 0, weight: 0, restTime: 90 }] }]);
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
  exercise.sets.length > 1 ? (
    <Swipeable
      key={i}
      renderRightActions={() => (
        <TouchableOpacity 
          style={styles.deleteAction}
          onPress={() => removeSet(index, i)}
        >
          <Ionicons name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    >
      <View style={styles.setRow}>
        <View style={styles.setNumberContainer}>
          <Text style={styles.setNumber}>Sett {i + 1}</Text>
        </View>
        
        <View style={styles.setInputsContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reps</Text>
            <View style={styles.numberInputContainer}>
              <TouchableOpacity 
                style={styles.numberButton}
                onPress={() => updateSetReps(index, i, Math.max(0, set.reps - 1))}
              >
                <Ionicons name="remove" size={16} color="#34C759" />
              </TouchableOpacity>
              <TextInput 
                style={styles.numberInput}
                value={set.reps.toString()}
                onChangeText={(text) => {
                  const reps = parseInt(text) || 0;
                  updateSetReps(index, i, reps);
                }}
                keyboardType="numeric"
                textAlign="center"
              />
              <TouchableOpacity 
                style={styles.numberButton}
                onPress={() => updateSetReps(index, i, set.reps + 1)}
              >
                <Ionicons name="add" size={16} color="#34C759" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kg</Text>
            <View style={styles.numberInputContainer}>
              <TouchableOpacity 
                style={styles.numberButton}
                onPress={() => updateSetWeight(index, i, Math.max(0, set.weight - 2.5))}
              >
                <Ionicons name="remove" size={16} color="#34C759" />
              </TouchableOpacity>
              <TextInput 
                style={styles.numberInput}
                value={set.weight.toString()}
                onChangeText={(text) => {
                  const weight = parseFloat(text) || 0;
                  updateSetWeight(index, i, weight);
                }}
                keyboardType="numeric"
                textAlign="center"
              />
              <TouchableOpacity 
                style={styles.numberButton}
                onPress={() => updateSetWeight(index, i, set.weight + 2.5)}
              >
                <Ionicons name="add" size={16} color="#34C759" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Swipeable>
  ) : (
    <View key={i} style={styles.setRow}>
      <View style={styles.setNumberContainer}>
        <Text style={styles.setNumber}>Sett {i + 1}</Text>
      </View>
      
      <View style={styles.setInputsContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reps</Text>
          <View style={styles.numberInputContainer}>
            <TouchableOpacity 
              style={styles.numberButton}
              onPress={() => updateSetReps(index, i, Math.max(0, set.reps - 1))}
            >
              <Ionicons name="remove" size={16} color="#34C759" />
            </TouchableOpacity>
            <TextInput 
              style={styles.numberInput}
              value={set.reps.toString()}
              onChangeText={(text) => {
                const reps = parseInt(text) || 0;
                updateSetReps(index, i, reps);
              }}
              keyboardType="numeric"
              textAlign="center"
            />
            <TouchableOpacity 
              style={styles.numberButton}
              onPress={() => updateSetReps(index, i, set.reps + 1)}
            >
              <Ionicons name="add" size={16} color="#34C759" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Kg</Text>
          <View style={styles.numberInputContainer}>
            <TouchableOpacity 
              style={styles.numberButton}
              onPress={() => updateSetWeight(index, i, Math.max(0, set.weight - 2.5))}
            >
              <Ionicons name="remove" size={16} color="#34C759" />
            </TouchableOpacity>
            <TextInput 
              style={styles.numberInput}
              value={set.weight.toString()}
              onChangeText={(text) => {
                const weight = parseFloat(text) || 0;
                updateSetWeight(index, i, weight);
              }}
              keyboardType="numeric"
              textAlign="center"
            />
            <TouchableOpacity 
              style={styles.numberButton}
              onPress={() => updateSetWeight(index, i, set.weight + 2.5)}
            >
              <Ionicons name="add" size={16} color="#34C759" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
))}
                    
                    {/* Legg til sett knapp */}
                    <TouchableOpacity 
                      style={styles.addSetButton} 
                      onPress={() => addSet(index)}
                    >
                      <Ionicons name="add-circle-outline" size={20} color="#34C759" />
                      <Text style={styles.addSetButtonText}>Legg til sett</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* Add Exercise Button */}
            <TouchableOpacity style={styles.addExerciseButton} onPress={() => setShowExercisePicker(true)}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addExerciseButtonText}>Øvelse</Text>
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
    paddingVertical: 12,
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
  setNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeSetButton: {
    padding: 4,
  },
  setInputsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 4,
  },
  numberButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  numberInput: {
    minWidth: 50,
    height: 32,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginTop: 8,
  },
  addSetButtonText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
  deleteAction: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    marginBottom: 8,
    borderRadius: 8,
  },
});


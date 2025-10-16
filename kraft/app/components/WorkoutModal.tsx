import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { auth } from "@/services/firebase";
import { createWorkout, createActivity, getUserWorkoutTemplates, deleteWorkoutTemplate, WorkoutTemplate } from "@/services/database";
import { router } from "expo-router";
import ExercisePickerModal from "./ExercisePickerModal";
import { SwipeListView } from 'react-native-swipe-list-view';
import { createWorkoutTemplate } from "@/services/database";

type Set = {
  id: string;
  reps: number;
  weight: number;
  restTime: number;
  completed: boolean;
};

type Exercise = {
  name: string;
  sets: Array<Set>;
};

interface WorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  initialTemplate?: WorkoutTemplate; // Ny prop for å laste inn mal
}

export default function WorkoutModal({ visible, onClose, initialTemplate }: WorkoutModalProps) {
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Legg til useEffect for å laste inn mal data
  useEffect(() => {
    if (initialTemplate && visible) {
      setWorkoutName(initialTemplate.name);
      setExercises(initialTemplate.exercises.map(exercise => ({
        ...exercise,
        sets: exercise.sets.map(set => ({
          ...set,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Generer ny ID for hvert sett
          completed: false // Reset completion status when loading template
        }))
      })));
    }
  }, [initialTemplate, visible]);

  // For å lagre som mal
  const saveAsTemplate = async () => {
    if (!auth.currentUser) return;

    if (exercises.length === 0) {
      Alert.alert("Feil", "Legg til minst én øvelse før du lagrer som mal");
      return;
    }

    const templateName = workoutName.trim() || "Tom mal";
    
    Alert.alert(
      "Lagre som mal",
      `Vil du lagre "${templateName}" som mal?`,
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Lagre",
          onPress: async () => {
            setSavingTemplate(true);
            try {
              await createWorkoutTemplate({
                userId: auth.currentUser!.uid,
                name: templateName,
                exercises: exercises,
                createdAt: new Date(),
              });
              
              Alert.alert("Suksess", "Mal lagret!");
              resetWorkout();
              onClose();
            } catch (error: any) {
              Alert.alert("Feil", error.message || "Kunne ikke lagre mal");
            } finally {
              setSavingTemplate(false);
            }
          }
        }
      ]
    );
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

  // For å toggle set completion
  const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex].completed = !updatedExercises[exerciseIndex].sets[setIndex].completed;
    setExercises(updatedExercises);
  };
  
  // For å legge til et sett
  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    const newSetId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    updatedExercises[exerciseIndex].sets.push({ 
      id: newSetId,
      reps: 0, 
      weight: 0, 
      restTime: 90,
      completed: false
    });
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
    const newSetId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setExercises([...exercises, { 
      name: exerciseName, 
      sets: [{ 
        id: newSetId,
        reps: 0, 
        weight: 0, 
        restTime: 90,
        completed: false
      }] 
    }]);
  };

  // For å konvertere sets til SwipeListView format
  const convertSetsToSwipeData = (sets: Array<Set>) => {
    return sets.map((set, index) => ({
      key: set.id,
      set: set,
      index: index
    }));
  };

  // For å slette et sett i SwipeListView
  const deleteSet = (exerciseIndex: number, setId: string) => {
    const updatedExercises = [...exercises];
    const setIndex = updatedExercises[exerciseIndex].sets.findIndex(set => set.id === setId);
    if (setIndex !== -1 && updatedExercises[exerciseIndex].sets.length > 1) {
      updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
      setExercises(updatedExercises);
    }
  };

  // Render funksjon for hvert sett i SwipeListView
  const renderSetItem = (data: any, exerciseIndex: number) => (
    <View style={styles.setRow}>
      <View style={styles.setNumberContainer}>
        <Text style={styles.setNumber}>Sett {data.index + 1}</Text>
      </View>
      {/* Labels utenfor containeren */}
      <View style={styles.setLabelsRow}>
        <Text style={[styles.inputLabel, styles.setLabelCol]}>Reps</Text>
        <Text style={[styles.inputLabel, styles.setLabelCol]}>Kg</Text>
        <View style={styles.checkboxSpace} />
      </View>

      <View style={[styles.setInputsContainer, data.set.completed && styles.setInputsContainerCompleted]}>
  {/* REPS container */}
  <View style={styles.inputBox}>
    <View style={[styles.controlContainer, data.set.completed && styles.completedControlContainer]}>
      <TouchableOpacity
        style={[styles.numberButton, data.set.completed && styles.completedNumberButton]}
        onPress={() =>
          updateSetReps(exerciseIndex, data.index, Math.max(0, data.set.reps - 1))
        }
        disabled={data.set.completed}
      >
        <Ionicons
          name="remove"
          size={16}
          color={data.set.completed ? "#ccc" : "#34C759"}
        />
      </TouchableOpacity>

      <TextInput
        style={[styles.numberInput, data.set.completed && styles.completedNumberInput]}
        placeholder="Reps"
        value={data.set.reps.toString()}
        onChangeText={(text) => {
          const reps = parseInt(text) || 0;
          updateSetReps(exerciseIndex, data.index, reps);
        }}
        keyboardType="numeric"
        textAlign="center"
        editable={!data.set.completed}
      />

      <TouchableOpacity
        style={[styles.numberButton, data.set.completed && styles.completedNumberButton]}
        onPress={() =>
          updateSetReps(exerciseIndex, data.index, data.set.reps + 1)
        }
        disabled={data.set.completed}
      >
        <Ionicons
          name="add"
          size={16}
          color={data.set.completed ? "#ccc" : "#34C759"}
        />
      </TouchableOpacity>
    </View>
  </View>

  {/* KG container */}
  <View style={styles.inputBox}>
    <View style={[styles.controlContainer, data.set.completed && styles.completedControlContainer]}>
      <TouchableOpacity
        style={[styles.numberButton, data.set.completed && styles.completedNumberButton]}
        onPress={() =>
          updateSetWeight(exerciseIndex, data.index, Math.max(0, data.set.weight - 2.5))
        }
        disabled={data.set.completed}
      >
        <Ionicons
          name="remove"
          size={16}
          color={data.set.completed ? "#ccc" : "#34C759"}
        />
      </TouchableOpacity>

      <TextInput
        style={[styles.numberInput, data.set.completed && styles.completedNumberInput]}
        placeholder="Kg"
        value={data.set.weight.toString()}
        onChangeText={(text) => {
          const weight = parseFloat(text) || 0;
          updateSetWeight(exerciseIndex, data.index, weight);
        }}
        keyboardType="numeric"
        textAlign="center"
        editable={!data.set.completed}
      />

      <TouchableOpacity
        style={[styles.numberButton, data.set.completed && styles.completedNumberButton]}
        onPress={() =>
          updateSetWeight(exerciseIndex, data.index, data.set.weight + 2.5)
        }
        disabled={data.set.completed}
      >
        <Ionicons
          name="add"
          size={16}
          color={data.set.completed ? "#ccc" : "#34C759"}
        />
      </TouchableOpacity>
    </View>
  </View>

  {/* Checkbox */}
  <TouchableOpacity
    style={[styles.checkbox]}
    onPress={() => toggleSetCompletion(exerciseIndex, data.index)}
  >
    {data.set.completed && <Ionicons name="checkmark" size={16} color="#34C759" />}
  </TouchableOpacity>
</View>

    </View>
  );

  // Render funksjon for swipe-actions
  const renderHiddenItem = (data: any, exerciseIndex: number) => (
    <View style={styles.hiddenItemContainer}>
      <TouchableOpacity 
        style={styles.deleteAction}
        onPress={() => deleteSet(exerciseIndex, data.item.key)}
      >
        <Ionicons name="trash" size={20} color="#fff" />
        <Text style={styles.deleteActionText}>Slett</Text>
      </TouchableOpacity>
    </View>
  );

  // Håndterer swipe-verdier for automatisk sletting
  const onSwipeValueChange = (swipeData: any, exerciseIndex: number) => {
    const { key, value, direction } = swipeData;
    // Hvis bruker swiper hele veien til venstre (negativ verdi)
    if (direction === 'right' && value <= -190) {
      deleteSet(exerciseIndex, key);
    }
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
                    <SwipeListView
                      data={convertSetsToSwipeData(exercise.sets)}
                      renderItem={({ item }) => renderSetItem(item, index)}
                      renderHiddenItem={({ item }) => renderHiddenItem({ item }, index)}
                      rightOpenValue={-200}
                      disableRightSwipe={exercise.sets.length <= 1}
                      keyExtractor={(item) => item.key}
                      showsVerticalScrollIndicator={false}
                      scrollEnabled={false}
                      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                      closeOnRowPress={true}
                      closeOnScroll={true}
                      swipeToOpenPercent={95}
                      onSwipeValueChange={(swipeData) => onSwipeValueChange(swipeData, index)}
                    />
                    
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
          <TouchableOpacity 
            style={[styles.saveTemplateButton, savingTemplate && styles.startWorkoutButtonDisabled]} 
            onPress={saveAsTemplate}
            disabled={savingTemplate}
          >
            <Ionicons name="document-text-outline" size={20} color="#000" />
            <Text style={styles.saveTemplateButtonText}>
              {savingTemplate ? "Lagrer..." : "Lagre som mal"}
            </Text>
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
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 0,
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
    marginTop: 8,
  },
  setLabelsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginTop: 8,
    marginLeft: 12,
  },
  setLabelCol: {
    flex: 1,
  },
  checkboxSpace: {
    width: 25,
  },
  setInputsContainerCompleted: {
    backgroundColor: '#f0f8f0',
    borderColor: '#34C759',
    borderWidth: 1,
    borderRadius: 8,
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
    backgroundColor: 'transparent',
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
    width: 200,
    borderRadius: 8,
    height: '100%',
    marginLeft: 8,
  },
  hiddenItemContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingRight: 8,
    height: '100%',
  },
  deleteActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  // Completion styles used only on setInputsContainer
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    alignSelf: 'flex-end',        // flytt den ned til samme linje som input-boksene
    marginLeft: 12,               
    marginBottom: 4,            
    
  },
  completedCheckbox: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  inputBox: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  controlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,

  },
  // Make inners transparent when completed so green background shows through
  completedControlContainer: {
    backgroundColor: 'transparent',
  },
  completedNumberButton: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  completedNumberInput: {
    backgroundColor: 'transparent',
  },
  
});


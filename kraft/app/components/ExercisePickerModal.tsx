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

// Raw øvelser uten pålitelige id-er. Vi genererer id og oversetter muskelgrupper nedenfor.
const EXERCISE_TEMPLATES_RAW: Array<Omit<ExerciseTemplate, 'id'>> = [
  { name: "Benkpress", muscleGroup: "Bryst", icon: "barbell" },
  { name: "Knebøy", muscleGroup: "Bein", icon: "fitness" },
  { name: "Markløft", muscleGroup: "Rygg • Bein", icon: "ellipsis-horizontal" },
  { name: "Skulderpress", muscleGroup: "Skuldre", icon: "arrow-up" },
  { name: "Roing med kabel", muscleGroup: "Rygg", icon: "pulse" },
  { name: "Bicepscurl", muscleGroup: "Armer", icon: "bicep" },
  { name: "Triceps dips", muscleGroup: "Armer", icon: "bicep" },
  { name: "Pull-ups", muscleGroup: "Rygg", icon: "pulse" },
  { name: "Push-ups", muscleGroup: "Bryst", icon: "barbell" },
  { name: "Lunges", muscleGroup: "Bein", icon: "fitness" },
  { name: "Deadlift", muscleGroup: "Rygg • Bein", icon: "ellipsis-horizontal" },
  { name: "Overhead press", muscleGroup: "Skuldre", icon: "arrow-up" },
  { name: "Ab Wheel", muscleGroup: "Core", icon: "ellipsis-horizontal" },
  { name: "Arnold Press (Dumbbell)", muscleGroup: "Shoulders", icon: "fitness" },
  { name: "Around The World", muscleGroup: "Chest", icon: "barbell" },
  { name: "Back Extension", muscleGroup: "Back", icon: "barbell" },
  { name: "Back Extension (Machine)", muscleGroup: "Back", icon: "barbell" },
  { name: "Bench Dips", muscleGroup: "Arms", icon: "fitness" },
  { name: "Bench Press (Cable)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Bench Press (Barbell)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Bench Press (Dumbbell)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Bench Press (Smith Machine)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Bench Press (Close Grip Barbell)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Bench Press (Wide Grip Barbell)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Bent Over Row (Band)", muscleGroup: "Back", icon: "fitness" },
  { name: "Bent Over Row (Barbell)", muscleGroup: "Back", icon: "barbell" },
  { name: "Bent Over Row (Dumbbell)", muscleGroup: "Back", icon: "fitness" },
  { name: "Bent Over Row (Underhand (Barbell)", muscleGroup: "Back", icon: "barbell" },
  { name: "Bicep Curls (Barbell)", muscleGroup: "Arms", icon: "fitness" },
  { name: "Bicep Curls (Cable)", muscleGroup: "Arms", icon: "barbell" },
  { name: "Bicep Curls (Dumbbell)", muscleGroup: "Arms", icon: "barbell" },
  { name: "Bicep Curls (Machine)", muscleGroup: "Arms", icon: "fitness" },
  { name: "Box Jumps", muscleGroup: "Legs", icon: "barbell" },
  { name: "Box Squat (Barbell)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Bulgarian Split Squat", muscleGroup: "Legs", icon: "barbell" },
  { name: "Cable Crossover", muscleGroup: "Chest", icon: "barbell" },
  { name: "Cable Crunch", muscleGroup: "Core", icon: "fitness" },
  { name: "Cable Kickback", muscleGroup: "Arms", icon: "barbell" },
  { name: "Cable Pull Through", muscleGroup: "Legs", icon: "barbell" },
  { name: "Cable Twist", muscleGroup: "Core", icon: "barbell" },
  { name: "Calf Press on Leg Press", muscleGroup: "Legs", icon: "barbell" },
  { name: "Calf Press on Seated Leg Press (Barbell)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Chest Dip", muscleGroup: "Chest", icon: "barbell" },
  { name: "Chest Dip (Assisted)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Chest Fly", muscleGroup: "Chest", icon: "barbell" },
  { name: "Chest Fly (Band)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Chest Fly (Dumbbell)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Chest Press (Band)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Chest Press (Machine)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Chin Up", muscleGroup: "Back", icon: "barbell" },
  { name: "Chin Up (Assisted)", muscleGroup: "Back", icon: "barbell" },
  { name: "Concentration Curl", muscleGroup: "Arms", icon: "barbell" },
  { name: "Cross Body Crunch", muscleGroup: "Core", icon: "barbell" },
  { name: "Crunches", muscleGroup: "Core", icon: "barbell" },
  { name: "Crunch (Machine)", muscleGroup: "Core", icon: "barbell" },
  { name: "Crunch (Stability Ball)", muscleGroup: "Core", icon: "barbell" },
  { name: "Deadlift (Band)", muscleGroup: "Legs", icon: "barbell" },
  { name: "Deadlift (Barbell)", muscleGroup: "Legs", icon: "barbell" },
  { name: "Deadlift (Dumbbell)", muscleGroup: "Legs", icon: "barbell" },
  { name: "Deadlift (Smith Machine)", muscleGroup: "Legs", icon: "barbell" },
  { name: "Decline Bench Press (Barbell)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Decline Bench Press (Dumbbell)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Decline Bench Press (Smith Machine)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Decline Crunch", muscleGroup: "Core", icon: "barbell" },
  { name: "Deficit Deadlift", muscleGroup: "Legs", icon: "barbell" },
  { name: "Face Pull (Cable)", muscleGroup: "Skuldre", icon: "barbell" },
  { name: "Flat Knee Raise", muscleGroup: "Core", icon: "fitness" },
  { name: "Flat Leg Raise", muscleGroup: "Core", icon: "fitness" },
  { name: "Floor Press (Barbell)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Front Raise (Band)", muscleGroup: "Shoulders", icon: "fitness" },
  { name: "Front Raise (Barbell)", muscleGroup: "Shoulders", icon: "barbell" },
  { name: "Front Raise (Cable)", muscleGroup: "Shoulders", icon: "barbell" },
  { name: "Front Raise (Dumbbell)", muscleGroup: "Shoulders", icon: "fitness" },
  { name: "Front Squat (Barbell)", muscleGroup: "Legs", icon: "barbell" },
  { name: "Glute Ham Raise", muscleGroup: "Legs", icon: "fitness" },
  { name: "Glute Kickback (Machine)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Goblet Squat (Kettlebell)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Good Morning (Barbell)", muscleGroup: "Back", icon: "barbell" },
  { name: "Hack Squat", muscleGroup: "Legs", icon: "fitness" },
  { name: "Hack Squat (Barbell)", muscleGroup: "Legs", icon: "barbell" },
  { name: "Hammer Curl (Band)", muscleGroup: "Arms", icon: "fitness" },
  { name: "Hammer Curl (Cable)", muscleGroup: "Arms", icon: "barbell" },
  { name: "Hammer Curl (Dumbbell)", muscleGroup: "Arms", icon: "fitness" },
  { name: "Hanging Knee Raise", muscleGroup: "Core", icon: "fitness" },
  { name: "Hanging Knee Skips", muscleGroup: "Legs", icon: "fitness" },
  { name: "Hip Abductor (Machine)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Hip Adductor (Machine)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Hip Thrust (Barbell)", muscleGroup: "Legs", icon: "barbell" },
  { name: "Hip Thrust (Bodyweight)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Incline Bench Press (Barbell)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Incline Bench Press (Cable)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Incline Bench Press (Dumbbell)", muscleGroup: "Chest", icon: "fitness" },
  { name: "Incline Bench Press (Smith Machine)", muscleGroup: "Chest", icon: "barbell" },
  { name: "Incline Chest Fly (Dumbbell)", muscleGroup: "Chest", icon: "fitness" },
  { name: "Incline Chest Press (Machine)", muscleGroup: "Chest", icon: "fitness" },
  { name: "Incline Curl (Dumbbell)", muscleGroup: "Arms", icon: "fitness" },
  { name: "Incline Row (Dumbbell)", muscleGroup: "Back", icon: "fitness" },
  { name: "Inverted Row (Bodyweight)", muscleGroup: "Back", icon: "fitness" },
  { name: "Iso-Lateral Chest Press (Machine)", muscleGroup: "Chest", icon: "fitness" },
  { name: "Iso-Lateral Row (Machine)", muscleGroup: "Back", icon: "fitness" },
  { name: "Jackknife Sit Up", muscleGroup: "Core", icon: "fitness" },
  { name: "Jump Squat", muscleGroup: "Legs", icon: "fitness" },
  { name: "Kipping Pull Up", muscleGroup: "Back", icon: "fitness" },
  { name: "Knee Raise (Captain's Chair)", muscleGroup: "Core", icon: "fitness" },
  { name: "Kneeling Pulldown (Band)", muscleGroup: "Back", icon: "fitness" },
  { name: "Knees to Elbows", muscleGroup: "Core", icon: "fitness" },
  { name: "Lat Pulldown (Cable)", muscleGroup: "Back", icon: "barbell" },
  { name: "Lat Pulldown (Machine)", muscleGroup: "Back", icon: "fitness" },
  { name: "Lat Pulldown (Single Arm)", muscleGroup: "Back", icon: "barbell" },
  { name: "Lat Pulldown - Underhand (Band)", muscleGroup: "Back", icon: "fitness" },
  { name: "Lat Pulldown - Underhand (Cable)", muscleGroup: "Back", icon: "barbell" },
  { name: "Lat Pulldown - Wide Grip (Cable)", muscleGroup: "Back", icon: "barbell" },
  { name: "Lateral Box Jump", muscleGroup: "Legs", icon: "fitness" },
  { name: "Lateral Raise (Band)", muscleGroup: "Shoulders", icon: "fitness" },
  { name: "Lateral Raise (Cable)", muscleGroup: "Shoulders", icon: "barbell" },
  { name: "Lateral Raise (Dumbbell)", muscleGroup: "Shoulders", icon: "fitness" },
  { name: "Lateral Raise (Machine)", muscleGroup: "Shoulders", icon: "fitness" },
  { name: "Leg Extension (Machine)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Leg Press", muscleGroup: "Legs", icon: "fitness" },
  { name: "Lunge (Barbell)", muscleGroup: "Legs", icon: "barbell" },
  { name: "Lunge (Bodyweight)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Lunge (Dumbbell)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Lying Leg Curl (Machine)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Mountain Climber", muscleGroup: "Core", icon: "fitness" },
  { name: "Muscle Up", muscleGroup: "Back", icon: "fitness" },
  { name: "Oblique Crunch", muscleGroup: "Core", icon: "fitness" },
  { name: "Overhead Press (Barbell)", muscleGroup: "Shoulders", icon: "barbell" },
  { name: "Overhead Press (Cable)", muscleGroup: "Shoulders", icon: "barbell" },
  { name: "Overhead Press (Dumbbell)", muscleGroup: "Shoulders", icon: "fitness" },
  { name: "Overhead Press (Smith Machine)", muscleGroup: "Shoulders", icon: "barbell" },
  { name: "Pec Deck (Machine)", muscleGroup: "Chest", icon: "fitness" },
  { name: "Pendlay Row (Barbell)", muscleGroup: "Back", icon: "barbell" },
  { name: "Pistol Squat", muscleGroup: "Legs", icon: "fitness" },
  { name: "Plank", muscleGroup: "Core", icon: "fitness" },
  { name: "Preacher Curl (Barbell)", muscleGroup: "Arms", icon: "barbell" },
  { name: "Preacher Curl (Dumbbell)", muscleGroup: "Arms", icon: "fitness" },
  { name: "Preacher Curl (Machine)", muscleGroup: "Arms", icon: "fitness" },
  { name: "Press Under (Barbell)", muscleGroup: "Shoulders", icon: "barbell" },
  { name: "Pull Up", muscleGroup: "Back", icon: "fitness" },
  { name: "Pull Up (Assisted)", muscleGroup: "Back", icon: "fitness" },
  { name: "Pull Up (Band)", muscleGroup: "Back", icon: "fitness" },
  { name: "Pullover (Dumbbell)", muscleGroup: "Chest", icon: "fitness" },
  { name: "Pullover (Machine)", muscleGroup: "Chest", icon: "fitness" },
  { name: "Push Press", muscleGroup: "Shoulders", icon: "barbell" },
  { name: "Push Up", muscleGroup: "Chest", icon: "fitness" },
  { name: "Push Up (Band)", muscleGroup: "Chest", icon: "fitness" },
  { name: "Push Up (Knees)", muscleGroup: "Chest", icon: "fitness" },
  { name: "Rack Pull (Barbell)", muscleGroup: "Back", icon: "barbell" },
  { name: "Reverse Crunch", muscleGroup: "Core", icon: "fitness" },
  { name: "Reverse Curl (Band)", muscleGroup: "Arms", icon: "fitness" },
  { name: "Reverse Curl (Barbell)", muscleGroup: "Arms", icon: "barbell" },
  { name: "Reverse Curl (Dumbbell)", muscleGroup: "Arms", icon: "fitness" },
  { name: "Reverse Fly (Cable)", muscleGroup: "Back", icon: "barbell" },
  { name: "Reverse Fly (Dumbbell)", muscleGroup: "Back", icon: "fitness" },
  { name: "Reverse Fly (Machine)", muscleGroup: "Back", icon: "fitness" },
  { name: "Reverse Grip Concentration Curl (Dumbbell)", muscleGroup: "Arms", icon: "fitness" },
  { name: "Reverse Plank", muscleGroup: "Core", icon: "fitness" },
  { name: "Romanian Deadlift (Barbell)", muscleGroup: "Legs", icon: "barbell" },
  { name: "Romanian Deadlift (Dumbbell)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Russian Twist", muscleGroup: "Core", icon: "fitness" },
  { name: "Seated Calf Raise (Machine)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Seated Calf Raise (Plate Loaded)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Seated Leg Curl (Machine)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Seated Leg Press (Machine)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Seated Overhead Press (Barbell)", muscleGroup: "Shoulders", icon: "barbell" },
  { name: "Seated Overhead Press (Dumbbell)", muscleGroup: "Shoulders", icon: "fitness" },
  { name: "Seated Palms Up Wrist Curl (Dumbbell)", muscleGroup: "Arms", icon: "fitness" },
  { name: "Seated Row (Cable)", muscleGroup: "Back", icon: "barbell" },
  { name: "Seated Row (Machine)", muscleGroup: "Back", icon: "fitness" },
  { name: "Seated Wide-Grip Row (Cable)", muscleGroup: "Back", icon: "barbell" },
  { name: "Shoulder Press (Machine)", muscleGroup: "Shoulders", icon: "fitness" },
  { name: "Shoulder Press (Plate Loaded)", muscleGroup: "Shoulders", icon: "fitness" },
  { name: "Shrug (Barbell)", muscleGroup: "Back", icon: "barbell" },
  { name: "Shrug (Dumbbell)", muscleGroup: "Back", icon: "fitness" },
  { name: "Shrug (Machine)", muscleGroup: "Back", icon: "fitness" },
  { name: "Shrug (Smith Machine)", muscleGroup: "Back", icon: "barbell" },
  { name: "Side Bend (Band)", muscleGroup: "Core", icon: "fitness" },
  { name: "Side Bend (Cable)", muscleGroup: "Core", icon: "barbell" },
  { name: "Side Bend (Dumbbell)", muscleGroup: "Core", icon: "fitness" },
  { name: "Side Plank", muscleGroup: "Core", icon: "fitness" },
  { name: "Single Leg Bridge", muscleGroup: "Legs", icon: "fitness" },
  { name: "Sit Up", muscleGroup: "Core", icon: "fitness" },
  { name: "Skullcrusher (Barbell)", muscleGroup: "Arms", icon: "barbell" },
  { name: "Skullcrusher (Dumbbell)", muscleGroup: "Arms", icon: "fitness" },
  { name: "Squat (Band)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Squat (Barbell)", muscleGroup: "Legs", icon: "barbell" },
  { name: "Squat (Bodyweight)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Squat (Dumbbell)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Squat (Machine)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Squat (Smith Machine)", muscleGroup: "Legs", icon: "barbell" },
  { name: "Standing Calf Raise (Barbell)", muscleGroup: "Legs", icon: "barbell" },
  { name: "Standing Calf Raise (Bodyweight)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Standing Calf Raise (Dumbbell)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Standing Calf Raise (Machine)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Standing Calf Raise (Smith Machine)", muscleGroup: "Legs", icon: "barbell" },
  { name: "Step-up", muscleGroup: "Legs", icon: "fitness" },
  { name: "Stiff Leg Deadlift (Barbell)", muscleGroup: "Legs", icon: "barbell" },
  { name: "Stiff Leg Deadlift (Dumbbell)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Straight Arm Pulldown", muscleGroup: "Back", icon: "barbell" },
  { name: "Straight Leg Deadlift (Band)", muscleGroup: "Legs", icon: "fitness" },
  { name: "Strict Military Press (Barbell)", muscleGroup: "Shoulders", icon: "barbell" },
  { name: "Sumo Deadlift (Barbell)", muscleGroup: "Legs", icon: "barbell" },
  { name: "Superman", muscleGroup: "Back", icon: "fitness" },
  { name: "T Bar Row", muscleGroup: "Back", icon: "barbell" },
  { name: "Toes To Bar", muscleGroup: "Core", icon: "fitness" },
  { name: "Torso Rotation (Machine)", muscleGroup: "Core", icon: "fitness" },
  { name: "Trap Bar Deadlift", muscleGroup: "Legs", icon: "barbell" },
  { name: "Triceps Dip", muscleGroup: "Arms", icon: "fitness" },
  { name: "Triceps Dip (Assisted)", muscleGroup: "Arms", icon: "fitness" },
  { name: "Triceps Extension", muscleGroup: "Arms", icon: "fitness" },
  { name: "Triceps Extension (Barbell)", muscleGroup: "Arms", icon: "barbell" },
  { name: "Triceps Extension (Cable)", muscleGroup: "Arms", icon: "barbell" },
  { name: "Triceps Extension (Dumbbell)", muscleGroup: "Arms", icon: "fitness" },
  { name: "Triceps Extension (Machine)", muscleGroup: "Arms", icon: "fitness" },
  { name: "Triceps Pushdown (Cable - Straight Bar)", muscleGroup: "Arms", icon: "barbell" },
  { name: "Upright Row (Barbell)", muscleGroup: "Shoulders", icon: "barbell" },
  { name: "Upright Row (Cable)", muscleGroup: "Shoulders", icon: "barbell" },
  { name: "Upright Row (Dumbbell)", muscleGroup: "Shoulders", icon: "fitness" },
  { name: "V Up", muscleGroup: "Core", icon: "fitness" },
  { name: "Wide Pull Up", muscleGroup: "Back", icon: "fitness" },
  { name: "Wrist Roller", muscleGroup: "Arms", icon: "fitness" },
  { name: "Zercher Squat (Barbell)", muscleGroup: "Legs", icon: "barbell" },
];

const translateMuscleGroup = (group: string): string => {
  return group
    .replace(/Chest/gi, 'Bryst')
    .replace(/Back/gi, 'Rygg')
    .replace(/Legs/gi, 'Bein')
    .replace(/Shoulders/gi, 'Skuldre')
    .replace(/Arms/gi, 'Armer')
    .replace(/Core/gi, 'Kjerne');
};

const EXERCISE_TEMPLATES: ExerciseTemplate[] = EXERCISE_TEMPLATES_RAW.map((ex, idx) => ({
  id: String(idx + 1),
  name: ex.name,
  muscleGroup: translateMuscleGroup(ex.muscleGroup),
  icon: ex.icon,
}));

const MUSCLE_GROUPS = ["Alle", "Bryst", "Rygg", "Bein", "Skuldre", "Armer"];

interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exerciseName: string) => void;
}

export default function ExercisePickerModal({ visible, onClose, onSelectExercise }: ExercisePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("Alle");

  const filteredExercises = EXERCISE_TEMPLATES
    .filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscleGroup = selectedMuscleGroup === "Alle" || exercise.muscleGroup.includes(selectedMuscleGroup);
    return matchesSearch && matchesMuscleGroup;
    })
    .sort((a, b) => {
      if (selectedMuscleGroup !== "Alle") return 0; // ikke sorter for spesifikk gruppe
      return a.name.localeCompare(b.name, 'no', { sensitivity: 'base' });
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


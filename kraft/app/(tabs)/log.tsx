import { View, Text, TextInput, Button, FlatList } from "react-native";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "@/services/firebase";

type SetRow = { reps: string; weight?: string };
type Exercise = { name: string; sets: SetRow[] };

export default function LogWorkout() {
  const [name, setName] = useState("");
  const [sets, setSets] = useState<SetRow[]>([{ reps: "", weight: "" }]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);

  const addSet = () => setSets((s) => [...s, { reps: "", weight: "" }]);
  const addExercise = () => {
    if (!name.trim()) return;
    setExercises((e) => [...e, { name: name.trim(), sets }]);
    setName("");
    setSets([{ reps: "", weight: "" }]);
  };

  const save = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "workouts"), {
        userId: auth.currentUser.uid,
        date: Date.now(),
        exercises: exercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets.map((s) => ({
            reps: Number(s.reps),
            weight: s.weight ? Number(s.weight) : null,
          })),
        })),
      });
      setExercises([]);
      alert("Workout saved");
    } catch (e: any) {
      alert(e.message ?? "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Log workout</Text>
      <TextInput
        placeholder="Exercise name (e.g. Bench Press)"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />
      <FlatList
        data={sets}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => (
          <View style={{ flexDirection: "row", gap: 8, marginVertical: 6 }}>
            <TextInput
              placeholder="Reps"
              keyboardType="number-pad"
              value={item.reps}
              onChangeText={(v) => {
                const c = [...sets]; c[index].reps = v; setSets(c);
              }}
              style={{ flex: 1, borderWidth: 1, padding: 10, borderRadius: 8 }}
            />
            <TextInput
              placeholder="Weight (kg) optional"
              keyboardType="decimal-pad"
              value={item.weight ?? ""}
              onChangeText={(v) => {
                const c = [...sets]; c[index].weight = v; setSets(c);
              }}
              style={{ flex: 1, borderWidth: 1, padding: 10, borderRadius: 8 }}
            />
          </View>
        )}
        ListFooterComponent={<Button title="+ Add set" onPress={addSet} />}
      />
      <Button title="+ Add exercise to workout" onPress={addExercise} />
      <FlatList
        data={exercises}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginTop: 8 }}>
            <Text style={{ fontWeight: "600" }}>{item.name}</Text>
            {item.sets.map((s, i) => (
              <Text key={i}>
                Set {i + 1}: {s.reps} reps {s.weight ? `@ ${s.weight} kg` : "(no weight)"}
              </Text>
            ))}
          </View>
        )}
      />
      <Button title={saving ? "Saving..." : "Save workout"} disabled={saving} onPress={save} />
    </View>
  );
}

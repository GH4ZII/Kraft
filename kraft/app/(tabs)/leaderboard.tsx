import { View, Text } from "react-native";

export default function Leaderboard() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Leaderboards</Text>
      <Text>• Most workouts this week</Text>
      <Text>• Strongest (Bench/Squat/Deadlift)</Text>
      {/* Neste steg: hent venner + sorter på pre-kalkulerte felt */}
    </View>
  );
}

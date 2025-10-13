import { View, Text, Button } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "@/services/firebase";

export default function Home() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>Kraft</Text>
      <Text>Weekly summary will go here.</Text>
      <Button title="Sign out" onPress={() => signOut(auth)} />
    </View>
  );
}

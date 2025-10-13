import { View, Text, Switch, Button } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth, db } from "@/services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Profile() {
  const { user } = useAuth();
  const [hideWeights, setHideWeights] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const u = snap.data() as any;
        setHideWeights(!!u.hideWeights);
        setUsername(u.username);
      }
    };
    run();
  }, [user]);

  const toggle = async () => {
    if (!user) return;
    const newVal = !hideWeights;
    setHideWeights(newVal);
    await updateDoc(doc(db, "users", user.uid), { hideWeights: newVal });
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{username || user?.email}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text>Hide weights publicly</Text>
        <Switch value={hideWeights} onValueChange={toggle} />
      </View>
      <Button title="Sign out" onPress={() => signOut(auth)} />
    </View>
  );
}

import { View, Text, Switch, Button, Alert } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth, firestore } from "@/services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Profile() {
  const { user } = useAuth();
  const [hideWeights, setHideWeights] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      const snap = await getDoc(doc(firestore, "users", user.uid));
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
    await updateDoc(doc(firestore, "users", user.uid), { hideWeights: newVal });
  };

  const handleSignOut = async () => {
    try {
      // Fjern lagrede påloggingsdetaljer
      await AsyncStorage.removeItem('rememberMe');
      await AsyncStorage.removeItem('savedEmail');
      await AsyncStorage.removeItem('savedPassword');
      
      // Logg ut fra Firebase
      await signOut(auth);
      
      // Naviger til login-siden
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
      Alert.alert("Feil", "Kunne ikke logge ut. Prøv igjen.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{username || user?.email}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text>Hide weights publicly</Text>
        <Switch value={hideWeights} onValueChange={toggle} />
      </View>
      <Button title="Sign out" onPress={handleSignOut} />
    </View>
  );
}

// app/(auth)/sign-up.tsx
import { View, Text, TextInput, Button } from "react-native";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/services/firebase";
import { createUserProfile } from "@/services/database";
import { Link, router } from "expo-router";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [username, setUsername] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      
      // Oppdater Firebase Auth profil
      await updateProfile(cred.user, { displayName: username });
      
      // Lag brukerprofil i Firestore (bruk database.ts funksjonen)
      await createUserProfile(cred.user.uid, {
        email: email.trim(),
        displayName: username.trim(),
      });
      
      router.replace("/(tabs)/");
    } catch (e: any) {
      setErr(e.message ?? "Sign-up failed");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Create account</Text>
      {!!err && <Text style={{ color: "tomato" }}>{err}</Text>}
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8, color: "#000" }}
      />
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8, color: "#000" }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={pass}
        onChangeText={setPass}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8, color: "#000" }}
      />
      <Button title="Create" onPress={submit} />
      <Link href="/(auth)/sign-in" style={{ marginTop: 12 }}>
        I already have an account
      </Link>
    </View>
  );
}

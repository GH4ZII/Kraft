// app/(auth)/sign-in.tsx
import { View, Text, TextInput, Button } from "react-native";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/services/firebase";
import { Link, router } from "expo-router";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      router.replace("/(tabs)/");
    } catch (e: any) {
      setErr(e.message ?? "Login failed");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Welcome back</Text>
      {!!err && <Text style={{ color: "tomato" }}>{err}</Text>}
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={pass}
        onChangeText={setPass}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />
      <Button title="Sign in" onPress={submit} />
      <Link href="/(auth)/sign-up" style={{ marginTop: 12 }}>
        Don’t have an account? Create one
      </Link>
    </View>
  );
}

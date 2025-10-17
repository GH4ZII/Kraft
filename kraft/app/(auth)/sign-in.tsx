import { View, Text, TextInput, Button, Platform } from "react-native";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/services/firebase";
import { Link, router } from "expo-router";

export default function SignIn() {
  // Platform-spesifikke verdier
  const isIOS = Platform.OS === 'ios';
  const defaultEmail = isIOS 
    ? process.env.EXPO_PUBLIC_LOCAL_EMAIL || "admin@example.com"
    : process.env.EXPO_PUBLIC_DEFAULT_EMAIL || "admin@example.com";
  const defaultPassword = isIOS 
    ? process.env.EXPO_PUBLIC_LOCAL_PASSWORD || "Password1."
    : process.env.EXPO_PUBLIC_DEFAULT_PASSWORD || "Password1.";
  const emailPlaceholder = isIOS 
    ? process.env.EXPO_PUBLIC_LOCAL_EMAIL || "admin@example.com"
    : process.env.EXPO_PUBLIC_DEFAULT_EMAIL || "admin@example.com";
  const passwordPlaceholder = isIOS 
    ? process.env.EXPO_PUBLIC_LOCAL_PASSWORD || "Password1."
    : process.env.EXPO_PUBLIC_DEFAULT_PASSWORD || "Password1.";

  const [email, setEmail] = useState(defaultEmail);
  const [pass, setPass] = useState(defaultPassword);
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
        placeholder={emailPlaceholder}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8, color: "#000" }}
      />
      <TextInput
        placeholder={passwordPlaceholder}
        secureTextEntry
        value={pass}
        onChangeText={setPass}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8, color: "#000" }}
      />
      <Button title="Sign in" onPress={submit} />
      <Link href="/(auth)/sign-up" style={{ marginTop: 12 }}>
        Don't have an account? Create one
      </Link>
    </View>
  );
}

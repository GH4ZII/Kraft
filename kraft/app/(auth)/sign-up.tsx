// app/(auth)/sign-up.tsx
import { View, Text, TextInput, Button, StatusBar, TouchableOpacity, Switch } from "react-native";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/services/firebase";
import { createUserProfile } from "@/services/database";
import { Link, router } from "expo-router";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [err, setErr] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const submit = async () => {
    setErr("");
    
    // Debug logging
    console.log("Validering:", {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      pass: pass.trim(),
      confirmPass: confirmPass.trim(),
      acceptTerms
    });
    
    // Validering
    if (!firstName.trim()) {
      setErr("Fornavn må fylles ut");
      return;
    }
    
    if (!lastName.trim()) {
      setErr("Etternavn må fylles ut");
      return;
    }
    
    if (!email.trim()) {
      setErr("E-post må fylles ut");
      return;
    }
    
    if (!pass.trim()) {
      setErr("Passord må fylles ut");
      return;
    }
    
    if (!confirmPass.trim()) {
      setErr("Bekreft passord må fylles ut");
      return;
    }
    
    if (pass !== confirmPass) {
      setErr("Passordene stemmer ikke overens");
      return;
    }
    
    if (pass.length < 8) {
      setErr("Passordet må være minst 8 tegn");
      return;
    }
    
    if (!acceptTerms) {
      setErr("Du må godta vilkårene");
      return;
    }
    
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      
      // Oppdater Firebase Auth profil
      await updateProfile(cred.user, { displayName: `${firstName.trim()} ${lastName.trim()}` });
      
      // Lag brukerprofil i Firestore
      await createUserProfile(cred.user.uid, {
        email: email.trim(),
        displayName: `${firstName.trim()} ${lastName.trim()}`,
      });
      
      router.replace("/(tabs)");
    } catch (e: any) {
      setErr(e.message ?? "Opprettelse av konto feilet");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f9fa", padding: 32 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Sign Up Content */}
      <View style={{ 
        flex: 1,
        justifyContent: "center"
      }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ 
              width: 32, 
              height: 32, 
              backgroundColor: "#22c55e", 
              borderRadius: 16, 
              justifyContent: 'center', 
              alignItems: 'center',
              marginRight: 8
            }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>K</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>Kraft</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
          Opprett konto
        </Text>
        <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 32, lineHeight: 24 }}>
          Start styrkereisen din. Lag en konto for å lagre maler og logge økter.
        </Text>

        {/* Error Message */}
        {!!err && <Text style={{ color: "#ef4444", marginBottom: 16, textAlign: 'center' }}>{err}</Text>}

        {/* First Name Input */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Fornavn</Text>
          <TextInput
            placeholder="Ola"
            placeholderTextColor="#9ca3af"
            value={firstName}
            onChangeText={setFirstName}
            style={{ 
              borderWidth: 1, 
              padding: 16, 
              borderRadius: 12, 
              color: "#1f2937", 
              backgroundColor: "#ffffff", 
              borderColor: "#d1d5db",
              fontSize: 16
            }}
          />
        </View>

        {/* Last Name Input */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Etternavn</Text>
          <TextInput
            placeholder="Nordmann"
            placeholderTextColor="#9ca3af"
            value={lastName}
            onChangeText={setLastName}
            style={{ 
              borderWidth: 1, 
              padding: 16, 
              borderRadius: 12, 
              color: "#1f2937", 
              backgroundColor: "#ffffff", 
              borderColor: "#d1d5db",
              fontSize: 16
            }}
          />
        </View>

        {/* Email Input */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>E-post</Text>
          <TextInput
            placeholder="ola@eksempel.no"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={{ 
              borderWidth: 1, 
              padding: 16, 
              borderRadius: 12, 
              color: "#1f2937", 
              backgroundColor: "#ffffff", 
              borderColor: "#d1d5db",
              fontSize: 16
            }}
          />
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Passord</Text>
          <TextInput
            placeholder="Minst 8 tegn ••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={pass}
            onChangeText={setPass}
            style={{ 
              borderWidth: 1, 
              padding: 16, 
              borderRadius: 12, 
              color: "#1f2937", 
              backgroundColor: "#ffffff", 
              borderColor: "#d1d5db",
              fontSize: 16
            }}
          />
        </View>

        {/* Confirm Password Input */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Bekreft passord</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={confirmPass}
            onChangeText={setConfirmPass}
            style={{ 
              borderWidth: 1, 
              padding: 16, 
              borderRadius: 12, 
              color: "#1f2937", 
              backgroundColor: "#ffffff", 
              borderColor: "#d1d5db",
              fontSize: 16
            }}
          />
        </View>

        {/* Terms and Conditions */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <Switch
            value={acceptTerms}
            onValueChange={setAcceptTerms}
            trackColor={{ false: '#d1d5db', true: '#22c55e' }}
            thumbColor={acceptTerms ? '#ffffff' : '#ffffff'}
          />
          <Text style={{ marginLeft: 8, fontSize: 14, color: '#6b7280' }}>Godta vilkår</Text>
          <Text style={{ color: "#22c55e", fontSize: 14, marginLeft: 4 }}>Les mer</Text>
        </View>

        {/* Create Account Button */}
        <TouchableOpacity 
          onPress={submit}
          style={{ 
            backgroundColor: "#22c55e", 
            borderRadius: 12, 
            padding: 16, 
            flexDirection: 'row', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: 24
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginRight: 8 }}>Opprett konto</Text>
          <Text style={{ color: '#ffffff', fontSize: 16 }}></Text>
        </TouchableOpacity>

        {/* Legal Disclaimer */}
        <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', lineHeight: 18 }}>
          Ved å opprette konto godtar du{" "}
          <Text style={{ color: "#22c55e" }}>vilkår</Text>
          {" "}og{" "}
          <Text style={{ color: "#22c55e" }}>personvern</Text>
          .
        </Text>
      </View>
    </View>
  );
}

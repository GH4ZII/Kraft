import { View, Text, TextInput, Button, Platform, Switch, StatusBar, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/services/firebase";
import { Link, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const REMEMBER_ME_KEY = 'rememberMe';
const SAVED_EMAIL_KEY = 'savedEmail';
const SAVED_PASSWORD_KEY = 'savedPassword';

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Last inn lagrede verdier når komponenten monteres
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedRememberMe = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      const savedEmail = await AsyncStorage.getItem(SAVED_EMAIL_KEY);
      const savedPassword = await AsyncStorage.getItem(SAVED_PASSWORD_KEY);
      
      if (savedRememberMe === 'true' && savedEmail && savedPassword) {
        setRememberMe(true);
        setEmail(savedEmail);
        setPass(savedPassword);
      }
    } catch (error) {
      console.log('Error loading saved credentials:', error);
    }
  };

  const submit = async () => {
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      
      // Lagre påloggingsdetaljer hvis "husk meg" er aktivert
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_ME_KEY, 'true');
        await AsyncStorage.setItem(SAVED_EMAIL_KEY, email.trim());
        await AsyncStorage.setItem(SAVED_PASSWORD_KEY, pass);
      } else {
        // Fjern lagrede verdier hvis "husk meg" ikke er aktivert
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
        await AsyncStorage.removeItem(SAVED_EMAIL_KEY);
        await AsyncStorage.removeItem(SAVED_PASSWORD_KEY);
      }
      
      router.replace("/(tabs)");
    } catch (e: any) {
      setErr(e.message ?? "Login failed");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f9fa", padding: 32 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Login Content */}
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
              borderRadius: 8, 
              justifyContent: 'center', 
              alignItems: 'center',
              marginRight: 8
            }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>K</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>Kraft</Text>
          </View>
          <Text style={{ color: "#22c55e", fontSize: 16 }}>Hjelp</Text>
        </View>

        {/* Welcome Message */}
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#16a34a', marginBottom: 8 }}>
          Velkommen til Kraft
        </Text>
        <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 32, lineHeight: 24 }}>
          Bygg styrke, loggfør løft, og hold deg motivert med venner.
        </Text>

        {/* Error Message */}
        {!!err && <Text style={{ color: "#ef4444", marginBottom: 16, textAlign: 'center' }}>{err}</Text>}

        {/* Email Input */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>E-post</Text>
          <TextInput
            placeholder="navn@eksempel.no"
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
            placeholder="••••••••"
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

        {/* Remember Me and Forgot Password */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: '#d1d5db', true: '#22c55e' }}
              thumbColor={rememberMe ? '#ffffff' : '#ffffff'}
            />
            <Text style={{ marginLeft: 8, fontSize: 14, color: '#6b7280' }}>Husk meg</Text>
          </View>
          <Text style={{ color: "#22c55e", fontSize: 14 }}>Glemt passord?</Text>
        </View>

        {/* Login Button */}
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
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginRight: 8 }}>Logg inn</Text>
          <Text style={{ color: '#ffffff', fontSize: 16 }}>→</Text>
        </TouchableOpacity>

        {/* Create Account Link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#6b7280', fontSize: 14 }}>Ny her? </Text>
          <Link href="/(auth)/sign-up">
            <Text style={{ color: "#22c55e", fontSize: 14, fontWeight: '500' }}>Opprett konto</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

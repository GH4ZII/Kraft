// app/_layout.tsx
import { Slot } from "expo-router";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useEffect } from "react";
import { router } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function Gate() {
  const { user, loading: authLoading } = useAuth();
  const { hasSeenOnboarding, loading: onboardingLoading } = useOnboarding();
  
  useEffect(() => {
    if (authLoading || onboardingLoading) return;

    if (!hasSeenOnboarding) {
      router.replace("/onboarding");
    } else if (!user) {
      router.replace("/(auth)/sign-in");
    } else {
      router.replace("/(tabs)");
    }
  }, [user, authLoading, hasSeenOnboarding, onboardingLoading]);
  
  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <AuthProvider>
      <Gate />
    </AuthProvider>
    </GestureHandlerRootView>
  );
}

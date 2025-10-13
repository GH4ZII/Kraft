// app/_layout.tsx
import { Slot } from "expo-router";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useEffect } from "react";
import { router } from "expo-router";

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
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

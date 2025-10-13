// app/_layout.tsx
import { Slot } from "expo-router";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { router } from "expo-router";

function Gate() {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/(auth)/sign-in");
      else router.replace("/(tabs)");
    }
  }, [user, loading]);
  return <Slot />; // viser child layout (auth eller tabs)
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

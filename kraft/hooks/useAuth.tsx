// hooks/useAuth.ts
import { useEffect, useState, createContext, useContext } from "react";
import { onAuthStateChanged, User, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthCtx = { user: User | null; loading: boolean };
const Ctx = createContext<AuthCtx>({ user: null, loading: true });

const REMEMBER_ME_KEY = 'rememberMe';
const SAVED_EMAIL_KEY = 'savedEmail';
const SAVED_PASSWORD_KEY = 'savedPassword';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setLoading(false);
      } else {
        // Hvis bruker ikke er logget inn, sjekk om vi skal automatisk logge inn
        await checkAutoLogin();
      }
    });

    return unsubscribe;
  }, []);

  const checkAutoLogin = async () => {
    try {
      const rememberMe = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      const savedEmail = await AsyncStorage.getItem(SAVED_EMAIL_KEY);
      const savedPassword = await AsyncStorage.getItem(SAVED_PASSWORD_KEY);

      if (rememberMe === 'true' && savedEmail && savedPassword) {
        try {
          await signInWithEmailAndPassword(auth, savedEmail, savedPassword);
          // Brukeren vil automatisk bli satt via onAuthStateChanged
        } catch (error) {
          console.log('Auto-login failed:', error);
          // Fjern lagrede påloggingsdetaljer hvis de ikke fungerer
          await AsyncStorage.removeItem(SAVED_PASSWORD_KEY);
        }
      }
      setLoading(false);
    } catch (error) {
      console.log('Error checking auto-login:', error);
      setLoading(false);
    }
  };

  return <Ctx.Provider value={{ user, loading }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);

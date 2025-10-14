import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = '@has_seen_onboarding';

export function useOnboarding() {
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkOnboarding();
    }, []);

    const checkOnboarding = async () => {
        try {
            const value = await AsyncStorage.getItem(ONBOARDING_KEY);
            setHasSeenOnboarding(value === 'true');
        } catch (error) {
            console.error('Error checking onboarding:', error);
            setHasSeenOnboarding(false);
        } finally {
            setLoading(false);
        }
    };

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            setHasSeenOnboarding(true);
        } catch (error) {
            console.error('Error completing onboarding:', error);
        }
        };

    return { hasSeenOnboarding, loading, completeOnboarding };
};
    
    

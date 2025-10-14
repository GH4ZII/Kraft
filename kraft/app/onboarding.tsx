import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useOnboarding } from '@/hooks/useOnboarding';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Velkommen til Kraft! 💪',
    subtitle: 'Din personlige treningspartner',
  },
  {
    title: 'Spor fremgangen din',
    subtitle: 'Hold oversikt over treningsøkter og styrke',
  },
  {
    title: 'Utfordre venner',
    subtitle: 'Konkurrer på leaderboard og bli sterkere sammen',
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding } = useOnboarding();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
      router.replace('/(auth)/sign-in');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(auth)/sign-in');
  };

  return (
    <View style={styles.container}>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{slides[currentSlide].title}</Text>
        <Text style={styles.subtitle}>{slides[currentSlide].subtitle}</Text>
      </View>

      {/* Dots indicator */}
      <View style={styles.dots}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentSlide && styles.activeDot,
            ]}
          />
        ))}
      </View>
      <View style={styles.buttonContainer}>
        {/* Kom i gang button */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleNext}
        >
          <Text style={styles.primaryButtonText}>
            {currentSlide === slides.length - 1 ? 'Kom i gang' : 'Neste'}
          </Text>
        </TouchableOpacity>
        
        {/* Skip button */}
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>Hopp over</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    color: "white",
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: 'green',
    width: 12,
    height: 12,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#34C759',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff', // Hvit tekst
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  skipButtonText: {
    color: '#9E9E9E', // Blå tekst
    fontSize: 16,
  },
});

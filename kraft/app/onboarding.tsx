import { View, Text, Button, StyleSheet, Dimensions } from 'react-native';
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
      {/* Skip button */}
      <Button title="Hopp over" onPress={handleSkip} color="#007AFF" />

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

      {/* Next button */}
      <Button
        title={currentSlide === slides.length - 1 ? 'Kom i gang' : 'Neste'}
        onPress={handleNext}
        color="#007AFF"
      />
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#000',
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
    backgroundColor: '#007AFF',
    width: 12,
    height: 12,
  },
});

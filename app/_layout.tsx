import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, useColorScheme } from 'react-native';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { useSubjects } from '@/hooks/useSubjects';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject } from '@/types/subject';
import { BookOpen } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

function SplashScreen() {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const logoScale = new Animated.Value(0.3);
  const textOpacity = new Animated.Value(0);
  const textTranslateY = new Animated.Value(20);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 10,
        friction: 2,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After animations complete, wait a bit before hiding splash
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    });
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f5f5f5' }]}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
        <BookOpen size={80} color={isDark ? '#ffffff' : '#000000'} />
      </Animated.View>
      <Animated.View style={[
        styles.textContainer,
        {
          opacity: textOpacity,
          transform: [{ translateY: textTranslateY }]
        }
      ]}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
          Attendance Tracker
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#888888' : '#666666' }]}>
          Track your attendance with ease
        </Text>
      </Animated.View>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { subjects, addSubject } = useSubjects();

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedSubjects = await AsyncStorage.getItem('subjects');
        if (savedSubjects) {
          const parsedSubjects = JSON.parse(savedSubjects);
          // Add each subject individually using addSubject
          for (const subject of parsedSubjects) {
            await addSubject(subject);
          }
        }
      } catch (error) {
        console.error('Error loading subjects:', error);
      }
    };

    loadData();
  }, []);

  return (
    <ThemeProvider>
      <SplashScreen />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  logoContainer: {
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
});
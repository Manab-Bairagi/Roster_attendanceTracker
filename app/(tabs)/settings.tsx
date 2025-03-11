import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun, Smartphone, Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubjects } from '@/hooks/useSubjects';

export default function SettingsScreen() {
  const { theme, setTheme, isDark } = useTheme();
  const { setSubjects } = useSubjects();

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to clear all data? This will remove all subjects, attendance records, and calendar events. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear specific keys instead of all storage
              await Promise.all([
                AsyncStorage.removeItem('subjects'),
                AsyncStorage.removeItem('calendar_events')
              ]);
              
              // Reset states
              setSubjects([]);
              
              Alert.alert(
                "Success", 
                "All data has been cleared successfully",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Force a reload of the app state
                      if (Platform.OS === 'web') {
                        window.location.reload();
                      } else {
                        // For mobile, the states will update automatically
                      }
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert("Error", "Failed to clear data");
            }
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#f5f5f5',
    },
    header: {
      marginTop: 60,
      marginBottom: 20,
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
    },
    section: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      margin: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 16,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333333' : '#f0f0f0',
    },
    optionText: {
      flex: 1,
      fontSize: 16,
      color: isDark ? '#ffffff' : '#000000',
      marginLeft: 12,
    },
    activeOption: {
      backgroundColor: isDark ? '#333333' : '#f0f0f0',
      borderRadius: 8,
    },
    dangerSection: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      margin: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    dangerButton: {
      backgroundColor: '#FF3B30',
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dangerButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme</Text>
        
        <TouchableOpacity
          style={[styles.option, theme === 'light' && styles.activeOption]}
          onPress={() => setTheme('light')}>
          <Sun size={24} color={isDark ? '#ffffff' : '#000000'} />
          <Text style={styles.optionText}>Light</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, theme === 'dark' && styles.activeOption]}
          onPress={() => setTheme('dark')}>
          <Moon size={24} color={isDark ? '#ffffff' : '#000000'} />
          <Text style={styles.optionText}>Dark</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, theme === 'system' && styles.activeOption, { borderBottomWidth: 0 }]}
          onPress={() => setTheme('system')}>
          <Smartphone size={24} color={isDark ? '#ffffff' : '#000000'} />
          <Text style={styles.optionText}>System</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dangerSection}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleClearAllData}>
          <Trash2 color="#ffffff" size={20} />
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Animated, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';
import { useTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubjects } from '@/hooks/useSubjects';
import { CalendarEvent } from '@/types/subject';
import { Plus, X, Check } from 'lucide-react-native';

export default function CalendarScreen() {
  const { isDark } = useTheme();
  const { subjects } = useSubjects();
  const [events, setEvents] = useState<{ [key: string]: CalendarEvent[] }>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    color: '#007AFF',
    description: ''
  });
  const fadeAnim = new Animated.Value(0);
  const keyboardAvoidingViewRef = useRef<KeyboardAvoidingView>(null);

  // Animation for event cards
  const eventAnimation = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Check for cleared data
  useEffect(() => {
    const checkEvents = async () => {
      try {
        const savedEvents = await AsyncStorage.getItem('calendar_events');
        if (!savedEvents) {
          setEvents({});
          setSelectedDate('');
        } else {
          setEvents(JSON.parse(savedEvents));
        }
      } catch (error) {
        console.error('Error checking events:', error);
      }
    };

    checkEvents();
    const interval = setInterval(checkEvents, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanup = setInterval(cleanupOldEvents, 24 * 60 * 60 * 1000); // Check daily
    return () => clearInterval(cleanup);
  }, [events]); // Add events as dependency

  useEffect(() => {
    if (selectedDate) {
      fadeAnim.setValue(0);
      eventAnimation();
    }
  }, [selectedDate, eventAnimation]);

  const cleanupOldEvents = async () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const updatedEvents = { ...events };
    let hasChanges = false;

    Object.entries(updatedEvents).forEach(([date, dateEvents]) => {
      const filteredEvents = dateEvents.filter(event => {
        if (!event.completed) return true;
        const completedDate = new Date(event.completedDate || '');
        return completedDate > oneMonthAgo;
      });

      if (filteredEvents.length !== dateEvents.length) {
        if (filteredEvents.length === 0) {
          delete updatedEvents[date];
        } else {
          updatedEvents[date] = filteredEvents;
        }
        hasChanges = true;
      }
    });

    if (hasChanges) {
      await saveEvents(updatedEvents);
    }
  };

  const loadEvents = async () => {
    try {
      const savedEvents = await AsyncStorage.getItem('calendar_events');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const saveEvents = async (newEvents: { [key: string]: CalendarEvent[] }) => {
    try {
      await AsyncStorage.setItem('calendar_events', JSON.stringify(newEvents));
      setEvents(newEvents);
    } catch (error) {
      console.error('Error saving events:', error);
    }
  };

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: selectedDate,
      description: newEvent.description,
      color: newEvent.color,
      type: 'custom',
      completed: false
    };

    const updatedEvents = {
      ...events,
      [selectedDate]: [...(events[selectedDate] || []), event]
    };

    saveEvents(updatedEvents);
    setNewEvent({ 
      title: '', 
      color: '#007AFF',
      description: '' 
    });
    setIsAddingEvent(false);
  };

  const toggleEventCompletion = (eventId: string) => {
    const updatedEvents = { ...events };
    const dateEvents = updatedEvents[selectedDate].map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          completed: !event.completed,
          completedDate: !event.completed ? new Date().toISOString() : undefined
        };
      }
      return event;
    });
    updatedEvents[selectedDate] = dateEvents;
    saveEvents(updatedEvents);
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
    calendar: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      margin: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    eventList: {
      padding: 16,
    },
    eventCard: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderLeftWidth: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    eventDetails: {
      flex: 1,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
    },
    eventTime: {
      fontSize: 12,
      color: isDark ? '#888888' : '#666666',
      marginTop: 4,
    },
    eventDescription: {
      fontSize: 14,
      color: isDark ? '#888888' : '#666666',
      marginTop: 4,
    },
    completedEvent: {
      opacity: 0.6,
    },
    checkButton: {
      padding: 8,
    },
    addButton: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      padding: 16,
      margin: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    addButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    modal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 20,
      width: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 16,
    },
    input: {
      backgroundColor: isDark ? '#333333' : '#f5f5f5',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      color: isDark ? '#ffffff' : '#000000',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    cancelButton: {
      backgroundColor: isDark ? '#333333' : '#f5f5f5',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      flex: 1,
    },
    saveButton: {
      backgroundColor: '#007AFF',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      flex: 1,
    },
    buttonText: {
      color: isDark ? '#ffffff' : '#000000',
      fontWeight: '600',
    },
    saveButtonText: {
      color: '#ffffff',
      fontWeight: '600',
    },
    keyboardAvoidingView: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalCard: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 20,
      width: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
  });

  const markedDates = Object.entries(events).reduce((acc, [date, dayEvents]) => {
    acc[date] = {
      marked: true,
      dots: dayEvents.map(event => ({
        color: event.color,
      })),
    };
    return acc;
  }, {} as any);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
      </View>

      <View style={styles.calendar}>
        <RNCalendar
          theme={{
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            calendarBackground: isDark ? '#1a1a1a' : '#ffffff',
            textSectionTitleColor: isDark ? '#ffffff' : '#000000',
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#007AFF',
            dayTextColor: isDark ? '#ffffff' : '#000000',
            textDisabledColor: isDark ? '#444444' : '#d9e1e8',
            monthTextColor: isDark ? '#ffffff' : '#000000',
          }}
          markingType="multi-dot"
          markedDates={markedDates}
          onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        />
      </View>

      {selectedDate && events[selectedDate] && (
        <Animated.View 
          style={[
            styles.eventList,
            { opacity: fadeAnim }
          ]}
        >
          {events[selectedDate].map((event, index) => (
            <Animated.View 
              key={event.id} 
              style={[
                styles.eventCard,
                { borderLeftColor: event.color },
                event.completed && styles.completedEvent
              ]}
            >
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.description && (
                  <Text style={styles.eventDescription}>{event.description}</Text>
                )}
                {event.completed && (
                  <Text style={styles.eventTime}>
                    Completed: {new Date(event.completedDate!).toLocaleDateString()}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.checkButton}
                onPress={() => toggleEventCompletion(event.id)}
              >
                <Check 
                  size={20} 
                  color={event.completed ? '#34C759' : isDark ? '#888888' : '#666666'}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      )}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          if (!selectedDate) {
            const today = new Date().toISOString().split('T')[0];
            setSelectedDate(today);
          }
          setIsAddingEvent(true);
        }}>
        <Plus color="#ffffff" size={20} />
        <Text style={styles.addButtonText}>Add Event</Text>
      </TouchableOpacity>

      <Modal
        visible={isAddingEvent}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setIsAddingEvent(false);
          setNewEvent({
            title: '',
            color: '#007AFF',
            description: '',
          });
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Add New Event</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Event Title"
                  placeholderTextColor={isDark ? '#888888' : '#999999'}
                  value={newEvent.title}
                  onChangeText={text => setNewEvent(prev => ({ ...prev, title: text }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Description"
                  placeholderTextColor={isDark ? '#888888' : '#999999'}
                  value={newEvent.description}
                  onChangeText={text => setNewEvent(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsAddingEvent(false);
                      setNewEvent({
                        title: '',
                        color: '#007AFF',
                        description: '',
                      });
                    }}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleAddEvent}>
                    <Text style={styles.saveButtonText}>Add Event</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
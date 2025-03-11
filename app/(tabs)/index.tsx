import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useSubjects } from '@/hooks/useSubjects';
import { useTheme } from '@/context/ThemeContext';
import { Plus, Check, X, CreditCard as Edit2, Save, Trash } from 'lucide-react-native';
import { Subject } from '@/types/subject';

export default function HomeScreen() {
  const { subjects, addSubject, removeSubject, updateSubject, getOverallAttendance, getClassesToMiss, markAttendance } = useSubjects();
  const { isDark } = useTheme();
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', requiredAttendance: '75' });
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ totalClasses: string; attendedClasses: string }>({
    totalClasses: '',
    attendedClasses: '',
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#f5f5f5',
      padding: 16,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 60,
      marginBottom: 20,
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
    },
    overallCard: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    overallTitle: {
      fontSize: 18,
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 8,
    },
    overallPercentage: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#007AFF',
    },
    subjectCard: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderLeftWidth: 6,
    },
    subjectHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    subjectName: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
      flex: 1,
    },
    subjectActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      padding: 8,
      marginLeft: 8,
    },
    editButton: {
      padding: 8,
    },
    subjectStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    percentage: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#007AFF',
    },
    missableClasses: {
      fontSize: 14,
      color: isDark ? '#888888' : '#666666',
    },
    attendanceButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    attendanceButton: {
      flex: 1,
      padding: 8,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    presentButton: {
      backgroundColor: '#34C759',
    },
    absentButton: {
      backgroundColor: '#FF3B30',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    addButtonCircle: {
      backgroundColor: '#007AFF',
      borderRadius: 25,
      width: 50,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    input: {
      backgroundColor: isDark ? '#333333' : '#ffffff',
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      color: isDark ? '#ffffff' : '#000000',
    },
    editRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    editInput: {
      flex: 1,
      backgroundColor: isDark ? '#333333' : '#ffffff',
      borderRadius: 8,
      padding: 12,
      color: isDark ? '#ffffff' : '#000000',
    },
    saveButton: {
      flex: 1,
      backgroundColor: '#34C759',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    requiredText: {
      color: isDark ? '#888888' : '#666666',
      fontSize: 12,
      marginTop: 4,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: '#FF3B30',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalCard: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 20,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 16,
      textAlign: 'center',
    },
    keyboardAvoidingView: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
    },
  });

  const handleAddSubject = () => {
    if (!newSubject.name || !newSubject.requiredAttendance) return;

    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubject.name,
      requiredAttendance: parseInt(newSubject.requiredAttendance),
      totalClasses: 0,
      attendedClasses: 0,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
    };

    addSubject(subject);
    setNewSubject({ name: '', requiredAttendance: '75' });
    setIsAddingSubject(false);
  };

  const handleAttendance = (subject: Subject, attended: boolean) => {
    markAttendance(subject.id, selectedDate, attended);
  };

  const startEditing = (subject: Subject) => {
    setEditingSubject(subject.id);
    setEditValues({
      totalClasses: subject.totalClasses.toString(),
      attendedClasses: subject.attendedClasses.toString(),
    });
  };

  const handleSaveEdit = (subject: Subject) => {
    const totalClasses = parseInt(editValues.totalClasses);
    const attendedClasses = parseInt(editValues.attendedClasses);

    if (isNaN(totalClasses) || isNaN(attendedClasses) || 
        totalClasses < 0 || attendedClasses < 0 || 
        attendedClasses > totalClasses) {
      return;
    }

    updateSubject({
      ...subject,
      totalClasses,
      attendedClasses,
    });
    setEditingSubject(null);
  };

  const handleRemoveSubject = (subjectId: string) => {
    Alert.alert(
      "Remove Subject",
      "Are you sure you want to remove this subject? All attendance records will be lost.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeSubject(subjectId)
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Attendance Manager</Text>
        <TouchableOpacity
          style={styles.addButtonCircle}
          onPress={() => setIsAddingSubject(true)}>
          <Plus color="#ffffff" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.overallCard}>
        <Text style={styles.overallTitle}>Overall Attendance</Text>
        <Text style={styles.overallPercentage}>{getOverallAttendance().toFixed(1)}%</Text>
      </View>

      {subjects.map(subject => (
        <View key={subject.id} style={[
          styles.subjectCard,
          {
            borderLeftColor: subject.color,
            backgroundColor: isDark 
              ? `${subject.color}15`
              : `${subject.color}08`
          }
        ]}>
          <View style={styles.subjectHeader}>
            <Text style={styles.subjectName}>{subject.name}</Text>
            <View style={styles.subjectActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => startEditing(subject)}>
                {editingSubject === subject.id ? (
                  <Save color={isDark ? '#ffffff' : '#000000'} size={20} />
                ) : (
                  <Edit2 color={isDark ? '#ffffff' : '#000000'} size={20} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleRemoveSubject(subject.id)}>
                <Trash color="#FF3B30" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {editingSubject === subject.id ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.editInput}
                placeholder="Total Classes"
                placeholderTextColor={isDark ? '#888888' : '#999999'}
                keyboardType="numeric"
                value={editValues.totalClasses}
                onChangeText={text => setEditValues(prev => ({ ...prev, totalClasses: text }))}
              />
              <TextInput
                style={styles.editInput}
                placeholder="Attended Classes"
                placeholderTextColor={isDark ? '#888888' : '#999999'}
                keyboardType="numeric"
                value={editValues.attendedClasses}
                onChangeText={text => setEditValues(prev => ({ ...prev, attendedClasses: text }))}
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleSaveEdit(subject)}>
                <Save color="#ffffff" size={20} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.subjectStats}>
                <Text style={styles.percentage}>
                  {subject.totalClasses === 0 ? '0.0' : ((subject.attendedClasses / subject.totalClasses) * 100).toFixed(1)}%
                </Text>
                <Text style={styles.missableClasses}>
                  Required: {subject.requiredAttendance}%
                </Text>
              </View>
              <Text style={styles.missableClasses}>
                Total Classes: {subject.totalClasses} | Attended: {subject.attendedClasses}
              </Text>
              {subject.totalClasses > 0 && (
                <Text style={[
                  styles.missableClasses,
                  getClassesToMiss(subject).canMiss > 0 ? { color: '#34C759' } : 
                  getClassesToMiss(subject).needToAttend > 0 ? { color: '#FF3B30' } : null
                ]}>
                  {getClassesToMiss(subject).canMiss > 0 
                    ? `You can miss ${getClassesToMiss(subject).canMiss} classes safely`
                    : getClassesToMiss(subject).needToAttend > 0
                    ? `You need to attend ${getClassesToMiss(subject).needToAttend} consecutive classes to reach target`
                    : 'Your attendance is exactly at the required percentage'}
                </Text>
              )}
              <View style={styles.attendanceButtons}>
                <TouchableOpacity
                  style={[styles.attendanceButton, styles.presentButton]}
                  onPress={() => handleAttendance(subject, true)}>
                  <Check color="#ffffff" size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.attendanceButton, styles.absentButton]}
                  onPress={() => handleAttendance(subject, false)}>
                  <X color="#ffffff" size={20} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ))}

      <Modal
        visible={isAddingSubject}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setIsAddingSubject(false);
          setNewSubject({ name: '', requiredAttendance: '75' });
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Add New Subject</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Subject Name"
                  placeholderTextColor={isDark ? '#888888' : '#999999'}
                  value={newSubject.name}
                  onChangeText={text => setNewSubject(prev => ({ ...prev, name: text }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Required Attendance %"
                  placeholderTextColor={isDark ? '#888888' : '#999999'}
                  keyboardType="numeric"
                  value={newSubject.requiredAttendance}
                  onChangeText={text => setNewSubject(prev => ({ ...prev, requiredAttendance: text }))}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsAddingSubject(false);
                      setNewSubject({ name: '', requiredAttendance: '75' });
                    }}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleAddSubject}>
                    <Text style={styles.saveButtonText}>Add Subject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
}
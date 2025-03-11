import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject, AttendanceEvent } from '@/types/subject';

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const savedSubjects = await AsyncStorage.getItem('subjects');
      if (savedSubjects) {
        setSubjects(JSON.parse(savedSubjects));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setLoading(false);
    }
  };

  const saveSubjects = async (newSubjects: Subject[]) => {
    try {
      await AsyncStorage.setItem('subjects', JSON.stringify(newSubjects));
      setSubjects(newSubjects);
    } catch (error) {
      console.error('Error saving subjects:', error);
    }
  };

  const addSubject = async (subject: Subject) => {
    const newSubjects = [...subjects, subject];
    await saveSubjects(newSubjects);
  };

  const removeSubject = async (id: string) => {
    const newSubjects = subjects.filter(subject => subject.id !== id);
    await saveSubjects(newSubjects);
  };

  const updateSubject = async (updatedSubject: Subject) => {
    const newSubjects = subjects.map(subject =>
      subject.id === updatedSubject.id ? updatedSubject : subject
    );
    await saveSubjects(newSubjects);
  };

  const markAttendance = async (subjectId: string, date: string, attended: boolean) => {
    const newSubjects = subjects.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          totalClasses: subject.totalClasses + 1,
          attendedClasses: attended ? subject.attendedClasses + 1 : subject.attendedClasses,
        };
      }
      return subject;
    });
    await saveSubjects(newSubjects);
  };

  const getOverallAttendance = () => {
    if (subjects.length === 0) return 0;
    const totalAttended = subjects.reduce((sum, subject) => sum + subject.attendedClasses, 0);
    const totalClasses = subjects.reduce((sum, subject) => sum + subject.totalClasses, 0);
    return totalClasses === 0 ? 0 : (totalAttended / totalClasses) * 100;
  };

  const getClassesToMiss = (subject: Subject) => {
    if (subject.totalClasses === 0) return { canMiss: 0, needToAttend: 0 };
    const currentPercentage = (subject.attendedClasses / subject.totalClasses) * 100;
    
    if (currentPercentage <= subject.requiredAttendance) {
      // Calculate how many consecutive classes need to be attended to reach required percentage
      let classesNeeded = 0;
      let tempTotal = subject.totalClasses;
      let tempAttended = subject.attendedClasses;
      
      while ((tempAttended / tempTotal) * 100 < subject.requiredAttendance) {
        tempTotal++;
        tempAttended++;
        classesNeeded++;
      }
      
      return { canMiss: 0, needToAttend: classesNeeded };
    }
    
    const canMiss = Math.floor(
      ((subject.attendedClasses * 100) - (subject.requiredAttendance * subject.totalClasses)) / subject.requiredAttendance
    );
    
    return { canMiss: Math.max(0, canMiss), needToAttend: 0 };
  };

  return {
    subjects,
    loading,
    addSubject,
    removeSubject,
    updateSubject,
    markAttendance,
    getOverallAttendance,
    getClassesToMiss,
  };
}
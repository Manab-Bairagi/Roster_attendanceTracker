export interface Subject {
  id: string;
  name: string;
  requiredAttendance: number;
  totalClasses: number;
  attendedClasses: number;
  color: string;
}

export interface AttendanceEvent {
  id: string;
  subjectId: string;
  date: string;
  attended: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  color: string;
  type: 'attendance' | 'custom';
  completed: boolean;
  completedDate?: string;
}
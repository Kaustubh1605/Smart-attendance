export type UserRole = 'student' | 'teacher' | 'admin';

export type AttendanceStatus = 'present' | 'probable' | 'needs_review' | 'absent';

export interface StudyMaterial {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  className: string;
  instructor: string;
  type: 'pdf' | 'ppt' | 'notes' | 'lab' | 'assignment' | 'link';
  unitOrTopic: string;
  description?: string;
  fileName: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedAt: string;
  downloadCount?: number;
  tags?: string[];
  externalUrl?: string;
  isBookmarked?: boolean;
}

export type VerificationResultStatus =
  | 'verified_present'
  | 'probable_present'
  | 'needs_review'
  | 'not_verified'
  | 'possible_proxy';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  studentId: string;
  program: string;
  batch: string;
  avatarUrl: string;
  overallAttendancePercentage: number;
  currentStreak: number;
  weeklyDelta: number;
  registeredDevice: {
    deviceName: string;
    deviceId: string;
    model: string;
    isTrusted: boolean;
    registeredAt: string;
    lastVerifiedAt: string;
    fingerprintHash: string;
  };
}

export interface Lecture {
  id: string;
  code: string;
  name: string;
  instructor: string;
  room: string;
  timeSlot: string;
  duration: string;
  status: 'active' | 'upcoming' | 'completed';
  className?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  attendanceCount?: number;
  isArchived?: boolean;
  geofence: {
    lat: number;
    lng: number;
    radiusMeters: number;
  };
  bleBeaconId?: string;
  activeSessionId?: string;
}

export interface VerificationEvidence {
  timestamp: string;
  locationStatus: 'verified' | 'mismatch' | 'uncertain';
  locationDistanceMeters: number;
  deviceStatus: 'trusted' | 'unrecognized' | 'mismatch';
  dynamicChallengeVerified: boolean;
  challengeLatencyMs: number;
  bleDetected: boolean;
  bleSignalRssi?: number;
  cctvFaceMatch?: 'match' | 'uncertain' | 'unavailable';
  confidenceScore: number; // 0 - 100
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  day: string;
  month: string;
  lectureCode: string;
  subjectName: string;
  lectureType: string;
  room: string;
  status: AttendanceStatus;
  evidence: VerificationEvidence;
  hasCorrectionRequest?: boolean;
  correctionStatus?: 'pending' | 'approved' | 'rejected';
  correctionReason?: string;
  teacherNote?: string;
}

export interface StudentAttendanceItem {
  studentId: string;
  studentName: string;
  rollNo: string;
  avatarUrl: string;
  time: string;
  status: AttendanceStatus;
  confidence: number;
  locationMatch: boolean;
  deviceTrusted: boolean;
  challengeOk: boolean;
  anomalyFlag?: string;
  bleDetected?: boolean;
  visualEvidence?: 'available' | 'unavailable';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  previousState?: string;
  newState?: string;
  reason?: string;
  ipAddress: string;
}

export interface SubjectAttendance {
  id: string;
  code: string;
  name: string;
  instructor: string;
  totalLectures: number;
  present: number;
  absent: number;
  needsReview: number;
  percentage: number;
  room: string;
  schedule: string;
  isBelowThreshold: boolean; // e.g. < 75%
}

export interface CorrectionRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  avatarUrl: string;
  lectureId: string;
  lectureCode: string;
  subjectName: string;
  lectureDate: string;
  currentStatus: AttendanceStatus;
  reason: string;
  note?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  teacherNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface StudentNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'attendance' | 'failed' | 'correction' | 'warning' | 'device' | 'announcement';
  isRead: boolean;
}

export interface OfflineAttendanceRecord {
  id: string;
  lectureId: string;
  lectureName: string;
  lectureCode: string;
  room: string;
  studentId: string;
  studentName: string;
  timestamp: string;
  status: 'pending_sync' | 'synced' | 'failed';
  factors: {
    deviceBound: boolean;
    sessionCode: string;
    gpsCaptured: boolean;
    bleDetected: boolean;
  };
  syncedAt?: string;
}

export interface AdminStudent {
  id: string;
  studentId: string;
  name: string;
  email: string;
  program: string;
  batch: string;
  deviceStatus: 'verified' | 'pending' | 'revoked';
  accountStatus: 'active' | 'suspended';
  attendancePercentage: number;
}

export interface AdminTeacher {
  id: string;
  teacherId: string;
  name: string;
  email: string;
  department: string;
  assignedClasses: string[];
  accountStatus: 'active' | 'inactive';
}

export interface ClassroomItem {
  id: string;
  name: string;
  building: string;
  roomNumber: string;
  capacity: number;
  lat: number;
  lng: number;
  radiusMeters: number;
  geofenceStatus: 'active' | 'inactive';
  bleBeaconId: string;
  bleStatus: 'active' | 'offline';
  localNetworkSsid?: string;
  localNetworkStatus?: 'configured' | 'not_configured';
  offlineEnabled?: boolean;
}

export interface TimetableSlot {
  id: string;
  day: string;
  time: string;
  subject: string;
  code: string;
  teacher: string;
  className: string;
  classroom: string;
}

export interface InstitutionSettings {
  qrExpirySeconds: number;
  locationToleranceMeters: number;
  sessionDurationMinutes: number;
  offlineModeEnabled: boolean;
  deviceChangePolicy: 'strict_admin_approval' | '2fa_self_service';
  visualAiEnabled: boolean;
  minimumAttendanceThreshold: number;
  // Extended offline settings
  maxOfflineDurationHours?: number;
  offlineSyncMode?: 'automatic' | 'manual';
  locationVerificationOffline?: boolean;
  bleVerificationOffline?: boolean;
  emergencyOfflineMode?: boolean;
  maxPendingSyncPeriodHours?: number;
  offlineSessionApproval?: 'automatic_trusted' | 'teacher_signed' | 'admin_audit';
}

export interface OfflineLectureSession {
  id: string;
  sessionCode: string;
  subjectName: string;
  subjectCode: string;
  className: string;
  room: string;
  teacherName: string;
  scheduledTime: string;
  startTime: string;
  endTime?: string;
  status: 'ready' | 'active' | 'completed';
  networkSsid: string;
  networkPassword?: string;
  connectedCount: number;
  qrRefreshIntervalSeconds: number;
  recordsCount: number;
  syncStatus: 'pending_sync' | 'synced' | 'failed';
  lastSyncedAt?: string;
}

export interface OfflineRosterStudent {
  studentId: string;
  studentName: string;
  rollNo: string;
  avatarUrl: string;
  status: 'verified_present' | 'probable_present' | 'needs_review' | 'not_verified' | 'possible_proxy';
  time: string;
  evidence: {
    studentIdentity: boolean;
    registeredDevice: 'verified' | 'mismatch' | 'unrecognized';
    lectureSession: boolean;
    dynamicQr: 'valid' | 'expired' | 'missing';
    location: 'within_area' | 'uncertain' | 'unavailable';
    ble: 'detected' | 'not_detected' | 'not_configured';
    visualVerification: 'available' | 'unavailable';
  };
  anomalyReason?: string;
  teacherReviewed?: boolean;
  teacherNotes?: string;
}

export interface OfflineSyncSessionItem {
  id: string;
  lectureName: string;
  lectureCode: string;
  time: string;
  room: string;
  recordsCount: number;
  status: 'pending_sync' | 'synced' | 'failed';
  failureReason?: string;
  lastAttemptAt?: string;
}

export interface VisualVerificationFeed {
  lectureCode: string;
  lectureName: string;
  room: string;
  cameraName: string;
  timestamp: string;
  totalDetected: number;
  matchedCount: number;
  unresolvedCount: number;
  studentsList: {
    name: string;
    studentId: string;
    status: 'matched' | 'unresolved' | 'face_obscured';
    confidence: number;
  }[];
}

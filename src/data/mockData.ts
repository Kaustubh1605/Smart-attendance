import {
  StudentProfile,
  Lecture,
  AttendanceRecord,
  StudentAttendanceItem,
  AuditLogEntry,
  SubjectAttendance,
  CorrectionRequest,
  StudentNotification,
  OfflineAttendanceRecord,
  AdminStudent,
  AdminTeacher,
  ClassroomItem,
  TimetableSlot,
  InstitutionSettings,
  VisualVerificationFeed,
  OfflineLectureSession,
  OfflineRosterStudent,
  OfflineSyncSessionItem
} from '../types';

let globalUniqueCounter = 0;
export const generateUniqueId = (prefix = 'id'): string => {
  globalUniqueCounter = (globalUniqueCounter + 1) % 1000000;
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${Date.now()}-${globalUniqueCounter}-${rand}`;
};

export const LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKtMH_06anbxENkEmEPhLI-XsRC4YrOHzL6gZegnfc6Qo3e-iszb15bTsGUASTvJnEPEDgbqSIvQJHzuGOFieX8b8Btc8-Cha8sqxxydHbAP5lByRCBnGbephhcnPZG2tKBiZGCaR6lvE7zQ4AeoUHsUi6LKGQIwul6lk5BGSqk-g5TVW7XGLK-3GqedJ1_EOSCoj4KPxYSvaDzlZ1HPR63U09TcXmDSPNFPhzhNWmo9jQUVnb4glU';

export const AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmfLE3oNg341CIhpLVlo98pJzyJjkHIjdbMsm5IN277QIycP_ZUeWCeopvYsJH7fZuN9IhHjvYx2_lcF-bQFoHPagf0b0_pDLA-WR8O-kc7WT0jzGVMwqb8rOhRYU6O_HDczDfX6Up9rbKnMyrjyWjla4fAe0SqcXjIc4rl-L1SpHN_HeNYKpSJGVzia7hIeuBJcqRy0RL_wg2OK0yNdDSN_laauBiy8-L0q0LDjHeOgMR9eLgb9Sz';

export const CLASSROOM_BG_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBA9JuZLFKv-HQOHg23UHEor_8yMPXEObZZwGQYA4hqj9ZbYcNu-ezI14iVUwHk961wd50sch3L2Fbm9n1NS0uq-5pR65enMHjaqoEnThtKKvh4WCGde8Y36ezFDEZy_1OHaoLf2ExoQ4ux4Ny2QU2ixuU5llucBek7A6t7SjYmYTV70vB2x0BMy17sj_BC_0OPi-RX5PHmBklP1z5_wJ3AKUNOem87SRQO0GRCQtSsEYgILBA-2Q6I';

export const CURRENT_STUDENT: StudentProfile = {
  id: 'stu_kaustubh_01',
  name: 'Kaustubh Nikam',
  email: 'kaustubh.nikam@springfield.edu',
  studentId: 'STU-2023-8842',
  program: 'Bachelor of Computer Applications (BCA)',
  batch: 'Batch 2023-2026 • Sem 3 (Div A)',
  avatarUrl: AVATAR_URL,
  overallAttendancePercentage: 86,
  currentStreak: 14,
  weeklyDelta: 3,
  registeredDevice: {
    deviceName: 'Google Pixel 8 Pro',
    deviceId: 'DEV-F7B29A-ANDROID14',
    model: 'Pixel 8 Pro (Tensor G3)',
    isTrusted: true,
    registeredAt: '2023-08-15',
    lastVerifiedAt: 'Today at 10:02 AM',
    fingerprintHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  }
};

export const TODAY_LECTURES: Lecture[] = [
  {
    id: 'lec-101',
    code: 'BCA 301',
    name: 'Database Systems',
    instructor: 'Prof. Sharma',
    room: 'Room 402',
    timeSlot: '10:00 - 11:30 AM',
    duration: '1h 30m',
    status: 'active',
    geofence: { lat: 19.9975, lng: 73.7898, radiusMeters: 30 },
    bleBeaconId: 'BEACON-HALL-402-UUID-A19',
    activeSessionId: 'sess-bca301-2410'
  },
  {
    id: 'lec-102',
    code: 'BCA 302',
    name: 'Data Structures & Algorithms',
    instructor: 'Prof. Mehta',
    room: 'Room 405',
    timeSlot: '11:45 AM - 1:00 PM',
    duration: '1h 15m',
    status: 'upcoming',
    geofence: { lat: 19.9978, lng: 73.7895, radiusMeters: 30 },
    bleBeaconId: 'BEACON-HALL-405-UUID-B22'
  },
  {
    id: 'lec-103',
    code: 'BCA 304',
    name: 'Operating Systems & Networks',
    instructor: 'Dr. V. Kulkarni',
    room: 'Lab 2',
    timeSlot: '2:00 PM - 4:00 PM',
    duration: '2h',
    status: 'upcoming',
    geofence: { lat: 19.9981, lng: 73.7901, radiusMeters: 25 },
    bleBeaconId: 'BEACON-LAB-2-UUID-C33'
  }
];

export const INITIAL_ATTENDANCE_HISTORY: AttendanceRecord[] = [
  {
    id: 'rec-001',
    date: '2023-10-24',
    day: '24',
    month: 'Oct',
    lectureCode: 'BCA 301',
    subjectName: 'Database Systems',
    lectureType: 'Lecture - Room 402',
    room: 'Room 402',
    status: 'present',
    evidence: {
      timestamp: '10:02 AM',
      locationStatus: 'verified',
      locationDistanceMeters: 6.2,
      deviceStatus: 'trusted',
      dynamicChallengeVerified: true,
      challengeLatencyMs: 420,
      bleDetected: true,
      bleSignalRssi: -64,
      cctvFaceMatch: 'match',
      confidenceScore: 96,
      notes: 'All signals coherent within lecture geofence & challenge window.'
    }
  },
  {
    id: 'rec-002',
    date: '2023-10-22',
    day: '22',
    month: 'Oct',
    lectureCode: 'ENG 101',
    subjectName: 'Design & Professional Ethics',
    lectureType: 'Seminar - Room 204',
    room: 'Room 204',
    status: 'needs_review',
    evidence: {
      timestamp: '14:15 PM',
      locationStatus: 'mismatch',
      locationDistanceMeters: 145.0,
      deviceStatus: 'trusted',
      dynamicChallengeVerified: true,
      challengeLatencyMs: 1240,
      bleDetected: false,
      cctvFaceMatch: 'unavailable',
      confidenceScore: 45,
      notes: 'Location mismatch (WiFi BSSID outside classroom geofence). Dynamic QR scanned with delay.'
    },
    hasCorrectionRequest: true,
    correctionStatus: 'pending',
    correctionReason: 'Campus WiFi router handover caused false GPS radius error while seated in Row 3.'
  },
  {
    id: 'rec-003',
    date: '2023-10-18',
    day: '18',
    month: 'Oct',
    lectureCode: 'MATH 202',
    subjectName: 'Linear Algebra & Statistics',
    lectureType: 'Lecture - Hall 1A',
    room: 'Hall 1A',
    status: 'absent',
    evidence: {
      timestamp: 'Session Concluded',
      locationStatus: 'uncertain',
      locationDistanceMeters: 0,
      deviceStatus: 'trusted',
      dynamicChallengeVerified: false,
      challengeLatencyMs: 0,
      bleDetected: false,
      cctvFaceMatch: 'unavailable',
      confidenceScore: 0,
      notes: 'No challenge token received during session.'
    }
  },
  {
    id: 'rec-004',
    date: '2023-10-15',
    day: '15',
    month: 'Oct',
    lectureCode: 'BCA 302',
    subjectName: 'Data Structures & Algorithms',
    lectureType: 'Lab - Room 405',
    room: 'Room 405',
    status: 'probable',
    evidence: {
      timestamp: '11:58 AM (Late entry)',
      locationStatus: 'verified',
      locationDistanceMeters: 12.8,
      deviceStatus: 'trusted',
      dynamicChallengeVerified: true,
      challengeLatencyMs: 890,
      bleDetected: true,
      bleSignalRssi: -78,
      cctvFaceMatch: 'uncertain',
      confidenceScore: 78,
      notes: 'Submitted within late grace period. GPS & Bound Device verified.'
    }
  },
  {
    id: 'rec-005',
    date: '2023-10-12',
    day: '12',
    month: 'Oct',
    lectureCode: 'BCA 304',
    subjectName: 'Operating Systems & Networks',
    lectureType: 'Lab - Lab 2',
    room: 'Lab 2',
    status: 'present',
    evidence: {
      timestamp: '14:03 PM',
      locationStatus: 'verified',
      locationDistanceMeters: 4.1,
      deviceStatus: 'trusted',
      dynamicChallengeVerified: true,
      challengeLatencyMs: 310,
      bleDetected: true,
      bleSignalRssi: -58,
      cctvFaceMatch: 'match',
      confidenceScore: 98,
      notes: 'All signals verified in room 2.'
    }
  }
];

export const MOCK_STUDENT_SUBJECTS: SubjectAttendance[] = [
  {
    id: 'subj-1',
    code: 'BCA 301',
    name: 'Database Systems',
    instructor: 'Prof. Sharma',
    totalLectures: 24,
    present: 22,
    absent: 1,
    needsReview: 1,
    percentage: 91.6,
    room: 'Room 402',
    schedule: 'Mon, Wed, Fri • 10:00 AM',
    isBelowThreshold: false
  },
  {
    id: 'subj-2',
    code: 'BCA 302',
    name: 'Data Structures & Algorithms',
    instructor: 'Prof. Mehta',
    totalLectures: 22,
    present: 20,
    absent: 1,
    needsReview: 1,
    percentage: 90.9,
    room: 'Room 405',
    schedule: 'Tue, Thu • 11:45 AM',
    isBelowThreshold: false
  },
  {
    id: 'subj-3',
    code: 'BCA 304',
    name: 'Operating Systems & Networks',
    instructor: 'Dr. V. Kulkarni',
    totalLectures: 20,
    present: 17,
    absent: 2,
    needsReview: 1,
    percentage: 85.0,
    room: 'Lab 2',
    schedule: 'Mon, Wed • 2:00 PM',
    isBelowThreshold: false
  },
  {
    id: 'subj-4',
    code: 'MATH 202',
    name: 'Linear Algebra & Statistics',
    instructor: 'Dr. R. Deshmukh',
    totalLectures: 18,
    present: 14,
    absent: 3,
    needsReview: 1,
    percentage: 77.7,
    room: 'Hall 1A',
    schedule: 'Tue, Fri • 9:00 AM',
    isBelowThreshold: false
  },
  {
    id: 'subj-5',
    code: 'ENG 101',
    name: 'Design & Professional Ethics',
    instructor: 'Prof. S. Sen',
    totalLectures: 16,
    present: 11,
    absent: 3,
    needsReview: 2,
    percentage: 68.7, // Below threshold 75%
    room: 'Room 204',
    schedule: 'Thu • 2:00 PM',
    isBelowThreshold: true
  }
];

export const MOCK_CORRECTION_REQUESTS: CorrectionRequest[] = [
  {
    id: 'cr-001',
    studentId: 'STU-2023-8842',
    studentName: 'Kaustubh Nikam',
    rollNo: 'BCA-01',
    avatarUrl: AVATAR_URL,
    lectureId: 'lec-104',
    lectureCode: 'ENG 101',
    subjectName: 'Design & Professional Ethics',
    lectureDate: '2023-10-22',
    currentStatus: 'needs_review',
    reason: 'WiFi handover placed IP off-perimeter while physically in Room 204.',
    note: 'I was present in row 3 next to classmate Rohan Gupta.',
    submittedAt: '2023-10-22 15:30 UTC',
    status: 'pending'
  },
  {
    id: 'cr-002',
    studentId: 'STU-2023-8844',
    studentName: 'Rohan Gupta',
    rollNo: 'BCA-03',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    lectureId: 'lec-101',
    lectureCode: 'BCA 301',
    subjectName: 'Database Systems',
    lectureDate: '2023-10-18',
    currentStatus: 'needs_review',
    reason: 'Device battery died during mid-session BLE ping verification.',
    submittedAt: '2023-10-18 16:10 UTC',
    status: 'approved',
    teacherNote: 'Verified with physical lab seating sheet.',
    reviewedBy: 'Prof. Sharma',
    reviewedAt: '2023-10-19 09:15 UTC'
  },
  {
    id: 'cr-003',
    studentId: 'STU-2023-8846',
    studentName: 'Vikramaditya Rao',
    rollNo: 'BCA-05',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    lectureId: 'lec-103',
    lectureCode: 'BCA 304',
    subjectName: 'Operating Systems & Networks',
    lectureDate: '2023-10-15',
    currentStatus: 'absent',
    reason: 'Could not connect to projector QR before lecture concluded.',
    submittedAt: '2023-10-15 18:00 UTC',
    status: 'rejected',
    teacherNote: 'Student did not arrive until final 5 minutes of class.',
    reviewedBy: 'Dr. V. Kulkarni',
    reviewedAt: '2023-10-16 11:00 UTC'
  }
];

export const MOCK_NOTIFICATIONS: StudentNotification[] = [
  {
    id: 'notif-1',
    title: 'Attendance Verified Present',
    message: 'BCA 301 Database Systems (Room 402) has been confirmed and logged.',
    timestamp: '10 mins ago',
    type: 'attendance',
    isRead: false
  },
  {
    id: 'notif-2',
    title: 'Low Attendance Alert (<75%)',
    message: 'Your attendance in ENG 101 has dropped to 68.7%. Minimum 75% required by college policy.',
    timestamp: '2 hours ago',
    type: 'warning',
    isRead: false
  },
  {
    id: 'notif-3',
    title: 'Dispute Update',
    message: 'Your correction request for ENG 101 (Oct 22) is currently under review by Prof. S. Sen.',
    timestamp: 'Yesterday',
    type: 'correction',
    isRead: true
  },
  {
    id: 'notif-4',
    title: 'Device Binding Confirmed',
    message: 'Pixel 8 Pro is verified as your trusted attendance device with hardware key attestation.',
    timestamp: '3 days ago',
    type: 'device',
    isRead: true
  },
  {
    id: 'notif-5',
    title: 'Campus Network Maintenance',
    message: 'Offline classroom attendance fallback mode will be active tomorrow morning for server upgrades.',
    timestamp: '4 days ago',
    type: 'announcement',
    isRead: true
  }
];

export const INITIAL_OFFLINE_RECORDS: OfflineAttendanceRecord[] = [
  {
    id: 'off-001',
    lectureId: 'lec-101',
    lectureName: 'Database Systems',
    lectureCode: 'BCA 301',
    room: 'Room 402',
    studentId: 'STU-2023-8842',
    studentName: 'Kaustubh Nikam',
    timestamp: '2023-10-24 10:05 AM',
    status: 'synced',
    factors: {
      deviceBound: true,
      sessionCode: 'OFFLINE-402-BCA301',
      gpsCaptured: true,
      bleDetected: true
    },
    syncedAt: '2023-10-24 10:45 AM'
  },
  {
    id: 'off-002',
    lectureId: 'lec-099',
    lectureName: 'Computer Architecture',
    lectureCode: 'BCA 204',
    room: 'Room 301',
    studentId: 'STU-2023-8842',
    studentName: 'Kaustubh Nikam',
    timestamp: '2023-10-20 14:10 PM',
    status: 'synced',
    factors: {
      deviceBound: true,
      sessionCode: 'OFFLINE-301-BCA204',
      gpsCaptured: true,
      bleDetected: false
    },
    syncedAt: '2023-10-20 15:00 PM'
  }
];

export const MOCK_CLASS_STUDENTS: StudentAttendanceItem[] = [
  {
    studentId: 'STU-2023-8842',
    studentName: 'Kaustubh Nikam',
    rollNo: 'BCA-01',
    avatarUrl: AVATAR_URL,
    time: '10:02 AM',
    status: 'present',
    confidence: 96,
    locationMatch: true,
    deviceTrusted: true,
    challengeOk: true,
    bleDetected: true,
    visualEvidence: 'available'
  },
  {
    studentId: 'STU-2023-8843',
    studentName: 'Priya Patel',
    rollNo: 'BCA-02',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    time: '10:03 AM',
    status: 'present',
    confidence: 98,
    locationMatch: true,
    deviceTrusted: true,
    challengeOk: true,
    bleDetected: true,
    visualEvidence: 'available'
  },
  {
    studentId: 'STU-2023-8844',
    studentName: 'Rohan Gupta',
    rollNo: 'BCA-03',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    time: '10:07 AM',
    status: 'needs_review',
    confidence: 42,
    locationMatch: false,
    deviceTrusted: true,
    challengeOk: true,
    anomalyFlag: 'Location Geofence Mismatch (Distance: 310m)',
    bleDetected: false,
    visualEvidence: 'unavailable'
  },
  {
    studentId: 'STU-2023-8845',
    studentName: 'Ananya Verma',
    rollNo: 'BCA-04',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    time: '10:14 AM',
    status: 'probable',
    confidence: 78,
    locationMatch: true,
    deviceTrusted: true,
    challengeOk: true,
    anomalyFlag: 'Late submission window (+14m)',
    bleDetected: true,
    visualEvidence: 'available'
  },
  {
    studentId: 'STU-2023-8846',
    studentName: 'Vikramaditya Rao',
    rollNo: 'BCA-05',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    time: '—',
    status: 'absent',
    confidence: 0,
    locationMatch: false,
    deviceTrusted: false,
    challengeOk: false,
    bleDetected: false,
    visualEvidence: 'unavailable'
  },
  {
    studentId: 'STU-2023-8847',
    studentName: 'Neha Joshi',
    rollNo: 'BCA-06',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    time: '10:04 AM',
    status: 'present',
    confidence: 96,
    locationMatch: true,
    deviceTrusted: true,
    challengeOk: true,
    bleDetected: true,
    visualEvidence: 'available'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-9901',
    timestamp: '2023-10-24 10:02:14 UTC',
    actor: 'system.verification-engine',
    role: 'SYSTEM',
    action: 'ATTENDANCE_VERIFIED',
    entity: 'AttendanceRecord',
    entityId: 'rec-001',
    previousState: 'PENDING',
    newState: 'PRESENT (96% Conf)',
    reason: 'Multi-factor signals reconciled: GPS=OK, BLE=OK, Device=OK, Challenge=OK',
    ipAddress: '10.0.4.18'
  },
  {
    id: 'aud-9902',
    timestamp: '2023-10-24 09:58:02 UTC',
    actor: 'prof.sharma@springfield.edu',
    role: 'TEACHER',
    action: 'SESSION_STARTED',
    entity: 'AttendanceSession',
    entityId: 'sess-bca301-2410',
    newState: 'ACTIVE (Dynamic Challenge rotating 10s)',
    reason: 'Initiated scheduled lecture session for BCA 301',
    ipAddress: '172.16.20.104'
  },
  {
    id: 'aud-9903',
    timestamp: '2023-10-22 14:30:11 UTC',
    actor: 'prof.sen@springfield.edu',
    role: 'TEACHER',
    action: 'EXCEPTION_FLAGGED',
    entity: 'AttendanceRecord',
    entityId: 'rec-002',
    previousState: 'PENDING',
    newState: 'NEEDS_REVIEW',
    reason: 'Automated anomaly detected: Device IP off-campus geofence boundary.',
    ipAddress: '172.16.20.108'
  },
  {
    id: 'aud-9904',
    timestamp: '2023-10-20 11:15:40 UTC',
    actor: 'admin.super@springfield.edu',
    role: 'ADMIN',
    action: 'DEVICE_REGISTERED',
    entity: 'StudentDevice',
    entityId: 'DEV-F7B29A-ANDROID14',
    newState: 'TRUSTED_BOUND',
    reason: 'Student self-provisioned device verified via Springfield Student SSO',
    ipAddress: '10.0.12.88'
  }
];

export const MOCK_ADMIN_STUDENTS: AdminStudent[] = [
  {
    id: 'ast-1',
    studentId: 'STU-2023-8842',
    name: 'Kaustubh Nikam',
    email: 'kaustubh.nikam@springfield.edu',
    program: 'BCA (3rd Sem)',
    batch: '2023-2026',
    deviceStatus: 'verified',
    accountStatus: 'active',
    attendancePercentage: 86
  },
  {
    id: 'ast-2',
    studentId: 'STU-2023-8843',
    name: 'Priya Patel',
    email: 'priya.patel@springfield.edu',
    program: 'BCA (3rd Sem)',
    batch: '2023-2026',
    deviceStatus: 'verified',
    accountStatus: 'active',
    attendancePercentage: 94
  },
  {
    id: 'ast-3',
    studentId: 'STU-2023-8844',
    name: 'Rohan Gupta',
    email: 'rohan.gupta@springfield.edu',
    program: 'BCA (3rd Sem)',
    batch: '2023-2026',
    deviceStatus: 'verified',
    accountStatus: 'active',
    attendancePercentage: 79
  },
  {
    id: 'ast-4',
    studentId: 'STU-2023-8845',
    name: 'Ananya Verma',
    email: 'ananya.verma@springfield.edu',
    program: 'BCA (3rd Sem)',
    batch: '2023-2026',
    deviceStatus: 'verified',
    accountStatus: 'active',
    attendancePercentage: 88
  },
  {
    id: 'ast-5',
    studentId: 'STU-2023-8846',
    name: 'Vikramaditya Rao',
    email: 'vikram.rao@springfield.edu',
    program: 'BCA (3rd Sem)',
    batch: '2023-2026',
    deviceStatus: 'pending',
    accountStatus: 'active',
    attendancePercentage: 62
  }
];

export const MOCK_ADMIN_TEACHERS: AdminTeacher[] = [
  {
    id: 'tch-1',
    teacherId: 'TCH-1082',
    name: 'Prof. Sharma',
    email: 'prof.sharma@springfield.edu',
    department: 'Computer Applications',
    assignedClasses: ['BCA Sem 3', 'MCA Sem 1'],
    accountStatus: 'active'
  },
  {
    id: 'tch-2',
    teacherId: 'TCH-1094',
    name: 'Prof. Mehta',
    email: 'prof.mehta@springfield.edu',
    department: 'Computer Applications',
    assignedClasses: ['BCA Sem 3', 'BCA Sem 5'],
    accountStatus: 'active'
  },
  {
    id: 'tch-3',
    teacherId: 'TCH-1055',
    name: 'Dr. V. Kulkarni',
    email: 'v.kulkarni@springfield.edu',
    department: 'Computer Science & IT',
    assignedClasses: ['BCA Sem 3', 'B.Tech IT'],
    accountStatus: 'active'
  },
  {
    id: 'tch-4',
    teacherId: 'TCH-1033',
    name: 'Prof. S. Sen',
    email: 's.sen@springfield.edu',
    department: 'Humanities & Management',
    assignedClasses: ['BCA Sem 3', 'BBA Sem 2'],
    accountStatus: 'active'
  }
];

export const MOCK_CLASSROOMS: ClassroomItem[] = [
  {
    id: 'crm-1',
    name: 'Room 204 (Smart Lecture Theatre)',
    building: 'Aryabhata Science Block',
    roomNumber: '204',
    capacity: 65,
    lat: 19.9975,
    lng: 73.7898,
    radiusMeters: 30,
    geofenceStatus: 'active',
    bleBeaconId: 'BEACON-HALL-204-UUID-A19',
    bleStatus: 'active',
    localNetworkSsid: 'SmartAttend-Room204',
    localNetworkStatus: 'configured',
    offlineEnabled: true,
  },
  {
    id: 'crm-2',
    name: 'Room 402 (Database Lab & Hall)',
    building: 'Aryabhata Science Block',
    roomNumber: '402',
    capacity: 65,
    lat: 19.9975,
    lng: 73.7898,
    radiusMeters: 30,
    geofenceStatus: 'active',
    bleBeaconId: 'BEACON-HALL-402-UUID-A19',
    bleStatus: 'active',
    localNetworkSsid: 'SmartAttend-Room402',
    localNetworkStatus: 'configured',
    offlineEnabled: true,
  },
  {
    id: 'crm-3',
    name: 'Room 405 (Algorithms Studio)',
    building: 'Aryabhata Science Block',
    roomNumber: '405',
    capacity: 60,
    lat: 19.9978,
    lng: 73.7895,
    radiusMeters: 30,
    geofenceStatus: 'active',
    bleBeaconId: 'BEACON-HALL-405-UUID-B22',
    bleStatus: 'active',
    localNetworkSsid: 'SmartAttend-Room405',
    localNetworkStatus: 'configured',
    offlineEnabled: true,
  },
  {
    id: 'crm-4',
    name: 'Lab 2 (Systems & Networking)',
    building: 'Chanakya Tech Center',
    roomNumber: 'Lab 2',
    capacity: 45,
    lat: 19.9981,
    lng: 73.7901,
    radiusMeters: 25,
    geofenceStatus: 'active',
    bleBeaconId: 'BEACON-LAB-2-UUID-C33',
    bleStatus: 'active',
    localNetworkSsid: 'SmartAttend-Lab2',
    localNetworkStatus: 'configured',
    offlineEnabled: true,
  },
  {
    id: 'crm-5',
    name: 'Hall 1A (Main Auditorium)',
    building: 'Central Admin Complex',
    roomNumber: 'Hall 1A',
    capacity: 180,
    lat: 19.9968,
    lng: 73.7889,
    radiusMeters: 45,
    geofenceStatus: 'active',
    bleBeaconId: 'BEACON-AUD-1A-UUID-D44',
    bleStatus: 'active',
    localNetworkSsid: 'SmartAttend-Hall1A',
    localNetworkStatus: 'configured',
    offlineEnabled: true,
  }
];

export const MOCK_OFFLINE_LECTURES = [
  {
    id: 'off-lec-1',
    sessionCode: 'OFF-JAVA-204',
    subjectName: 'Java Programming',
    subjectCode: 'BCA-301',
    className: 'BCA-A',
    room: 'Room 204',
    teacherName: 'Prof. Sharma',
    scheduledTime: '10:00 AM – 11:00 AM',
    startTime: '10:02 AM',
    status: 'ready' as const,
    networkSsid: 'SmartAttend-Room204',
    networkPassword: 'springfield204',
    connectedCount: 43,
    qrRefreshIntervalSeconds: 15,
    recordsCount: 43,
    syncStatus: 'pending_sync' as const,
  },
  {
    id: 'off-lec-2',
    sessionCode: 'OFF-DBMS-204',
    subjectName: 'Database Management Systems',
    subjectCode: 'BCA-302',
    className: 'BCA-A',
    room: 'Room 204',
    teacherName: 'Prof. Sharma',
    scheduledTime: '11:00 AM – 12:00 PM',
    startTime: '11:00 AM',
    status: 'ready' as const,
    networkSsid: 'SmartAttend-Room204',
    networkPassword: 'springfield204',
    connectedCount: 41,
    qrRefreshIntervalSeconds: 15,
    recordsCount: 41,
    syncStatus: 'synced' as const,
  }
];

export const MOCK_OFFLINE_ROSTER: OfflineRosterStudent[] = [
  {
    studentId: 'STU-2023-8842',
    studentName: 'Kaustubh Nikam',
    rollNo: 'BCA102',
    avatarUrl: AVATAR_URL,
    status: 'verified_present',
    time: '10:05:24 AM',
    evidence: {
      studentIdentity: true,
      registeredDevice: 'verified',
      lectureSession: true,
      dynamicQr: 'valid',
      location: 'within_area',
      ble: 'detected',
      visualVerification: 'unavailable',
    },
  },
  {
    studentId: 'STU-2023-8843',
    studentName: 'Priya Patel',
    rollNo: 'BCA103',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    status: 'verified_present',
    time: '10:05:48 AM',
    evidence: {
      studentIdentity: true,
      registeredDevice: 'verified',
      lectureSession: true,
      dynamicQr: 'valid',
      location: 'within_area',
      ble: 'detected',
      visualVerification: 'unavailable',
    },
  },
  {
    studentId: 'STU-2023-8844',
    studentName: 'Rohan Gupta',
    rollNo: 'BCA109',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    status: 'needs_review',
    time: '10:07:12 AM',
    anomalyReason: 'Location uncertain — GPS jitter exceeds 35m indoor limit (supporting signal only)',
    evidence: {
      studentIdentity: true,
      registeredDevice: 'verified',
      lectureSession: true,
      dynamicQr: 'valid',
      location: 'uncertain',
      ble: 'detected',
      visualVerification: 'unavailable',
    },
  },
  {
    studentId: 'STU-2023-8845',
    studentName: 'Ananya Verma',
    rollNo: 'BCA105',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    status: 'probable_present',
    time: '10:08:30 AM',
    anomalyReason: 'Slight dynamic nonce latency (+12s). Device and BLE proximity verified.',
    evidence: {
      studentIdentity: true,
      registeredDevice: 'verified',
      lectureSession: true,
      dynamicQr: 'valid',
      location: 'within_area',
      ble: 'detected',
      visualVerification: 'unavailable',
    },
  },
  {
    studentId: 'STU-2023-8846',
    studentName: 'Vikramaditya Rao',
    rollNo: 'BCA115',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    status: 'possible_proxy',
    time: '10:09:15 AM',
    anomalyReason: 'Registered device mismatch — keystore hash does not match enrolled hardware ID.',
    evidence: {
      studentIdentity: true,
      registeredDevice: 'mismatch',
      lectureSession: true,
      dynamicQr: 'valid',
      location: 'within_area',
      ble: 'detected',
      visualVerification: 'unavailable',
    },
  },
  {
    studentId: 'STU-2023-8847',
    studentName: 'Neha Joshi',
    rollNo: 'BCA106',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    status: 'verified_present',
    time: '10:06:10 AM',
    evidence: {
      studentIdentity: true,
      registeredDevice: 'verified',
      lectureSession: true,
      dynamicQr: 'valid',
      location: 'within_area',
      ble: 'detected',
      visualVerification: 'unavailable',
    },
  },
  {
    studentId: 'STU-2023-8848',
    studentName: 'Aditya Mehta',
    rollNo: 'BCA112',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    status: 'needs_review',
    time: '10:11:05 AM',
    anomalyReason: 'BLE beacon signal weak (-92 dBm) with GPS reading off-boundary.',
    evidence: {
      studentIdentity: true,
      registeredDevice: 'verified',
      lectureSession: true,
      dynamicQr: 'valid',
      location: 'uncertain',
      ble: 'not_detected',
      visualVerification: 'unavailable',
    },
  },
  {
    studentId: 'STU-2023-8849',
    studentName: 'Sneha Kulkarni',
    rollNo: 'BCA118',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
    status: 'not_verified',
    time: '—',
    anomalyReason: 'No check-in broadcast received across classroom local network.',
    evidence: {
      studentIdentity: false,
      registeredDevice: 'unrecognized',
      lectureSession: false,
      dynamicQr: 'missing',
      location: 'unavailable',
      ble: 'not_detected',
      visualVerification: 'unavailable',
    },
  }
];

export const MOCK_OFFLINE_SYNC_SESSIONS: OfflineSyncSessionItem[] = [
  {
    id: 'sync-sess-1',
    lectureName: 'Java Programming',
    lectureCode: 'BCA-301',
    time: '10:00 AM – 11:00 AM',
    room: 'Room 204',
    recordsCount: 43,
    status: 'pending_sync',
  },
  {
    id: 'sync-sess-2',
    lectureName: 'Database Management Systems',
    lectureCode: 'BCA-302',
    time: '11:00 AM – 12:00 PM',
    room: 'Room 204',
    recordsCount: 41,
    status: 'synced',
    lastAttemptAt: 'Today, 12:05 PM',
  },
  {
    id: 'sync-sess-3',
    lectureName: 'Python Programming Lab',
    lectureCode: 'BCA-305',
    time: '12:00 PM – 1:30 PM',
    room: 'Lab 2',
    recordsCount: 39,
    status: 'failed',
    failureReason: 'Server unavailable / SSL Gateway timeout (All 39 records safely retained locally)',
    lastAttemptAt: 'Today, 1:45 PM',
  }
];

export const MOCK_TIMETABLE: TimetableSlot[] = [
  {
    id: 'tt-1',
    day: 'Monday',
    time: '10:00 AM - 11:30 AM',
    subject: 'Database Systems',
    code: 'BCA 301',
    teacher: 'Prof. Sharma',
    className: 'BCA Sem 3 (Div A)',
    classroom: 'Room 402'
  },
  {
    id: 'tt-2',
    day: 'Monday',
    time: '2:00 PM - 4:00 PM',
    subject: 'Operating Systems & Networks',
    code: 'BCA 304',
    teacher: 'Dr. V. Kulkarni',
    className: 'BCA Sem 3 (Div A)',
    classroom: 'Lab 2'
  },
  {
    id: 'tt-3',
    day: 'Tuesday',
    time: '11:45 AM - 1:00 PM',
    subject: 'Data Structures & Algorithms',
    code: 'BCA 302',
    teacher: 'Prof. Mehta',
    className: 'BCA Sem 3 (Div A)',
    classroom: 'Room 405'
  },
  {
    id: 'tt-4',
    day: 'Wednesday',
    time: '10:00 AM - 11:30 AM',
    subject: 'Database Systems',
    code: 'BCA 301',
    teacher: 'Prof. Sharma',
    className: 'BCA Sem 3 (Div A)',
    classroom: 'Room 402'
  },
  {
    id: 'tt-5',
    day: 'Thursday',
    time: '2:00 PM - 3:30 PM',
    subject: 'Design & Professional Ethics',
    code: 'ENG 101',
    teacher: 'Prof. S. Sen',
    className: 'BCA Sem 3 (Div A)',
    classroom: 'Room 204'
  }
];

export const DEFAULT_INSTITUTION_SETTINGS: InstitutionSettings = {
  qrExpirySeconds: 15,
  locationToleranceMeters: 30,
  sessionDurationMinutes: 45,
  offlineModeEnabled: true,
  deviceChangePolicy: 'strict_admin_approval',
  visualAiEnabled: true,
  minimumAttendanceThreshold: 75,
  maxOfflineDurationHours: 2,
  offlineSyncMode: 'automatic',
  locationVerificationOffline: true,
  bleVerificationOffline: true,
  emergencyOfflineMode: true,
  maxPendingSyncPeriodHours: 24,
  offlineSessionApproval: 'teacher_signed',
};

export const MOCK_SUBJECTS = MOCK_STUDENT_SUBJECTS;
export const MOCK_INSTITUTION_SETTINGS = DEFAULT_INSTITUTION_SETTINGS;
export const MOCK_STUDENT_NOTIFICATIONS = MOCK_NOTIFICATIONS;
export const MOCK_OFFLINE_ATTENDANCE_RECORDS = INITIAL_OFFLINE_RECORDS;

export const MOCK_VISUAL_FEED: VisualVerificationFeed = {
  lectureCode: 'BCA 301',
  lectureName: 'Database Systems',
  room: 'Room 402',
  cameraName: 'Cam-02-Ceiling-Wide (Hikvision 4K)',
  timestamp: 'Live Stream • 10:04:12 AM',
  totalDetected: 38,
  matchedCount: 36,
  unresolvedCount: 2,
  studentsList: [
    { name: 'Kaustubh Nikam', studentId: 'STU-2023-8842', status: 'matched', confidence: 94 },
    { name: 'Priya Patel', studentId: 'STU-2023-8843', status: 'matched', confidence: 98 },
    { name: 'Neha Joshi', studentId: 'STU-2023-8847', status: 'matched', confidence: 96 },
    { name: 'Ananya Verma', studentId: 'STU-2023-8845', status: 'matched', confidence: 88 },
    { name: 'Rohan Gupta', studentId: 'STU-2023-8844', status: 'face_obscured', confidence: 32 }
  ]
};

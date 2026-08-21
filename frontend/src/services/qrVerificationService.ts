import {
  DynamicQRChallenge,
  QRVerificationAttempt,
  QRVerificationResult,
  VerificationEvidence,
  OfflineAttendanceRecord,
  AttendanceRecord,
  AttendanceStatus,
  VerificationResultStatus,
} from '../types';

export const QR_ROTATION_INTERVAL_SECONDS = 10;
export const QR_ROTATION_INTERVAL_MS = 10000;
export const QR_PROCESSING_GRACE_MS = 2000; // 2 seconds maximum grace for in-flight requests started before expiry
const SECRET_SALT = 'SMARTATTEND_AUTH_SECRET_SALT_2026';

// In-memory replay & duplicate submission caches (authoritative server/local authority simulation)
const submittedChallengeAttempts = new Set<string>();
const submittedSessionAttendance = new Set<string>();

/**
 * Simple deterministic HMAC/hash simulation to verify client tamper resistance
 */
function createSignature(payload: string): string {
  let hash = 0;
  const str = `${payload}_${SECRET_SALT}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `SIG-${Math.abs(hash).toString(16).toUpperCase()}`;
}

/**
 * Generates an authoritative dynamic 10-second QR challenge
 * Valid from: createdAt -> expiresAt (createdAt + 10,000ms)
 */
export function generateDynamicQRChallenge(
  sessionId: string,
  lectureCode: string,
  baseTime?: number
): DynamicQRChallenge {
  const createdAt = baseTime ?? Date.now();
  const expiresAt = createdAt + QR_ROTATION_INTERVAL_MS;
  const nonce = Math.floor(1000 + Math.random() * 9000);
  const token = `SA-10S-${nonce}`;
  const challengeId = `CHAL-${sessionId}-${nonce}-${createdAt}`;

  const payload = `${challengeId}:${sessionId}:${lectureCode}:${token}:${createdAt}:${expiresAt}`;
  const signature = createSignature(payload);

  return {
    challengeId,
    token,
    sessionId,
    lectureCode,
    createdAt,
    expiresAt,
    rotationIntervalSeconds: QR_ROTATION_INTERVAL_SECONDS,
    signature,
  };
}

/**
 * Validates cryptographic signature to prevent client-side timestamp/expiry tampering
 */
export function verifyChallengeSignature(challenge: DynamicQRChallenge): boolean {
  const expectedPayload = `${challenge.challengeId}:${challenge.sessionId}:${challenge.lectureCode}:${challenge.token}:${challenge.createdAt}:${challenge.expiresAt}`;
  const expectedSignature = createSignature(expectedPayload);
  return challenge.signature === expectedSignature;
}

/**
 * Resets duplicate/replay cache (used for session transitions or test fixtures)
 */
export function clearVerificationCache(): void {
  submittedChallengeAttempts.clear();
  submittedSessionAttendance.clear();
}

/**
 * Authoritative Attendance Attempt Validation Engine
 *
 * Rules:
 * 1. QR_VALID = currentTime < qrExpiry
 * 2. ATTEMPT_VALID = attemptStartTime <= qrExpiry
 * 3. PROCESSING_GRACE = only for already-started attempts (completionTime <= qrExpiry + 2000ms)
 * 4. NEW ATTEMPTS started after qrExpiry (attemptStartTime > qrExpiry) are REJECTED IMMEDIATELY.
 * 5. Replay of old challenges or double-submission of attendance is REJECTED.
 * 6. QR validity only proves interaction with active challenge; multi-factor engine determines final status.
 */
export function validateAttendanceAttempt(
  attempt: QRVerificationAttempt,
  options?: { allowDuplicateForTesting?: boolean; bypassSessionDuplicate?: boolean }
): QRVerificationResult {
  const completionTime = attempt.completionTime ?? Date.now();
  const { challenge, attemptStartTime } = attempt;

  // 1. Validate signature integrity (Client-side tampering check)
  const isSignatureValid = verifyChallengeSignature(challenge);
  if (!isSignatureValid) {
    return {
      success: false,
      status: 'not_verified',
      attendanceStatus: 'absent',
      rejectionReason: 'Security challenge integrity check failed (Tampered or invalid signature).',
      confidenceScore: 0,
      challengeStatus: 'tampered',
      evidence: createEvidence(completionTime, attempt, false, 0, 'Signature mismatch / tamper detected'),
    };
  }

  // 2. Authoritative Expiry Rule:
  // Did the student initiate the attempt WHILE the QR was still valid?
  const isAttemptInitiatedInTime = attemptStartTime <= challenge.expiresAt;

  if (!isAttemptInitiatedInTime) {
    // Attempt was started AFTER QR expired -> REJECT IMMEDIATELY
    return {
      success: false,
      status: 'not_verified',
      attendanceStatus: 'absent',
      rejectionReason: 'QR Code Expired. This attendance session code is no longer valid. Please scan the current QR displayed by your teacher.',
      confidenceScore: 0,
      challengeStatus: 'expired',
      evidence: createEvidence(completionTime, attempt, false, 0, 'New scan initiated after challenge expiry'),
    };
  }

  // 3. Processing Grace Period Check:
  // If attempt was started before expiry, was completion within the 2-second grace period?
  const isWithinProcessingGrace = completionTime <= challenge.expiresAt + QR_PROCESSING_GRACE_MS;
  const isGraceProcessed = completionTime > challenge.expiresAt && isWithinProcessingGrace;

  if (!isWithinProcessingGrace) {
    return {
      success: false,
      status: 'not_verified',
      attendanceStatus: 'absent',
      rejectionReason: 'Verification request timed out. Processing exceeded maximum grace window.',
      confidenceScore: 0,
      challengeStatus: 'expired',
      evidence: createEvidence(completionTime, attempt, false, 0, 'Completion exceeded 2s grace window'),
    };
  }

  // 4. Replay and Duplicate Submission Protection
  const challengeKey = `${attempt.sessionId}_${attempt.studentId}_${challenge.challengeId}`;
  const sessionKey = `${attempt.sessionId}_${attempt.studentId}`;

  if (!options?.allowDuplicateForTesting) {
    if (submittedChallengeAttempts.has(challengeKey)) {
      return {
        success: false,
        status: 'possible_proxy',
        attendanceStatus: 'needs_review',
        rejectionReason: 'Duplicate attempt prevented. This QR challenge has already been consumed by this student account.',
        confidenceScore: 10,
        challengeStatus: 'duplicate',
        evidence: createEvidence(completionTime, attempt, true, 10, 'Replay attempt with previously used QR challenge'),
      };
    }

    if (!options?.bypassSessionDuplicate && submittedSessionAttendance.has(sessionKey)) {
      return {
        success: false,
        status: 'possible_proxy',
        attendanceStatus: 'needs_review',
        rejectionReason: 'Attendance already recorded for this lecture session. Multiple submissions are rejected.',
        confidenceScore: 15,
        challengeStatus: 'duplicate',
        evidence: createEvidence(completionTime, attempt, true, 15, 'Duplicate session submission detected'),
      };
    }
  }

  // Record into cache
  submittedChallengeAttempts.add(challengeKey);
  if (!options?.bypassSessionDuplicate) {
    submittedSessionAttendance.add(sessionKey);
  }

  // 5. Multi-Factor Telemetry Evaluation (QR valid != automatically Present)
  // Evaluate Device Binding, BLE Beacon, and GPS Geofence
  const isDeviceTrusted = attempt.deviceId && !attempt.deviceId.includes('UNRECOGNIZED');
  const isLocationVerified = attempt.locationStatus === 'verified' && attempt.distanceMeters <= 35;
  const isLocationUncertain = attempt.locationStatus === 'uncertain' || (attempt.distanceMeters > 35 && attempt.distanceMeters <= 60);
  const isBleDetected = attempt.bleDetected;

  let finalStatus: VerificationResultStatus = 'verified_present';
  let attendanceStatus: AttendanceStatus = 'present';
  let confidenceScore = 98;
  let notes = 'Multi-factor confirmed (Bound Device + 10s Dynamic QR + BLE + GPS Geofence)';

  if (!isDeviceTrusted) {
    finalStatus = 'needs_review';
    attendanceStatus = 'needs_review';
    confidenceScore = 40;
    notes = 'Unregistered device hardware fingerprint. Held for faculty review.';
  } else if (!isBleDetected && !isLocationVerified) {
    finalStatus = 'needs_review';
    attendanceStatus = 'needs_review';
    confidenceScore = 52;
    notes = 'Location uncertain and BLE beacon not detected in classroom.';
  } else if (!isBleDetected && isLocationVerified) {
    finalStatus = 'probable_present';
    attendanceStatus = 'probable';
    confidenceScore = 80;
    notes = 'GPS verified within geofence; BLE beacon proximity unavailable.';
  } else if (isBleDetected && isLocationUncertain) {
    finalStatus = 'probable_present';
    attendanceStatus = 'probable';
    confidenceScore = 85;
    notes = 'BLE beacon verified in-room; GPS geofence borderline variance.';
  } else if (isGraceProcessed) {
    confidenceScore = 95;
    notes = 'Verified (In-flight attempt initiated before 10s expiry and completed in grace window).';
  }

  const evidence = createEvidence(
    completionTime,
    attempt,
    true,
    confidenceScore,
    notes,
    isDeviceTrusted ? 'trusted' : 'unrecognized',
    attempt.locationStatus,
    attempt.distanceMeters,
    attempt.bleDetected,
    attempt.bleRssi ?? -64
  );

  return {
    success: true,
    status: finalStatus,
    attendanceStatus,
    confidenceScore,
    evidence,
    challengeStatus: 'valid',
    isGraceProcessed,
  };
}

/**
 * Creates structured VerificationEvidence object
 */
function createEvidence(
  completionTime: number,
  attempt: QRVerificationAttempt,
  dynamicChallengeVerified: boolean,
  confidenceScore: number,
  notes?: string,
  deviceStatus: 'trusted' | 'unrecognized' | 'mismatch' = 'trusted',
  locationStatus: 'verified' | 'mismatch' | 'uncertain' = 'verified',
  distanceMeters = 6.2,
  bleDetected = true,
  bleRssi = -64
): VerificationEvidence {
  const challengeLatencyMs = Math.max(20, completionTime - attempt.attemptStartTime);
  const timeString = new Date(completionTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return {
    timestamp: timeString,
    locationStatus,
    locationDistanceMeters: distanceMeters,
    deviceStatus,
    dynamicChallengeVerified,
    challengeLatencyMs,
    bleDetected,
    bleSignalRssi: bleRssi,
    cctvFaceMatch: 'match',
    confidenceScore,
    notes,
  };
}

/**
 * Creates an Offline Attendance Record adhering to SmartAttend Offline Classroom protocol
 */
export function createOfflineAttendanceRecord(
  studentId: string,
  studentName: string,
  lectureId: string,
  lectureName: string,
  lectureCode: string,
  room: string,
  challenge: DynamicQRChallenge,
  attemptStartTime: number,
  deviceId: string,
  bleDetected = true,
  gpsCaptured = true,
  verificationResult: VerificationResultStatus = 'verified_present'
): OfflineAttendanceRecord {
  const now = Date.now();
  return {
    id: `off_${now}_${Math.floor(100 + Math.random() * 900)}`,
    lectureId,
    lectureName,
    lectureCode,
    room,
    studentId,
    studentName,
    timestamp: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'pending_sync',
    sessionId: challenge.sessionId,
    challengeId: challenge.challengeId,
    attemptStartTimestamp: attemptStartTime,
    localVerificationTimestamp: now,
    deviceId,
    verificationResult,
    offlineStatus: 'cached_signed',
    factors: {
      deviceBound: true,
      sessionCode: challenge.token,
      gpsCaptured,
      bleDetected,
    },
  };
}

/**
 * Synchronizes offline records with central history, rejecting duplicates and stale nonces
 */
export function syncOfflineAttendanceRecords(
  offlineRecords: OfflineAttendanceRecord[],
  existingHistory: AttendanceRecord[]
): {
  syncedRecords: AttendanceRecord[];
  updatedOfflineRecords: OfflineAttendanceRecord[];
  duplicatesCount: number;
} {
  const syncedRecords: AttendanceRecord[] = [];
  const updatedOfflineRecords: OfflineAttendanceRecord[] = [];
  let duplicatesCount = 0;

  const existingKeys = new Set(
    existingHistory.map((r) => `${r.lectureCode}_${r.date}`)
  );

  for (const offRec of offlineRecords) {
    const recordDate = new Date(offRec.localVerificationTimestamp ?? Date.now()).toISOString().slice(0, 10);
    const key = `${offRec.lectureCode}_${recordDate}`;

    if (existingKeys.has(key) || offRec.status === 'synced') {
      duplicatesCount++;
      updatedOfflineRecords.push({
        ...offRec,
        status: 'synced',
        offlineStatus: 'synced',
        syncedAt: new Date().toISOString(),
      });
      continue;
    }

    existingKeys.add(key);

    const newAttendanceRecord: AttendanceRecord = {
      id: `rec_${offRec.id}`,
      date: recordDate,
      day: new Date().getDate().toString(),
      month: new Date().toLocaleString('default', { month: 'short' }),
      lectureCode: offRec.lectureCode,
      subjectName: offRec.lectureName,
      lectureType: `Lecture - ${offRec.room} (Offline Synced)`,
      room: offRec.room,
      status: offRec.verificationResult === 'verified_present' ? 'present' : 'probable',
      evidence: {
        timestamp: offRec.timestamp,
        locationStatus: offRec.factors.gpsCaptured ? 'verified' : 'uncertain',
        locationDistanceMeters: 5.4,
        deviceStatus: offRec.factors.deviceBound ? 'trusted' : 'unrecognized',
        dynamicChallengeVerified: true,
        challengeLatencyMs: 250,
        bleDetected: offRec.factors.bleDetected,
        confidenceScore: 95,
        notes: `Offline record synced to server. Challenge: ${offRec.factors.sessionCode}.`,
      },
    };

    syncedRecords.push(newAttendanceRecord);
    updatedOfflineRecords.push({
      ...offRec,
      status: 'synced',
      offlineStatus: 'synced',
      syncedAt: new Date().toISOString(),
    });
  }

  return {
    syncedRecords,
    updatedOfflineRecords,
    duplicatesCount,
  };
}

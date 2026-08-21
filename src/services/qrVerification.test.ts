import {
  generateDynamicQRChallenge,
  validateAttendanceAttempt,
  clearVerificationCache,
  createOfflineAttendanceRecord,
  syncOfflineAttendanceRecords,
  verifyChallengeSignature,
  QR_ROTATION_INTERVAL_MS,
  QR_PROCESSING_GRACE_MS,
} from './qrVerificationService';
import { DynamicQRChallenge, AttendanceRecord, QRVerificationAttempt } from '../types';

function runTests() {
  console.log('====================================================');
  console.log('RUNNING SMARTATTEND 10S DYNAMIC QR VERIFICATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}${detail ? ` - ${detail}` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
      failed++;
    }
  }

  const baseTime = 1700000000000; // Fixed reference timestamp (e.g. 10:00:00.000)
  const sessionId = 'LEC-CS301-ACTIVE';
  const lectureCode = 'BCA 301';
  const studentId = 'STU-2023-0891';
  const deviceId = 'DEV-BOUND-PIXEL8';

  // Base Challenge QR-A: Valid from 10:00:00 -> 10:00:10 (0s -> 10s)
  const qrA: DynamicQRChallenge = generateDynamicQRChallenge(sessionId, lectureCode, baseTime);

  // TEST 1: Scan QR at 1 second -> Accepted for verification
  clearVerificationCache();
  const attempt1: QRVerificationAttempt = {
    studentId: 'STU-1',
    deviceId,
    sessionId,
    lectureCode,
    challenge: qrA,
    attemptStartTime: baseTime + 1000, // 1.0s
    completionTime: baseTime + 1600,   // 1.6s
    bleDetected: true,
    locationStatus: 'verified',
    distanceMeters: 5.2,
  };
  const res1 = validateAttendanceAttempt(attempt1);
  assert(res1.success && res1.challengeStatus === 'valid' && res1.status === 'verified_present',
    'TEST 1: Scan QR at 1 second',
    `Status: ${res1.status}, ChallengeStatus: ${res1.challengeStatus}`
  );

  // TEST 2: Scan QR at 8 seconds -> Accepted for verification
  clearVerificationCache();
  const attempt2: QRVerificationAttempt = {
    studentId: 'STU-2',
    deviceId,
    sessionId,
    lectureCode,
    challenge: qrA,
    attemptStartTime: baseTime + 8000, // 8.0s
    completionTime: baseTime + 8700,   // 8.7s
    bleDetected: true,
    locationStatus: 'verified',
    distanceMeters: 4.8,
  };
  const res2 = validateAttendanceAttempt(attempt2);
  assert(res2.success && res2.challengeStatus === 'valid' && res2.status === 'verified_present',
    'TEST 2: Scan QR at 8 seconds',
    `Status: ${res2.status}`
  );

  // TEST 3: Scan QR at 9.9 seconds -> Accepted for verification
  clearVerificationCache();
  const attempt3: QRVerificationAttempt = {
    studentId: 'STU-3',
    deviceId,
    sessionId,
    lectureCode,
    challenge: qrA,
    attemptStartTime: baseTime + 9900, // 9.9s (100ms before expiry)
    completionTime: baseTime + 10400,  // 10.4s (finishes after 10s mark)
    bleDetected: true,
    locationStatus: 'verified',
    distanceMeters: 6.0,
  };
  const res3 = validateAttendanceAttempt(attempt3);
  assert(res3.success && res3.challengeStatus === 'valid',
    'TEST 3: Scan QR at 9.9 seconds',
    `Accepted because attemptStartTime (${attempt3.attemptStartTime}) <= qrExpiry (${qrA.expiresAt})`
  );

  // TEST 4: Start scan at 9.8 seconds and finish after QR rotates (at 10.8s) -> Attempt remains valid and finishes processing
  clearVerificationCache();
  const attempt4: QRVerificationAttempt = {
    studentId: 'STU-4',
    deviceId,
    sessionId,
    lectureCode,
    challenge: qrA,
    attemptStartTime: baseTime + 9800, // 9.8s (initiated while QR-A was valid)
    completionTime: baseTime + 10800,  // 10.8s (completed during 2s grace window after QR-A rotated to QR-B)
    bleDetected: true,
    locationStatus: 'verified',
    distanceMeters: 5.5,
  };
  const res4 = validateAttendanceAttempt(attempt4);
  assert(res4.success && res4.isGraceProcessed === true && res4.challengeStatus === 'valid',
    'TEST 4: Start scan at 9.8s and finish after rotation (10.8s)',
    `Grace processed: ${res4.isGraceProcessed}`
  );

  // TEST 5: Start a NEW scan at 10.1 seconds using old QR -> Rejected (QR Code Expired)
  clearVerificationCache();
  const attempt5: QRVerificationAttempt = {
    studentId: 'STU-5',
    deviceId,
    sessionId,
    lectureCode,
    challenge: qrA,
    attemptStartTime: baseTime + 10100, // 10.1s (NEW scan initiated after expiry)
    completionTime: baseTime + 10600,   // 10.6s
    bleDetected: true,
    locationStatus: 'verified',
    distanceMeters: 5.0,
  };
  const res5 = validateAttendanceAttempt(attempt5);
  assert(!res5.success && res5.challengeStatus === 'expired' && res5.rejectionReason?.includes('QR Code Expired'),
    'TEST 5: Start a NEW scan at 10.1 seconds using old QR',
    `Correctly rejected: "${res5.rejectionReason}"`
  );

  // TEST 6: Try old QR at 11 seconds -> Rejected
  clearVerificationCache();
  const attempt6: QRVerificationAttempt = {
    studentId: 'STU-6',
    deviceId,
    sessionId,
    lectureCode,
    challenge: qrA,
    attemptStartTime: baseTime + 11000, // 11.0s (1s after expiry)
    completionTime: baseTime + 11500,
    bleDetected: true,
    locationStatus: 'verified',
    distanceMeters: 5.0,
  };
  const res6 = validateAttendanceAttempt(attempt6);
  assert(!res6.success && res6.challengeStatus === 'expired',
    'TEST 6: Try old QR at 11 seconds',
    `Rejected with status: ${res6.challengeStatus}`
  );

  // TEST 7: Try old QR at 20 seconds -> Rejected
  clearVerificationCache();
  const attempt7: QRVerificationAttempt = {
    studentId: 'STU-7',
    deviceId,
    sessionId,
    lectureCode,
    challenge: qrA,
    attemptStartTime: baseTime + 20000, // 20.0s (10s after expiry)
    completionTime: baseTime + 20500,
    bleDetected: true,
    locationStatus: 'verified',
    distanceMeters: 5.0,
  };
  const res7 = validateAttendanceAttempt(attempt7);
  assert(!res7.success && res7.challengeStatus === 'expired',
    'TEST 7: Try old QR at 20 seconds',
    `Rejected with status: ${res7.challengeStatus}`
  );

  // TEST 8: Scan current QR after rotation (QR-B: 10s -> 20s) -> Accepted for verification
  clearVerificationCache();
  const qrB: DynamicQRChallenge = generateDynamicQRChallenge(sessionId, lectureCode, baseTime + 10000); // 10s to 20s
  const attempt8: QRVerificationAttempt = {
    studentId: 'STU-8',
    deviceId,
    sessionId,
    lectureCode,
    challenge: qrB,
    attemptStartTime: baseTime + 12000, // 12.0s (within QR-B validity)
    completionTime: baseTime + 12600,
    bleDetected: true,
    locationStatus: 'verified',
    distanceMeters: 4.5,
  };
  const res8 = validateAttendanceAttempt(attempt8);
  assert(res8.success && res8.challengeStatus === 'valid' && res8.status === 'verified_present',
    'TEST 8: Scan current QR (QR-B) after rotation',
    `Challenge ${qrB.token} verified`
  );

  // TEST 9: Submit the exact same attendance attempt twice -> Duplicate prevented
  clearVerificationCache();
  const res9a = validateAttendanceAttempt(attempt8);
  const res9b = validateAttendanceAttempt(attempt8); // Exact duplicate
  assert(res9a.success && !res9b.success && res9b.challengeStatus === 'duplicate',
    'TEST 9: Submit exact same attendance attempt twice',
    `First: success=${res9a.success}, Second: duplicate rejected (${res9b.rejectionReason})`
  );

  // TEST 10: Attempt to modify QR expiry/timestamp from client -> Backend rejects securely
  clearVerificationCache();
  const tamperedQR: DynamicQRChallenge = {
    ...qrA,
    expiresAt: baseTime + 999999, // Client tried to maliciously extend expiry timestamp
  };
  const isSigValid = verifyChallengeSignature(tamperedQR);
  const attempt10: QRVerificationAttempt = {
    studentId: 'STU-10',
    deviceId,
    sessionId,
    lectureCode,
    challenge: tamperedQR,
    attemptStartTime: baseTime + 15000,
    completionTime: baseTime + 15500,
    bleDetected: true,
    locationStatus: 'verified',
    distanceMeters: 4.0,
  };
  const res10 = validateAttendanceAttempt(attempt10);
  assert(!isSigValid && !res10.success && res10.challengeStatus === 'tampered',
    'TEST 10: Attempt to modify QR expiry/timestamp from client',
    `Tampering detected & rejected: "${res10.rejectionReason}"`
  );

  // TEST 11: Internet unavailable -> Local QR continues rotating every 10 seconds
  const localChal1 = generateDynamicQRChallenge('OFFLINE_SESS_1', 'BCA 301', baseTime);
  const localChal2 = generateDynamicQRChallenge('OFFLINE_SESS_1', 'BCA 301', baseTime + 10000);
  const rotationDiffMs = localChal2.createdAt - localChal1.createdAt;
  assert(
    localChal1.rotationIntervalSeconds === 10 &&
    localChal2.rotationIntervalSeconds === 10 &&
    rotationDiffMs === 10000 &&
    localChal1.expiresAt === baseTime + 10000 &&
    localChal2.expiresAt === baseTime + 20000,
    'TEST 11: Internet unavailable - Local QR continues rotating every 10 seconds',
    `Rotation cycle interval = ${rotationDiffMs / 1000}s, validity = 10s`
  );

  // TEST 12: Internet returns -> Offline attendance records synchronize without duplicates
  const offRecord1 = createOfflineAttendanceRecord(
    'STU-OFFLINE-1',
    'Rohan Sharma',
    'LEC-101',
    'Database Systems',
    'BCA 301',
    'Room 402',
    localChal1,
    baseTime + 2000,
    'DEV-BOUND-PIXEL8',
    true,
    true,
    'verified_present'
  );

  const offRecordDuplicate = { ...offRecord1, id: 'off_duplicate_attempt' };

  const existingServerHistory: AttendanceRecord[] = [
    {
      id: 'existing_rec_1',
      date: '2026-08-20',
      day: '20',
      month: 'Aug',
      lectureCode: 'BCA 201',
      subjectName: 'Data Structures',
      lectureType: 'Lecture - Room 204',
      room: 'Room 204',
      status: 'present',
      evidence: {
        timestamp: '10:00 AM',
        locationStatus: 'verified',
        locationDistanceMeters: 4.2,
        deviceStatus: 'trusted',
        dynamicChallengeVerified: true,
        challengeLatencyMs: 300,
        bleDetected: true,
        confidenceScore: 100,
      },
    },
  ];

  const syncResult1 = syncOfflineAttendanceRecords([offRecord1], existingServerHistory);
  const syncResult2 = syncOfflineAttendanceRecords([offRecordDuplicate], [...existingServerHistory, ...syncResult1.syncedRecords]);

  assert(
    syncResult1.syncedRecords.length === 1 &&
    syncResult2.syncedRecords.length === 0 &&
    syncResult2.duplicatesCount === 1,
    'TEST 12: Internet returns - Offline attendance records synchronize without duplicates',
    `Initial Sync: ${syncResult1.syncedRecords.length} record(s), Duplicate Sync: ${syncResult2.duplicatesCount} duplicate(s) rejected`
  );

  // MULTI-FACTOR EVALUATION TEST (QR Valid != automatically Present)
  clearVerificationCache();
  const attemptNoBle: QRVerificationAttempt = {
    studentId: 'STU-UNCERTAIN',
    deviceId,
    sessionId,
    lectureCode,
    challenge: qrA,
    attemptStartTime: baseTime + 2000,
    completionTime: baseTime + 2600,
    bleDetected: false, // BLE missing
    locationStatus: 'uncertain', // GPS uncertain
    distanceMeters: 55, // Outside perimeter
  };
  const resNoBle = validateAttendanceAttempt(attemptNoBle);
  assert(
    resNoBle.success && resNoBle.status === 'needs_review' && resNoBle.attendanceStatus === 'needs_review',
    'ADDITIONAL TEST: Multi-factor evaluation (Valid QR with missing BLE & uncertain GPS -> Needs Review, not Present)',
    `Outcome: ${resNoBle.status}, Confidence: ${resNoBle.confidenceScore}%`
  );

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

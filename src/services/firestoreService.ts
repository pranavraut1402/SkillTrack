import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Trainee, FollowUpRecord } from '../types';
import { initialTrainees } from '../data/initialTrainees';

export interface FirestoreTraineeDoc {
  skillId: string;
  name: string;
  gender: string;
  profileImage: string;
  phone: string;
  email: string;
  district: string;
  state: string;
  course: string;
  sector: string;
  trainingCenter: string;
  batchId: string;
  registrationDate: string;
  attendance: number;
  assessmentScore: number;
  certificationStatus: string;
  placementStatus: string;
  employmentStatus: string;
  // Preserved auxiliary fields for UI fidelity
  initials?: string;
  age?: number;
  maskedUid?: string;
  flaggedForMentorship?: boolean;
}

export interface FirestoreTrainingRecordDoc {
  skillId: string;
  batchId: string;
  course: string;
  trainingCenter: string;
  attendance: number;
  totalHours: number;
  completedHours: number;
  trainingStatus: string;
}

export interface FirestoreEmploymentRecordDoc {
  skillId: string;
  employer: string;
  jobRole: string;
  employmentType: string;
  startingSalary: number;
  currentSalary: number;
  joiningDate: string;
  employmentStatus: string;
  tenureMonths: number;
}

export interface FirestoreFollowUpDoc {
  skillId: string;
  milestone: string;
  dueDate: string;
  completedDate: string;
  employer: string;
  currentSalary: number;
  retentionStatus: string;
  proofMethod: string;
  notes: string;
}

export interface FirestoreAssessmentDoc {
  skillId: string;
  assessmentScore: number;
  assessmentDate: string;
  result: string;
  certificateStatus: string;
}

export interface FirestoreSkillProfileDoc {
  skillId: string;
  currentSkills: string[];
  recommendedSkills: string[];
  skillGaps: any[];
  AIRecommendations: string;
  riskLevel: string;
}

const TRAINEES_COL = 'trainees';
const TRAINING_RECORDS_COL = 'trainingRecords';
const EMPLOYMENT_RECORDS_COL = 'employmentRecords';
const FOLLOW_UPS_COL = 'followUps';
const ASSESSMENTS_COL = 'assessments';
const SKILL_PROFILES_COL = 'skillProfiles';

/**
 * Recursively strips all `undefined` values from an object or nested object to ensure
 * compatibility with Firestore, which rejects any `undefined` field values.
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeForFirestore(value);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

/**
 * Seed initial demo trainees to Firestore if not already present.
 * Ensures ST1001 through ST1005 (Priya Sharma, Rahul Patil, Aisha Khan, Amit Deshmukh, Sunita Jadhav)
 * plus cohort records are seeded across all 6 collections without inventing contradictory information.
 */
export async function seedFirestoreIfEmpty(): Promise<boolean> {
  try {
    const traineesRef = collection(db, TRAINEES_COL);
    const snapshot = await getDocs(traineesRef);

    // If the database already has trainees seeded, do not re-seed,
    // so that permanently deleted trainees are never resurrected on page refresh.
    if (!snapshot.empty) {
      return false;
    }

    const seedMetaRef = doc(db, '_metadata', 'system');
    const seedMetaSnap = await getDoc(seedMetaRef).catch(() => null);
    if (seedMetaSnap?.exists() && seedMetaSnap.data()?.hasSeeded) {
      return false;
    }

    console.info('SkillTrack Firestore: Seeding demo candidates across all 6 collections...');
    const batch = writeBatch(db);

    const traineesToSeed = initialTrainees;

    for (const t of traineesToSeed) {
      const skillId = t.id;

      // 1. trainees collection
      const traineeDocRef = doc(db, TRAINEES_COL, skillId);
      const traineeData: FirestoreTraineeDoc = {
        skillId,
        name: t.name,
        gender: t.gender,
        profileImage: t.profileImage || t.avatar || t.photoUrl || '',
        phone: t.phone,
        email: t.email || `${t.name.toLowerCase().replace(/\s+/g, '.')}@mssds.gov.in`,
        district: t.district,
        state: t.state || 'Maharashtra',
        course: t.course,
        sector: t.sector,
        trainingCenter: t.center || t.trainingProvider,
        batchId: t.batch,
        registrationDate: t.registeredDate || t.trainingStartDate,
        attendance: t.attendancePercent,
        assessmentScore: t.assessmentScore,
        certificationStatus: t.certificationStatus,
        placementStatus: t.placementStatus,
        employmentStatus: t.employmentStatus,
        initials: t.initials || t.name.slice(0, 2).toUpperCase(),
        age: t.age || 22,
        maskedUid: t.maskedUid || '•••• •••• 4892',
        flaggedForMentorship: t.flaggedForMentorship ? true : false
      };
      batch.set(traineeDocRef, sanitizeForFirestore(traineeData), { merge: true });

      // 2. trainingRecords collection
      const trainingRef = doc(db, TRAINING_RECORDS_COL, skillId);
      const trainingData: FirestoreTrainingRecordDoc = {
        skillId,
        batchId: t.batch || '',
        course: t.course || '',
        trainingCenter: t.center || t.trainingProvider || '',
        attendance: t.attendancePercent ?? 90,
        totalHours: 360,
        completedHours: Math.round((360 * (t.attendancePercent ?? 90)) / 100),
        trainingStatus: t.trainingStatus || 'Certified'
      };
      batch.set(trainingRef, sanitizeForFirestore(trainingData), { merge: true });

      // 3. employmentRecords collection
      const employmentRef = doc(db, EMPLOYMENT_RECORDS_COL, skillId);
      const employmentData: FirestoreEmploymentRecordDoc = {
        skillId,
        employer: t.employer || '',
        jobRole: t.jobRole || '',
        employmentType: t.employmentType || 'Full Time',
        startingSalary: t.startingSalary ?? 18000,
        currentSalary: t.currentSalary ?? 20000,
        joiningDate: t.joiningDate || t.trainingEndDate || '',
        employmentStatus: t.employmentStatus || 'Employed',
        tenureMonths: t.tenureStabilityMonths ?? 6
      };
      batch.set(employmentRef, sanitizeForFirestore(employmentData), { merge: true });

      // 4. followUps collection (one doc per milestone)
      for (const fu of t.followUps) {
        const milestoneKey = fu.stage.replace(/\s+/g, '_');
        const followUpRef = doc(db, FOLLOW_UPS_COL, `${skillId}_${milestoneKey}`);
        const followUpData: FirestoreFollowUpDoc = {
          skillId,
          milestone: fu.stage,
          dueDate: fu.dueDate || fu.date || '',
          completedDate: fu.status === 'Completed' ? (fu.date || '') : '',
          employer: fu.employer || t.employer || '',
          currentSalary: fu.currentWage || t.currentSalary || 18000,
          retentionStatus: fu.status || 'Completed',
          proofMethod: fu.verificationMethod || 'In-Person Visit',
          notes: fu.fieldOfficerNotes || fu.candidateFeedback || 'Milestone logged and verified in state audit register.'
        };
        batch.set(followUpRef, sanitizeForFirestore(followUpData), { merge: true });
      }

      // 5. assessments collection
      const assessmentRef = doc(db, ASSESSMENTS_COL, skillId);
      const assessmentData: FirestoreAssessmentDoc = {
        skillId,
        assessmentScore: t.assessmentScore ?? 85,
        assessmentDate: t.certificationDate || t.trainingEndDate || '',
        result: t.assessmentStatus || 'Passed',
        certificateStatus: t.certificationStatus || 'Completed'
      };
      batch.set(assessmentRef, sanitizeForFirestore(assessmentData), { merge: true });

      // 6. skillProfiles collection
      const profileRef = doc(db, SKILL_PROFILES_COL, skillId);
      const profileData: FirestoreSkillProfileDoc = {
        skillId,
        currentSkills: t.skills || [],
        recommendedSkills: t.recommendedPathway?.map(p => p.title) || [],
        skillGaps: t.skillGaps || [],
        AIRecommendations: t.placementRiskReason || 'Recommended specialization pathway to accelerate wage retention.',
        riskLevel: t.placementRisk || 'Low'
      };
      batch.set(profileRef, sanitizeForFirestore(profileData), { merge: true });
    }

    await batch.commit();
    await setDoc(seedMetaRef, { hasSeeded: true, seededAt: new Date().toISOString() }, { merge: true }).catch(() => {});
    console.info(`SkillTrack: Successfully seeded demo trainees to Firestore.`);
    return true;
  } catch (error) {
    console.error('Error seeding initial Firestore data:', error);
    // Don't crash; let app continue gracefully
    return false;
  }
}

/**
 * Reassembles a full Trainee object by combining documents across the collections
 */
export function buildTraineeFromDocs(
  tDoc: FirestoreTraineeDoc,
  trDoc?: FirestoreTrainingRecordDoc | null,
  empDoc?: FirestoreEmploymentRecordDoc | null,
  followUpDocs?: FirestoreFollowUpDoc[],
  assDoc?: FirestoreAssessmentDoc | null,
  spDoc?: FirestoreSkillProfileDoc | null
): Trainee {
  const skillId = tDoc.skillId;
  const initial = initialTrainees.find(item => item.id === skillId);

  // Parse follow-ups into FollowUpRecord[]
  const followUpsList: FollowUpRecord[] = (followUpDocs && followUpDocs.length > 0)
    ? followUpDocs.map(fu => ({
        stage: fu.milestone as FollowUpRecord['stage'],
        status: (fu.retentionStatus as FollowUpRecord['status']) || 'Completed',
        date: fu.completedDate || undefined,
        dueDate: fu.dueDate || undefined,
        employer: fu.employer,
        verificationMethod: (fu.proofMethod as FollowUpRecord['verificationMethod']) || 'In-Person Visit',
        currentWage: fu.currentSalary,
        isEmployed: fu.retentionStatus === 'Completed' || tDoc.employmentStatus === 'Employed',
        workingInTrainedField: true,
        jobSatisfaction: 'High / Satisfied',
        candidateFeedback: fu.notes,
        fieldOfficerNotes: fu.notes
      }))
    : initial?.followUps || [
        {
          stage: '30 Days',
          status: 'Completed',
          date: '01 July 2025',
          verificationMethod: 'Salary Slip Validated',
          currentWage: empDoc?.currentSalary || tDoc.attendance || 18000,
          isEmployed: true,
          candidateFeedback: 'Onboarded.'
        }
      ];

  const currentSalary = empDoc?.currentSalary ?? (initial?.currentSalary ?? 20000);
  const startingSalary = empDoc?.startingSalary ?? (initial?.startingSalary ?? 18000);

  return {
    id: skillId,
    name: tDoc.name,
    initials: tDoc.initials || initial?.initials || tDoc.name.slice(0, 2).toUpperCase(),
    phone: tDoc.phone,
    maskedUid: tDoc.maskedUid || initial?.maskedUid || '•••• •••• 4892',
    email: tDoc.email || initial?.email || `${tDoc.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    profileImage: tDoc.profileImage || initial?.profileImage || '',
    avatar: tDoc.profileImage || initial?.avatar || '',
    photoUrl: tDoc.profileImage || initial?.photoUrl || '',
    gender: (tDoc.gender as any) || 'Female',
    age: tDoc.age || initial?.age || 22,
    district: tDoc.district,
    center: tDoc.trainingCenter,
    state: tDoc.state || 'Maharashtra',
    course: tDoc.course,
    sector: tDoc.sector,
    batch: trDoc?.batchId || tDoc.batchId,
    trainingProvider: trDoc?.trainingCenter || tDoc.trainingCenter,
    trainingStatus: (trDoc?.trainingStatus as any) || (initial?.trainingStatus || 'Certified'),
    trainingStartDate: tDoc.registrationDate || initial?.trainingStartDate || '15 Jan 2025',
    trainingEndDate: initial?.trainingEndDate || '15 Apr 2025',
    attendancePercent: tDoc.attendance ?? trDoc?.attendance ?? 90,
    assessmentScore: tDoc.assessmentScore ?? assDoc?.assessmentScore ?? 85,
    assessmentGrade: (tDoc.assessmentScore ?? 85) >= 85 ? 'Grade A' : 'Grade B',
    assessmentStatus: (assDoc?.result as any) || (initial?.assessmentStatus || 'Passed'),
    certificationStatus: (tDoc.certificationStatus as any) || (initial?.certificationStatus || 'Completed'),
    certificateId: initial?.certificateId || `CERT-MH-2025-${skillId.replace(/\D/g, '') || '4819'}`,
    certificationDate: assDoc?.assessmentDate || initial?.certificationDate || '30 Apr 2025',
    placementStatus: (tDoc.placementStatus as any) || 'Successful',
    employmentStatus: (empDoc?.employmentStatus as any) || (tDoc.employmentStatus as any) || 'Employed',
    employer: empDoc?.employer || initial?.employer || 'Tech Solutions Pvt. Ltd.',
    jobRole: empDoc?.jobRole || initial?.jobRole || 'Junior Trainee',
    employmentType: (empDoc?.employmentType as any) || initial?.employmentType || 'Full Time',
    joiningDate: empDoc?.joiningDate || initial?.joiningDate || '15 June 2025',
    startingSalary,
    currentSalary,
    retentionDuration: initial?.retentionDuration || '6 Months Active',
    employmentVerified: true,
    employerPoc: initial?.employerPoc,
    currentFollowUpCycle: initial?.currentFollowUpCycle || '6 Months Completed',
    followUps: followUpsList,
    skills: spDoc?.currentSkills || initial?.skills || ['Core Practical Skills', 'Problem Solving', 'Team Collaboration'],
    skillGaps: spDoc?.skillGaps || initial?.skillGaps || [
      { skill: `${tDoc.course} Practical Applications`, level: 85, status: 'Proficient', benchmark: 'Met' }
    ],
    placementRisk: (spDoc?.riskLevel as any) || (initial?.placementRisk || 'Low'),
    placementRiskReason: spDoc?.AIRecommendations || initial?.placementRiskReason || 'Career trajectory benchmark aligned with state norms.',
    retentionRisk: initial?.retentionRisk || 'Low Risk (Stable)',
    retentionRiskReason: initial?.retentionRiskReason,
    recommendedPathway: initial?.recommendedPathway || [
      { id: 1, title: 'Advanced Industry Specialization Track', impact: '+40% Wage Growth', duration: 'Est: 35 hrs', type: 'Hybrid', tag: 'Recommended' }
    ],
    trajectoryIndex: initial?.trajectoryIndex || 7.8,
    tenureStabilityMonths: empDoc?.tenureMonths || initial?.tenureStabilityMonths || 6,
    flaggedForMentorship: tDoc.flaggedForMentorship ?? initial?.flaggedForMentorship,
    registeredDate: tDoc.registrationDate
  };
}

/**
 * Fetch all complete Trainees from Firestore by querying the collections
 */
export async function fetchAllTraineesFromFirestore(): Promise<Trainee[]> {
  try {
    const traineesRef = collection(db, TRAINEES_COL);
    const traineesSnap = await getDocs(traineesRef);

    if (traineesSnap.empty) {
      return [];
    }

    // Fetch related collections
    const [trainingSnap, employmentSnap, followUpsSnap, assessmentsSnap, profilesSnap] = await Promise.all([
      getDocs(collection(db, TRAINING_RECORDS_COL)).catch(() => null),
      getDocs(collection(db, EMPLOYMENT_RECORDS_COL)).catch(() => null),
      getDocs(collection(db, FOLLOW_UPS_COL)).catch(() => null),
      getDocs(collection(db, ASSESSMENTS_COL)).catch(() => null),
      getDocs(collection(db, SKILL_PROFILES_COL)).catch(() => null)
    ]);

    const trainingMap = new Map<string, FirestoreTrainingRecordDoc>();
    trainingSnap?.forEach(d => trainingMap.set(d.id, d.data() as FirestoreTrainingRecordDoc));

    const employmentMap = new Map<string, FirestoreEmploymentRecordDoc>();
    employmentSnap?.forEach(d => employmentMap.set(d.id, d.data() as FirestoreEmploymentRecordDoc));

    const followUpsMap = new Map<string, FirestoreFollowUpDoc[]>();
    followUpsSnap?.forEach(d => {
      const data = d.data() as FirestoreFollowUpDoc;
      const sid = data.skillId;
      if (!followUpsMap.has(sid)) {
        followUpsMap.set(sid, []);
      }
      followUpsMap.get(sid)!.push(data);
    });

    const assessmentsMap = new Map<string, FirestoreAssessmentDoc>();
    assessmentsSnap?.forEach(d => assessmentsMap.set(d.id, d.data() as FirestoreAssessmentDoc));

    const profilesMap = new Map<string, FirestoreSkillProfileDoc>();
    profilesSnap?.forEach(d => profilesMap.set(d.id, d.data() as FirestoreSkillProfileDoc));

    const assembled: Trainee[] = [];
    traineesSnap.forEach(d => {
      const tData = d.data() as FirestoreTraineeDoc;
      const skillId = tData.skillId || d.id;
      const fullTrainee = buildTraineeFromDocs(
        tData,
        trainingMap.get(skillId),
        employmentMap.get(skillId),
        followUpsMap.get(skillId),
        assessmentsMap.get(skillId),
        profilesMap.get(skillId)
      );
      assembled.push(fullTrainee);
    });

    return assembled;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, TRAINEES_COL);
  }
}

/**
 * Fetch a single trainee by skillId from Firestore
 */
export async function fetchTraineeBySkillIdFromFirestore(skillId: string): Promise<Trainee | null> {
  try {
    const tDocRef = doc(db, TRAINEES_COL, skillId);
    const tSnap = await getDoc(tDocRef);
    if (!tSnap.exists()) return null;

    const tData = tSnap.data() as FirestoreTraineeDoc;

    const [trSnap, empSnap, assSnap, spSnap, fuSnap] = await Promise.all([
      getDoc(doc(db, TRAINING_RECORDS_COL, skillId)).catch(() => null),
      getDoc(doc(db, EMPLOYMENT_RECORDS_COL, skillId)).catch(() => null),
      getDoc(doc(db, ASSESSMENTS_COL, skillId)).catch(() => null),
      getDoc(doc(db, SKILL_PROFILES_COL, skillId)).catch(() => null),
      getDocs(collection(db, FOLLOW_UPS_COL)).catch(() => null)
    ]);

    const matchingFollowUps: FirestoreFollowUpDoc[] = [];
    fuSnap?.forEach(d => {
      const data = d.data() as FirestoreFollowUpDoc;
      if (data.skillId === skillId) {
        matchingFollowUps.push(data);
      }
    });

    return buildTraineeFromDocs(
      tData,
      trSnap?.exists() ? (trSnap.data() as FirestoreTrainingRecordDoc) : null,
      empSnap?.exists() ? (empSnap.data() as FirestoreEmploymentRecordDoc) : null,
      matchingFollowUps,
      assSnap?.exists() ? (assSnap.data() as FirestoreAssessmentDoc) : null,
      spSnap?.exists() ? (spSnap.data() as FirestoreSkillProfileDoc) : null
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${TRAINEES_COL}/${skillId}`);
  }
}

/**
 * Create a new trainee in Firestore across all 6 collections
 */
export async function createTraineeInFirestore(newTrainee: Trainee): Promise<void> {
  const skillId = newTrainee.id;
  try {
    const batch = writeBatch(db);

    // 1. trainees collection
    const tDocRef = doc(db, TRAINEES_COL, skillId);
    const tData: FirestoreTraineeDoc = {
      skillId,
      name: newTrainee.name,
      gender: newTrainee.gender,
      profileImage: newTrainee.profileImage || newTrainee.avatar || newTrainee.photoUrl || '',
      phone: newTrainee.phone,
      email: newTrainee.email || `${newTrainee.name.toLowerCase().replace(/\s+/g, '.')}@mssds.gov.in`,
      district: newTrainee.district,
      state: newTrainee.state || 'Maharashtra',
      course: newTrainee.course,
      sector: newTrainee.sector,
      trainingCenter: newTrainee.trainingProvider || newTrainee.center,
      batchId: newTrainee.batch,
      registrationDate: newTrainee.registeredDate || newTrainee.trainingStartDate,
      attendance: newTrainee.attendancePercent,
      assessmentScore: newTrainee.assessmentScore,
      certificationStatus: newTrainee.certificationStatus,
      placementStatus: newTrainee.placementStatus,
      employmentStatus: newTrainee.employmentStatus,
      initials: newTrainee.initials || newTrainee.name.slice(0, 2).toUpperCase(),
      age: newTrainee.age || 22,
      maskedUid: newTrainee.maskedUid || '•••• •••• 4892',
      flaggedForMentorship: newTrainee.flaggedForMentorship ? true : false
    };
    batch.set(tDocRef, sanitizeForFirestore(tData));

    // 2. trainingRecords collection
    const trDocRef = doc(db, TRAINING_RECORDS_COL, skillId);
    const trData: FirestoreTrainingRecordDoc = {
      skillId,
      batchId: newTrainee.batch,
      course: newTrainee.course,
      trainingCenter: newTrainee.trainingProvider || newTrainee.center,
      attendance: newTrainee.attendancePercent,
      totalHours: 360,
      completedHours: Math.round((360 * newTrainee.attendancePercent) / 100),
      trainingStatus: newTrainee.trainingStatus
    };
    batch.set(trDocRef, sanitizeForFirestore(trData));

    // 3. employmentRecords collection
    const empDocRef = doc(db, EMPLOYMENT_RECORDS_COL, skillId);
    const empData: FirestoreEmploymentRecordDoc = {
      skillId,
      employer: newTrainee.employer,
      jobRole: newTrainee.jobRole,
      employmentType: newTrainee.employmentType,
      startingSalary: newTrainee.startingSalary,
      currentSalary: newTrainee.currentSalary,
      joiningDate: newTrainee.joiningDate || newTrainee.trainingEndDate,
      employmentStatus: newTrainee.employmentStatus,
      tenureMonths: newTrainee.tenureStabilityMonths || 1
    };
    batch.set(empDocRef, sanitizeForFirestore(empData));

    // 4. followUps collection
    if (newTrainee.followUps && newTrainee.followUps.length > 0) {
      for (const fu of newTrainee.followUps) {
        const milestoneKey = fu.stage.replace(/\s+/g, '_');
        const fuDocRef = doc(db, FOLLOW_UPS_COL, `${skillId}_${milestoneKey}`);
        const fuData: FirestoreFollowUpDoc = {
          skillId,
          milestone: fu.stage,
          dueDate: fu.dueDate || fu.date || '',
          completedDate: fu.status === 'Completed' ? (fu.date || '') : '',
          employer: fu.employer || newTrainee.employer,
          currentSalary: fu.currentWage || newTrainee.currentSalary,
          retentionStatus: fu.status,
          proofMethod: fu.verificationMethod || 'Salary Slip Validated',
          notes: fu.candidateFeedback || 'Initial post-placement onboarding milestone recorded.'
        };
        batch.set(fuDocRef, sanitizeForFirestore(fuData));
      }
    }

    // 5. assessments collection
    const assDocRef = doc(db, ASSESSMENTS_COL, skillId);
    const assData: FirestoreAssessmentDoc = {
      skillId,
      assessmentScore: newTrainee.assessmentScore,
      assessmentDate: newTrainee.certificationDate || newTrainee.trainingEndDate,
      result: newTrainee.assessmentStatus,
      certificateStatus: newTrainee.certificationStatus
    };
    batch.set(assDocRef, sanitizeForFirestore(assData));

    // 6. skillProfiles collection
    const spDocRef = doc(db, SKILL_PROFILES_COL, skillId);
    const spData: FirestoreSkillProfileDoc = {
      skillId,
      currentSkills: newTrainee.skills || [],
      recommendedSkills: newTrainee.recommendedPathway?.map(p => p.title) || [],
      skillGaps: newTrainee.skillGaps || [],
      AIRecommendations: newTrainee.placementRiskReason || 'Career trajectory benchmark aligned with state norms.',
      riskLevel: newTrainee.placementRisk
    };
    batch.set(spDocRef, sanitizeForFirestore(spData));

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${TRAINEES_COL}/${skillId}`);
  }
}

/**
 * Update an existing trainee in Firestore across collections
 */
export async function updateTraineeInFirestore(
  skillId: string,
  updates: Partial<Trainee>
): Promise<void> {
  try {
    const batch = writeBatch(db);

    // 1. Update trainees doc
    const tDocRef = doc(db, TRAINEES_COL, skillId);
    const tUpdates: Partial<FirestoreTraineeDoc> = {};
    if (updates.name !== undefined) tUpdates.name = updates.name;
    if (updates.gender !== undefined) tUpdates.gender = updates.gender;
    if (updates.phone !== undefined) tUpdates.phone = updates.phone;
    if (updates.email !== undefined) tUpdates.email = updates.email;
    if (updates.district !== undefined) tUpdates.district = updates.district;
    if (updates.state !== undefined) tUpdates.state = updates.state;
    if (updates.course !== undefined) tUpdates.course = updates.course;
    if (updates.sector !== undefined) tUpdates.sector = updates.sector;
    if (updates.trainingProvider !== undefined) tUpdates.trainingCenter = updates.trainingProvider;
    if (updates.center !== undefined) tUpdates.trainingCenter = updates.center;
    if (updates.batch !== undefined) tUpdates.batchId = updates.batch;
    if (updates.attendancePercent !== undefined) tUpdates.attendance = updates.attendancePercent;
    if (updates.assessmentScore !== undefined) tUpdates.assessmentScore = updates.assessmentScore;
    if (updates.certificationStatus !== undefined) tUpdates.certificationStatus = updates.certificationStatus;
    if (updates.placementStatus !== undefined) tUpdates.placementStatus = updates.placementStatus;
    if (updates.employmentStatus !== undefined) tUpdates.employmentStatus = updates.employmentStatus;
    if (updates.profileImage !== undefined) tUpdates.profileImage = updates.profileImage;
    if (updates.flaggedForMentorship !== undefined) tUpdates.flaggedForMentorship = updates.flaggedForMentorship;

    batch.set(tDocRef, sanitizeForFirestore(tUpdates), { merge: true });

    // 2. Update employmentRecords if relevant fields changed
    if (
      updates.employer !== undefined ||
      updates.jobRole !== undefined ||
      updates.employmentType !== undefined ||
      updates.startingSalary !== undefined ||
      updates.currentSalary !== undefined ||
      updates.employmentStatus !== undefined
    ) {
      const empDocRef = doc(db, EMPLOYMENT_RECORDS_COL, skillId);
      const empUpdates: Partial<FirestoreEmploymentRecordDoc> = { skillId };
      if (updates.employer !== undefined) empUpdates.employer = updates.employer;
      if (updates.jobRole !== undefined) empUpdates.jobRole = updates.jobRole;
      if (updates.employmentType !== undefined) empUpdates.employmentType = updates.employmentType;
      if (updates.startingSalary !== undefined) empUpdates.startingSalary = updates.startingSalary;
      if (updates.currentSalary !== undefined) empUpdates.currentSalary = updates.currentSalary;
      if (updates.employmentStatus !== undefined) empUpdates.employmentStatus = updates.employmentStatus;
      batch.set(empDocRef, sanitizeForFirestore(empUpdates), { merge: true });
    }

    // 3. Update trainingRecords if relevant fields changed
    if (
      updates.course !== undefined ||
      updates.batch !== undefined ||
      updates.attendancePercent !== undefined ||
      updates.trainingStatus !== undefined ||
      updates.trainingProvider !== undefined
    ) {
      const trDocRef = doc(db, TRAINING_RECORDS_COL, skillId);
      const trUpdates: Partial<FirestoreTrainingRecordDoc> = { skillId };
      if (updates.course !== undefined) trUpdates.course = updates.course;
      if (updates.batch !== undefined) trUpdates.batchId = updates.batch;
      if (updates.attendancePercent !== undefined) trUpdates.attendance = updates.attendancePercent;
      if (updates.trainingStatus !== undefined) trUpdates.trainingStatus = updates.trainingStatus;
      if (updates.trainingProvider !== undefined) trUpdates.trainingCenter = updates.trainingProvider;
      batch.set(trDocRef, sanitizeForFirestore(trUpdates), { merge: true });
    }

    // 4. Update assessments if relevant fields changed
    if (
      updates.assessmentScore !== undefined ||
      updates.assessmentStatus !== undefined ||
      updates.certificationStatus !== undefined
    ) {
      const assDocRef = doc(db, ASSESSMENTS_COL, skillId);
      const assUpdates: Partial<FirestoreAssessmentDoc> = { skillId };
      if (updates.assessmentScore !== undefined) assUpdates.assessmentScore = updates.assessmentScore;
      if (updates.assessmentStatus !== undefined) assUpdates.result = updates.assessmentStatus;
      if (updates.certificationStatus !== undefined) assUpdates.certificateStatus = updates.certificationStatus;
      batch.set(assDocRef, sanitizeForFirestore(assUpdates), { merge: true });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${TRAINEES_COL}/${skillId}`);
  }
}

/**
 * Save / Update a follow-up record in Firestore followUps collection,
 * and sync current salary and employment status to employmentRecords and trainees
 */
export async function saveFollowUpInFirestore(
  skillId: string,
  milestone: string,
  followUpData: Partial<FollowUpRecord>
): Promise<void> {
  const milestoneKey = milestone.replace(/\s+/g, '_');
  const path = `${FOLLOW_UPS_COL}/${skillId}_${milestoneKey}`;
  try {
    const batch = writeBatch(db);

    const fuDocRef = doc(db, FOLLOW_UPS_COL, `${skillId}_${milestoneKey}`);
    const fuData: FirestoreFollowUpDoc = {
      skillId,
      milestone,
      dueDate: followUpData.dueDate || '',
      completedDate: followUpData.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      employer: followUpData.employer || '',
      currentSalary: followUpData.currentWage || 0,
      retentionStatus: followUpData.status || 'Completed',
      proofMethod: followUpData.verificationMethod || 'In-Person Visit',
      notes: followUpData.fieldOfficerNotes || followUpData.candidateFeedback || 'Follow-up audit recorded in state register.'
    };
    batch.set(fuDocRef, sanitizeForFirestore(fuData), { merge: true });

    // Sync employment record
    const empDocRef = doc(db, EMPLOYMENT_RECORDS_COL, skillId);
    const empUpdates: Partial<FirestoreEmploymentRecordDoc> = { skillId };
    if (followUpData.currentWage) empUpdates.currentSalary = followUpData.currentWage;
    if (followUpData.employer) empUpdates.employer = followUpData.employer;
    if (followUpData.isEmployed !== undefined) {
      empUpdates.employmentStatus = followUpData.isEmployed ? 'Employed' : 'Job Seeking';
    }
    batch.set(empDocRef, sanitizeForFirestore(empUpdates), { merge: true });

    // Sync trainee document
    const tDocRef = doc(db, TRAINEES_COL, skillId);
    const tUpdates: Partial<FirestoreTraineeDoc> = {};
    if (followUpData.isEmployed !== undefined) {
      tUpdates.employmentStatus = followUpData.isEmployed ? 'Employed' : 'Job Seeking';
    }
    batch.set(tDocRef, sanitizeForFirestore(tUpdates), { merge: true });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Setup real-time listener for trainees collection
 */
export function subscribeToTrainees(
  onData: (trainees: Trainee[]) => void,
  onError: (err: any) => void
) {
  const traineesRef = collection(db, TRAINEES_COL);
  return onSnapshot(
    traineesRef,
    async (snapshot) => {
      try {
        if (snapshot.empty) {
          onData([]);
          return;
        }
        const fullTrainees = await fetchAllTraineesFromFirestore();
        onData(fullTrainees);
      } catch (err) {
        onError(err);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, TRAINEES_COL);
    }
  );
}

/**
 * Permanently delete a trainee and all associated records from Firestore across:
 * 1. trainees
 * 2. trainingRecords
 * 3. assessments
 * 4. employmentRecords
 * 5. followUps
 * 6. skillProfiles
 * Uses the trainee's unique skillTrackId to identify and delete only related records.
 */
export async function deleteTraineeFromFirestore(skillId: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    // 1. Primary document in trainees collection
    const traineeDocRef = doc(db, TRAINEES_COL, skillId);
    batch.delete(traineeDocRef);

    // 2. Training records document
    const trainingDocRef = doc(db, TRAINING_RECORDS_COL, skillId);
    batch.delete(trainingDocRef);

    // 3. Employment records document
    const employmentDocRef = doc(db, EMPLOYMENT_RECORDS_COL, skillId);
    batch.delete(employmentDocRef);

    // 4. Assessments document
    const assessmentDocRef = doc(db, ASSESSMENTS_COL, skillId);
    batch.delete(assessmentDocRef);

    // 5. Skill profiles document
    const profileDocRef = doc(db, SKILL_PROFILES_COL, skillId);
    batch.delete(profileDocRef);

    // 6. Follow-ups documents: Query where skillId == skillId to catch all associated milestones
    try {
      const fuQuery = query(collection(db, FOLLOW_UPS_COL), where('skillId', '==', skillId));
      const fuSnap = await getDocs(fuQuery);
      fuSnap.forEach(d => {
        batch.delete(d.ref);
      });
    } catch (fuErr) {
      console.warn('Notice: Error querying followUps by skillId for deletion:', fuErr);
    }

    // Also delete any follow-up records with known compound key patterns like ST1001_30_Days
    const standardMilestones = [
      '30_Days', '60_Days', '90_Days', '6_Months', '12_Months', '18_Months', '24_Months',
      '30 Days', '60 Days', '90 Days', '6 Months', '12 Months', '18 Months', '24 Months'
    ];
    for (const milestone of standardMilestones) {
      const milestoneKey = milestone.replace(/\s+/g, '_');
      batch.delete(doc(db, FOLLOW_UPS_COL, `${skillId}_${milestoneKey}`));
    }

    // Also check other collections if any records exist by skillId query
    const [extraTrSnap, extraEmpSnap, extraAssSnap, extraSpSnap] = await Promise.all([
      getDocs(query(collection(db, TRAINING_RECORDS_COL), where('skillId', '==', skillId))).catch(() => null),
      getDocs(query(collection(db, EMPLOYMENT_RECORDS_COL), where('skillId', '==', skillId))).catch(() => null),
      getDocs(query(collection(db, ASSESSMENTS_COL), where('skillId', '==', skillId))).catch(() => null),
      getDocs(query(collection(db, SKILL_PROFILES_COL), where('skillId', '==', skillId))).catch(() => null)
    ]);

    extraTrSnap?.forEach(d => batch.delete(d.ref));
    extraEmpSnap?.forEach(d => batch.delete(d.ref));
    extraAssSnap?.forEach(d => batch.delete(d.ref));
    extraSpSnap?.forEach(d => batch.delete(d.ref));

    await batch.commit();
    console.info(`SkillTrack Firestore: Successfully deleted trainee ${skillId} and all associated records.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${TRAINEES_COL}/${skillId}`);
  }
}


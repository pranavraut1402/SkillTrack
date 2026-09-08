export interface FollowUpRecord {
  stage: '30 Days' | '90 Days' | '6 Months' | '12 Months' | '24 Months';
  status: 'Completed' | 'Pending' | 'In Review' | 'Upcoming' | 'Scheduled';
  date?: string;
  dueDate?: string;
  employer?: string;
  verificationMethod?: 'EPFO Synced' | 'Tele-verification' | 'Salary Slip Validated' | 'Employer Confirmed' | 'Self-Reported' | 'In-Person Visit';
  currentWage?: number;
  isEmployed?: boolean;
  workingInTrainedField?: boolean;
  jobSatisfaction?: 'High / Satisfied' | 'Moderate' | 'Low';
  candidateFeedback?: string;
  fieldOfficerNotes?: string;
  supportingDocName?: string;
}

export interface SkillGapItem {
  skill: string;
  level: number; // 0 - 100
  status: 'Proficient' | 'Competent' | 'Gap Identified — Critical' | 'High Demand Gap';
  benchmark: string;
}

export interface RecommendedCourse {
  id: number;
  title: string;
  impact: string;
  duration: string;
  type: string;
  tag: string;
}

export interface Trainee {
  id: string; // e.g. ST1001
  name: string;
  initials: string;
  phone: string;
  maskedUid: string;
  email?: string;
  photoUrl?: string;
  profileImage?: string;
  avatar?: string;
  gender: 'Female' | 'Male' | 'Other';
  age?: number;
  
  // Location
  district: string;
  center: string;
  state: string;

  // Course & Training
  course: string;
  sector: string;
  batch: string;
  trainingProvider: string;
  trainingStatus: 'Certified' | 'In Training' | 'Completed' | 'Dropped';
  trainingStartDate: string;
  trainingEndDate: string;
  attendancePercent: number; // e.g. 92

  // Assessment & Certification
  assessmentScore: number; // e.g. 86
  assessmentGrade: string; // e.g. 'Grade A'
  assessmentStatus: 'Passed' | 'Pending' | 'In Review';
  certificationStatus: 'Completed' | 'Pending' | 'Awarded';
  certificateId?: string;
  certificationDate?: string;

  // Placement & Employment
  placementStatus: 'Successful' | 'Job Seeking' | 'Not Applicable (Enrolled)' | 'Placed';
  employmentStatus: 'Employed' | 'Self-Employed' | 'Apprenticeship' | 'Job Seeking' | 'In Training';
  employer: string;
  jobRole: string;
  employmentType: 'Full Time' | 'Contract' | 'Apprenticeship' | 'Freelance';
  joiningDate?: string;
  startingSalary: number; // e.g. 18000
  currentSalary: number; // e.g. 22000
  retentionDuration: string; // e.g. "6 Months Active", "12 Months Verified"
  employmentVerified: boolean;
  employerPoc?: string;

  // Follow-ups
  currentFollowUpCycle: string; // e.g. "6 Months Completed", "90 Days Pending"
  followUps: FollowUpRecord[];

  // Skills & AI Diagnostics
  skills: string[];
  skillGaps: SkillGapItem[];
  placementRisk: 'Low' | 'Medium' | 'High';
  placementRiskReason?: string;
  retentionRisk: 'Low Risk (Stable)' | 'Medium Risk' | 'High Risk';
  retentionRiskReason?: string;
  recommendedPathway: RecommendedCourse[];
  trajectoryIndex: number; // e.g. 8.4
  tenureStabilityMonths: number; // e.g. 7

  // Audit / Flags
  flaggedForMentorship?: boolean;
  flaggedForAudit?: boolean;
  nonPlacementReason?: string;
  notes?: string;
  registeredDate: string;
}

export type ActivePage = 
  | 'dashboard'
  | 'trainees'
  | 'trainee-profile'
  | 'training'
  | 'assessment'
  | 'placement'
  | 'employment'
  | 'follow-ups'
  | 'analytics'
  | 'ai-insights'
  | 'reports'
  | 'settings';

export interface TraineeSkillGapAnalysis {
  currentSkillAssessment: string;
  identifiedSkillGaps: string[];
  priority: 'High' | 'Medium' | 'Low';
  prioritySkills: string[];
  suggestedUpskillingAreas: string[];
  recommendedCareerDirection: string;
  recommendation: string;
}

export interface TraineePlacementRiskAnalysis {
  riskLevel: 'Low' | 'Medium' | 'High';
  contributingFactors: string[];
  recommendedIntervention: string;
  disclaimer: string;
}

export interface TraineeRetentionRiskAnalysis {
  isApplicable: boolean;
  riskLevel: 'Low' | 'Medium' | 'High' | 'N/A';
  reasons: string[];
  suggestedIntervention: string;
  disclaimer: string;
}

export interface TraineeCareerRecommendations {
  recommendedSkillDevelopment: string[];
  suggestedJobRoles: string[];
  suggestedCertifications: string[];
  suggestedOfficerIntervention: string;
}

export interface TraineeAIAnalysisResult {
  traineeId: string;
  traineeName: string;
  course: string;
  skillGapAnalysis: TraineeSkillGapAnalysis;
  placementRiskAnalysis: TraineePlacementRiskAnalysis;
  retentionRiskAnalysis: TraineeRetentionRiskAnalysis;
  careerRecommendations: TraineeCareerRecommendations;
  whyThisInsight: string[];
  badge: string;
  disclaimer: string;
  analyzedAt: string;
  source: 'gemini-live' | 'cached';
}

export interface CourseOutcomeObservation {
  course: string;
  observation: string;
  metric?: string;
}

export interface ProgramLevelAIInsightsResult {
  commonSkillGaps: string[];
  coursesWithWeakerOutcomes: CourseOutcomeObservation[];
  coursesWithStrongerOutcomes: CourseOutcomeObservation[];
  placementChallenges: string[];
  employmentRetentionPatterns: string[];
  areasRequiringAdditionalTraining: string[];
  suggestedProgramInterventions: string[];
  whyThisInsight: string[];
  badge: string;
  disclaimer: string;
  analyzedAt: string;
  totalCohortAnalyzed: number;
}

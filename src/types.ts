export interface Institution {
  id: string;
  name: string;
  country: string;
  code: string;
  adminEmail: string;
  contact: string;
  status: string;
  registeredAt: string;
}

export interface ApplicationHistoryState {
  stage: string;
  date: string;
  status: string;
  note: string;
}

export interface CriteriaEvaluation {
  facultyAccreditation: string;
  curriculumQuality: string;
  infrastructureAdequacy: string;
  studentSupport: string;
}

export interface AHECApplication {
  id: string;
  institutionId: string;
  institutionName: string;
  country: string;
  programName: string;
  level: string;
  submissionDate: string;
  currentStage: string;
  history: ApplicationHistoryState[];
  status: string;
  readinessScore: number;
  criteriaEvaluation: CriteriaEvaluation;
}

export interface AcademicCredential {
  id: string;
  studentName: string;
  institutionName: string;
  degree: string;
  graduationYear: number;
  country: string;
  digitalSignature: string;
  status: string;
  sealedBy: string;
  dateSealed: string;
}

export interface PortalStats {
  totalInstitutions: number;
  activeApplications: number;
  approvedAccreditations: number;
  verifiedCredentials: number;
  memberNationsCount: number;
}

export interface EvaluationResult {
  readinessScore: number;
  facultyEvaluation: string;
  curriculumStrengths: string[];
  curriculumGaps: string[];
  relevanceRating: string;
  detailedAppraisal: string;
  recommendations: string[];
}

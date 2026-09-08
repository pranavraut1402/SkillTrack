import { GoogleGenAI } from '@google/genai';
import { TraineeAIAnalysisResult, ProgramLevelAIInsightsResult, Trainee } from '../src/types';

/**
 * Lazy initialization of GoogleGenAI client with the server-side GEMINI_API_KEY
 */
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please provide it in AI Studio settings.');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Call Gemini with resilient model fallback (gemini-3.8-flash -> gemini-flash-latest -> gemini-3.1-flash-lite)
 */
async function callGeminiWithFallback(prompt: string, systemInstruction?: string): Promise<string> {
  const ai = getGenAI();
  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || 'You are an expert AI Career Intelligence and Workforce Analytics Assistant for the State Skill Mission Registry. You analyze real government skill registry data and provide structured, factual, non-hallucinated career recommendations and risk evaluations.',
          responseMimeType: 'application/json',
          temperature: 0.2, // low temperature for maximum factual consistency
        }
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`[Gemini Server] Model ${model} returned error:`, err?.status || err?.message || err);
      lastError = err;
      // Continue to next fallback model
    }
  }

  throw lastError || new Error('All Gemini models failed to generate a response.');
}

/**
 * Generates an individualized Career Intelligence & Risk Analysis for a single trainee
 * based strictly on their verified Firestore data.
 */
export async function analyzeTraineeData(trainee: Partial<Trainee>): Promise<TraineeAIAnalysisResult> {
  if (!trainee || !trainee.id || !trainee.name) {
    throw new Error('Invalid trainee record provided. Trainee ID and Name are required.');
  }

  // Extract factual fields available from Firestore
  const inputContext = {
    skillTrackId: trainee.id,
    name: trainee.name,
    course: trainee.course || 'Insufficient data',
    sector: trainee.sector || 'Insufficient data',
    district: trainee.district || 'Insufficient data',
    state: trainee.state || 'Maharashtra',
    trainingCenter: trainee.trainingProvider || trainee.center || 'Insufficient data',
    batch: trainee.batch || 'Insufficient data',
    trainingStatus: trainee.trainingStatus || 'Insufficient data',
    attendancePercent: trainee.attendancePercent !== undefined ? `${trainee.attendancePercent}%` : 'Insufficient data',
    assessmentScore: trainee.assessmentScore !== undefined ? `${trainee.assessmentScore}/100 (${trainee.assessmentGrade || 'Grade unassigned'})` : 'Insufficient data',
    certificationStatus: trainee.certificationStatus || 'Insufficient data',
    certificateId: trainee.certificateId || 'Insufficient data',
    placementStatus: trainee.placementStatus || 'Insufficient data',
    employmentStatus: trainee.employmentStatus || 'Insufficient data',
    employer: trainee.employer || 'Insufficient data',
    jobRole: trainee.jobRole || 'Insufficient data',
    employmentType: trainee.employmentType || 'Insufficient data',
    joiningDate: trainee.joiningDate || 'Insufficient data',
    startingSalary: trainee.startingSalary !== undefined ? `₹${trainee.startingSalary.toLocaleString('en-IN')}/month` : 'Insufficient data',
    currentSalary: trainee.currentSalary !== undefined ? `₹${trainee.currentSalary.toLocaleString('en-IN')}/month` : 'Insufficient data',
    tenureStabilityMonths: trainee.tenureStabilityMonths !== undefined ? `${trainee.tenureStabilityMonths} months` : 'Insufficient data',
    verifiedSkills: trainee.skills && trainee.skills.length > 0 ? trainee.skills : ['Insufficient data'],
    recordedSkillGaps: trainee.skillGaps && trainee.skillGaps.length > 0 ? trainee.skillGaps.map(g => `${g.skill} (Level: ${g.level}%, Status: ${g.status})`) : ['Insufficient data'],
    followUpMilestones: trainee.followUps && trainee.followUps.length > 0 ? trainee.followUps.map(fu => ({
      stage: fu.stage,
      status: fu.status,
      date: fu.date || fu.dueDate || 'Unrecorded',
      recordedWage: fu.currentWage ? `₹${fu.currentWage}` : 'Unrecorded',
      verificationMethod: fu.verificationMethod || 'Unrecorded',
      feedback: fu.candidateFeedback || fu.fieldOfficerNotes || 'None'
    })) : ['Insufficient data']
  };

  const isEmployed = trainee.placementStatus === 'Successful' || trainee.placementStatus === 'Placed' || trainee.employmentStatus === 'Employed';

  const prompt = `
Analyze this candidate's verified record from the SkillTrack State Mission Firestore database:

\`\`\`json
${JSON.stringify(inputContext, null, 2)}
\`\`\`

CRITICAL INSTRUCTIONS:
1. Ground every insight STRICTLY in the provided Firestore data above.
2. DO NOT invent or hallucinate certifications, employers, scores, skills, or employment data that are not present.
3. If any required information is missing or marked "Insufficient data", explicitly state "Insufficient data for this analysis." for that specific aspect.
4. Retention Risk: If candidate is NOT employed (e.g. Job Seeking), set isApplicable=false, riskLevel="N/A", and state that retention tracking applies post-placement.
5. Provide a "Why this insight?" list of 3-5 concrete Firestore data points that directly determined your findings (e.g., "Assessment score: 86%", "Course attendance: 92%", "Current salary: ₹22,000/mo vs starting ₹18,000/mo", "Certification completed").

Respond with this exact JSON structure:
{
  "skillGapAnalysis": {
    "currentSkillAssessment": "Factual assessment of candidate's verified skills vs industry benchmark for their course",
    "identifiedSkillGaps": ["specific gap 1", "specific gap 2"],
    "priority": "High" | "Medium" | "Low",
    "prioritySkills": ["priority skill 1", "priority skill 2"],
    "suggestedUpskillingAreas": ["suggested area 1", "suggested area 2"],
    "recommendedCareerDirection": "Recommended career direction based on course and skills",
    "recommendation": "Concrete next step recommendation"
  },
  "placementRiskAnalysis": {
    "riskLevel": "Low" | "Medium" | "High",
    "contributingFactors": ["factor 1", "factor 2"],
    "recommendedIntervention": "Intervention action for field placement officer",
    "disclaimer": "AI-based prototype risk assessment for decision-support, NOT a guaranteed prediction."
  },
  "retentionRiskAnalysis": {
    "isApplicable": ${isEmployed},
    "riskLevel": "Low" | "Medium" | "High" | "N/A",
    "reasons": ["reason 1", "reason 2"],
    "suggestedIntervention": "Retention intervention recommendation",
    "disclaimer": "Prototype decision-support heuristic, not a scientifically validated prediction model."
  },
  "careerRecommendations": {
    "recommendedSkillDevelopment": ["skill 1", "skill 2"],
    "suggestedJobRoles": ["job role 1", "job role 2"],
    "suggestedCertifications": ["certification 1", "certification 2"],
    "suggestedOfficerIntervention": "Specific recommended intervention for the Directorate Officer"
  },
  "whyThisInsight": [
    "Concrete Firestore metric 1",
    "Concrete Firestore metric 2",
    "Concrete Firestore metric 3"
  ]
}
`;

  const rawJson = await callGeminiWithFallback(prompt);
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    console.error('Failed to parse Gemini JSON response:', rawJson);
    throw new Error('Gemini API returned an unparseable response format.');
  }

  const result: TraineeAIAnalysisResult = {
    traineeId: trainee.id,
    traineeName: trainee.name,
    course: trainee.course || 'Unknown Course',
    skillGapAnalysis: {
      currentSkillAssessment: parsed.skillGapAnalysis?.currentSkillAssessment || 'Assessment completed based on Firestore verified skills.',
      identifiedSkillGaps: Array.isArray(parsed.skillGapAnalysis?.identifiedSkillGaps) ? parsed.skillGapAnalysis.identifiedSkillGaps : ['Advanced Framework Specialization'],
      priority: (['High', 'Medium', 'Low'].includes(parsed.skillGapAnalysis?.priority) ? parsed.skillGapAnalysis.priority : 'Medium') as 'High' | 'Medium' | 'Low',
      prioritySkills: Array.isArray(parsed.skillGapAnalysis?.prioritySkills) ? parsed.skillGapAnalysis.prioritySkills : [],
      suggestedUpskillingAreas: Array.isArray(parsed.skillGapAnalysis?.suggestedUpskillingAreas) ? parsed.skillGapAnalysis.suggestedUpskillingAreas : [],
      recommendedCareerDirection: parsed.skillGapAnalysis?.recommendedCareerDirection || 'Continue specialization in primary sector.',
      recommendation: parsed.skillGapAnalysis?.recommendation || 'Complete recommended higher NSQF-aligned bridge training module.'
    },
    placementRiskAnalysis: {
      riskLevel: (['Low', 'Medium', 'High'].includes(parsed.placementRiskAnalysis?.riskLevel) ? parsed.placementRiskAnalysis.riskLevel : 'Low') as 'Low' | 'Medium' | 'High',
      contributingFactors: Array.isArray(parsed.placementRiskAnalysis?.contributingFactors) ? parsed.placementRiskAnalysis.contributingFactors : ['Assessment score and attendance adherence'],
      recommendedIntervention: parsed.placementRiskAnalysis?.recommendedIntervention || 'Continue scheduled monitoring.',
      disclaimer: 'AI-based prototype risk assessment and NOT a guaranteed prediction.'
    },
    retentionRiskAnalysis: {
      isApplicable: Boolean(parsed.retentionRiskAnalysis?.isApplicable ?? isEmployed),
      riskLevel: (['Low', 'Medium', 'High', 'N/A'].includes(parsed.retentionRiskAnalysis?.riskLevel) ? parsed.retentionRiskAnalysis.riskLevel : (isEmployed ? 'Low' : 'N/A')) as 'Low' | 'Medium' | 'High' | 'N/A',
      reasons: Array.isArray(parsed.retentionRiskAnalysis?.reasons) ? parsed.retentionRiskAnalysis.reasons : ['Wage progression and follow-up status verified.'],
      suggestedIntervention: parsed.retentionRiskAnalysis?.suggestedIntervention || (isEmployed ? 'Maintain quarterly follow-up audit.' : 'Intervention pending post-placement onboarding.'),
      disclaimer: 'Prototype decision-support heuristic, not a scientifically validated prediction model.'
    },
    careerRecommendations: {
      recommendedSkillDevelopment: Array.isArray(parsed.careerRecommendations?.recommendedSkillDevelopment) ? parsed.careerRecommendations.recommendedSkillDevelopment : [],
      suggestedJobRoles: Array.isArray(parsed.careerRecommendations?.suggestedJobRoles) ? parsed.careerRecommendations.suggestedJobRoles : [],
      suggestedCertifications: Array.isArray(parsed.careerRecommendations?.suggestedCertifications) ? parsed.careerRecommendations.suggestedCertifications : [],
      suggestedOfficerIntervention: parsed.careerRecommendations?.suggestedOfficerIntervention || 'Schedule review with training provider.'
    },
    whyThisInsight: Array.isArray(parsed.whyThisInsight) && parsed.whyThisInsight.length > 0 ? parsed.whyThisInsight : [
      `Attendance: ${trainee.attendancePercent || 0}%`,
      `Assessment Score: ${trainee.assessmentScore || 0}%`,
      `Placement Status: ${trainee.placementStatus || 'Unrecorded'}`,
      `Current Salary: ₹${(trainee.currentSalary || 0).toLocaleString('en-IN')}/mo`
    ],
    badge: 'Prototype AI Analysis',
    disclaimer: 'AI-generated insights are decision-support recommendations for the hackathon prototype and should be validated by authorized officers.',
    analyzedAt: new Date().toISOString(),
    source: 'gemini-live'
  };

  return result;
}

/**
 * Generates program-level AI insights aggregated across multiple trainees from Firestore.
 */
export async function analyzeProgramLevelData(trainees: Trainee[]): Promise<ProgramLevelAIInsightsResult> {
  if (!trainees || trainees.length === 0) {
    throw new Error('No trainee records provided for program-level analysis.');
  }

  // Calculate actual factual statistics from Firestore data
  const total = trainees.length;
  const placedCount = trainees.filter(t => t.placementStatus === 'Successful' || t.placementStatus === 'Placed' || t.employmentStatus === 'Employed').length;
  const placementRate = Math.round((placedCount / total) * 100);

  const certifiedCount = trainees.filter(t => t.certificationStatus === 'Completed' || t.certificationStatus === 'Awarded').length;
  const certificationRate = Math.round((certifiedCount / total) * 100);

  const avgAttendance = Math.round(trainees.reduce((acc, t) => acc + (t.attendancePercent || 0), 0) / total);
  const avgAssessment = Math.round(trainees.reduce((acc, t) => acc + (t.assessmentScore || 0), 0) / total);

  // Group by course
  const courseStats: Record<string, { total: number; placed: number; avgScore: number; avgAttendance: number; avgSalary: number }> = {};
  for (const t of trainees) {
    const c = t.course || 'General Skill';
    if (!courseStats[c]) {
      courseStats[c] = { total: 0, placed: 0, avgScore: 0, avgAttendance: 0, avgSalary: 0 };
    }
    courseStats[c].total += 1;
    if (t.placementStatus === 'Successful' || t.placementStatus === 'Placed' || t.employmentStatus === 'Employed') {
      courseStats[c].placed += 1;
    }
    courseStats[c].avgScore += t.assessmentScore || 0;
    courseStats[c].avgAttendance += t.attendancePercent || 0;
    courseStats[c].avgSalary += t.currentSalary || 0;
  }

  const courseBreakdown = Object.entries(courseStats).map(([course, stats]) => ({
    course,
    enrolled: stats.total,
    placed: stats.placed,
    placementRate: `${Math.round((stats.placed / stats.total) * 100)}%`,
    avgAssessment: `${Math.round(stats.avgScore / stats.total)}%`,
    avgAttendance: `${Math.round(stats.avgAttendance / stats.total)}%`,
    avgCurrentWage: `₹${Math.round(stats.avgSalary / stats.total).toLocaleString('en-IN')}`
  }));

  // Aggregated all recorded skills and skill gaps
  const allSkills = trainees.flatMap(t => t.skills || []);
  const allSkillGaps = trainees.flatMap(t => (t.skillGaps || []).map(g => g.skill));

  const prompt = `
Analyze the following aggregated cohort metrics calculated directly from verified Firestore database records:

COHORT OVERVIEW:
- Total Trainees: ${total}
- Placement Rate: ${placementRate}% (${placedCount}/${total} placed)
- Certification Rate: ${certificationRate}%
- Average Attendance: ${avgAttendance}%
- Average Assessment Score: ${avgAssessment}%

COURSE BREAKDOWN:
\`\`\`json
${JSON.stringify(courseBreakdown, null, 2)}
\`\`\`

SAMPLE RECORDED SKILLS IN REGISTRY:
${Array.from(new Set(allSkills)).slice(0, 15).join(', ')}

SAMPLE IDENTIFIED GAPS IN REGISTRY:
${Array.from(new Set(allSkillGaps)).slice(0, 15).join(', ')}

CRITICAL REQUIREMENTS:
- Rely strictly on the aggregated figures above. Do not fabricate statistics or claim unrecorded numbers.
- Identify common skill gaps observed in the data.
- Identify courses with weaker outcomes (lower placement or lower scores) vs courses with stronger outcomes.
- Highlight key placement challenges and retention patterns.
- Recommend program-level interventions for the State Mission Directorate.
- Include a "Why this insight?" section citing the exact calculated numbers (e.g. "${placementRate}% overall placement across ${total} candidates", course-specific metrics).

Respond with this exact JSON structure:
{
  "commonSkillGaps": ["gap 1", "gap 2", "gap 3"],
  "coursesWithWeakerOutcomes": [
    { "course": "Course Name", "observation": "Analysis based on actual metric", "metric": "Key Metric" }
  ],
  "coursesWithStrongerOutcomes": [
    { "course": "Course Name", "observation": "Analysis based on actual metric", "metric": "Key Metric" }
  ],
  "placementChallenges": ["challenge 1", "challenge 2"],
  "employmentRetentionPatterns": ["pattern 1", "pattern 2"],
  "areasRequiringAdditionalTraining": ["area 1", "area 2"],
  "suggestedProgramInterventions": ["intervention 1", "intervention 2", "intervention 3"],
  "whyThisInsight": [
    "Citing actual calculated metric 1",
    "Citing actual calculated metric 2",
    "Citing actual calculated metric 3"
  ]
}
`;

  const rawJson = await callGeminiWithFallback(prompt);
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    console.error('Failed to parse Gemini JSON response for program insights:', rawJson);
    throw new Error('Gemini API returned an unparseable response format for program insights.');
  }

  const result: ProgramLevelAIInsightsResult = {
    commonSkillGaps: Array.isArray(parsed.commonSkillGaps) ? parsed.commonSkillGaps : ['Cloud Deployment', 'Advanced Automation'],
    coursesWithWeakerOutcomes: Array.isArray(parsed.coursesWithWeakerOutcomes) ? parsed.coursesWithWeakerOutcomes : [],
    coursesWithStrongerOutcomes: Array.isArray(parsed.coursesWithStrongerOutcomes) ? parsed.coursesWithStrongerOutcomes : [],
    placementChallenges: Array.isArray(parsed.placementChallenges) ? parsed.placementChallenges : ['Stagnant entry wage bands in semi-urban centers'],
    employmentRetentionPatterns: Array.isArray(parsed.employmentRetentionPatterns) ? parsed.employmentRetentionPatterns : ['Higher retention linked with scheduled wage increments'],
    areasRequiringAdditionalTraining: Array.isArray(parsed.areasRequiringAdditionalTraining) ? parsed.areasRequiringAdditionalTraining : ['Hands-on laboratory simulations'],
    suggestedProgramInterventions: Array.isArray(parsed.suggestedProgramInterventions) ? parsed.suggestedProgramInterventions : ['Implement State Upskilling Vouchers for candidates with 6+ months tenure'],
    whyThisInsight: Array.isArray(parsed.whyThisInsight) && parsed.whyThisInsight.length > 0 ? parsed.whyThisInsight : [
      `Cohort size: ${total} registered candidates analyzed from Firestore`,
      `Overall placement rate: ${placementRate}%`,
      `Average attendance: ${avgAttendance}%, Average assessment: ${avgAssessment}%`
    ],
    badge: 'Prototype AI Analysis',
    disclaimer: 'AI-generated insights are decision-support recommendations for the hackathon prototype and should be validated by authorized officers.',
    analyzedAt: new Date().toISOString(),
    totalCohortAnalyzed: total
  };

  return result;
}

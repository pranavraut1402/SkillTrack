import { Trainee, TraineeAIAnalysisResult, ProgramLevelAIInsightsResult } from '../types';

const TRAINEE_AI_CACHE_KEY_PREFIX = 'skilltrack_ai_trainee_';
const PROGRAM_AI_CACHE_KEY = 'skilltrack_ai_program_insights';

/**
 * Fetch individual trainee AI skill gap, placement risk, and retention analysis
 * from the secure server-side Gemini API.
 */
export async function requestTraineeAIAnalysis(
  trainee: Trainee,
  forceRefresh: boolean = false
): Promise<TraineeAIAnalysisResult> {
  const cacheKey = `${TRAINEE_AI_CACHE_KEY_PREFIX}${trainee.id}`;

  // Check client cache if not forced refresh
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed: TraineeAIAnalysisResult = JSON.parse(cached);
        // Ensure cache matches current trainee ID
        if (parsed.traineeId === trainee.id) {
          return {
            ...parsed,
            source: 'cached'
          };
        }
      }
    } catch (e) {
      console.warn('Could not read trainee AI cache:', e);
    }
  }

  // Secure server-side request
  const response = await fetch('/api/ai/analyze-trainee', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ trainee })
  });

  if (!response.ok) {
    let errorDetail = 'Failed to generate AI analysis.';
    try {
      const errJson = await response.json();
      if (errJson && errJson.error) {
        errorDetail = errJson.error;
      }
    } catch {
      errorDetail = `Server responded with status ${response.status} (${response.statusText})`;
    }
    throw new Error(errorDetail);
  }

  const result: TraineeAIAnalysisResult = await response.json();

  // Save to cache
  try {
    localStorage.setItem(cacheKey, JSON.stringify(result));
  } catch (e) {
    console.warn('Failed to save trainee AI result to localStorage:', e);
  }

  return result;
}

/**
 * Fetch aggregated program-level AI insights from the secure server-side Gemini API.
 */
export async function requestProgramLevelAIInsights(
  trainees: Trainee[],
  forceRefresh: boolean = false
): Promise<ProgramLevelAIInsightsResult> {
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(PROGRAM_AI_CACHE_KEY);
      if (cached) {
        const parsed: ProgramLevelAIInsightsResult = JSON.parse(cached);
        if (parsed.totalCohortAnalyzed === trainees.length) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read program AI cache:', e);
    }
  }

  const response = await fetch('/api/ai/program-insights', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ trainees })
  });

  if (!response.ok) {
    let errorDetail = 'Failed to generate program-level AI insights.';
    try {
      const errJson = await response.json();
      if (errJson && errJson.error) {
        errorDetail = errJson.error;
      }
    } catch {
      errorDetail = `Server responded with status ${response.status} (${response.statusText})`;
    }
    throw new Error(errorDetail);
  }

  const result: ProgramLevelAIInsightsResult = await response.json();

  try {
    localStorage.setItem(PROGRAM_AI_CACHE_KEY, JSON.stringify(result));
  } catch (e) {
    console.warn('Failed to save program AI result to localStorage:', e);
  }

  return result;
}

/**
 * Invalidate cached AI analysis for a specific trainee (e.g. after editing/updating records)
 */
export function invalidateTraineeAICache(traineeId: string): void {
  try {
    localStorage.removeItem(`${TRAINEE_AI_CACHE_KEY_PREFIX}${traineeId}`);
  } catch (e) {
    console.warn('Failed to invalidate trainee AI cache:', e);
  }
}

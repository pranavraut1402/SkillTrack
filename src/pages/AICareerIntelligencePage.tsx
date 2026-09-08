import React, { useState, useEffect } from 'react';
import { useTrainees } from '../context/TraineeContext';
import { BackButton } from '../components/BackButton';
import { getTraineeAvatar } from '../utils/avatarHelper';
import { requestTraineeAIAnalysis, requestProgramLevelAIInsights } from '../services/aiService';
import { TraineeAIAnalysisResult, ProgramLevelAIInsightsResult, Trainee } from '../types';

interface TraineeRiskAssessment {
  id: string;
  name: string;
  course: string;
  district: string;
  employer: string;
  currentSalary: number;
  startingSalary: number;
  attendancePercent: number;
  assessmentScore: number;
  riskLevel: 'High' | 'Medium' | 'Low / Stable';
  riskScore: number;
  primaryRiskFactor: string;
  recommendedAction: string;
}

export const AICareerIntelligencePage: React.FC = () => {
  const { trainees, selectedTraineeId, setSelectedTraineeId, openTraineeProfile, previousPage, setActivePage, showToast } = useTrainees();

  // Selected candidate state for individual deep analysis
  const activeTraineeId = selectedTraineeId || (trainees.length > 0 ? trainees[0].id : '');
  const activeTrainee = trainees.find(t => t.id === activeTraineeId) || trainees[0];

  // Individual AI analysis state
  const [traineeAIResult, setTraineeAIResult] = useState<TraineeAIAnalysisResult | null>(null);
  const [isAnalyzingTrainee, setIsAnalyzingTrainee] = useState(false);
  const [traineeAIError, setTraineeAIError] = useState<string | null>(null);

  // Program-level AI insights state
  const [programAIResult, setProgramAIResult] = useState<ProgramLevelAIInsightsResult | null>(null);
  const [isScanningProgram, setIsScanningProgram] = useState(false);
  const [programAIError, setProgramAIError] = useState<string | null>(null);
  const [showProgramInsightsModal, setShowProgramInsightsModal] = useState(false);

  // UI filters & deterministic rules
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low / Stable'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Load cached AI analysis on trainee switch or mount
  useEffect(() => {
    if (!activeTrainee) return;
    setTraineeAIError(null);

    // Try reading cached analysis
    try {
      const cached = localStorage.getItem(`skilltrack_ai_trainee_${activeTrainee.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.traineeId === activeTrainee.id) {
          setTraineeAIResult(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setTraineeAIResult(null);
  }, [activeTrainee?.id]);

  // Handler to run AI analysis for the selected individual trainee
  const handleRunTraineeAnalysis = async (t: Trainee = activeTrainee, force: boolean = true) => {
    if (!t) return;
    setIsAnalyzingTrainee(true);
    setTraineeAIError(null);

    try {
      const result = await requestTraineeAIAnalysis(t, force);
      setTraineeAIResult(result);
      showToast(`AI analysis complete for ${t.name} (${t.id})`);
    } catch (err: any) {
      console.error('Trainee AI analysis failed:', err);
      const errMsg = err?.message || 'Failed to generate AI analysis.';
      setTraineeAIError(errMsg);
      setTraineeAIResult(null);
      showToast(`AI Analysis Failed: ${errMsg}`, 'error');
    } finally {
      setIsAnalyzingTrainee(false);
    }
  };

  // Handler to run program-level AI analysis across the entire Firestore cohort
  const handleRunProgramAnalysis = async (force: boolean = true) => {
    if (!trainees || trainees.length === 0) {
      showToast('No trainee records in Firestore to analyze.', 'error');
      return;
    }
    setIsScanningProgram(true);
    setProgramAIError(null);

    try {
      const result = await requestProgramLevelAIInsights(trainees, force);
      setProgramAIResult(result);
      setShowProgramInsightsModal(true);
      showToast(`Program-level AI analysis complete for ${trainees.length} candidates.`);
    } catch (err: any) {
      console.error('Program AI analysis failed:', err);
      const errMsg = err?.message || 'Failed to generate program-level insights.';
      setProgramAIError(errMsg);
      showToast(`Program AI Scan Failed: ${errMsg}`, 'error');
    } finally {
      setIsScanningProgram(false);
    }
  };

  // Compute rule-based baseline risk assessment for all trainees in dataset
  const assessTrainee = (t: Trainee): TraineeRiskAssessment => {
    let score = 20;
    const reasons: string[] = [];
    let action = 'Maintain standard quarterly audit follow-up.';

    if (t.attendancePercent < 85) {
      score += 35;
      reasons.push(`Low course attendance (${t.attendancePercent}%) during certification`);
      action = 'Assign field mentor for workplace adjustment counseling';
    }

    if (t.currentSalary <= t.startingSalary) {
      score += 30;
      reasons.push('No wage increment recorded since initial placement');
      action = 'Review employer wage progression commitment and offer upskilling voucher';
    }

    if (t.assessmentScore < 75) {
      score += 25;
      reasons.push(`Sub-optimal technical assessment score (${t.assessmentScore}/100)`);
      action = 'Enroll in specialized bridge upskilling track';
    }

    if (t.employmentStatus === 'Job Seeking' || t.employmentStatus === 'Apprenticeship') {
      score += 20;
      reasons.push('Temporary or apprentice contract awaiting permanent absorption');
      action = 'Coordinate with placement partner for full-time conversion';
    }

    let riskLevel: 'High' | 'Medium' | 'Low / Stable' = 'Low / Stable';
    if (score >= 60) {
      riskLevel = 'High';
    } else if (score >= 40) {
      riskLevel = 'Medium';
    }

    const primaryReason = reasons.length > 0 
      ? reasons.join('; ') 
      : 'Solid employment stability, active retention milestone verified with positive salary growth.';

    return {
      id: t.id,
      name: t.name,
      course: t.course,
      district: t.district,
      employer: t.employer,
      currentSalary: t.currentSalary,
      startingSalary: t.startingSalary,
      attendancePercent: t.attendancePercent,
      assessmentScore: t.assessmentScore,
      riskLevel,
      riskScore: score,
      primaryRiskFactor: primaryReason,
      recommendedAction: action
    };
  };

  const assessedCohort = trainees.map(assessTrainee);
  const highRiskCount = assessedCohort.filter(c => c.riskLevel === 'High').length;
  const mediumRiskCount = assessedCohort.filter(c => c.riskLevel === 'Medium').length;
  const retentionForecast = Math.round(
    ((assessedCohort.length - highRiskCount) / (assessedCohort.length || 1)) * 100
  );

  const filteredCohort = assessedCohort.filter(item => {
    if (selectedRiskFilter !== 'All' && item.riskLevel !== selectedRiskFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.course.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleNotifyOfficers = () => {
    const count = highRiskCount + mediumRiskCount;
    showToast(`Dispatched proactive intervention alerts for ${count} flagged candidates to district officers.`);
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Not yet analyzed';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Header Deck */}
      <div className="px-space-24 py-space-20 bg-surface-container-lowest border-b border-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <BackButton
              label="Back to Dashboard"
              to="dashboard"
              id="ai-insights-back-dashboard-btn"
            />
            {previousPage === 'trainee-profile' && activeTrainee && (
              <BackButton
                label={`Back to ${activeTrainee.name}'s Profile`}
                onClick={() => openTraineeProfile(activeTrainee.id)}
                id="ai-insights-back-profile-btn"
              />
            )}
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-label-sm uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-base text-primary">auto_awesome</span>
            <span>Predictive Modeling &amp; Career Intelligence Engine</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Prototype AI Analysis
            </span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">
            AI Career Intelligence &amp; Retention Predictor
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Server-side Gemini AI analytics connected to live Firestore registry data for individual skill gaps, placement risks, and program-level cohort insights.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            disabled={isScanningProgram}
            onClick={() => handleRunProgramAnalysis(true)}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-base ${isScanningProgram ? 'animate-spin' : ''}`}>
              {isScanningProgram ? 'sync' : 'psychology'}
            </span>
            <span>
              {isScanningProgram ? 'Analyzing Cohort...' : programAIResult ? 'Re-run Program Insights' : 'Run Program-Level AI Insights'}
            </span>
          </button>

          {programAIResult && (
            <button
              type="button"
              onClick={() => setShowProgramInsightsModal(true)}
              className="px-3 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-primary">analytics</span>
              <span>View Cohort Insights</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-space-24 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        {/* Prototype AI Disclaimer banner */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-3 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg shrink-0">info</span>
            <span>
              <strong>Prototype AI Analysis:</strong> AI-generated insights are decision-support recommendations for the hackathon prototype and should be validated by authorized officers. Real-time Firestore records are used as the single source of truth.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[11px] shrink-0">
            Gemini Flash
          </span>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">Flagged Attrition Risk</span>
              <span className="material-symbols-outlined text-amber-600 text-lg">warning</span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-amber-700">{highRiskCount}</div>
              <p className="text-xs text-on-surface-variant mt-1">{highRiskCount} candidates needing immediate intervention</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">Predicted 12-Mo Retention</span>
              <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-emerald-700">{retentionForecast}%</div>
              <p className="text-xs text-secondary font-semibold mt-1">Calculated across {trainees.length} Firestore trainees</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">Live Cohort Assessed</span>
              <span className="material-symbols-outlined text-primary text-lg">groups</span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-primary">{trainees.length}</div>
              <p className="text-xs text-on-surface-variant mt-1">Verified registry documents</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">AI Engine Status</span>
              <span className="material-symbols-outlined text-emerald-600 text-lg">bolt</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-emerald-700">Online</div>
              <p className="text-xs text-on-surface-variant mt-1">Server-side Gemini 3.8 / Flash</p>
            </div>
          </div>
        </div>

        {/* Main Intelligence Grid: Left = Cohort List & Trainee Selector; Right = Deep Individual AI Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Identified Risk Cohort & Candidate Selector */}
          <div className="lg:col-span-6 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-container">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Trainee Cohort &amp; Intervention Queue</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Select any candidate from Firestore to execute individual Gemini AI analysis
                </p>
              </div>
              <button
                type="button"
                onClick={handleNotifyOfficers}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container text-xs font-semibold text-on-surface cursor-pointer self-start sm:self-auto"
              >
                Notify Field Officers
              </button>
            </div>

            {/* Trainee Quick Selector Dropdown & Search */}
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-sm">search</span>
                <input
                  type="text"
                  placeholder="Search by name, ID (e.g. ST1001), course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Direct Dropdown for Fast Switching */}
              <div className="sm:w-56 shrink-0">
                <select
                  value={activeTrainee?.id || ''}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedTraineeId(id);
                  }}
                  className="w-full py-2 px-3 text-xs rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {trainees.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.id} — {t.name} ({t.course})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Risk Filter Tabs */}
            <div className="flex items-center gap-2 mt-4 pb-2 overflow-x-auto">
              {(['All', 'High', 'Medium', 'Low / Stable'] as const).map(risk => (
                <button
                  key={risk}
                  type="button"
                  onClick={() => setSelectedRiskFilter(risk)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    selectedRiskFilter === risk
                      ? 'bg-primary text-white'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {risk} {risk === 'High' ? `(${highRiskCount})` : risk === 'Medium' ? `(${mediumRiskCount})` : ''}
                </button>
              ))}
            </div>

            {/* Cohort Candidates List */}
            <div className="mt-4 flex flex-col gap-3 max-h-[700px] overflow-y-auto pr-1">
              {filteredCohort.map(item => {
                const isSelected = activeTrainee?.id === item.id;
                const traineeObj = trainees.find(t => t.id === item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedTraineeId(item.id)}
                    className={`p-4 rounded-xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/30'
                        : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/30'
                    } flex flex-col gap-2.5`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center shrink-0 ring-1 ring-outline-variant/30 mt-0.5">
                          <img
                            src={getTraineeAvatar(traineeObj || item)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-on-surface text-sm">{item.name}</span>
                            <span className="text-xs font-mono text-outline font-semibold">{item.id}</span>
                            <span className="text-xs text-on-surface-variant">• {item.district}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                item.riskLevel === 'High'
                                  ? 'bg-error-container text-on-error-container'
                                  : item.riskLevel === 'Medium'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-secondary-container text-on-secondary-container'
                              }`}
                            >
                              {item.riskLevel} Risk ({item.riskScore} pts)
                            </span>
                          </div>

                          <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-2 flex-wrap">
                            <span><strong>Course:</strong> {item.course}</span>
                            <span>•</span>
                            <span><strong>Wage:</strong> ₹{item.currentSalary.toLocaleString('en-IN')}/mo</span>
                            <span>•</span>
                            <span><strong>Attendance:</strong> {item.attendancePercent}%</span>
                          </div>

                          <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                            <strong>Factor:</strong> {item.primaryRiskFactor}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTraineeId(item.id);
                            if (traineeObj) handleRunTraineeAnalysis(traineeObj, true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">auto_awesome</span>
                          <span>Analyze</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTraineeProfile(item.id);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors cursor-pointer"
                        >
                          Dossier
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredCohort.length === 0 && (
                <div className="p-8 text-center text-xs text-on-surface-variant">
                  No candidates match the specified filter or search query.
                </div>
              )}
            </div>
          </div>

          {/* Right: Individual Trainee Deep AI Career Intelligence */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {activeTrainee ? (
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col">
                {/* Active Candidate Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-container">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-container text-on-primary font-bold text-sm flex items-center justify-center shrink-0 ring-2 ring-primary/20">
                      <img
                        src={getTraineeAvatar(activeTrainee)}
                        alt={activeTrainee.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-on-surface">{activeTrainee.name}</h3>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-container-high text-primary">
                          {activeTrainee.id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          Prototype AI Analysis
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {activeTrainee.course} • {activeTrainee.district} • {activeTrainee.employmentStatus}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isAnalyzingTrainee}
                      onClick={() => handleRunTraineeAnalysis(activeTrainee, true)}
                      className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-sm ${isAnalyzingTrainee ? 'animate-spin' : ''}`}>
                        {isAnalyzingTrainee ? 'sync' : 'psychology'}
                      </span>
                      <span>
                        {isAnalyzingTrainee
                          ? 'Generating Analysis...'
                          : traineeAIResult
                          ? 'Re-run Analysis'
                          : 'Run AI Analysis'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Analysis Timestamp or Status */}
                <div className="py-2.5 px-3 bg-surface-container-low rounded-lg mt-3 flex items-center justify-between text-xs text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-primary">schedule</span>
                    <span>
                      {traineeAIResult
                        ? `Last analyzed: ${formatDateTime(traineeAIResult.analyzedAt)}`
                        : 'Ready for Gemini AI evaluation'}
                    </span>
                    {traineeAIResult && (
                      <span className="text-[10px] font-semibold text-outline">
                        ({traineeAIResult.source === 'cached' ? 'Cached Result' : 'Live Gemini Model'})
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openTraineeProfile(activeTrainee.id)}
                    className="text-primary hover:underline text-xs font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Full Profile</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>

                {/* Loading State */}
                {isAnalyzingTrainee && (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <div className="text-sm font-bold text-on-surface">
                      Connecting to Gemini AI Engine...
                    </div>
                    <p className="text-xs text-on-surface-variant max-w-md">
                      Analyzing {activeTrainee.name}’s verified Firestore records: attendance ({activeTrainee.attendancePercent}%), assessment score ({activeTrainee.assessmentScore}%), certification status, employment logs, and skill registry.
                    </p>
                  </div>
                )}

                {/* Error State: Show clear real error message without fake AI output */}
                {!isAnalyzingTrainee && traineeAIError && (
                  <div className="mt-4 p-4 rounded-xl bg-error-container/40 border border-error/30 text-on-error-container">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-error text-xl shrink-0">error</span>
                      <div className="flex-1">
                        <div className="text-sm font-bold">AI Analysis Could Not Complete</div>
                        <p className="text-xs mt-1 leading-relaxed">{traineeAIError}</p>
                        <button
                          type="button"
                          onClick={() => handleRunTraineeAnalysis(activeTrainee, true)}
                          className="mt-3 px-3 py-1.5 rounded-lg bg-error text-white text-xs font-semibold hover:bg-error/90 cursor-pointer"
                        >
                          Retry Analysis
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Initial Unanalyzed Prompt */}
                {!isAnalyzingTrainee && !traineeAIError && !traineeAIResult && (
                  <div className="py-10 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">insights</span>
                    </div>
                    <div className="text-sm font-bold text-on-surface">
                      Ready to Analyze {activeTrainee.name}
                    </div>
                    <p className="text-xs text-on-surface-variant max-w-sm">
                      Click &ldquo;Run AI Analysis&rdquo; to send {activeTrainee.name}&rsquo;s verified Firestore data to Gemini for real-time skill gap analysis, placement risk scoring, and career pathway recommendations.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRunTraineeAnalysis(activeTrainee, true)}
                      className="mt-1 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold shadow-sm hover:bg-primary-container cursor-pointer flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
                      <span>Run AI Analysis Now</span>
                    </button>
                  </div>
                )}

                {/* Active AI Result Sections */}
                {!isAnalyzingTrainee && !traineeAIError && traineeAIResult && (
                  <div className="mt-4 flex flex-col gap-4 max-h-[700px] overflow-y-auto pr-1">
                    {/* 1. Skill Gap Analysis */}
                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-base">psychology</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                            1. Individual Skill Gap Analysis
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            traineeAIResult.skillGapAnalysis.priority === 'High'
                              ? 'bg-rose-100 text-rose-800'
                              : traineeAIResult.skillGapAnalysis.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          Priority: {traineeAIResult.skillGapAnalysis.priority}
                        </span>
                      </div>

                      <p className="text-xs text-on-surface leading-relaxed">
                        {traineeAIResult.skillGapAnalysis.currentSkillAssessment}
                      </p>

                      {/* Identified Skill Gaps */}
                      <div className="mt-3">
                        <div className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                          Identified Skill Gaps
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {traineeAIResult.skillGapAnalysis.identifiedSkillGaps.map((gap, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-md bg-surface-container-high text-xs text-on-surface font-medium flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-xs text-amber-600">warning</span>
                              {gap}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Suggested Upskilling & Practical Recommendation */}
                      <div className="mt-3 pt-3 border-t border-outline-variant/10 text-xs">
                        <div className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1">
                          Recommended Career Direction &amp; Action
                        </div>
                        <p className="text-xs text-on-surface-variant font-medium">
                          <strong>Direction:</strong> {traineeAIResult.skillGapAnalysis.recommendedCareerDirection}
                        </p>
                        <p className="text-xs text-primary font-semibold mt-1 flex items-start gap-1">
                          <span className="material-symbols-outlined text-xs mt-0.5 shrink-0">recommend</span>
                          <span><strong>Recommendation:</strong> {traineeAIResult.skillGapAnalysis.recommendation}</span>
                        </p>
                      </div>
                    </div>

                    {/* 2. Placement Risk Analysis */}
                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-base">work</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                            2. Placement Risk Analysis
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                            traineeAIResult.placementRiskAnalysis.riskLevel === 'High'
                              ? 'bg-rose-100 text-rose-800'
                              : traineeAIResult.placementRiskAnalysis.riskLevel === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {traineeAIResult.placementRiskAnalysis.riskLevel} Risk
                        </span>
                      </div>

                      <div className="text-xs text-on-surface-variant">
                        <div className="font-semibold text-on-surface mb-1">Contributing Factors:</div>
                        <ul className="list-disc list-inside space-y-0.5 ml-1">
                          {traineeAIResult.placementRiskAnalysis.contributingFactors.map((factor, idx) => (
                            <li key={idx}>{factor}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-2.5 p-2.5 rounded-lg bg-surface-container-high/60 text-xs text-on-surface">
                        <strong>Recommended Intervention:</strong>{' '}
                        {traineeAIResult.placementRiskAnalysis.recommendedIntervention}
                      </div>

                      <p className="text-[10px] text-outline mt-2 italic">
                        Notice: {traineeAIResult.placementRiskAnalysis.disclaimer}
                      </p>
                    </div>

                    {/* 3. Attrition / Retention Risk Analysis */}
                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-amber-600 text-base">trending_down</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                            3. Retention &amp; Attrition Risk
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                            traineeAIResult.retentionRiskAnalysis.riskLevel === 'High'
                              ? 'bg-rose-100 text-rose-800'
                              : traineeAIResult.retentionRiskAnalysis.riskLevel === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : traineeAIResult.retentionRiskAnalysis.riskLevel === 'N/A'
                              ? 'bg-surface-container-high text-on-surface-variant'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {traineeAIResult.retentionRiskAnalysis.riskLevel === 'N/A'
                            ? 'N/A (Job Seeking)'
                            : `${traineeAIResult.retentionRiskAnalysis.riskLevel} Retention Risk`}
                        </span>
                      </div>

                      <div className="text-xs text-on-surface-variant">
                        <div className="font-semibold text-on-surface mb-1">Retention Dynamics &amp; Factors:</div>
                        <ul className="list-disc list-inside space-y-0.5 ml-1">
                          {traineeAIResult.retentionRiskAnalysis.reasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-2.5 p-2.5 rounded-lg bg-surface-container-high/60 text-xs text-on-surface">
                        <strong>Retention Intervention:</strong>{' '}
                        {traineeAIResult.retentionRiskAnalysis.suggestedIntervention}
                      </div>

                      <p className="text-[10px] text-outline mt-2 italic">
                        Notice: {traineeAIResult.retentionRiskAnalysis.disclaimer}
                      </p>
                    </div>

                    {/* 4. Practical Career Recommendations */}
                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-base">explore</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                          4. Practical Career Recommendations
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-xs">
                        <div className="bg-surface-container-high/50 p-2.5 rounded-lg">
                          <span className="font-bold text-on-surface block mb-1">Suggested Job Roles:</span>
                          <div className="flex flex-wrap gap-1">
                            {traineeAIResult.careerRecommendations.suggestedJobRoles.map((role, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-surface text-on-surface text-[11px] font-medium">
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-surface-container-high/50 p-2.5 rounded-lg">
                          <span className="font-bold text-on-surface block mb-1">Target Certifications:</span>
                          <div className="flex flex-wrap gap-1">
                            {traineeAIResult.careerRecommendations.suggestedCertifications.map((cert, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-surface text-on-surface text-[11px] font-medium">
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-on-surface">
                        <strong className="text-primary">Officer Action:</strong>{' '}
                        {traineeAIResult.careerRecommendations.suggestedOfficerIntervention}
                      </div>
                    </div>

                    {/* 5. Why this insight? */}
                    <div className="p-4 rounded-xl bg-primary-container/15 border border-primary/25">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-base">fact_check</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                          Why this insight? (Firestore Grounding)
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mb-2">
                        The following concrete records from {activeTrainee.name}’s verified profile directly influenced this AI output:
                      </p>
                      <ul className="space-y-1 text-xs text-on-surface">
                        {traineeAIResult.whyThisInsight.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-xs text-primary mt-0.5 shrink-0">check_circle</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer Disclaimer */}
                    <div className="p-3 bg-surface-container-high rounded-lg text-[11px] text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base shrink-0">verified_user</span>
                      <span>{traineeAIResult.disclaimer}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                Please select a trainee from the left queue to view or generate AI intelligence.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Program-Level AI Insights Modal */}
      {showProgramInsightsModal && programAIResult && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/30 flex flex-col">
            <div className="p-6 border-b border-surface-container flex items-center justify-between sticky top-0 bg-surface-container-lowest z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-xl">analytics</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    Prototype AI Analysis
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Cohort Size: {programAIResult.totalCohortAnalyzed} Candidates
                  </span>
                </div>
                <h2 className="text-xl font-bold text-on-surface">
                  Program-Level AI Cohort Insights &amp; Interventions
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowProgramInsightsModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5 text-xs text-on-surface">
              {/* Why this insight banner */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="font-bold text-sm text-primary mb-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">tune</span>
                  <span>Why this cohort insight?</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-on-surface-variant mt-2">
                  {programAIResult.whyThisInsight.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>

              {/* Common Skill Gaps */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-outline mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-600 text-sm">warning</span>
                  <span>Common Skill Gaps Across Trainees</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {programAIResult.commonSkillGaps.map((gap, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-surface-container-high font-medium text-on-surface">
                      {gap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stronger vs Weaker Courses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                  <div className="font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">trending_up</span>
                    <span>Courses with Stronger Outcomes</span>
                  </div>
                  <ul className="space-y-2">
                    {programAIResult.coursesWithStrongerOutcomes.map((c, idx) => (
                      <li key={idx}>
                        <div className="font-semibold text-emerald-900">{c.course}</div>
                        <div className="text-emerald-700 text-[11px]">{c.observation}</div>
                        {c.metric && <span className="text-[10px] font-bold text-emerald-800">{c.metric}</span>}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200">
                  <div className="font-bold text-rose-800 mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">trending_down</span>
                    <span>Courses with Weaker Outcomes</span>
                  </div>
                  <ul className="space-y-2">
                    {programAIResult.coursesWithWeakerOutcomes.map((c, idx) => (
                      <li key={idx}>
                        <div className="font-semibold text-rose-900">{c.course}</div>
                        <div className="text-rose-700 text-[11px]">{c.observation}</div>
                        {c.metric && <span className="text-[10px] font-bold text-rose-800">{c.metric}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Placement Challenges & Retention Patterns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="font-bold text-on-surface mb-2">Placement Challenges</div>
                  <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                    {programAIResult.placementChallenges.map((ch, idx) => (
                      <li key={idx}>{ch}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="font-bold text-on-surface mb-2">Retention &amp; Stability Patterns</div>
                  <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                    {programAIResult.employmentRetentionPatterns.map((pat, idx) => (
                      <li key={idx}>{pat}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggested Program-Level Interventions */}
              <div className="p-4 rounded-xl bg-primary-container/20 border border-primary/30">
                <div className="font-bold text-primary mb-2 flex items-center gap-1.5 text-sm">
                  <span className="material-symbols-outlined text-base">lightbulb</span>
                  <span>Suggested Directorate Program-Level Interventions</span>
                </div>
                <ul className="space-y-1.5">
                  {programAIResult.suggestedProgramInterventions.map((inv, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-on-surface">
                      <span className="material-symbols-outlined text-xs text-primary mt-0.5 shrink-0">check</span>
                      <span>{inv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[11px] text-on-surface-variant italic">
                {programAIResult.disclaimer}
              </p>
            </div>

            <div className="p-4 bg-surface-container-low border-t border-surface-container flex justify-end">
              <button
                type="button"
                onClick={() => setShowProgramInsightsModal(false)}
                className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

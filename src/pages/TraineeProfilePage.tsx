import React, { useState, useEffect } from 'react';
import { useTrainees } from '../context/TraineeContext';
import { UpdateTrainingModal } from '../components/UpdateTrainingModal';
import { DeleteTraineeModal } from '../components/DeleteTraineeModal';
import { BackButton } from '../components/BackButton';
import { getTraineeAvatar } from '../utils/avatarHelper';
import { requestTraineeAIAnalysis } from '../services/aiService';
import { TraineeAIAnalysisResult } from '../types';

export const TraineeProfilePage: React.FC = () => {
  const { selectedTrainee, toggleMentorshipFlag, setActivePage, showToast } = useTrainees();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'training' | 'assessment' | 'employment'>('training');

  const [aiResult, setAiResult] = useState<TraineeAIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTrainee) return;
    setAiError(null);
    try {
      const cached = localStorage.getItem(`skilltrack_ai_trainee_${selectedTrainee.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.traineeId === selectedTrainee.id) {
          setAiResult(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setAiResult(null);
  }, [selectedTrainee?.id]);

  const handleRunAI = async () => {
    if (!selectedTrainee) return;
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const res = await requestTraineeAIAnalysis(selectedTrainee, true);
      setAiResult(res);
      showToast(`AI Analysis generated for ${selectedTrainee.name}`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to complete AI analysis.';
      setAiError(msg);
      showToast(`AI Analysis Failed: ${msg}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!selectedTrainee) {
    return (
      <div className="p-8 text-center text-on-surface">
        <p className="text-body-md text-on-surface-variant">No trainee selected.</p>
        <div className="mt-4 flex justify-center">
          <BackButton label="Back to Trainee Directory" to="trainees" id="fallback-back-to-trainees-btn" />
        </div>
      </div>
    );
  }

  const isFlagged = selectedTrainee.flaggedForMentorship;

  const handleOpenEdit = (tab: 'training' | 'assessment' | 'employment') => {
    setModalTab(tab);
    setIsUpdateModalOpen(true);
  };

  const handleExport = () => {
    showToast(`Exported complete career dossier for ${selectedTrainee.name} (${selectedTrainee.id}).pdf`);
  };

  // Dynamic wage calculations
  const wageDiff = selectedTrainee.currentSalary - selectedTrainee.startingSalary;
  const wageGrowthPct = selectedTrainee.startingSalary > 0
    ? Math.round((wageDiff / selectedTrainee.startingSalary) * 100)
    : 0;

  // Dynamic stage completion count
  const followUp6m = selectedTrainee.followUps.find(f => f.stage === '6 Months');
  const followUp30d = selectedTrainee.followUps.find(f => f.stage === '30 Days');
  const followUp90d = selectedTrainee.followUps.find(f => f.stage === '90 Days');
  const followUp12m = selectedTrainee.followUps.find(f => f.stage === '12 Months');

  const completedStagesCount = [
    true, // Stage 1: Registration
    selectedTrainee.trainingStatus === 'Certified' || selectedTrainee.trainingStatus === 'Completed', // Stage 2: Training
    selectedTrainee.assessmentStatus === 'Passed', // Stage 3: Assessment
    selectedTrainee.certificationStatus === 'Completed' || selectedTrainee.certificationStatus === 'Awarded', // Stage 4: Certification
    selectedTrainee.placementStatus !== 'Job Seeking', // Stage 5: Placement
    selectedTrainee.employmentStatus === 'Employed' || selectedTrainee.employmentStatus === 'Self-Employed', // Stage 6: Employment
    selectedTrainee.followUps.some(f => (f.stage === '6 Months' || f.stage === '90 Days' || f.stage === '30 Days') && f.status === 'Completed'), // Stage 7: Follow-up
    selectedTrainee.followUps.some(f => f.stage === '12 Months' && f.status === 'Completed'), // Stage 8: 12-Month Update
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Sub-Navigation Breadcrumb Bar */}
      <div className="w-full bg-surface-container-low/60 border-b border-outline-variant/20 px-space-32 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton
            label="Back to Trainee Directory"
            to="trainees"
            id="profile-back-to-directory-btn"
          />
          <div className="h-4 w-px bg-outline-variant/40 hidden sm:block"></div>
          <nav className="hidden sm:flex items-center gap-2 text-xs text-on-surface-variant">
            <button
              type="button"
              onClick={() => setActivePage('trainees')}
              className="hover:text-primary transition-colors cursor-pointer font-medium"
            >
              Trainees
            </button>
            <span className="material-symbols-outlined text-xs text-outline">chevron_right</span>
            <span className="font-semibold text-primary">{selectedTrainee.name}</span>
            <span className="text-outline-variant">•</span>
            <span className="text-outline font-mono font-semibold">ID: {selectedTrainee.id}</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            selectedTrainee.employmentVerified || selectedTrainee.placementStatus === 'Successful'
              ? 'bg-emerald-100 text-emerald-800'
              : selectedTrainee.placementStatus === 'Job Seeking'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              selectedTrainee.placementStatus === 'Job Seeking' ? 'bg-amber-600' : 'bg-emerald-600'
            }`}></span>
            {selectedTrainee.placementStatus === 'Job Seeking'
              ? 'Seeking Placement'
              : selectedTrainee.retentionDuration || 'Placement Verified'}
          </span>
        </div>
      </div>

      {/* Trainee Profile Banner */}
      <div className="px-space-32 pt-6 pb-6">
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <img
                className="w-20 h-20 rounded-xl object-cover ring-2 ring-primary/30 shadow-sm"
                alt={`Portrait of ${selectedTrainee.name}`}
                src={getTraineeAvatar(selectedTrainee)}
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = getTraineeAvatar(selectedTrainee);
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
              />
              <div className={`absolute -bottom-1 -right-1 text-white p-1 rounded-full shadow-sm flex items-center justify-center ring-2 ring-white ${
                selectedTrainee.placementStatus === 'Job Seeking' ? 'bg-amber-500' : 'bg-emerald-600'
              }`}>
                <span className="material-symbols-outlined text-sm">
                  {selectedTrainee.placementStatus === 'Job Seeking' ? 'hourglass_top' : 'check'}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                  {selectedTrainee.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-md bg-surface-container text-primary font-semibold text-xs font-mono">
                  {selectedTrainee.id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 ${
                  selectedTrainee.placementStatus === 'Job Seeking'
                    ? 'bg-amber-50 text-amber-800'
                    : 'bg-emerald-50 text-emerald-700'
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {selectedTrainee.placementStatus === 'Job Seeking' ? 'search' : 'verified'}
                  </span>
                  {selectedTrainee.employmentStatus}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-primary">person</span>
                  <span className="font-medium text-on-surface">
                    {selectedTrainee.gender} • {selectedTrainee.age ? `${selectedTrainee.age} yrs` : 'Candidate'}
                  </span>
                </span>
                <span className="text-outline-variant">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-primary">school</span>
                  <span className="font-medium text-on-surface">{selectedTrainee.course}</span>
                </span>
                <span className="text-outline-variant">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-outline">location_on</span>
                  <span>{selectedTrainee.district}, {selectedTrainee.state || 'Maharashtra'}</span>
                </span>
                <span className="text-outline-variant">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-secondary">apartment</span>
                  <span>{selectedTrainee.center || selectedTrainee.trainingProvider}</span>
                </span>
                <span className="text-outline-variant">•</span>
                <span className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-base ${selectedTrainee.placementStatus === 'Job Seeking' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    work
                  </span>
                  <span>{selectedTrainee.employer || (selectedTrainee.placementStatus === 'Job Seeking' ? 'Seeking Placement' : 'In Pipeline')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Header Quick Actions */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => toggleMentorshipFlag(selectedTrainee.id)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                isFlagged
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'border-outline-variant/60 hover:bg-surface-container text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base text-amber-600">star</span>
              <span>{isFlagged ? 'Flagged for Mentorship' : 'Flag for Mentorship'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenEdit('training')}
              className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container text-primary text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              <span>Update Record</span>
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2 rounded-lg border border-outline-variant/60 hover:bg-surface-container text-on-surface text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-outline">download</span>
              <span>Export Dossier</span>
            </button>
            <button
              type="button"
              id="delete-trainee-button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 rounded-lg border border-error/40 hover:bg-error-container/20 text-error text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
              title="Delete Trainee and associated records"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              <span>Delete Trainee</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Metric Overview (High Visual Hierarchy) */}
      <div className="px-space-32 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Attendance */}
          <div
            onClick={() => handleOpenEdit('training')}
            className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-outline">Attendance</span>
              <span className="material-symbols-outlined text-lg text-primary">calendar_month</span>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-on-surface tracking-tight">
                {selectedTrainee.attendancePercent}%
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-on-surface-variant">
                <span>{Math.round((selectedTrainee.attendancePercent / 100) * 300)} of 300 hrs</span>
                <span className={`font-semibold ${selectedTrainee.attendancePercent >= 90 ? 'text-emerald-700' : selectedTrainee.attendancePercent >= 75 ? 'text-amber-700' : 'text-rose-600'}`}>
                  {selectedTrainee.attendancePercent >= 90 ? 'Optimal' : selectedTrainee.attendancePercent >= 75 ? 'Satisfactory' : 'Needs Attention'}
                </span>
              </div>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full"
                style={{ width: `${selectedTrainee.attendancePercent}%` }}
              ></div>
            </div>
          </div>

          {/* 2. Assessment Score */}
          <div
            onClick={() => handleOpenEdit('assessment')}
            className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-outline">Assessment</span>
              <span className="material-symbols-outlined text-lg text-secondary">fact_check</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-on-surface tracking-tight">
                  {selectedTrainee.assessmentScore}%
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                  {selectedTrainee.assessmentGrade}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                {selectedTrainee.assessmentStatus === 'Passed' ? 'Evaluation Passed' : selectedTrainee.assessmentStatus}
              </p>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full"
                style={{ width: `${selectedTrainee.assessmentScore}%` }}
              ></div>
            </div>
          </div>

          {/* 3. Certification */}
          <div
            onClick={() => handleOpenEdit('assessment')}
            className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-outline">Certification</span>
              <span className="material-symbols-outlined text-lg text-emerald-600">military_tech</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-700 tracking-tight">
                {selectedTrainee.certificationStatus}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                {selectedTrainee.certificationDate || selectedTrainee.trainingEndDate || 'Validated'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-emerald-700 text-xs font-semibold truncate" title={selectedTrainee.certificateId || `CERT-MH-${selectedTrainee.id}`}>
              <span className="material-symbols-outlined text-sm">verified</span>
              {selectedTrainee.certificateId || `CERT-MH-${selectedTrainee.id}`}
            </div>
          </div>

          {/* 4. Placement */}
          <div
            onClick={() => handleOpenEdit('employment')}
            className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-outline">Placement</span>
              <span className="material-symbols-outlined text-lg text-primary">work</span>
            </div>
            <div>
              <div className="text-xl font-bold text-on-surface tracking-tight truncate" title={selectedTrainee.employer}>
                {selectedTrainee.employer || (selectedTrainee.placementStatus === 'Job Seeking' ? 'Seeking Placement' : 'In Pipeline')}
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {selectedTrainee.district} • {selectedTrainee.joiningDate ? `Joined ${selectedTrainee.joiningDate}` : selectedTrainee.placementStatus}
              </p>
            </div>
            <div className={`flex items-center gap-1.5 mt-3 text-xs font-semibold ${
              selectedTrainee.placementStatus === 'Job Seeking' ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              <span className="material-symbols-outlined text-sm">
                {selectedTrainee.placementStatus === 'Job Seeking' ? 'hourglass_top' : 'check_circle'}
              </span>
              {selectedTrainee.employmentStatus}
            </div>
          </div>

          {/* 5. Current Salary */}
          <div
            onClick={() => handleOpenEdit('employment')}
            className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-outline">Current Salary</span>
              <span className="material-symbols-outlined text-lg text-emerald-600">trending_up</span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-on-surface tracking-tight">
                  ₹{selectedTrainee.currentSalary.toLocaleString()}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">/mo</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-xs font-bold flex items-center ${wageGrowthPct > 0 ? 'text-emerald-700' : 'text-on-surface-variant'}`}>
                  {wageGrowthPct > 0 && <span className="material-symbols-outlined text-xs">arrow_upward</span>}
                  {wageGrowthPct > 0 ? `+${wageGrowthPct}%` : '0% (Starting Band)'}
                </span>
                <span className="text-xs text-on-surface-variant">from ₹{selectedTrainee.startingSalary.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Career Journey & Contextual Data Section */}
      <div className="px-space-32 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8" id="career-journey">
        {/* Left 8 Columns: Dominant 8-Stage Career Journey Timeline */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-2xl p-7 shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between pb-6 border-b border-outline-variant/20">
              <div>
                <h2 className="text-xl font-bold text-on-surface tracking-tight flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-primary inline-block"></span>
                  Career Journey
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Continuous tracking through every training milestone to ongoing employment.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
                {completedStagesCount} of 8 Stages Completed
              </span>
            </div>

            {/* 8-Stage Clean Timeline */}
            <div className="relative mt-8 pl-4 sm:pl-6">
              <div className="absolute left-7 sm:left-9 top-4 bottom-8 w-0.5 bg-surface-container-highest"></div>

              {/* Stage 1: Registration & Enrollment */}
              <div className="relative flex items-start gap-5 pb-7 group">
                <div className="relative z-10 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0 ring-4 ring-white">
                  <span className="material-symbols-outlined text-base">how_to_reg</span>
                </div>
                <div className="flex-1 bg-surface-container-low/70 border border-outline-variant/20 p-4 rounded-xl hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-outline uppercase tracking-wider">Stage 01</span>
                      <h3 className="text-base font-semibold text-on-surface">Registration &amp; Enrollment</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                      Completed
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-outline">calendar_today</span>
                      {selectedTrainee.registeredDate || selectedTrainee.trainingStartDate || 'Enrolled'}
                    </span>
                    <span>Batch: {selectedTrainee.batch}</span>
                    <span className="text-primary font-medium">{selectedTrainee.center || selectedTrainee.trainingProvider}</span>
                  </div>
                </div>
              </div>

              {/* Stage 2: Training Phase */}
              <div className="relative flex items-start gap-5 pb-7 group">
                <div className="relative z-10 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0 ring-4 ring-white">
                  <span className="material-symbols-outlined text-base">menu_book</span>
                </div>
                <div className="flex-1 bg-surface-container-low/70 border border-outline-variant/20 p-4 rounded-xl hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-outline uppercase tracking-wider">Stage 02</span>
                      <h3 className="text-base font-semibold text-on-surface">Training Phase</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                      {selectedTrainee.trainingStatus}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-outline">date_range</span>
                      {selectedTrainee.trainingStartDate} – {selectedTrainee.trainingEndDate}
                    </span>
                    <span className="flex items-center gap-1 text-primary font-semibold">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {selectedTrainee.attendancePercent}% Attendance ({Math.round((selectedTrainee.attendancePercent / 100) * 300)} hrs)
                    </span>
                    <span>{selectedTrainee.trainingProvider}</span>
                  </div>
                </div>
              </div>

              {/* Stage 3: Assessment & Examination */}
              <div className="relative flex items-start gap-5 pb-7 group">
                <div className="relative z-10 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0 ring-4 ring-white">
                  <span className="material-symbols-outlined text-base">fact_check</span>
                </div>
                <div className="flex-1 bg-surface-container-low/70 border border-outline-variant/20 p-4 rounded-xl hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-outline uppercase tracking-wider">Stage 03</span>
                      <h3 className="text-base font-semibold text-on-surface">Assessment &amp; Examination</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                      {selectedTrainee.assessmentStatus === 'Passed' ? 'Completed' : selectedTrainee.assessmentStatus}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-outline">event</span>
                      {selectedTrainee.trainingEndDate || 'Evaluation'}
                    </span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">grade</span>
                      Score: {selectedTrainee.assessmentScore}% ({selectedTrainee.assessmentGrade})
                    </span>
                  </div>
                </div>
              </div>

              {/* Stage 4: Certification */}
              <div className="relative flex items-start gap-5 pb-7 group">
                <div className="relative z-10 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0 ring-4 ring-white">
                  <span className="material-symbols-outlined text-base">military_tech</span>
                </div>
                <div className="flex-1 bg-surface-container-low/70 border border-outline-variant/20 p-4 rounded-xl hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-outline uppercase tracking-wider">Stage 04</span>
                      <h3 className="text-base font-semibold text-on-surface">Certification</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                      {selectedTrainee.certificationStatus}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-outline">event</span>
                      {selectedTrainee.certificationDate || selectedTrainee.trainingEndDate}
                    </span>
                    <span className="text-primary font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">verified</span>
                      State Skill Certificate ({selectedTrainee.certificateId || `CERT-MH-${selectedTrainee.id}`})
                    </span>
                  </div>
                </div>
              </div>

              {/* Stage 5: Placement Drive & Offer */}
              <div className="relative flex items-start gap-5 pb-7 group">
                <div className={`relative z-10 w-9 h-9 rounded-full text-white flex items-center justify-center shadow-sm shrink-0 ring-4 ring-white ${
                  selectedTrainee.placementStatus === 'Job Seeking' ? 'bg-amber-500' : 'bg-emerald-600'
                }`}>
                  <span className="material-symbols-outlined text-base">
                    {selectedTrainee.placementStatus === 'Job Seeking' ? 'hourglass_top' : 'campaign'}
                  </span>
                </div>
                <div className="flex-1 bg-surface-container-low/70 border border-outline-variant/20 p-4 rounded-xl hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-outline uppercase tracking-wider">Stage 05</span>
                      <h3 className="text-base font-semibold text-on-surface">Placement Drive &amp; Offer</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      selectedTrainee.placementStatus === 'Job Seeking'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedTrainee.placementStatus === 'Job Seeking' ? 'In Progress' : 'Completed'}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-outline">event</span>
                      {selectedTrainee.joiningDate || (selectedTrainee.placementStatus === 'Job Seeking' ? 'Active Pipeline' : 'Completed')}
                    </span>
                    <span className="font-semibold text-on-surface">
                      {selectedTrainee.employer || (selectedTrainee.placementStatus === 'Job Seeking' ? 'Seeking Placement' : 'In Pipeline')}
                    </span>
                    <span>
                      {selectedTrainee.placementStatus === 'Job Seeking'
                        ? `Target Band: ₹${selectedTrainee.startingSalary.toLocaleString()} / mo`
                        : `Starting Salary: ₹${selectedTrainee.startingSalary.toLocaleString()} / mo`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stage 6: Employment Started */}
              <div className="relative flex items-start gap-5 pb-7 group">
                <div className={`relative z-10 w-9 h-9 rounded-full text-white flex items-center justify-center shadow-sm shrink-0 ring-4 ring-white ${
                  selectedTrainee.placementStatus === 'Job Seeking' ? 'bg-surface-container-highest text-on-surface-variant' : 'bg-emerald-600'
                }`}>
                  <span className="material-symbols-outlined text-base">work</span>
                </div>
                <div className="flex-1 bg-surface-container-low/70 border border-outline-variant/20 p-4 rounded-xl hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-outline uppercase tracking-wider">Stage 06</span>
                      <h3 className="text-base font-semibold text-on-surface">Employment Started</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      selectedTrainee.placementStatus === 'Job Seeking'
                        ? 'bg-surface-container text-on-surface-variant'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedTrainee.placementStatus === 'Job Seeking' ? 'Pending Placement' : 'Active'}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                    {selectedTrainee.placementStatus === 'Job Seeking' ? (
                      <span>Candidate active in employer match pipeline ({selectedTrainee.jobRole})</span>
                    ) : (
                      <>
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-outline">event</span>
                          Joined {selectedTrainee.joiningDate || 'Verified'}
                        </span>
                        <span className="text-emerald-700 font-medium">Role: {selectedTrainee.jobRole}</span>
                        <span>Type: {selectedTrainee.employmentType || 'Full Time'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stage 7: Follow-up Milestones */}
              <div className="relative flex items-start gap-5 pb-7 group">
                <div className={`relative z-10 w-9 h-9 rounded-full text-white flex items-center justify-center shadow-sm shrink-0 ring-4 ring-white ${
                  followUp6m?.status === 'Completed' || followUp90d?.status === 'Completed' || followUp30d?.status === 'Completed'
                    ? 'bg-emerald-600'
                    : 'bg-amber-500'
                }`}>
                  <span className="material-symbols-outlined text-base">verified</span>
                </div>
                <div className="flex-1 bg-surface-container-low/70 border border-outline-variant/20 p-4 rounded-xl hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-outline uppercase tracking-wider">Stage 07</span>
                      <h3 className="text-base font-semibold text-on-surface">
                        {followUp6m ? '6-Month Follow-up' : followUp90d ? '90-Day Retention Check' : '30-Day Follow-up'}
                      </h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      followUp6m?.status === 'Completed' || followUp30d?.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {followUp6m ? followUp6m.status : followUp90d ? followUp90d.status : followUp30d ? followUp30d.status : 'Scheduled'}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-outline">event</span>
                      {followUp6m?.date || followUp90d?.date || followUp30d?.date || followUp90d?.dueDate || 'In Follow-up Cycle'}
                    </span>
                    <span className="font-bold text-emerald-700">
                      Current Salary: ₹{selectedTrainee.currentSalary.toLocaleString()} / mo
                      {wageGrowthPct > 0 ? ` (+${wageGrowthPct}%)` : ''}
                    </span>
                    <span className="text-primary font-medium">
                      {selectedTrainee.retentionDuration || 'Retention Monitored'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stage 8: 12-Month Update */}
              <div className="relative flex items-start gap-5 group">
                <div className={`relative z-10 w-9 h-9 rounded-full text-white flex items-center justify-center shadow-sm shrink-0 ring-4 ring-white ${
                  followUp12m?.status === 'Completed'
                    ? 'bg-emerald-600'
                    : 'bg-surface-container-highest text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-base">
                    {followUp12m?.status === 'Completed' ? 'verified' : 'update'}
                  </span>
                </div>
                <div className="flex-1 bg-surface-container-lowest border border-outline-variant/40 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-outline uppercase tracking-wider">Stage 08</span>
                      <h3 className="text-base font-semibold text-on-surface">12-Month Update</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      followUp12m?.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {followUp12m?.status || 'Scheduled'}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                      <span className="material-symbols-outlined text-sm">event_upcoming</span>
                      {followUp12m?.status === 'Completed'
                        ? `Verified on ${followUp12m.date}`
                        : `Due: ${followUp12m?.dueDate || '12-Month Milestone'}`}
                    </span>
                    <span>{followUp12m?.candidateFeedback || 'Longitudinal employment verification and sustainability audit'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Follow-up Milestones Detailed Audit History */}
          <div className="bg-surface-container-lowest rounded-2xl p-7 shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">history_edu</span>
                <h3 className="text-base font-bold text-on-surface">
                  Follow-Up Milestones &amp; Retention Audit
                </h3>
              </div>
              <span className="text-xs font-medium text-on-surface-variant">
                Cycle: {selectedTrainee.currentFollowUpCycle}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {selectedTrainee.followUps && selectedTrainee.followUps.length > 0 ? (
                selectedTrainee.followUps.map((fu, idx) => (
                  <div
                    key={`${fu.stage}-${idx}`}
                    className="p-3.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        fu.status === 'Completed' ? 'bg-emerald-600' : fu.status === 'Pending' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}></span>
                      <div>
                        <span className="font-bold text-on-surface text-sm">{fu.stage} Milestone</span>
                        <div className="text-on-surface-variant mt-0.5">
                          {fu.date ? `Verified: ${fu.date}` : fu.dueDate ? `Due Date: ${fu.dueDate}` : 'Scheduled'}
                          {fu.verificationMethod && ` • ${fu.verificationMethod}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:text-right">
                      {fu.currentWage && (
                        <div>
                          <div className="font-bold text-on-surface">₹{fu.currentWage.toLocaleString()}</div>
                          <div className="text-[11px] text-on-surface-variant">Recorded Wage</div>
                        </div>
                      )}
                      <span className={`px-2.5 py-1 rounded-full font-semibold text-xs ${
                        fu.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fu.status === 'Pending'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {fu.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-on-surface-variant">No follow-up entries recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Streamlined Right Rail */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* 1. Current Employment Snapshot Card */}
          <div className="bg-primary-container text-on-primary p-6 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-on-primary/80">
                Employment Snapshot
              </span>
              <span className={`material-symbols-outlined ${selectedTrainee.placementStatus === 'Job Seeking' ? 'text-amber-300' : 'text-emerald-300'}`}>
                {selectedTrainee.placementStatus === 'Job Seeking' ? 'hourglass_top' : 'verified'}
              </span>
            </div>
            <div className="text-xl font-bold text-white">
              {selectedTrainee.employer || (selectedTrainee.placementStatus === 'Job Seeking' ? 'Seeking Placement' : 'In Pipeline')}
            </div>
            <p className="text-xs text-on-primary-container mt-1">
              {selectedTrainee.jobRole} • {selectedTrainee.district}
            </p>
            <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-on-primary-container">Current Salary</div>
                <div className="text-lg font-bold text-white">
                  ₹{selectedTrainee.currentSalary.toLocaleString()}{' '}
                  {wageGrowthPct > 0 && (
                    <span className="text-xs font-normal text-emerald-300">
                      +{wageGrowthPct}%
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-on-primary-container">Tenure &amp; Retention</div>
                <div className="text-lg font-bold text-white">
                  {selectedTrainee.tenureStabilityMonths}+ Mos
                </div>
                <div className="text-[11px] text-white/80">{selectedTrainee.retentionDuration}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('employment')}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <span>View Employment Logs</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* 2. Training Center Card */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">
                Training Institute
              </h3>
              <span className="material-symbols-outlined text-outline">apartment</span>
            </div>
            <div className="text-base font-bold text-on-surface">
              {selectedTrainee.trainingProvider}
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {selectedTrainee.center || selectedTrainee.trainingProvider} • {selectedTrainee.district}
            </p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-surface-container-low p-3 rounded-xl">
                <div className="flex items-center gap-1.5 text-amber-600">
                  <span className="material-symbols-outlined text-base">star</span>
                  <span className="text-lg font-bold text-on-surface">4.8</span>
                  <span className="text-xs text-on-surface-variant">/5</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Center Rating</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl">
                <div className="flex items-center gap-1 text-emerald-700">
                  <span className="material-symbols-outlined text-base">trending_up</span>
                  <span className="text-lg font-bold text-on-surface">
                    {selectedTrainee.attendancePercent}%
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Attendance Record</p>
              </div>
            </div>
          </div>

          {/* 3. Key Skills Verified Card */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">
                Key Skills Verified
              </h3>
              <span className="material-symbols-outlined text-outline">psychology</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTrainee.skills && selectedTrainee.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-xs font-medium flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm text-primary">verified</span>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* 4. AI Career Intelligence & Recommendations */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">
                  AI Career Recommendations
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                Prototype AI Analysis
              </span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                (aiResult ? aiResult.placementRiskAnalysis.riskLevel : selectedTrainee.placementRisk) === 'High'
                  ? 'bg-rose-100 text-rose-800'
                  : (aiResult ? aiResult.placementRiskAnalysis.riskLevel : selectedTrainee.placementRisk) === 'Medium'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {aiResult ? aiResult.placementRiskAnalysis.riskLevel : selectedTrainee.placementRisk} Placement Risk
              </span>

              <button
                type="button"
                disabled={isAnalyzing}
                onClick={handleRunAI}
                className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-xs ${isAnalyzing ? 'animate-spin' : ''}`}>
                  {isAnalyzing ? 'sync' : 'psychology'}
                </span>
                <span>{isAnalyzing ? 'Analyzing...' : aiResult ? 'Re-run AI' : 'Run Gemini AI'}</span>
              </button>
            </div>

            {aiError && (
              <div className="mb-3 p-3 rounded-lg bg-error-container/50 border border-error/30 text-xs text-on-error-container">
                <strong>Analysis Error:</strong> {aiError}
              </div>
            )}

            {aiResult ? (
              <div className="flex flex-col gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="font-bold text-on-surface mb-1 flex items-center gap-1 text-primary">
                    <span className="material-symbols-outlined text-sm">psychology</span>
                    <span>Skill Gaps Identified:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {aiResult.skillGapAnalysis.identifiedSkillGaps.map((gap, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-surface-container-high font-medium text-on-surface text-[11px]">
                        {gap}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-2 font-medium">
                    {aiResult.skillGapAnalysis.recommendation}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="font-bold text-on-surface mb-1 text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">explore</span>
                    <span>Recommended Career Direction:</span>
                  </div>
                  <p className="text-on-surface text-[11px]">
                    {aiResult.skillGapAnalysis.recommendedCareerDirection}
                  </p>
                  <div className="mt-2 text-[11px] text-on-surface-variant">
                    <strong>Suggested Roles:</strong> {aiResult.careerRecommendations.suggestedJobRoles.join(', ')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-[11px]">
                  <strong className="text-primary block mb-1">Why this insight?</strong>
                  <ul className="list-disc list-inside space-y-0.5 text-on-surface-variant">
                    {aiResult.whyThisInsight.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>

                <p className="text-[10px] text-outline italic">
                  {aiResult.disclaimer}
                </p>
              </div>
            ) : (
              <div>
                {selectedTrainee.placementRiskReason && (
                  <p className="text-xs text-on-surface-variant mb-4 bg-surface-container-low p-3 rounded-lg border border-outline-variant/20">
                    {selectedTrainee.placementRiskReason}
                  </p>
                )}

                <div className="text-xs font-bold uppercase tracking-wider text-outline mb-2">
                  Recommended Upskilling Pathways
                </div>
                <div className="flex flex-col gap-2">
                  {selectedTrainee.recommendedPathway && selectedTrainee.recommendedPathway.map(course => (
                    <div key={course.id} className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-on-surface">{course.title}</span>
                        <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10 shrink-0">
                          {course.tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-on-surface-variant">
                        <span className="text-emerald-700 font-semibold">{course.impact}</span>
                        <span>•</span>
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActivePage('ai-insights')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Open AI Career Intelligence</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
          </div>
        </div>
      </div>

      <UpdateTrainingModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        defaultTab={modalTab}
      />

      <DeleteTraineeModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        trainee={selectedTrainee}
      />
    </div>
  );
};

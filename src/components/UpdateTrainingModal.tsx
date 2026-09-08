import React, { useState, useEffect } from 'react';
import { useTrainees } from '../context/TraineeContext';
import { getTraineeAvatar } from '../utils/avatarHelper';

interface UpdateTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'training' | 'assessment' | 'employment';
}

export const UpdateTrainingModal: React.FC<UpdateTrainingModalProps> = ({ isOpen, onClose, defaultTab = 'training' }) => {
  const { selectedTrainee, updateTrainee, showToast } = useTrainees();

  const [activeTab, setActiveTab] = useState<'training' | 'assessment' | 'employment'>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const [form, setForm] = useState({
    course: '',
    trainingProvider: '',
    attendancePercent: 90,
    trainingStatus: 'Certified' as any,
    assessmentScore: 85,
    assessmentGrade: 'Grade A',
    assessmentStatus: 'Passed' as any,
    certificationStatus: 'Completed' as any,
    placementStatus: 'Successful' as any,
    employmentStatus: 'Employed' as any,
    employer: '',
    jobRole: '',
    startingSalary: 18000,
    currentSalary: 22000,
  });

  useEffect(() => {
    if (selectedTrainee) {
      setForm({
        course: selectedTrainee.course,
        trainingProvider: selectedTrainee.trainingProvider,
        attendancePercent: selectedTrainee.attendancePercent,
        trainingStatus: selectedTrainee.trainingStatus,
        assessmentScore: selectedTrainee.assessmentScore,
        assessmentGrade: selectedTrainee.assessmentGrade,
        assessmentStatus: selectedTrainee.assessmentStatus,
        certificationStatus: selectedTrainee.certificationStatus,
        placementStatus: selectedTrainee.placementStatus,
        employmentStatus: selectedTrainee.employmentStatus,
        employer: selectedTrainee.employer,
        jobRole: selectedTrainee.jobRole,
        startingSalary: selectedTrainee.startingSalary,
        currentSalary: selectedTrainee.currentSalary,
      });
    }
  }, [selectedTrainee]);

  if (!isOpen || !selectedTrainee) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTrainee(selectedTrainee.id, {
      course: form.course,
      trainingProvider: form.trainingProvider,
      attendancePercent: Number(form.attendancePercent),
      trainingStatus: form.trainingStatus,
      assessmentScore: Number(form.assessmentScore),
      assessmentGrade: form.assessmentScore >= 85 ? 'Grade A' : 'Grade B',
      assessmentStatus: form.assessmentStatus,
      certificationStatus: form.certificationStatus,
      placementStatus: form.placementStatus,
      employmentStatus: form.employmentStatus,
      employer: form.employer,
      jobRole: form.jobRole,
      startingSalary: Number(form.startingSalary),
      currentSalary: Number(form.currentSalary),
    });
    showToast(`Updated training & career details for ${selectedTrainee.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-space-16">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-xl shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-space-20 bg-surface-container-low border-b border-surface-container gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              id="update-training-modal-back-btn"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container bg-surface-container-lowest border border-outline-variant/30 transition-all cursor-pointer shadow-2xs hover:shadow-xs shrink-0"
              title="Back"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back</span>
            </button>
            <div className="h-5 w-px bg-outline-variant/30 hidden sm:block"></div>
            <div className="flex items-center gap-space-12">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center shrink-0 ring-1 ring-outline-variant/30">
                <img
                  src={getTraineeAvatar(selectedTrainee)}
                  alt={selectedTrainee.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Update Trainee Records
                </h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  {selectedTrainee.name} ({selectedTrainee.id}) • {selectedTrainee.course}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            id="update-training-modal-close-icon-btn"
            className="p-space-4 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-surface-container-low bg-surface-container-low/40 px-space-20 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('training')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'training'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Training &amp; Attendance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assessment')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'assessment'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Assessment &amp; Certification
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('employment')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'employment'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Placement &amp; Employment
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} className="p-space-20 flex flex-col gap-space-16 overflow-y-auto">
          {activeTab === 'training' && (
            <div className="flex flex-col gap-space-12">
              <div className="flex flex-col gap-space-4">
                <label className="font-label-md text-label-md font-semibold text-on-surface">Course Enrolled</label>
                <input
                  type="text"
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30"
                />
              </div>

              <div className="flex flex-col gap-space-4">
                <label className="font-label-md text-label-md font-semibold text-on-surface">Training Provider / Institute</label>
                <input
                  type="text"
                  value={form.trainingProvider}
                  onChange={(e) => setForm({ ...form, trainingProvider: e.target.value })}
                  className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-12">
                <div className="flex flex-col gap-space-4">
                  <label className="font-label-md text-label-md font-semibold text-on-surface">Attendance (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.attendancePercent}
                    onChange={(e) => setForm({ ...form, attendancePercent: parseInt(e.target.value, 10) || 0 })}
                    className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30"
                  />
                </div>

                <div className="flex flex-col gap-space-4">
                  <label className="font-label-md text-label-md font-semibold text-on-surface">Training Status</label>
                  <select
                    value={form.trainingStatus}
                    onChange={(e) => setForm({ ...form, trainingStatus: e.target.value as any })}
                    className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 cursor-pointer"
                  >
                    <option value="Certified">Certified</option>
                    <option value="In Training">In Training</option>
                    <option value="Completed">Completed</option>
                    <option value="Dropped">Dropped</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assessment' && (
            <div className="flex flex-col gap-space-12">
              <div className="grid grid-cols-2 gap-space-12">
                <div className="flex flex-col gap-space-4">
                  <label className="font-label-md text-label-md font-semibold text-on-surface">Assessment Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.assessmentScore}
                    onChange={(e) => setForm({ ...form, assessmentScore: parseInt(e.target.value, 10) || 0 })}
                    className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30"
                  />
                </div>

                <div className="flex flex-col gap-space-4">
                  <label className="font-label-md text-label-md font-semibold text-on-surface">Assessment Status</label>
                  <select
                    value={form.assessmentStatus}
                    onChange={(e) => setForm({ ...form, assessmentStatus: e.target.value as any })}
                    className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 cursor-pointer"
                  >
                    <option value="Passed">Passed</option>
                    <option value="Pending">Pending</option>
                    <option value="In Review">In Review</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-space-4">
                <label className="font-label-md text-label-md font-semibold text-on-surface">Certification Status</label>
                <select
                  value={form.certificationStatus}
                  onChange={(e) => setForm({ ...form, certificationStatus: e.target.value as any })}
                  className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 cursor-pointer"
                >
                  <option value="Completed">Completed (State Certificate Awarded)</option>
                  <option value="Pending">Pending Verification</option>
                  <option value="Awarded">Awarded</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'employment' && (
            <div className="flex flex-col gap-space-12">
              <div className="grid grid-cols-2 gap-space-12">
                <div className="flex flex-col gap-space-4">
                  <label className="font-label-md text-label-md font-semibold text-on-surface">Placement Status</label>
                  <select
                    value={form.placementStatus}
                    onChange={(e) => setForm({ ...form, placementStatus: e.target.value as any })}
                    className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 cursor-pointer"
                  >
                    <option value="Successful">Successful Placement</option>
                    <option value="Job Seeking">Job Seeking</option>
                    <option value="Not Applicable (Enrolled)">Not Applicable (Enrolled)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-space-4">
                  <label className="font-label-md text-label-md font-semibold text-on-surface">Employment Status</label>
                  <select
                    value={form.employmentStatus}
                    onChange={(e) => setForm({ ...form, employmentStatus: e.target.value as any })}
                    className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 cursor-pointer"
                  >
                    <option value="Employed">Employed (Formal)</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                    <option value="Job Seeking">Job Seeking</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-space-4">
                <label className="font-label-md text-label-md font-semibold text-on-surface">Employer Name</label>
                <input
                  type="text"
                  value={form.employer}
                  onChange={(e) => setForm({ ...form, employer: e.target.value })}
                  className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30"
                />
              </div>

              <div className="flex flex-col gap-space-4">
                <label className="font-label-md text-label-md font-semibold text-on-surface">Designation / Role</label>
                <input
                  type="text"
                  value={form.jobRole}
                  onChange={(e) => setForm({ ...form, jobRole: e.target.value })}
                  className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-12">
                <div className="flex flex-col gap-space-4">
                  <label className="font-label-md text-label-md font-semibold text-on-surface">Starting Salary (₹)</label>
                  <input
                    type="number"
                    value={form.startingSalary}
                    onChange={(e) => setForm({ ...form, startingSalary: parseInt(e.target.value, 10) || 0 })}
                    className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30"
                  />
                </div>

                <div className="flex flex-col gap-space-4">
                  <label className="font-label-md text-label-md font-semibold text-on-surface">Current Salary (₹)</label>
                  <input
                    type="number"
                    value={form.currentSalary}
                    onChange={(e) => setForm({ ...form, currentSalary: parseInt(e.target.value, 10) || 0 })}
                    className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30"
                  />
                </div>
              </div>

              {/* Automatic Wage Growth Calculation Indicator */}
              <div className="p-space-12 rounded-lg bg-secondary-container/30 border border-secondary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-base">trending_up</span>
                  <span className="font-label-md text-label-md font-medium text-on-surface">
                    Automatic Wage Growth:
                  </span>
                </div>
                <span className="font-bold text-secondary text-sm">
                  {form.startingSalary > 0
                    ? `+${Math.round(((form.currentSalary - form.startingSalary) / form.startingSalary) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          )}

          <div className="p-space-16 bg-surface-container-low rounded-lg flex items-center justify-end gap-space-12 mt-space-8">
            <button
              type="button"
              onClick={onClose}
              className="px-space-16 py-space-8 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-body-md-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-space-20 py-space-8 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors font-body-md-medium shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>Save &amp; Update Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useTrainees } from '../context/TraineeContext';
import { getTraineeAvatar } from '../utils/avatarHelper';

interface UpdateFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateFollowUpModal: React.FC<UpdateFollowUpModalProps> = ({ isOpen, onClose }) => {
  const { trainees, selectedTraineeId, setSelectedTraineeId, updateFollowUp, showToast } = useTrainees();

  const [currentId, setCurrentId] = useState(selectedTraineeId || 'ST1001');

  useEffect(() => {
    if (selectedTraineeId) {
      setCurrentId(selectedTraineeId);
    }
  }, [selectedTraineeId, isOpen]);

  const activeTrainee = trainees.find(t => t.id === currentId) || trainees[0];

  const [milestone, setMilestone] = useState<'30 Days' | '90 Days' | '6 Months' | '12 Months' | '24 Months'>('6 Months');
  const [employer, setEmployer] = useState('');
  const [currentSalary, setCurrentSalary] = useState<number>(22000);
  const [employmentStatus, setEmploymentStatus] = useState<'Employed' | 'Self-Employed' | 'Apprenticeship' | 'Job Seeking'>('Employed');
  const [verificationMethod, setVerificationMethod] = useState<'Salary Slip Validated' | 'Employer Confirmed' | 'In-Person Visit' | 'Tele-verification' | 'EPFO Synced'>('In-Person Visit');
  const [notes, setNotes] = useState('Conducted in-person retention review. Trainee confirmed wage increment and active employment.');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when active candidate changes
  useEffect(() => {
    if (activeTrainee) {
      setEmployer(activeTrainee.employer || '');
      setCurrentSalary(activeTrainee.currentSalary || 22000);
      setEmploymentStatus((activeTrainee.employmentStatus as any) || 'Employed');
    }
  }, [activeTrainee?.id]);

  if (!isOpen) return null;

  const handleTraineeChange = (id: string) => {
    setCurrentId(id);
    setSelectedTraineeId(id);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrainee) return;

    setIsSaving(true);
    setTimeout(() => {
      updateFollowUp(activeTrainee.id, milestone, {
        currentWage: Number(currentSalary),
        employer: employer.trim() || activeTrainee.employer,
        isEmployed: employmentStatus !== 'Job Seeking',
        status: 'Completed',
        verificationMethod,
        fieldOfficerNotes: notes,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      });
      setIsSaving(false);
      showToast(`Follow-up audit recorded for ${activeTrainee.name} (${milestone})`);
      onClose();
    }, 500);
  };

  const growth = activeTrainee && activeTrainee.startingSalary > 0
    ? Math.round(((currentSalary - activeTrainee.startingSalary) / activeTrainee.startingSalary) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-space-16">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-xl shadow-xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-space-20 bg-surface-container-low border-b border-surface-container gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              id="update-followup-modal-back-btn"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container bg-surface-container-lowest border border-outline-variant/30 transition-all cursor-pointer shadow-2xs hover:shadow-xs shrink-0"
              title="Back"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back</span>
            </button>
            <div className="h-5 w-px bg-outline-variant/30 hidden sm:block"></div>
            <div className="flex items-center gap-space-12">
              {activeTrainee ? (
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center shrink-0 ring-1 ring-outline-variant/30">
                  <img
                    src={getTraineeAvatar(activeTrainee)}
                    alt={activeTrainee.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <span className="material-symbols-outlined text-primary text-2xl">post_add</span>
              )}
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Follow-Up Audit Entry
                </h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  {activeTrainee ? `${activeTrainee.name} (${activeTrainee.id}) • Retention Verification` : 'Longitudinal Post-Placement Retention Verification'}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            id="update-followup-modal-close-icon-btn"
            className="p-space-4 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSave} className="p-space-20 flex flex-col gap-space-16 overflow-y-auto font-body-md text-body-md">
          {/* Trainee Selector & Auto-populated Skill ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-12">
            <div className="flex flex-col gap-space-4">
              <label className="font-label-md text-label-md font-semibold text-on-surface">
                Select Candidate
              </label>
              <select
                value={activeTrainee?.id || ''}
                onChange={(e) => handleTraineeChange(e.target.value)}
                className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container border border-outline-variant/30 cursor-pointer"
              >
                {trainees.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-space-4">
              <label className="font-label-md text-label-md font-semibold text-on-surface">
                Skill ID (Auto-populated)
              </label>
              <input
                type="text"
                readOnly
                value={activeTrainee?.id || ''}
                className="h-10 px-space-12 rounded-lg bg-surface-container text-on-surface-variant font-mono font-bold text-body-sm border border-outline-variant/20 select-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Milestone & Employment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-12">
            <div className="flex flex-col gap-space-4">
              <label className="font-label-md text-label-md font-semibold text-on-surface">
                Audit Milestone
              </label>
              <select
                value={milestone}
                onChange={(e) => setMilestone(e.target.value as any)}
                className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container border border-outline-variant/30 cursor-pointer"
              >
                <option value="30 Days">30 Days (1st Month Checkpoint)</option>
                <option value="90 Days">90 Days (Quarterly Verification)</option>
                <option value="6 Months">6 Months (Semi-annual Audit)</option>
                <option value="12 Months">12 Months (Statutory Retention)</option>
                <option value="24 Months">24 Months (Sustainability Audit)</option>
              </select>
            </div>

            <div className="flex flex-col gap-space-4">
              <label className="font-label-md text-label-md font-semibold text-on-surface">
                Employment Status
              </label>
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value as any)}
                className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container border border-outline-variant/30 cursor-pointer"
              >
                <option value="Employed">Employed (Formal Wage)</option>
                <option value="Self-Employed">Self-Employed / Entrepreneur</option>
                <option value="Apprenticeship">Apprenticeship (NAPS / NATS)</option>
                <option value="Job Seeking">Job Seeking / Transitioning</option>
              </select>
            </div>
          </div>

          {/* Current Employer & Current Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-12">
            <div className="flex flex-col gap-space-4">
              <label className="font-label-md text-label-md font-semibold text-on-surface">
                Current Employer / Organization
              </label>
              <input
                type="text"
                value={employer}
                onChange={(e) => setEmployer(e.target.value)}
                placeholder="e.g. Tata Consultancy Services, Self..."
                className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container border border-outline-variant/30"
              />
            </div>

            <div className="flex flex-col gap-space-4">
              <label className="font-label-md text-label-md font-semibold text-on-surface">
                Current Monthly Salary (₹)
              </label>
              <input
                type="number"
                value={currentSalary}
                onChange={(e) => setCurrentSalary(parseInt(e.target.value, 10) || 0)}
                className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container border border-outline-variant/30"
              />
            </div>
          </div>

          {/* Automatic Wage Growth Feedback */}
          {activeTrainee && (
            <div className="p-space-12 rounded-lg bg-secondary-container/20 border border-secondary/20 flex items-center justify-between text-xs">
              <span className="text-on-surface font-medium">
                Entry wage: <strong>₹{activeTrainee.startingSalary.toLocaleString('en-IN')}</strong> → Current: <strong>₹{currentSalary.toLocaleString('en-IN')}</strong>
              </span>
              <span className="font-bold text-secondary text-sm">
                Wage Growth: {growth >= 0 ? `+${growth}%` : `${growth}%`}
              </span>
            </div>
          )}

          {/* Verification Method */}
          <div className="flex flex-col gap-space-4">
            <label className="font-label-md text-label-md font-semibold text-on-surface">
              Verification Method
            </label>
            <select
              value={verificationMethod}
              onChange={(e) => setVerificationMethod(e.target.value as any)}
              className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container border border-outline-variant/30 cursor-pointer"
            >
              <option value="In-Person Visit">In-Person Visit (Field Officer physical check)</option>
              <option value="Salary Slip Validated">Salary Slip Validated (Bank/slip proof)</option>
              <option value="Employer Confirmed">Employer Confirmed (HR verification)</option>
              <option value="Tele-verification">Tele-verification (Recorded audio log)</option>
              <option value="EPFO Synced">EPFO Synced (Universal Account Number)</option>
            </select>
          </div>

          {/* Field Officer Notes */}
          <div className="flex flex-col gap-space-4">
            <label className="font-label-md text-label-md font-semibold text-on-surface">
              Field Officer Verification Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter observations regarding job retention, role progression, and workplace conditions..."
              rows={3}
              className="p-space-12 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container placeholder:text-outline border border-outline-variant/30"
            />
          </div>

          {/* Document Upload Simulation */}
          <div
            onClick={() => showToast('Proof attached: Audit_Attestation_Doc.pdf')}
            className="p-space-12 rounded-lg bg-surface-container-low flex items-center justify-center gap-2 text-center cursor-pointer hover:bg-surface-container transition-colors border border-dashed border-outline-variant/60"
          >
            <span className="material-symbols-outlined text-primary text-lg">cloud_upload</span>
            <span className="font-body-sm text-body-sm text-on-surface">
              Attach Salary Slip / Attestation Proof (PDF, max 5MB)
            </span>
          </div>

          {/* Modal Footer */}
          <div className="pt-space-12 bg-surface-container-lowest flex items-center justify-end gap-space-12 border-t border-surface-container">
            <button
              type="button"
              onClick={onClose}
              className="px-space-16 py-space-8 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-body-md-medium text-body-md-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-space-20 py-space-8 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors font-body-md-medium text-body-md-medium flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                  <span>Saving Audit...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">edit_document</span>
                  <span>Submit &amp; Sign Audit Entry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

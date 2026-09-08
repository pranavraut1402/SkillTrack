import React, { useState } from 'react';
import { Trainee } from '../types';
import { useTrainees } from '../context/TraineeContext';

interface DeleteTraineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainee: Trainee;
}

export const DeleteTraineeModal: React.FC<DeleteTraineeModalProps> = ({
  isOpen,
  onClose,
  trainee
}) => {
  const { deleteTrainee, setActivePage, showToast } = useTrainees();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !trainee) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteTrainee(trainee.id);
      showToast(`Trainee ${trainee.name} (${trainee.id}) and all associated records have been permanently deleted.`, 'success');
      onClose();
      setActivePage('trainees');
    } catch (err: any) {
      console.error('Delete trainee failed:', err);
      const msg = err?.message || 'Failed to delete trainee records from database. Please verify network or database permissions and try again.';
      setErrorMessage(msg);
      showToast(`Error deleting trainee: ${msg}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return; // Prevent closing while deletion is in progress
    setErrorMessage(null);
    onClose();
  };

  return (
    <div
      id="delete-trainee-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-space-16"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/30 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-space-20 bg-surface-container-low border-b border-surface-container gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="delete-modal-back-btn"
              onClick={handleClose}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container bg-surface-container-lowest border border-outline-variant/30 transition-all cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              title="Back"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back</span>
            </button>
            <div className="h-5 w-px bg-outline-variant/30 hidden sm:block"></div>
            <div className="flex items-center gap-space-12">
              <div className="w-10 h-10 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">delete_forever</span>
              </div>
              <div>
                <h3 id="delete-modal-title" className="text-lg font-bold text-on-surface">
                  Delete Trainee
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Officer / Admin Permanent Record Removal
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            id="close-delete-modal-button"
            onClick={handleClose}
            disabled={isDeleting}
            className="p-space-4 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-space-24 flex flex-col gap-space-16 max-h-[75vh] overflow-y-auto">
          {/* Target Trainee Card */}
          <div className="p-space-16 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between gap-space-12">
            <div className="flex items-center gap-space-12 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary-container text-on-primary font-bold text-sm flex items-center justify-center shrink-0 ring-1 ring-outline-variant/30">
                {trainee.profileImage || trainee.avatar ? (
                  <img
                    src={trainee.profileImage || trainee.avatar}
                    alt={trainee.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{trainee.initials || trainee.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-on-surface text-base truncate">
                  {trainee.name}
                </div>
                <div className="text-xs text-on-surface-variant flex items-center gap-space-6 flex-wrap mt-space-2">
                  <span>Course: {trainee.course}</span>
                  <span>•</span>
                  <span>{trainee.district}, {trainee.state || 'Maharashtra'}</span>
                </div>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <span className="inline-block px-space-8 py-space-2 rounded bg-surface-container-highest text-on-surface font-mono font-bold text-xs">
                {trainee.id}
              </span>
              <div className="text-[11px] text-on-surface-variant mt-space-2">
                SkillTrack ID
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="p-space-16 rounded-xl bg-error-container/20 border border-error/30 flex items-start gap-space-12">
            <span className="material-symbols-outlined text-error text-xl shrink-0 mt-0.5">
              warning
            </span>
            <div className="flex flex-col text-xs text-on-surface">
              <span className="font-bold text-error text-sm">
                Warning: Irreversible Action
              </span>
              <p className="text-on-surface-variant mt-1 leading-relaxed">
                Deleting this trainee will permanently purge their profile and all associated records across the state skill database. This action cannot be rolled back.
              </p>
            </div>
          </div>

          {/* List of records to be deleted */}
          <div className="flex flex-col gap-space-8">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">
              Associated Records To Be Deleted
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-8 text-xs text-on-surface">
              <div className="p-space-10 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center gap-space-8">
                <span className="material-symbols-outlined text-primary text-base">badge</span>
                <span>Trainee Profile &amp; Enrollment</span>
              </div>
              <div className="p-space-10 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center gap-space-8">
                <span className="material-symbols-outlined text-primary text-base">calendar_today</span>
                <span>Training Records &amp; Attendance</span>
              </div>
              <div className="p-space-10 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center gap-space-8">
                <span className="material-symbols-outlined text-primary text-base">fact_check</span>
                <span>Assessments &amp; Certifications</span>
              </div>
              <div className="p-space-10 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center gap-space-8">
                <span className="material-symbols-outlined text-primary text-base">work</span>
                <span>Employment &amp; Wage Records</span>
              </div>
              <div className="p-space-10 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center gap-space-8">
                <span className="material-symbols-outlined text-primary text-base">history_edu</span>
                <span>Follow-Up Milestones</span>
              </div>
              <div className="p-space-10 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center gap-space-8">
                <span className="material-symbols-outlined text-primary text-base">psychology</span>
                <span>Skill Profiles &amp; AI Pathways</span>
              </div>
            </div>
          </div>

          {/* Error Message if deletion failed */}
          {errorMessage && (
            <div
              id="delete-error-message"
              className="p-space-12 rounded-xl bg-error-container text-on-error-container border border-error flex items-start gap-space-8 text-xs"
            >
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
              <div className="flex flex-col">
                <span className="font-bold">Deletion Failed</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-space-20 bg-surface-container-low border-t border-surface-container flex items-center justify-end gap-space-12">
          <button
            type="button"
            id="cancel-delete-button"
            onClick={handleClose}
            disabled={isDeleting}
            className="px-space-16 py-space-8 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-space-20 py-space-8 rounded-lg bg-error hover:bg-error/90 text-on-error transition-colors text-sm font-semibold flex items-center gap-space-8 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">
                  progress_activity
                </span>
                <span>Deleting Records...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">delete</span>
                <span>Delete Trainee Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

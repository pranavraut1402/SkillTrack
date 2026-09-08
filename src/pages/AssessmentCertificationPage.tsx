import React, { useState } from 'react';
import { useTrainees } from '../context/TraineeContext';
import { BackButton } from '../components/BackButton';
import { UpdateTrainingModal } from '../components/UpdateTrainingModal';

export const AssessmentCertificationPage: React.FC = () => {
  const { trainees, selectedTraineeId, setSelectedTraineeId, openTraineeProfile, setActivePage, showToast } = useTrainees();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (id: string) => {
    setSelectedTraineeId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <div className="px-space-24 py-space-20 bg-surface-container-lowest border-b border-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <BackButton
              label="Back to Trainee Profile"
              onClick={() => {
                if (selectedTraineeId) {
                  openTraineeProfile(selectedTraineeId);
                } else {
                  setActivePage('trainees');
                }
              }}
              id="assessment-back-profile-btn"
            />
            <BackButton
              label="Back to Directory"
              to="trainees"
              id="assessment-back-directory-btn"
              className="text-outline"
            />
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-label-sm uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-base text-primary">military_tech</span>
            <span>State Skill Council • Assessment Board</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">
            Assessment &amp; Certification
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Standardized third-party skill assessments, certification audits, and National Skill Qualification Framework (NSQF) alignment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => showToast('Batch certificate verification completed. All signatures valid.')}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">verified</span>
            <span>Verify Certificates</span>
          </button>
        </div>
      </div>

      <div className="p-space-24 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Assessed Candidates</div>
            <div className="text-3xl font-extrabold text-on-surface mt-2">8,912</div>
            <p className="text-xs text-on-surface-variant mt-1">Evaluated by Sector Skill Councils</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">State Pass Rate</div>
            <div className="text-3xl font-extrabold text-emerald-700 mt-2">85.6%</div>
            <p className="text-xs text-emerald-700 font-semibold mt-1">Certified for workforce entry</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Avg Assessment Score</div>
            <div className="text-3xl font-extrabold text-on-surface mt-2">82.4%</div>
            <p className="text-xs text-on-surface-variant mt-1">Theory + Practical Combined</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">DigiLocker Integration</div>
            <div className="text-3xl font-extrabold text-primary mt-2">100%</div>
            <p className="text-xs text-on-surface-variant mt-1">Direct digital credentials pushed</p>
          </div>
        </div>

        {/* Assessment Ledger Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <div className="p-4 bg-surface-container-low/60 border-b border-surface-container flex items-center justify-between">
            <h3 className="text-base font-bold text-on-surface">Candidate Certification Ledger</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Course Track</th>
                  <th className="py-3 px-4">Assessment Score</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Certificate ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low text-sm text-on-surface">
                {trainees.map(t => (
                  <tr key={t.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-4 px-4 font-medium">
                      <div>{t.name}</div>
                      <div className="text-xs text-on-surface-variant">{t.id}</div>
                    </td>
                    <td className="py-4 px-4">{t.course}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-on-surface">{t.assessmentScore}%</div>
                      <div className="text-xs text-on-surface-variant">{t.assessmentStatus}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-xs font-bold text-primary">
                        {t.assessmentGrade}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-on-surface-variant">
                      {t.certificateId || 'CERT-MH-2025-4819'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container text-xs font-semibold">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        {t.certificationStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => showToast(`Downloaded Certificate: ${t.certificateId || 'CERT-MH-2025'}.pdf`)}
                          className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface"
                          title="Download Certificate"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(t.id)}
                          className="px-3 py-1 rounded bg-surface-container hover:bg-primary hover:text-white text-xs font-semibold text-primary transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => openTraineeProfile(t.id)}
                          className="px-2 py-1 rounded text-outline hover:text-on-surface text-xs"
                        >
                          <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UpdateTrainingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab="assessment"
      />
    </div>
  );
};

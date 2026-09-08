import React, { useState } from 'react';
import { useTrainees } from '../context/TraineeContext';
import { BackButton } from '../components/BackButton';
import { UpdateTrainingModal } from '../components/UpdateTrainingModal';

export const PlacementTrackingPage: React.FC = () => {
  const { trainees, metrics, setSelectedTraineeId, openTraineeProfile, showToast } = useTrainees();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (id: string) => {
    setSelectedTraineeId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <div className="px-space-24 py-space-20 bg-surface-container-lowest border-b border-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="mb-2">
            <BackButton label="Back to Dashboard" to="dashboard" id="placement-back-btn" />
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-label-sm uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-base text-primary">business_center</span>
            <span>Industry Linkages &amp; Placement Cell</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">
            Placement Tracking &amp; Drives
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Corporate hiring pipelines, placement drives, offer letter issuance, and wage benchmarking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => showToast('New corporate campus placement drive scheduled.')}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_business</span>
            <span>Schedule Placement Drive</span>
          </button>
        </div>
      </div>

      <div className="p-space-24 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Overall Placement Rate</div>
            <div className="text-3xl font-extrabold text-emerald-700 mt-2">{metrics.placementRate}%</div>
            <p className="text-xs text-emerald-700 font-semibold mt-1">+8% above statutory threshold (70%)</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Avg Starting Salary</div>
            <div className="text-3xl font-extrabold text-on-surface mt-2">₹{metrics.averageStartingSalary.toLocaleString()}</div>
            <p className="text-xs text-on-surface-variant mt-1">Formal sector entry salary</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Corporate Partners</div>
            <div className="text-3xl font-extrabold text-primary mt-2">240+</div>
            <p className="text-xs text-on-surface-variant mt-1">Active MoUs signed across industries</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Offer Letters Issued</div>
            <div className="text-3xl font-extrabold text-on-surface mt-2">6,840</div>
            <p className="text-xs text-secondary font-semibold mt-1">Verified with HR offer letters</p>
          </div>
        </div>

        {/* Placed Candidates Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <div className="p-4 bg-surface-container-low/60 border-b border-surface-container flex items-center justify-between">
            <h3 className="text-base font-bold text-on-surface">Candidate Placement Registry</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Employer</th>
                  <th className="py-3 px-4">Job Role</th>
                  <th className="py-3 px-4">Starting Salary</th>
                  <th className="py-3 px-4">Joining Date</th>
                  <th className="py-3 px-4">Placement Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low text-sm text-on-surface">
                {trainees.map(t => (
                  <tr key={t.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-4 px-4 font-medium">
                      <div>{t.name}</div>
                      <div className="text-xs text-on-surface-variant">{t.id} • {t.district}</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-on-surface">{t.employer || 'In Pipeline'}</td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant">{t.jobRole}</td>
                    <td className="py-4 px-4 font-bold text-on-surface">
                      ₹{t.startingSalary.toLocaleString()}/mo
                    </td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant">{t.joiningDate || '15 Jun 2025'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        t.placementStatus === 'Successful'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {t.placementStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(t.id)}
                          className="px-3 py-1 rounded bg-surface-container hover:bg-primary hover:text-white text-xs font-semibold text-primary transition-colors cursor-pointer"
                        >
                          Update
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
        defaultTab="employment"
      />
    </div>
  );
};

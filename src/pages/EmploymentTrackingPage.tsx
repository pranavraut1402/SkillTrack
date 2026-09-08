import React, { useState } from 'react';
import { useTrainees } from '../context/TraineeContext';
import { UpdateTrainingModal } from '../components/UpdateTrainingModal';
import { BackButton } from '../components/BackButton';
import { downloadDemoFile } from '../utils/downloadHelper';
import { getTraineeAvatar } from '../utils/avatarHelper';

export const EmploymentTrackingPage: React.FC = () => {
  const { trainees, metrics, setSelectedTraineeId, openTraineeProfile, showToast } = useTrainees();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUpdate = (id: string) => {
    setSelectedTraineeId(id);
    setIsModalOpen(true);
  };

  const filtered = trainees.filter(t => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.employer.toLowerCase().includes(q) ||
      t.jobRole.toLowerCase().includes(q) ||
      t.employmentStatus.toLowerCase().includes(q)
    );
  });

  const handleExportCareerReport = () => {
    const header = 'Candidate ID,Name,Employment Status,Employer,Job Role,Starting Salary,Current Salary,Wage Growth %,Tenure Stability\n';
    const rows = filtered.map(t => {
      const growth = t.startingSalary > 0
        ? Math.round(((t.currentSalary - t.startingSalary) / t.startingSalary) * 100)
        : 0;
      return `"${t.id}","${t.name}","${t.employmentStatus}","${t.employer}","${t.jobRole}",₹${t.startingSalary},₹${t.currentSalary},+${growth}%,${t.tenureStabilityMonths} Months`;
    }).join('\n');
    const content = `SKILLTRACK - LONGITUDINAL CAREER & WAGE PROGRESSION AUDIT REPORT\nGenerated: ${new Date().toLocaleString()}\nCohort Size: ${filtered.length}\n\n${header}${rows}`;
    downloadDemoFile('SkillTrack_Career_Wage_Report.csv', content);
    showToast(`Downloaded Career Audit Report for ${filtered.length} candidates`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <div className="px-space-24 py-space-20 bg-surface-container-lowest border-b border-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="mb-2">
            <BackButton label="Back to Dashboard" to="dashboard" id="employment-tracking-back-btn" />
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-label-sm uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-base text-primary">work</span>
            <span>Employment Directorate • Long-term Tracking</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">
            Employment &amp; Career Trajectory
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Audit long-term career stability, wage progression, job changes, and employer retention verifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCareerReport}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">analytics</span>
            <span>Generate Career Audit Report</span>
          </button>
        </div>
      </div>

      <div className="p-space-24 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Employment Rate</div>
            <div className="text-3xl font-extrabold text-emerald-700 mt-2">{metrics.employmentRate}%</div>
            <p className="text-xs text-on-surface-variant mt-1">Formal wage + self-employed</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Average Current Wage</div>
            <div className="text-3xl font-extrabold text-on-surface mt-2">₹{metrics.averageCurrentSalary.toLocaleString()}</div>
            <p className="text-xs text-secondary font-semibold mt-1">+{metrics.salaryGrowthPercent}% wage growth</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Tenure Stability</div>
            <div className="text-3xl font-extrabold text-primary mt-2">7.2 Mo</div>
            <p className="text-xs text-on-surface-variant mt-1">Median job duration across candidates</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Longitudinal Compliance</div>
            <div className="text-3xl font-extrabold text-emerald-700 mt-2">91.4%</div>
            <p className="text-xs text-emerald-700 font-semibold mt-1">Candidates in active follow-up cycle</p>
          </div>
        </div>

        {/* Search and Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <div className="p-4 bg-surface-container-low/60 border-b border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-on-surface">Verified Employment Registry</h3>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-lg pointer-events-none">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate, ID, or employer..."
                className="w-full sm:w-72 h-9 pl-9 pr-3 rounded-lg bg-surface-container-lowest text-xs font-medium text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-outline hover:text-on-surface text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Employer</th>
                  <th className="py-3 px-4">Job Designation</th>
                  <th className="py-3 px-4">Entry Wage</th>
                  <th className="py-3 px-4">Current Wage</th>
                  <th className="py-3 px-4">Wage Growth</th>
                  <th className="py-3 px-4">Tenure</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low text-sm text-on-surface">
                {filtered.map(t => {
                  const growth = t.startingSalary > 0
                    ? Math.round(((t.currentSalary - t.startingSalary) / t.startingSalary) * 100)
                    : 0;

                  return (
                    <tr key={t.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-4 px-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center shrink-0 ring-1 ring-outline-variant/30">
                            <img
                              src={getTraineeAvatar(t)}
                              alt={t.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface">{t.name}</div>
                            <div className="text-xs text-on-surface-variant">{t.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold">{t.employer || '—'}</td>
                      <td className="py-4 px-4 text-xs text-on-surface-variant">{t.jobRole || '—'}</td>
                      <td className="py-4 px-4">₹{t.startingSalary.toLocaleString()}</td>
                      <td className="py-4 px-4 font-bold text-emerald-700">₹{t.currentSalary.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-bold text-secondary flex items-center">
                          <span className="material-symbols-outlined text-xs">arrow_upward</span>
                          +{growth}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-on-surface-variant">{t.tenureStabilityMonths} Months</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdate(t.id)}
                            className="px-3 py-1 rounded bg-surface-container hover:bg-primary hover:text-white text-xs font-semibold text-primary transition-colors cursor-pointer"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={() => openTraineeProfile(t.id)}
                            className="px-2 py-1 rounded text-outline hover:text-on-surface text-xs cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

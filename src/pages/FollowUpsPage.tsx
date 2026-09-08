import React, { useState } from 'react';
import { useTrainees } from '../context/TraineeContext';
import { UpdateFollowUpModal } from '../components/UpdateFollowUpModal';
import { BackButton } from '../components/BackButton';
import { downloadDemoFile } from '../utils/downloadHelper';
import { getTraineeAvatar } from '../utils/avatarHelper';

export const FollowUpsPage: React.FC = () => {
  const {
    trainees,
    setSelectedTraineeId,
    openTraineeProfile,
    metrics,
    showToast
  } = useTrainees();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenAuditModal = (traineeId?: string) => {
    if (traineeId) {
      setSelectedTraineeId(traineeId);
    }
    setIsUpdateModalOpen(true);
  };

  const filteredTrainees = trainees.filter(t => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = q === '' ||
      t.name.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.employer.toLowerCase().includes(q) ||
      t.district.toLowerCase().includes(q);

    const matchesCycle = selectedCycle === 'All' ||
      t.currentFollowUpCycle.toLowerCase().includes(selectedCycle.toLowerCase()) ||
      t.followUps.some(f => f.stage.toLowerCase().includes(selectedCycle.toLowerCase()));

    return matchesSearch && matchesCycle;
  });

  const handleExportAuditLog = () => {
    const header = 'Candidate ID,Name,District,Milestone Stage,Employer,Current Salary,Verification Method,Verification Notes\n';
    const rows = filteredTrainees.map(t => {
      const latest = t.followUps[t.followUps.length - 1];
      return `"${t.id}","${t.name}","${t.district}","${latest?.stage || t.currentFollowUpCycle}","${t.employer || 'Self-Employed'}",₹${t.currentSalary},"${latest?.verificationMethod || 'In-Person Visit'}","${(latest?.fieldOfficerNotes || 'Active retention verified.').replace(/"/g, '""')}"`;
    }).join('\n');
    const content = `SKILLTRACK LONGITUDINAL RETENTION AUDIT LEDGER - MILESTONE: ${selectedCycle}\nGenerated: ${new Date().toLocaleString()}\nTotal Records: ${filteredTrainees.length}\n\n${header}${rows}`;
    downloadDemoFile(`SkillTrack_FollowUp_Audit_${selectedCycle.replace(/\s+/g, '_')}.csv`, content);
    showToast(`Exported ${filteredTrainees.length} audit records (${selectedCycle})`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Header Deck */}
      <div className="px-space-24 py-space-20 bg-surface-container-lowest border-b border-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-space-16">
        <div>
          <div className="mb-2">
            <BackButton label="Back to Dashboard" to="dashboard" id="followups-back-btn" />
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-label-sm uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-base text-primary">event_available</span>
            <span>Post-Placement Compliance &amp; Longitudinal Audit</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">
            Follow-Up &amp; Retention Audits
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Track 30-day, 90-day, 6-month, 12-month, and 24-month career retention checkpoints with verifiable proofs.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleExportAuditLog}
            className="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            <span>Export Audit Log (CSV)</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAuditModal()}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">post_add</span>
            <span>New Follow-up Audit Entry</span>
          </button>
        </div>
      </div>

      <div className="p-space-24 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">Due This Month</span>
              <span className="material-symbols-outlined text-primary text-lg">calendar_clock</span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-on-surface">412</div>
              <p className="text-xs text-on-surface-variant mt-1">Scheduled for automated &amp; field review</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">Completed Audits</span>
              <span className="material-symbols-outlined text-secondary text-lg">task_alt</span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-on-surface">3,890</div>
              <p className="text-xs text-secondary font-semibold mt-1">Verified with documentary proof</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">Pending Verification</span>
              <span className="material-symbols-outlined text-amber-600 text-lg">hourglass_top</span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-amber-700">84</div>
              <p className="text-xs text-on-surface-variant mt-1">Awaiting salary slip or employer sign-off</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-xs uppercase tracking-wider font-semibold text-outline">12-Mo Retention Rate</span>
              <span className="material-symbols-outlined text-emerald-600 text-lg">trending_up</span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-emerald-700">{metrics.twelveMonthRetentionRate}%</div>
              <p className="text-xs text-on-surface-variant mt-1">Sustained placement compliance</p>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80 flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-lg pointer-events-none">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, ID, or employer..."
              className="w-full h-10 pl-10 pr-3 bg-surface-container-low rounded-lg text-sm text-on-surface focus:outline-none"
            />
          </div>

          {/* Milestone Cycle Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['All', '30 Days', '90 Days', '6 Months', '12 Months', '24 Months'].map(cycle => (
              <button
                key={cycle}
                type="button"
                onClick={() => setSelectedCycle(cycle)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCycle === cycle
                    ? 'bg-primary text-white'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                {cycle}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Registry Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <div className="p-4 bg-surface-container-low/60 border-b border-surface-container flex items-center justify-between">
            <h3 className="text-base font-bold text-on-surface">Verified Milestone Follow-up Records</h3>
            <span className="text-xs text-on-surface-variant">Displaying {filteredTrainees.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Trainee Candidate</th>
                  <th className="py-3 px-4">Milestone</th>
                  <th className="py-3 px-4">Current Employer</th>
                  <th className="py-3 px-4">Verified Wage</th>
                  <th className="py-3 px-4">Proof / Method</th>
                  <th className="py-3 px-4">Field Officer Notes</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low text-sm text-on-surface">
                {filteredTrainees.map(t => {
                  const latestFollowUp = t.followUps[t.followUps.length - 1];

                  return (
                    <tr key={t.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-4 px-4">
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
                            <div className="text-xs text-on-surface-variant">{t.id} • {t.district}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container text-xs font-semibold">
                          {latestFollowUp?.stage || t.currentFollowUpCycle}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>{t.employer || 'Self-Employed'}</div>
                        <div className="text-xs text-on-surface-variant">{t.jobRole}</div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-emerald-700">
                        ₹{t.currentSalary.toLocaleString()}/mo
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                          <span>{latestFollowUp?.verificationMethod || 'Salary Slip Validated'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-on-surface-variant max-w-[220px] truncate" title={latestFollowUp?.fieldOfficerNotes}>
                        {latestFollowUp?.fieldOfficerNotes || 'Active retention verified. Candidate reported satisfactory career progression.'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenAuditModal(t.id)}
                            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-white text-xs font-semibold text-primary transition-colors cursor-pointer"
                          >
                            Update Audit
                          </button>
                          <button
                            type="button"
                            onClick={() => openTraineeProfile(t.id)}
                            className="px-2.5 py-1.5 rounded-lg text-outline hover:text-on-surface text-xs"
                            title="View Full Profile"
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

      <UpdateFollowUpModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />
    </div>
  );
};

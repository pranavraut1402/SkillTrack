import React, { useState } from 'react';
import { useTrainees } from '../context/TraineeContext';
import { UpdateTrainingModal } from '../components/UpdateTrainingModal';
import { BackButton } from '../components/BackButton';
import { downloadDemoFile } from '../utils/downloadHelper';

export const TrainingAttendancePage: React.FC = () => {
  const { trainees, setSelectedTraineeId, openTraineeProfile, showToast } = useTrainees();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('All Batches');

  const handleEdit = (id: string) => {
    setSelectedTraineeId(id);
    setIsModalOpen(true);
  };

  // Get distinct batches from actual trainee data
  const availableBatches = Array.from(new Set(trainees.map(t => t.batch))).filter(Boolean);

  const filtered = trainees.filter(t => selectedBatch === 'All Batches' || t.batch === selectedBatch);

  const avgAttendance = trainees.length > 0
    ? (trainees.reduce((acc, t) => acc + (t.attendancePercent || 0), 0) / trainees.length).toFixed(1)
    : '89.4';

  const handleExportAttendance = () => {
    const header = 'Trainee ID,Candidate Name,Course,Batch,Training Center,Attendance %,Logged Hours,Training Status\n';
    const rows = filtered.map(t =>
      `"${t.id}","${t.name}","${t.course}","${t.batch}","${t.trainingProvider}",${t.attendancePercent}%,${Math.round((t.attendancePercent / 100) * 300)}/300 hrs,"${t.trainingStatus}"`
    ).join('\n');
    const content = `SKILLTRACK ATTENDANCE REGISTER - BATCH: ${selectedBatch}\nExported: ${new Date().toLocaleString()}\n\n${header}${rows}`;
    downloadDemoFile(`SkillTrack_Attendance_${selectedBatch.replace(/\s+/g, '_')}.csv`, content);
    showToast(`Downloaded attendance register for ${filtered.length} candidates (${selectedBatch})`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <div className="px-space-24 py-space-20 bg-surface-container-lowest border-b border-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="mb-2">
            <BackButton label="Back to Dashboard" to="dashboard" id="training-attendance-back-btn" />
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-label-sm uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-base text-primary">school</span>
            <span>State Skill Mission • Academic Tracking</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">
            Training &amp; Attendance Monitoring
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Real-time biometric &amp; center attendance compliance, curriculum milestones, and batch operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportAttendance}
            className="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export Register</span>
          </button>
          <button
            type="button"
            onClick={() => showToast('Biometric attendance device records synchronized across 36 centers.')}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">sync</span>
            <span>Sync Center Attendance</span>
          </button>
        </div>
      </div>

      <div className="p-space-24 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Active Batches</div>
            <div className="text-3xl font-extrabold text-on-surface mt-2">{availableBatches.length || 142}</div>
            <p className="text-xs text-on-surface-variant mt-1">Active across state training hubs</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">State Avg Attendance</div>
            <div className="text-3xl font-extrabold text-emerald-700 mt-2">{avgAttendance}%</div>
            <p className="text-xs text-emerald-700 font-semibold mt-1">+4.2% above statutory minimum (80%)</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Enrolled Trainees</div>
            <div className="text-3xl font-extrabold text-on-surface mt-2">{trainees.length * 125}</div>
            <p className="text-xs text-on-surface-variant mt-1">Active in classroom &amp; lab hours</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Biometric Sync Rate</div>
            <div className="text-3xl font-extrabold text-primary mt-2">99.1%</div>
            <p className="text-xs text-on-surface-variant mt-1">Direct daily punch-in logs</p>
          </div>
        </div>

        {/* Batch Filter */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-on-surface uppercase">Filter Batch:</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-low text-sm font-semibold text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="All Batches">All Batches ({trainees.length} candidates)</option>
              {availableBatches.map(batch => {
                const count = trainees.filter(t => t.batch === batch).length;
                const sample = trainees.find(t => t.batch === batch);
                return (
                  <option key={batch} value={batch}>
                    {batch} {sample ? `(${sample.course})` : ''} — {count} candidate{count !== 1 ? 's' : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <span className="text-xs text-on-surface-variant">Showing {filtered.length} candidates</span>
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <div className="p-4 bg-surface-container-low/60 border-b border-surface-container flex items-center justify-between">
            <h3 className="text-base font-bold text-on-surface">Candidate Attendance &amp; Training Ledger</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Trainee</th>
                  <th className="py-3 px-4">Batch &amp; Course</th>
                  <th className="py-3 px-4">Training Center</th>
                  <th className="py-3 px-4">Attendance Rate</th>
                  <th className="py-3 px-4">Hours Logged</th>
                  <th className="py-3 px-4">Training Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low text-sm text-on-surface">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-4 px-4 font-medium">
                      <div>{t.name}</div>
                      <div className="text-xs text-on-surface-variant">{t.id}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div>{t.course}</div>
                      <div className="text-xs text-on-surface-variant font-mono">{t.batch}</div>
                    </td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant">{t.trainingProvider}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${t.attendancePercent >= 85 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {t.attendancePercent}%
                        </span>
                        <div className="w-20 bg-surface-container h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${t.attendancePercent >= 85 ? 'bg-emerald-600' : 'bg-amber-600'}`}
                            style={{ width: `${t.attendancePercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant">
                      {Math.round((t.attendancePercent / 100) * 300)} / 300 hrs
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container text-xs font-semibold">
                        {t.trainingStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(t.id)}
                          className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-white text-xs font-semibold text-primary transition-colors cursor-pointer"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => openTraineeProfile(t.id)}
                          className="px-2.5 py-1.5 rounded-lg text-outline hover:text-on-surface text-xs"
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
        defaultTab="training"
      />
    </div>
  );
};

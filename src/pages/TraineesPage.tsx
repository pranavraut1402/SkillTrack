import React, { useState, useEffect } from 'react';
import { useTrainees } from '../context/TraineeContext';
import { BackButton } from '../components/BackButton';
import { RegistrationModal } from '../components/RegistrationModal';
import { downloadDemoFile, generateTraineesCSV } from '../utils/downloadHelper';
import { getTraineeAvatar } from '../utils/avatarHelper';

export const TraineesPage: React.FC = () => {
  const {
    trainees,
    selectedTrainee,
    setSelectedTraineeId,
    openTraineeProfile,
    metrics,
    showToast,
    globalSearchQuery,
    setGlobalSearchQuery
  } = useTrainees();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || '');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [selectedProvider, setSelectedProvider] = useState('All Institutes');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>(['ST1001']);

  useEffect(() => {
    if (globalSearchQuery) {
      setSearchQuery(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  // Filter trainees
  const filteredTrainees = trainees.filter(t => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = q === '' ||
      t.name.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.course.toLowerCase().includes(q) ||
      t.batch.toLowerCase().includes(q) ||
      t.district.toLowerCase().includes(q) ||
      t.employer.toLowerCase().includes(q) ||
      t.trainingProvider.toLowerCase().includes(q);
    
    const matchesDistrict = selectedDistrict === 'All Districts' || t.district === selectedDistrict;
    const matchesCourse = selectedCourse === 'All Courses' || t.course === selectedCourse;
    const matchesProvider = selectedProvider === 'All Institutes' || t.trainingProvider.includes(selectedProvider);
    const matchesStatus = selectedStatus === 'All Statuses' || t.employmentStatus === selectedStatus;

    return matchesSearch && matchesDistrict && matchesCourse && matchesProvider && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(filteredTrainees.map(t => t.id));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleOpenDrawer = (id: string) => {
    setSelectedTraineeId(id);
    setIsDrawerOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setGlobalSearchQuery('');
    setSelectedDistrict('All Districts');
    setSelectedCourse('All Courses');
    setSelectedProvider('All Institutes');
    setSelectedStatus('All Statuses');
    showToast('Filters reset to show all registered trainees.');
  };

  const handleExportCSV = () => {
    const csv = generateTraineesCSV(filteredTrainees);
    downloadDemoFile('SkillTrack_Trainees_Registry.csv', csv);
    showToast(`Downloaded CSV registry (${filteredTrainees.length} records)`);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="px-space-24 py-space-20 max-w-[1600px] mx-auto w-full flex flex-col gap-space-20">
        {/* Notice Banner for Case Study Highlight */}
        <div className="bg-primary-container text-on-primary rounded-lg p-space-12 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-space-12">
            <span className="material-symbols-outlined text-secondary-fixed text-xl">star</span>
            <div className="flex items-center gap-space-8 flex-wrap">
              <span className="font-label-md text-label-md uppercase tracking-wider bg-on-primary-fixed-variant text-inverse-on-surface px-space-8 py-space-2 rounded font-bold">
                State Flagship Demo
              </span>
              <span className="font-body-md-medium text-body-md-medium">
                Highlighted for State Case Study: <strong className="text-white">Priya Sharma (ST1001)</strong> — Longitudinal Post-Placement Retention Track (Yavatmal District).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-12 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenDrawer('ST1001')}
              className="bg-secondary text-on-secondary px-space-12 py-space-4 rounded font-label-md text-label-md flex items-center gap-space-4 hover:bg-on-secondary-container transition-colors shadow-sm cursor-pointer"
            >
              <span>Inspect Case Audit</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-16 pb-space-4">
          <div className="flex flex-col">
            <div className="mb-2">
              <BackButton label="Back to Dashboard" to="dashboard" id="trainees-back-btn" />
            </div>
            <div className="flex items-center gap-space-8 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider mb-space-4">
              <span className="material-symbols-outlined text-base text-primary">verified_user</span>
              <span>Mission Directorate • Unified Candidate Registry</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight">
              Trainees
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-2">
              Comprehensive registry of enrolled, certified, placed, and longitudinally tracked candidates across all 36 state administrative zones.
            </p>
          </div>

          {/* Top Action Buttons */}
          <div className="flex items-center gap-space-8 flex-wrap">
            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors font-body-md-medium text-body-md-medium px-space-16 py-space-8 rounded-lg flex items-center gap-space-8 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">file_download</span>
              <span>Export Directory (CSV)</span>
            </button>
            <button
              type="button"
              onClick={() => showToast('Batch upload manifest ready. Supported: CSV, XLSX')}
              className="bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors font-body-md-medium text-body-md-medium px-space-16 py-space-8 rounded-lg flex items-center gap-space-8 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">upload_file</span>
              <span>Batch Upload</span>
            </button>
            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="bg-primary text-on-primary hover:bg-primary-container transition-colors font-body-md-medium text-body-md-medium px-space-16 py-space-8 rounded-lg flex items-center gap-space-8 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>Add New Trainee Record</span>
            </button>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-12">
          <div className="bg-surface-container-lowest p-space-16 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">
                Total Registered
              </span>
              <span className="material-symbols-outlined text-outline text-lg">badge</span>
            </div>
            <div className="mt-space-8 flex items-baseline justify-between">
              <span className="font-data-metric text-data-metric text-on-surface font-bold">
                {metrics.totalRegisteredCount.toLocaleString()}
              </span>
              <span className="text-secondary font-label-md text-label-md font-semibold flex items-center">
                <span className="material-symbols-outlined text-sm">trending_up</span>+8.4%
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-16 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">
                Assessed &amp; Certified
              </span>
              <span className="material-symbols-outlined text-outline text-lg">workspace_premium</span>
            </div>
            <div className="mt-space-8 flex items-baseline justify-between">
              <span className="font-data-metric text-data-metric text-on-surface font-bold">
                8,912
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm">85.0% pass rate</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-16 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">
                Placed in Workforce
              </span>
              <span className="material-symbols-outlined text-outline text-lg">business_center</span>
            </div>
            <div className="mt-space-8 flex items-baseline justify-between">
              <span className="font-data-metric text-data-metric text-secondary font-bold">
                6,840
              </span>
              <span className="bg-secondary-container text-on-secondary-container px-space-6 py-space-2 rounded text-label-sm font-semibold">
                {metrics.placementRate}% placement
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-16 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">
                6M+ Retention Verified
              </span>
              <span className="material-symbols-outlined text-outline text-lg">history_toggle_off</span>
            </div>
            <div className="mt-space-8 flex items-baseline justify-between">
              <span className="font-data-metric text-data-metric text-on-surface font-bold">
                5,124
              </span>
              <span className="text-primary font-label-md text-label-md font-semibold">
                Longitudinal Active
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Search Control Panel */}
        <div className="bg-surface-container-lowest p-space-16 rounded-xl shadow-sm flex flex-col gap-space-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-12 items-center">
            {/* Search Field */}
            <div className="md:col-span-4 relative flex items-center">
              <span className="material-symbols-outlined absolute left-space-12 text-outline text-lg pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or Skill ID (e.g. ST1001, Priya Sharma)..."
                className="w-full h-10 pl-space-40 pr-space-12 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-colors"
              />
            </div>

            {/* Filter Dropdown 1: District */}
            <div className="md:col-span-2">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full h-10 px-space-12 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:bg-surface-container-high transition-colors cursor-pointer"
              >
                <option value="All Districts">All Districts</option>
                <option value="Yavatmal">Yavatmal</option>
                <option value="Pune">Pune</option>
                <option value="Nagpur">Nagpur</option>
                <option value="Nashik">Nashik</option>
                <option value="Aurangabad">Aurangabad</option>
                <option value="Solapur">Solapur</option>
              </select>
            </div>

            {/* Filter Dropdown 2: Course */}
            <div className="md:col-span-2">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full h-10 px-space-12 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:bg-surface-container-high transition-colors cursor-pointer"
              >
                <option value="All Courses">All Courses</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Entry & Office Admin">Data Entry &amp; Office Admin</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Solar PV Installation">Solar PV Installation</option>
                <option value="Healthcare General Duty">Healthcare General Duty</option>
                <option value="Full Stack Development">Full Stack Development</option>
                <option value="Electrician & Wiring">Electrician &amp; Wiring</option>
              </select>
            </div>

            {/* Filter Dropdown 3: Provider */}
            <div className="md:col-span-2">
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full h-10 px-space-12 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:bg-surface-container-high transition-colors cursor-pointer"
              >
                <option value="All Institutes">All Institutes</option>
                <option value="Apex Skills Hub">Apex Skills Hub</option>
                <option value="Govt ITI Aundh">Govt ITI Aundh</option>
                <option value="Vidarbha Skill">Vidarbha Skill</option>
                <option value="Sahyadri Tech">Sahyadri Tech</option>
              </select>
            </div>

            {/* Filter Dropdown 4: Employment Status */}
            <div className="md:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-10 px-space-12 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface focus:outline-none focus:bg-surface-container-high transition-colors cursor-pointer"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Employed">Employed</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Apprenticeship">Apprenticeship</option>
                <option value="Job Seeking">Job Seeking</option>
                <option value="In Training">In Training</option>
              </select>
            </div>
          </div>

          {/* Active Filters Row & Results Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-8 pt-space-8 bg-surface-container-lowest">
            <div className="flex items-center flex-wrap gap-space-8">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Active Filters:</span>
              {selectedDistrict !== 'All Districts' && (
                <span className="inline-flex items-center gap-space-4 px-space-8 py-space-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md">
                  <span>District: <strong>{selectedDistrict}</strong></span>
                  <button type="button" onClick={() => setSelectedDistrict('All Districts')} className="hover:text-error flex items-center">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-space-4 px-space-8 py-space-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md">
                  <span>Query: <strong>"{searchQuery}"</strong></span>
                  <button type="button" onClick={() => setSearchQuery('')} className="hover:text-error flex items-center">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={clearFilters}
                className="text-primary hover:underline font-label-sm text-label-sm ml-space-4 cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="font-label-md text-label-md text-on-surface-variant flex items-center gap-space-4">
              <span className="material-symbols-outlined text-base text-outline">tune</span>
              <span>Showing <strong>1–{filteredTrainees.length}</strong> of <strong>{metrics.totalRegisteredCount.toLocaleString()}</strong> Trainee Records</span>
            </div>
          </div>
        </div>

        {/* Trainee Records Data Table Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md select-none">
                  <th className="py-space-12 px-space-16 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedRows.length === filteredTrainees.length && filteredTrainees.length > 0}
                      className="rounded text-primary focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-space-12 px-space-16 font-semibold uppercase tracking-wider">Skill ID</th>
                  <th className="py-space-12 px-space-16 font-semibold uppercase tracking-wider">Trainee Name &amp; Details</th>
                  <th className="py-space-12 px-space-16 font-semibold uppercase tracking-wider">Course &amp; Sector</th>
                  <th className="py-space-12 px-space-16 font-semibold uppercase tracking-wider">District</th>
                  <th className="py-space-12 px-space-16 font-semibold uppercase tracking-wider">Training Status</th>
                  <th className="py-space-12 px-space-16 font-semibold uppercase tracking-wider">Employment Status</th>
                  <th className="py-space-12 px-space-16 font-semibold uppercase tracking-wider">Follow-Up Cycle</th>
                  <th className="py-space-12 px-space-16 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-body-sm font-body-sm divide-y divide-surface-container-low">
                {filteredTrainees.map((t) => {
                  const isChecked = selectedRows.includes(t.id);
                  const isPriya = t.id === 'ST1001';

                  return (
                    <tr
                      key={t.id}
                      className={`${
                        isPriya ? 'bg-surface-container-high/40' : ''
                      } hover:bg-surface-container transition-colors group`}
                    >
                      <td className="py-space-12 px-space-16 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRow(t.id)}
                          className="rounded text-primary focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-space-12 px-space-16">
                        <div className="flex items-center gap-space-4">
                          <span className="font-mono font-semibold text-primary bg-primary-fixed px-space-8 py-space-2 rounded text-label-sm">
                            {t.id}
                          </span>
                          <span className="material-symbols-outlined text-secondary text-sm" title="Verified Record">
                            verified
                          </span>
                        </div>
                      </td>
                      <td className="py-space-12 px-space-16">
                        <div className="flex items-center gap-space-12">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-container text-on-primary flex items-center justify-center font-bold text-label-md shrink-0 shadow-sm ring-1 ring-outline-variant/30">
                            <img
                              src={getTraineeAvatar(t)}
                              alt={t.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-body-md-medium text-body-md-medium text-on-surface font-semibold flex items-center gap-space-6">
                              {t.name}
                              {isPriya && (
                                <span className="bg-secondary-fixed text-on-secondary-fixed text-label-sm px-space-4 py-0.5 rounded font-bold">
                                  DEMO TARGET
                                </span>
                              )}
                            </span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-space-4">
                              <span>UID: {t.maskedUid}</span>
                              <span>•</span>
                              <span>{t.phone}</span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-space-12 px-space-16">
                        <div className="flex flex-col">
                          <span className="font-body-md-medium text-on-surface font-medium">{t.course}</span>
                          <span className="text-label-sm font-label-sm text-on-surface-variant">{t.sector}</span>
                        </div>
                      </td>
                      <td className="py-space-12 px-space-16">
                        <div className="flex items-center gap-space-4">
                          <span className="material-symbols-outlined text-outline text-sm">location_on</span>
                          <span className="font-body-sm text-on-surface">{t.district}</span>
                        </div>
                      </td>
                      <td className="py-space-12 px-space-16">
                        <span className="inline-flex items-center gap-space-4 px-space-8 py-space-2 rounded-lg bg-secondary-container text-on-secondary-container font-label-md text-label-md font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          {t.trainingStatus}
                        </span>
                      </td>
                      <td className="py-space-12 px-space-16">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-space-4">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                t.employmentStatus === 'Employed' || t.employmentStatus === 'Self-Employed'
                                  ? 'bg-secondary'
                                  : t.employmentStatus === 'Apprenticeship'
                                  ? 'bg-surface-tint'
                                  : 'bg-on-tertiary-container'
                              }`}
                            ></span>
                            <span
                              className={`font-body-md-medium font-semibold ${
                                t.employmentStatus === 'Employed' || t.employmentStatus === 'Self-Employed'
                                  ? 'text-secondary'
                                  : 'text-on-surface'
                              }`}
                            >
                              {t.employmentStatus}
                            </span>
                          </div>
                          {t.employer && (
                            <span className="text-label-sm text-on-surface-variant truncate max-w-[170px]">
                              {t.employer} {t.currentSalary > 0 && `(₹${t.currentSalary.toLocaleString()}/mo)`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-space-12 px-space-16">
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-space-4 font-label-md text-label-md font-semibold text-secondary">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {t.currentFollowUpCycle}
                          </span>
                          <span className="text-label-sm text-on-surface-variant">Retention Verified</span>
                        </div>
                      </td>
                      <td className="py-space-12 px-space-16 text-right">
                        <div className="inline-flex items-center gap-space-4">
                          <button
                            type="button"
                            onClick={() => openTraineeProfile(t.id)}
                            className="bg-primary text-on-primary hover:bg-primary-container px-space-12 py-space-6 rounded-lg font-label-md text-label-md flex items-center gap-space-4 shadow-sm transition-colors cursor-pointer"
                          >
                            <span>View Profile</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(t.id)}
                            className="p-space-4 text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer"
                            title="Quick Drawer"
                          >
                            <span className="material-symbols-outlined text-lg">more_vert</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Batch Actions Bar */}
          <div className="px-space-16 py-space-12 bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-space-12">
            <div className="flex items-center gap-space-12">
              <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
                {selectedRows.length} record{selectedRows.length !== 1 ? 's' : ''} selected on page
              </span>
              <span className="text-outline">|</span>
              <button
                type="button"
                onClick={() => setSelectedRows(filteredTrainees.map(t => t.id))}
                className="font-label-md text-label-md text-primary font-bold hover:underline flex items-center gap-space-4 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">select_all</span>
                <span>Select all {metrics.totalRegisteredCount.toLocaleString()} trainees across all districts</span>
              </button>
            </div>

            <div className="flex items-center gap-space-8 flex-wrap">
              <button
                type="button"
                onClick={() => showToast(`Triggered follow-up broadcast to ${selectedRows.length} selected candidates.`)}
                className="bg-surface-container-lowest text-on-surface hover:bg-surface-container-high px-space-12 py-space-6 rounded-lg font-label-md text-label-md flex items-center gap-space-6 transition-colors shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">sms</span>
                <span>Trigger Follow-up SMS Broadcast</span>
              </button>
              <button
                type="button"
                onClick={() => showToast(`Assigned Field Verification Officer to ${selectedRows.length} selected records.`)}
                className="bg-surface-container-lowest text-on-surface hover:bg-surface-container-high px-space-12 py-space-6 rounded-lg font-label-md text-label-md flex items-center gap-space-6 transition-colors shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">assignment_turned_in</span>
                <span>Assign Follow-up Officer</span>
              </button>
              <button
                type="button"
                onClick={() => showToast(`Flagged ${selectedRows.length} records for State Quality Audit.`)}
                className="bg-surface-container-lowest text-error hover:bg-error-container hover:text-on-error-container px-space-12 py-space-6 rounded-lg font-label-md text-label-md flex items-center gap-space-6 transition-colors shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">flag</span>
                <span>Flag for Audit</span>
              </button>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="px-space-16 py-space-12 bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-12">
            <div className="flex items-center gap-space-8 text-on-surface-variant font-label-md text-label-md">
              <span>Rows per page:</span>
              <select className="bg-surface-container-low text-on-surface px-space-8 py-space-2 rounded font-semibold focus:outline-none">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
              <span className="ml-space-8">Page <strong>1</strong> of <strong>1,048</strong></span>
            </div>

            <div className="flex items-center gap-space-4">
              <button type="button" className="p-space-6 rounded-lg text-outline hover:bg-surface-container transition-colors disabled:opacity-40" disabled>
                <span className="material-symbols-outlined text-lg">first_page</span>
              </button>
              <button type="button" className="p-space-6 rounded-lg text-outline hover:bg-surface-container transition-colors disabled:opacity-40" disabled>
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button type="button" className="w-8 h-8 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold">1</button>
              <button type="button" className="w-8 h-8 rounded-lg text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors">2</button>
              <button type="button" className="w-8 h-8 rounded-lg text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors">3</button>
              <span className="px-space-4 text-outline font-bold">...</span>
              <button type="button" className="w-8 h-8 rounded-lg text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors">1048</button>
              <button type="button" className="p-space-6 rounded-lg text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
              <button type="button" className="p-space-6 rounded-lg text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-lg">last_page</span>
              </button>
            </div>
          </div>
        </div>

        {/* Supplementary Insight / District Context Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-20 mt-space-8">
          {/* Cohort Summary Card */}
          <div className="bg-surface-container-lowest p-space-20 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Yavatmal District Pipeline
                </h3>
                <span className="material-symbols-outlined text-primary">pie_chart</span>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-space-4">
                Targeted aspirational district skill outcome snapshot for FY 2023-24.
              </p>
              <div className="mt-space-16 flex flex-col gap-space-8">
                <div className="flex justify-between font-label-sm text-label-sm">
                  <span className="text-on-surface">Placed in Formal Sector</span>
                  <span className="font-bold text-secondary">64.2%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '64.2%' }}></div>
                </div>

                <div className="flex justify-between font-label-sm text-label-sm mt-space-4">
                  <span className="text-on-surface">Self-Employed / Micro Enterprise</span>
                  <span className="font-bold text-primary">21.8%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full" style={{ width: '21.8%' }}></div>
                </div>

                <div className="flex justify-between font-label-sm text-label-sm mt-space-4">
                  <span className="text-on-surface">Active Follow-up Compliance</span>
                  <span className="font-bold text-tertiary">91.4%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-tertiary-fixed-dim rounded-full" style={{ width: '91.4%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-space-16 pt-space-12 bg-surface-container-lowest flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
              <span>Target: 1,200 Trainees</span>
              <span className="text-secondary font-semibold">1,084 Achieved</span>
            </div>
          </div>

          {/* Verified Wage Progression Card */}
          <div className="bg-surface-container-lowest p-space-20 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Wage Retention Curve
                </h3>
                <span className="material-symbols-outlined text-secondary">payments</span>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-space-4">
                Median monthly wage growth verified via employer records &amp; bank slips.
              </p>
              <div className="mt-space-16 flex items-baseline gap-space-12">
                <span className="font-display-lg text-display-lg font-bold text-on-surface">
                  ₹22,400
                </span>
                <span className="text-secondary font-label-md text-label-md font-semibold flex items-center">
                  <span className="material-symbols-outlined text-sm">arrow_upward</span> +38% from entry
                </span>
              </div>
              <div className="w-full h-16 mt-space-12">
                <svg className="w-full h-full text-secondary stroke-current fill-none" viewBox="0 0 300 60">
                  <path d="M0,50 Q40,45 80,38 T160,25 T240,15 T300,8" strokeLinecap="round" strokeWidth="3"></path>
                  <path className="fill-secondary/10 stroke-none" d="M0,50 Q40,45 80,38 T160,25 T240,15 T300,8 L300,60 L0,60 Z"></path>
                  <circle className="fill-secondary" cx="300" cy="8" r="4"></circle>
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant pt-space-8">
              <span>Initial: ₹14,500/mo</span>
              <span>6M: ₹19,800/mo</span>
              <span className="font-semibold text-on-surface">12M: ₹22,400/mo</span>
            </div>
          </div>

          {/* Quick Registry Assistant */}
          <div className="bg-surface-container-low p-space-20 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-space-8 text-primary font-headline-sm text-headline-sm font-bold">
                <span className="material-symbols-outlined">auto_awesome</span>
                <span>SkillTrack Verification AI</span>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-space-8 leading-relaxed">
                32 trainees in the current view have updated employment verification status. Candidate retention status can be verified in bulk.
              </p>
              <div className="mt-space-12 p-space-12 rounded-lg bg-surface-container-lowest flex items-center gap-space-8">
                <span className="material-symbols-outlined text-secondary text-xl">mark_email_read</span>
                <span className="font-label-md text-label-md text-on-surface">
                  94.2% verified candidate retention rate
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast('Batch verification executed for 32 candidate records.')}
              className="w-full mt-space-16 bg-primary text-on-primary hover:bg-primary-container font-body-md-medium text-body-md-medium py-space-8 rounded-lg flex items-center justify-center gap-space-8 transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">sync</span>
              <span>Verify 32 Candidate Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Quick Drawer for Selected Trainee (ST1001 Priya Sharma) */}
      {isDrawerOpen && (
        <aside className="fixed top-16 right-0 bottom-0 w-96 bg-surface-container-lowest shadow-2xl z-50 flex flex-col justify-between overflow-y-auto border-l border-surface-container">
          <div className="p-space-20 flex flex-col gap-space-16">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-space-12 bg-surface-container-lowest border-b border-surface-container">
              <div className="flex items-center gap-space-8">
                <span className="font-mono text-label-sm font-bold bg-primary-fixed text-primary px-space-8 py-space-2 rounded">
                  {selectedTrainee.id}
                </span>
                <span className={`font-label-sm text-label-sm font-semibold px-space-6 py-space-2 rounded ${
                  selectedTrainee.placementStatus === 'Job Seeking'
                    ? 'text-amber-800 bg-amber-100'
                    : 'text-secondary bg-secondary-container'
                }`}>
                  {selectedTrainee.placementStatus === 'Job Seeking'
                    ? 'Seeking Placement'
                    : selectedTrainee.retentionDuration || 'Verified Placed'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-space-4 text-outline hover:text-on-surface rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Candidate Profile Summary */}
            <div className="flex items-center gap-space-16">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-primary text-on-primary flex items-center justify-center font-bold text-headline-sm shrink-0 shadow ring-2 ring-primary/20">
                <img
                  src={getTraineeAvatar(selectedTrainee)}
                  alt={selectedTrainee.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  {selectedTrainee.name}
                </h2>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {selectedTrainee.course} • {selectedTrainee.batch}
                </span>
                <span className="font-label-sm text-label-sm text-outline">
                  District: {selectedTrainee.district}, Maharashtra
                </span>
              </div>
            </div>

            {/* Longitudinal Progression Timeline */}
            <div className="flex flex-col gap-space-12 mt-space-8">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                Verification Milestones
              </span>

              {/* Step 1 */}
              <div className="flex items-start gap-space-12">
                <div className="flex flex-col items-center">
                  <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs">✓</span>
                  <div className="w-0.5 h-10 bg-secondary mt-1"></div>
                </div>
                <div className="flex flex-col pb-space-8">
                  <span className="font-body-md-medium text-body-md-medium font-semibold text-on-surface">
                    Skill Training Completed
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {selectedTrainee.assessmentGrade} ({selectedTrainee.attendancePercent}%) • {selectedTrainee.trainingProvider}
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-space-12">
                <div className="flex flex-col items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    selectedTrainee.placementStatus === 'Job Seeking'
                      ? 'bg-amber-100 text-amber-800 font-bold'
                      : 'bg-secondary text-on-secondary'
                  }`}>
                    {selectedTrainee.placementStatus === 'Job Seeking' ? '•' : '✓'}
                  </span>
                  <div className="w-0.5 h-10 bg-secondary mt-1"></div>
                </div>
                <div className="flex flex-col pb-space-8">
                  <span className="font-body-md-medium text-body-md-medium font-semibold text-on-surface">
                    {selectedTrainee.placementStatus === 'Job Seeking' ? 'Placement Drive in Progress' : 'Offer Letter & Placement'}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {selectedTrainee.employer || 'Active Pipeline'} • {selectedTrainee.placementStatus === 'Job Seeking' ? `Target: ₹${selectedTrainee.startingSalary.toLocaleString()}/mo` : `₹${selectedTrainee.currentSalary.toLocaleString()}/mo`}
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-space-12">
                <div className="flex flex-col items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    selectedTrainee.followUps && selectedTrainee.followUps.some(f => (f.stage === '30 Days' || f.stage === '90 Days') && f.status === 'Completed')
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {selectedTrainee.followUps && selectedTrainee.followUps.some(f => (f.stage === '30 Days' || f.stage === '90 Days') && f.status === 'Completed') ? '✓' : '3'}
                  </span>
                  <div className="w-0.5 h-10 bg-secondary mt-1"></div>
                </div>
                <div className="flex flex-col pb-space-8">
                  <span className="font-body-md-medium text-body-md-medium font-semibold text-on-surface">
                    30 &amp; 90-Day Retention Check
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {selectedTrainee.followUps && selectedTrainee.followUps.some(f => f.stage === '90 Days' && f.status === 'Completed')
                      ? '90-Day audit confirmed via salary verification'
                      : selectedTrainee.followUps && selectedTrainee.followUps.some(f => f.stage === '30 Days' && f.status === 'Completed')
                      ? '30-Day audit confirmed; 90-Day scheduled'
                      : 'Scheduled upon employment confirmation'}
                  </span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-space-12">
                <div className="flex flex-col items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    selectedTrainee.followUps && selectedTrainee.followUps.some(f => f.stage === '6 Months' && f.status === 'Completed')
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {selectedTrainee.followUps && selectedTrainee.followUps.some(f => f.stage === '6 Months' && f.status === 'Completed') ? '✓' : '4'}
                  </span>
                  <div className="w-0.5 h-10 bg-surface-container mt-1"></div>
                </div>
                <div className="flex flex-col pb-space-8">
                  <span className="font-body-md-medium text-body-md-medium font-semibold text-on-surface">
                    6-Month Post-Placement Audit
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold">
                    {selectedTrainee.followUps && selectedTrainee.followUps.some(f => f.stage === '6 Months' && f.status === 'Completed')
                      ? 'Completed & Field Verified'
                      : 'Pending 6-Month Tenure'}
                  </span>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start gap-space-12">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  selectedTrainee.followUps && selectedTrainee.followUps.some(f => f.stage === '12 Months' && f.status === 'Completed')
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {selectedTrainee.followUps && selectedTrainee.followUps.some(f => f.stage === '12 Months' && f.status === 'Completed') ? '✓' : '5'}
                </div>
                <div className="flex flex-col">
                  <span className="font-body-md-medium text-body-md-medium font-semibold text-on-surface-variant">
                    12-Month Final Survey
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">
                    {selectedTrainee.followUps && selectedTrainee.followUps.some(f => f.stage === '12 Months' && f.status === 'Completed')
                      ? 'Completed & 12-Month Retention Documented'
                      : 'Automated follow-up scheduled for 12-month cycle'}
                  </span>
                </div>
              </div>
            </div>

            {/* Candidate Contact & Admin Meta */}
            <div className="bg-surface-container-low p-space-12 rounded-lg flex flex-col gap-space-8 text-label-sm font-label-sm text-on-surface-variant">
              <div className="flex justify-between">
                <span>Identity Masked:</span>
                <span className="font-mono text-on-surface font-semibold">{selectedTrainee.maskedUid}</span>
              </div>
              <div className="flex justify-between">
                <span>Primary Phone:</span>
                <span className="text-on-surface font-semibold">{selectedTrainee.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>Employer Contact:</span>
                <span className="text-on-surface font-semibold">{selectedTrainee.employerPoc || (selectedTrainee.placementStatus === 'Job Seeking' ? 'Seeking Placement' : 'hr@company.com')}</span>
              </div>
              <div className="flex justify-between">
                <span>Employment ID:</span>
                <span className="font-mono text-on-surface font-semibold">{selectedTrainee.certificateId || `EMP-${selectedTrainee.id}`}</span>
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-space-16 bg-surface-container-low flex flex-col gap-space-8 border-t border-surface-container">
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                openTraineeProfile(selectedTrainee.id);
              }}
              className="w-full bg-primary text-on-primary hover:bg-primary-container text-center py-space-8 rounded-lg font-body-md-medium text-body-md-medium transition-colors shadow-sm cursor-pointer"
            >
              Open Comprehensive Dossier
            </button>
            <button
              type="button"
              onClick={() => showToast(`Counselor call logged for candidate ${selectedTrainee.name} (${selectedTrainee.id}).`)}
              className="w-full bg-surface-container-lowest text-on-surface hover:bg-surface-container text-center py-space-8 rounded-lg font-label-md text-label-md transition-colors cursor-pointer"
            >
              Log Direct Counselor Call
            </button>
          </div>
        </aside>
      )}

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </div>
  );
};

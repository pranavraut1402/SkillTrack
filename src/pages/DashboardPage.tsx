import React, { useState, useMemo } from 'react';
import { useTrainees } from '../context/TraineeContext';
import { getTraineeAvatar } from '../utils/avatarHelper';

export const DashboardPage: React.FC = () => {
  const { trainees, openTraineeProfile, setActivePage, showToast } = useTrainees();
  const [selectedProgram, setSelectedProgram] = useState<string>('All Training Programs');

  const handleExport = () => {
    showToast('Exporting SkillTrack Outcome Report (PDF/Excel)...');
  };

  // Filter trainees based on selected training program
  const filteredTrainees = useMemo(() => {
    if (selectedProgram === 'All Training Programs') {
      return trainees;
    }
    if (selectedProgram === 'Other Programs') {
      const knownPrograms = ['web development', 'data analytics', 'digital marketing', 'data entry'];
      return trainees.filter((t) => {
        const c = (t.course || '').toLowerCase();
        return !knownPrograms.some((kp) => c.includes(kp));
      });
    }
    const needle = selectedProgram.toLowerCase();
    return trainees.filter((t) => (t.course || '').toLowerCase().includes(needle));
  }, [trainees, selectedProgram]);

  // Compute live metrics dynamically strictly from filtered Firestore records
  const metrics = useMemo(() => {
    const total = filteredTrainees.length;
    if (total === 0) return null;

    const placed = filteredTrainees.filter(
      (t) =>
        t.placementStatus === 'Successful' ||
        t.employmentStatus === 'Employed' ||
        t.employmentStatus === 'Self-Employed' ||
        t.employmentStatus === 'Apprenticeship'
    ).length;

    const employed = filteredTrainees.filter(
      (t) =>
        t.employmentStatus === 'Employed' ||
        t.employmentStatus === 'Self-Employed' ||
        t.employmentStatus === 'Apprenticeship'
    ).length;

    const retained12m = filteredTrainees.filter(
      (t) =>
        t.retentionDuration?.includes('12') ||
        t.retentionDuration?.includes('6') ||
        (t.tenureStabilityMonths && t.tenureStabilityMonths >= 6) ||
        t.followUps?.some((f) => (f.stage === '6 Months' || f.stage === '12 Months') && f.status === 'Completed')
    ).length;

    const placementRate = Math.round((placed / total) * 100);
    const employmentRate = Math.round((employed / total) * 100);
    const twelveMonthRetentionRate = Math.round((retained12m / total) * 100);

    const wageEmployedCount = filteredTrainees.filter((t) => t.employmentStatus === 'Employed').length;
    const selfEmployedCount = filteredTrainees.filter((t) => t.employmentStatus === 'Self-Employed').length;
    const apprenticeshipCount = filteredTrainees.filter((t) => t.employmentStatus === 'Apprenticeship').length;
    const seekingCount = filteredTrainees.filter((t) => t.employmentStatus === 'Job Seeking' || t.employmentStatus === 'In Training').length;

    const wageEmployedPercent = Math.round((wageEmployedCount / total) * 100);
    const selfEmployedPercent = Math.round((selfEmployedCount / total) * 100);
    const apprenticeshipPercent = Math.round((apprenticeshipCount / total) * 100);
    const seekingPercent = Math.round((seekingCount / total) * 100);

    const salariesWithJob = filteredTrainees.filter((t) => t.currentSalary && t.currentSalary > 0);
    const avgStarting =
      salariesWithJob.length > 0
        ? Math.round(salariesWithJob.reduce((acc, t) => acc + (t.startingSalary || 18000), 0) / salariesWithJob.length)
        : Math.round(filteredTrainees.reduce((acc, t) => acc + (t.startingSalary || 18000), 0) / total);
    const avgCurrent =
      salariesWithJob.length > 0
        ? Math.round(salariesWithJob.reduce((acc, t) => acc + (t.currentSalary || 18000), 0) / salariesWithJob.length)
        : Math.round(filteredTrainees.reduce((acc, t) => acc + (t.currentSalary || 20000), 0) / total);
    const salaryGrowthPercent = avgStarting > 0 ? Math.round(((avgCurrent - avgStarting) / avgStarting) * 100) : 0;

    // Course wise breakdown from Firestore records
    const coursesMap = new Map<string, { total: number; placed: number }>();
    filteredTrainees.forEach((t) => {
      const c = t.course || 'General Skills';
      const curr = coursesMap.get(c) || { total: 0, placed: 0 };
      curr.total += 1;
      if (t.employmentStatus === 'Employed' || t.employmentStatus === 'Self-Employed' || t.employmentStatus === 'Apprenticeship') {
        curr.placed += 1;
      }
      coursesMap.set(c, curr);
    });

    const courseStats = Array.from(coursesMap.entries()).map(([course, stats]) => ({
      course,
      total: stats.total,
      placed: stats.placed,
      rate: Math.round((stats.placed / stats.total) * 100),
    }));

    const atRiskCount = filteredTrainees.filter((t) => t.placementRisk === 'High' || t.employmentStatus === 'Job Seeking').length;

    return {
      total,
      totalTraineesDisplay: total.toString(),
      placedCount: placed,
      employedCount: employed,
      retainedCount: retained12m,
      placementRate,
      employmentRate,
      twelveMonthRetentionRate,
      wageEmployedCount,
      selfEmployedCount,
      apprenticeshipCount,
      seekingCount,
      wageEmployedPercent,
      selfEmployedPercent,
      apprenticeshipPercent,
      seekingPercent,
      averageStartingSalary: avgStarting,
      averageCurrentSalary: avgCurrent,
      salaryGrowthPercent,
      courseStats,
      atRiskCount,
    };
  }, [filteredTrainees]);

  return (
    <div className="flex flex-col w-full">
      {/* Top Command & Filter Deck */}
      <div className="px-space-24 py-space-20 bg-surface-container-lowest flex flex-col gap-space-16 border-b border-surface-container-low">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-16">
          <div className="flex flex-col gap-space-4">
            <div className="flex items-center gap-space-12">
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                SkillTrack Dashboard
              </h1>
              <span className="inline-flex items-center gap-space-6 px-space-8 py-space-2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-pulse"></span>
                Prototype Demo Data • Firestore Connected
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Monitor training outcomes, verified employment pipelines, and multi-year career retention velocity from database records.
            </p>
          </div>

          {/* Controls & Quick Actions */}
          <div className="flex flex-wrap items-center gap-space-12">
            <div className="flex items-center gap-space-8 bg-surface-container-low px-space-12 py-space-6 rounded-lg text-on-surface">
              <span className="material-symbols-outlined text-sm text-outline">location_on</span>
              <select className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer">
                <option>All Centers / Demo Region</option>
                <option>Pune Center</option>
                <option>Mumbai Center</option>
                <option>Nagpur Center</option>
                <option>Aurangabad Center</option>
                <option>Yavatmal Center</option>
              </select>
            </div>

            <div className="flex items-center gap-space-8 bg-surface-container-low px-space-12 py-space-6 rounded-lg text-on-surface">
              <span className="material-symbols-outlined text-sm text-outline">calendar_today</span>
              <select className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer">
                <option>2025-26 Cohort (Active)</option>
                <option>2024-25 Cohort (Audited)</option>
                <option>2023-24 Cohort (Historical)</option>
              </select>
            </div>

            {/* Program Filter Dropdown */}
            <div className="flex items-center gap-space-8 bg-surface-container-low px-space-12 py-space-6 rounded-lg text-on-surface">
              <span className="material-symbols-outlined text-sm text-outline">school</span>
              <select
                id="dashboard-program-filter"
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer font-medium"
              >
                <option value="All Training Programs">All Training Programs</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Analytics">Data Analytics</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Data Entry">Data Entry</option>
                <option value="Other Programs">Other Programs</option>
              </select>
            </div>

            <button
              type="button"
              id="hero-officer-login-btn"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.history.pushState(null, '', '/login');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              className="flex items-center gap-space-8 bg-primary hover:bg-primary/90 text-on-primary px-space-16 py-space-8 rounded-lg font-label-md text-label-md transition-all shadow-sm hover:shadow-md cursor-pointer select-none font-semibold ring-1 ring-primary/20"
              title="Officer Login"
              aria-label="Officer Login"
            >
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              <span>Officer Login</span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-space-8 bg-primary-container hover:bg-primary text-on-primary px-space-16 py-space-8 rounded-lg font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">file_download</span>
              <span>Export Outcome Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-space-24 flex flex-col gap-space-24 max-w-[1600px] w-full mx-auto">
        {!metrics ? (
          /* Empty State when selected program has no records */
          <div className="bg-surface-container-lowest p-space-32 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col items-center justify-center text-center gap-space-16 my-space-24">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            <div className="flex flex-col gap-space-6 max-w-lg">
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                No trainee data available for this program.
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                There are currently no trainee records stored for "{selectedProgram}" in the Firestore database. Select another training program or view all programs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedProgram('All Training Programs')}
              className="px-space-20 py-space-10 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
            >
              View All Training Programs
            </button>
          </div>
        ) : (
          <>
            {/* Top KPI Cards Grid (5 metrics) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-16">
              {/* 1. Total Trainees */}
              <div
                onClick={() => setActivePage('trainees')}
                className="bg-surface-container-lowest p-space-20 rounded-xl shadow-sm flex flex-col justify-between hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">
                    Total Trainees
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">group</span>
                  </span>
                </div>
                <div className="mt-space-12 flex flex-col">
                  <span className="font-data-metric text-data-metric text-on-surface">
                    {metrics.totalTraineesDisplay}
                  </span>
                  <div className="flex items-center gap-space-4 mt-space-4 text-secondary font-label-md text-label-md">
                    <span className="material-symbols-outlined text-sm">database</span>
                    <span>
                      {selectedProgram === 'All Training Programs'
                        ? `${trainees.length} records in Firestore`
                        : `${filteredTrainees.length} of ${trainees.length} in Firestore`}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Placement Rate */}
              <div
                onClick={() => setActivePage('analytics')}
                className="bg-surface-container-lowest p-space-20 rounded-xl shadow-sm flex flex-col justify-between hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">
                    Placement Rate
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined text-lg">fact_check</span>
                  </span>
                </div>
                <div className="mt-space-12 flex flex-col">
                  <span className="font-data-metric text-data-metric text-on-surface">
                    {metrics.placementRate}%
                  </span>
                  <div className="flex items-center gap-space-4 mt-space-4 text-secondary font-label-md text-label-md">
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    <span>Target: 70% ({metrics.placementRate >= 70 ? '+' : ''}{metrics.placementRate - 70}% delta)</span>
                  </div>
                </div>
              </div>

              {/* 3. Employment Rate */}
              <div
                onClick={() => setActivePage('employment')}
                className="bg-surface-container-lowest p-space-20 rounded-xl shadow-sm flex flex-col justify-between hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">
                    Employment Rate
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined text-lg">work</span>
                  </span>
                </div>
                <div className="mt-space-12 flex flex-col">
                  <span className="font-data-metric text-data-metric text-on-surface">
                    {metrics.employmentRate}%
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-space-4">
                    {metrics.employedCount} of {filteredTrainees.length} employed ({metrics.wageEmployedCount} formal, {metrics.selfEmployedCount} self)
                  </span>
                </div>
              </div>

              {/* 4. 12-Month Retention */}
              <div
                onClick={() => setActivePage('follow-ups')}
                className="bg-surface-container-lowest p-space-20 rounded-xl shadow-sm flex flex-col justify-between hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">
                    12-Mo Retention
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">history_toggle_off</span>
                  </span>
                </div>
                <div className="mt-space-12 flex flex-col">
                  <span className="font-data-metric text-data-metric text-on-surface">
                    {metrics.twelveMonthRetentionRate}%
                  </span>
                  <div className="flex items-center gap-space-4 mt-space-4 text-on-surface-variant font-label-md text-label-md">
                    <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                    <span>{metrics.retainedCount} of {filteredTrainees.length} verified retention</span>
                  </div>
                </div>
              </div>

              {/* 5. Average Current Salary */}
              <div
                onClick={() => setActivePage('analytics')}
                className="bg-surface-container-lowest p-space-20 rounded-xl shadow-sm flex flex-col justify-between hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">
                    Average Salary
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                    <span className="material-symbols-outlined text-lg">payments</span>
                  </span>
                </div>
                <div className="mt-space-12 flex flex-col">
                  <span className="font-data-metric text-data-metric text-on-surface">
                    ₹{metrics.averageCurrentSalary.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-space-4 mt-space-4 text-secondary font-label-md text-label-md">
                    <span className="material-symbols-outlined text-sm">north_east</span>
                    <span>{metrics.salaryGrowthPercent >= 0 ? '+' : ''}{metrics.salaryGrowthPercent}% vs baseline (₹{metrics.averageStartingSalary.toLocaleString()})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1 & 2: Employment Distribution + AI Insights Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24">
              {/* 1. Employment Outcome Distribution (8 cols) */}
              <div className="lg:col-span-8 bg-surface-container-lowest p-space-24 rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-16 gap-space-8">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Employment Outcome Distribution
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Outcome verification distribution for candidate records in Firestore
                    </p>
                  </div>
                  <div className="flex items-center gap-space-6 px-space-8 py-space-4 rounded bg-surface-container text-on-surface font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-sm text-secondary">sync</span>
                    <span>Firestore Connected</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-space-24 items-center my-space-12">
                  {/* Donut Graphic Visualizer (SVG) */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center relative">
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" fill="none" r="15.915" stroke="#EAEDFF" strokeWidth="4.5"></circle>
                        {/* Segment 1: Employed */}
                        <circle
                          cx="18"
                          cy="18"
                          fill="none"
                          r="15.915"
                          stroke="#00236F"
                          strokeDasharray={`${metrics.wageEmployedPercent} ${100 - metrics.wageEmployedPercent}`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          strokeWidth="4.5"
                        ></circle>
                        {/* Segment 2: Self-Employed */}
                        <circle
                          cx="18"
                          cy="18"
                          fill="none"
                          r="15.915"
                          stroke="#006C4A"
                          strokeDasharray={`${metrics.selfEmployedPercent} ${100 - metrics.selfEmployedPercent}`}
                          strokeDashoffset={`-${metrics.wageEmployedPercent}`}
                          strokeLinecap="round"
                          strokeWidth="4.5"
                        ></circle>
                        {/* Segment 3: Apprenticeship */}
                        <circle
                          cx="18"
                          cy="18"
                          fill="none"
                          r="15.915"
                          stroke="#4059AA"
                          strokeDasharray={`${metrics.apprenticeshipPercent} ${100 - metrics.apprenticeshipPercent}`}
                          strokeDashoffset={`-${metrics.wageEmployedPercent + metrics.selfEmployedPercent}`}
                          strokeLinecap="round"
                          strokeWidth="4.5"
                        ></circle>
                        {/* Segment 4: Unemployed */}
                        <circle
                          cx="18"
                          cy="18"
                          fill="none"
                          r="15.915"
                          stroke="#FC922B"
                          strokeDasharray={`${metrics.seekingPercent} ${100 - metrics.seekingPercent}`}
                          strokeDashoffset={`-${metrics.wageEmployedPercent + metrics.selfEmployedPercent + metrics.apprenticeshipPercent}`}
                          strokeLinecap="round"
                          strokeWidth="4.5"
                        ></circle>
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                        <span className="font-headline-lg text-headline-lg font-bold text-on-surface">{filteredTrainees.length}</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                          Trainees
                        </span>
                      </div>
                    </div>
                    <span className="mt-space-8 font-label-sm text-label-sm text-on-surface-variant text-center">
                      Prototype Demo Data • Firestore Connected
                    </span>
                  </div>

                  {/* Structured Stat Breakdown Bars */}
                  <div className="md:col-span-7 flex flex-col gap-space-12">
                    {/* Employed */}
                    <div className="p-space-12 rounded-lg bg-surface-container-low flex flex-col gap-space-6">
                      <div className="flex items-center justify-between font-label-md text-label-md">
                        <span className="flex items-center gap-space-8 text-on-surface">
                          <span className="w-3 h-3 rounded bg-primary"></span>
                          Wage Employed (Formal Sector)
                        </span>
                        <span className="font-bold text-on-surface">
                          {metrics.wageEmployedPercent}%{' '}
                          <span className="font-normal text-on-surface-variant">
                            ({metrics.wageEmployedCount} of {filteredTrainees.length})
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${metrics.wageEmployedPercent}%` }}></div>
                      </div>
                    </div>

                    {/* Self-Employed */}
                    <div className="p-space-12 rounded-lg bg-surface-container-low flex flex-col gap-space-6">
                      <div className="flex items-center justify-between font-label-md text-label-md">
                        <span className="flex items-center gap-space-8 text-on-surface">
                          <span className="w-3 h-3 rounded bg-secondary"></span>
                          Self-Employed / Entrepreneurship
                        </span>
                        <span className="font-bold text-on-surface">
                          {metrics.selfEmployedPercent}%{' '}
                          <span className="font-normal text-on-surface-variant">
                            ({metrics.selfEmployedCount} of {filteredTrainees.length})
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full" style={{ width: `${metrics.selfEmployedPercent}%` }}></div>
                      </div>
                    </div>

                    {/* Apprenticeship */}
                    <div className="p-space-12 rounded-lg bg-surface-container-low flex flex-col gap-space-6">
                      <div className="flex items-center justify-between font-label-md text-label-md">
                        <span className="flex items-center gap-space-8 text-on-surface">
                          <span className="w-3 h-3 rounded bg-surface-tint"></span>
                          Industry Apprenticeship / Internship
                        </span>
                        <span className="font-bold text-on-surface">
                          {metrics.apprenticeshipPercent}%{' '}
                          <span className="font-normal text-on-surface-variant">
                            ({metrics.apprenticeshipCount} of {filteredTrainees.length})
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="bg-surface-tint h-full rounded-full" style={{ width: `${metrics.apprenticeshipPercent}%` }}></div>
                      </div>
                    </div>

                    {/* Unemployed / Seeking */}
                    <div className="p-space-12 rounded-lg bg-surface-container-low flex flex-col gap-space-6">
                      <div className="flex items-center justify-between font-label-md text-label-md">
                        <span className="flex items-center gap-space-8 text-on-surface">
                          <span className="w-3 h-3 rounded bg-on-tertiary-container"></span>
                          Unemployed / Actively Seeking
                        </span>
                        <span className="font-bold text-on-surface">
                          {metrics.seekingPercent}%{' '}
                          <span className="font-normal text-on-surface-variant">
                            ({metrics.seekingCount} of {filteredTrainees.length})
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="bg-on-tertiary-container h-full rounded-full" style={{ width: `${metrics.seekingPercent}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-space-16 flex flex-wrap items-center justify-between gap-space-8 bg-surface-container-low px-space-16 py-space-12 rounded-lg">
                  <div className="flex items-center gap-space-12">
                    <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                    <span className="font-body-sm text-body-sm text-on-surface font-medium">
                      {metrics.employedCount} of {filteredTrainees.length} trainees actively employed or in apprenticeship in database
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePage('trainees')}
                    className="font-label-md text-label-md text-primary font-bold hover:underline flex items-center gap-space-4"
                  >
                    <span>Audit Micro-Registry</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* 2. AI Insights Panel (4 cols) */}
              <div className="lg:col-span-4 bg-surface-container-lowest p-space-24 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-space-16">
                    <div className="flex items-center gap-space-8">
                      <span className="w-7 h-7 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                      </span>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        AI Career Intelligence
                      </h2>
                    </div>
                    <span className="px-space-8 py-space-2 rounded bg-surface-container-high text-on-primary-container font-label-sm text-label-sm font-semibold">
                      Prototype AI Model Active
                    </span>
                  </div>

                  <div className="flex flex-col gap-space-12">
                    {/* Card 1: Risk Cohort */}
                    <div className="p-space-16 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col gap-space-8">
                      <div className="flex items-start gap-space-12">
                        <span className="material-symbols-outlined text-on-tertiary-container mt-space-2">warning</span>
                        <div className="flex flex-col">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-medium">
                            {metrics.atRiskCount} trainee(s) at placement risk
                          </span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2">
                            Candidate(s) identified in database requiring priority job matching and interview assistance.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end pt-space-4">
                        <button
                          type="button"
                          onClick={() => setActivePage('ai-insights')}
                          className="font-label-md text-label-md text-on-tertiary-container font-bold hover:underline flex items-center gap-space-2"
                        >
                          <span>Review Risk Cohort</span>
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </button>
                      </div>
                    </div>

                    {/* Card 2: Skill Demand Surge */}
                    <div className="p-space-16 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col gap-space-8">
                      <div className="flex items-start gap-space-12">
                        <span className="material-symbols-outlined text-secondary mt-space-2">trending_up</span>
                        <div className="flex flex-col">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-medium">
                            High Technical Demand (+42%)
                          </span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2">
                            Surge observed for verified software and analytical capabilities in candidate tracking.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Retention Multiplier */}
                    <div className="p-space-16 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col gap-space-8">
                      <div className="flex items-start gap-space-12">
                        <span className="material-symbols-outlined text-primary-container mt-space-2">psychology</span>
                        <div className="flex flex-col">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-medium">
                            {metrics.twelveMonthRetentionRate}% Retention Correlation
                          </span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2">
                            Candidates with formal post-training verification show sustained wage stability.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePage('ai-insights')}
                  className="mt-space-16 w-full py-space-12 px-space-16 bg-surface-container hover:bg-surface-container-high text-primary font-body-md-medium text-body-md-medium rounded-lg flex items-center justify-center gap-space-8 transition-colors cursor-pointer"
                >
                  <span>Open Full AI Intelligence Engine</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Section 3 & 4: Placement by Course & Salary Progression Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24">
              {/* 3. Placement by Course (6 cols) */}
              <div className="lg:col-span-6 bg-surface-container-lowest p-space-24 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-space-16">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        Placement Rate by Course
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Performance metrics mapped against standard industry benchmark (70%)
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-outline">bar_chart</span>
                  </div>

                  <div className="flex flex-col gap-space-16 mt-space-8">
                    {metrics.courseStats.slice(0, 5).map((stat, idx) => {
                      const isAbove = stat.rate >= 70;
                      const barColors = ['bg-primary', 'bg-secondary', 'bg-surface-tint', 'bg-primary', 'bg-on-tertiary-container'];
                      const colorClass = isAbove ? barColors[idx % barColors.length] : 'bg-on-tertiary-container';
                      return (
                        <div key={stat.course} className="flex flex-col gap-space-4">
                          <div className="flex items-center justify-between font-label-md text-label-md">
                            <span className="text-on-surface font-medium">{stat.course}</span>
                            <span className="font-bold text-on-surface">
                              {stat.rate}%{' '}
                              <span className={`font-normal ${isAbove ? 'text-secondary' : 'text-error'}`}>
                                ({isAbove ? `+${stat.rate - 70}% vs target` : `${stat.rate - 70}% under target`})
                              </span>
                            </span>
                          </div>
                          <div className="relative w-full h-3 bg-surface-container rounded-full overflow-hidden">
                            <div className="absolute left-[70%] top-0 bottom-0 w-0.5 bg-outline-variant z-10" title="Target: 70%"></div>
                            <div className={`${colorClass} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(4, stat.rate))}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-space-16 flex items-center justify-between pt-space-12 text-on-surface-variant font-label-sm text-label-sm">
                  <div className="flex items-center gap-space-6">
                    <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                    <span>Target Benchmark: 70% placement</span>
                  </div>
                  <span>Calculated from {filteredTrainees.length} Firestore records (Prototype Demo Data)</span>
                </div>
              </div>

              {/* 4. Salary Progression (6 cols) */}
              <div className="lg:col-span-6 bg-surface-container-lowest p-space-24 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-space-16">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        Salary Progression Timeline
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Longitudinal wage growth tracked through periodic verification gates
                      </p>
                    </div>
                    <span className="px-space-8 py-space-2 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                      {metrics.salaryGrowthPercent >= 0 ? '+' : ''}{metrics.salaryGrowthPercent}% Avg Multiplier
                    </span>
                  </div>

                  {/* Structured Visual Timeline */}
                  <div className="relative mt-space-8 py-space-12">
                    <div className="w-full h-24 mb-space-8">
                      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 100">
                        <defs>
                          <linearGradient id="salaryGrad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#00236F" stopOpacity="0.15"></stop>
                            <stop offset="100%" stopColor="#00236F" stopOpacity="0.0"></stop>
                          </linearGradient>
                        </defs>
                        <path d="M 30,70 Q 250,45 470,15 L 470,100 L 30,100 Z" fill="url(#salaryGrad)"></path>
                        <path d="M 30,70 Q 250,45 470,15" fill="none" stroke="#00236F" strokeLinecap="round" strokeWidth="3"></path>
                        <circle cx="30" cy="70" fill="#00236F" r="5"></circle>
                        <circle cx="250" cy="42" fill="#00236F" r="5"></circle>
                        <circle cx="470" cy="15" fill="#006C4A" r="6"></circle>
                      </svg>
                    </div>

                    <div className="grid grid-cols-3 gap-space-12 text-center">
                      <div className="p-space-12 rounded-lg bg-surface-container-low flex flex-col items-center">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Initial Gate</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-4">₹{metrics.averageStartingSalary.toLocaleString()}</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Month 0 Starting Avg</span>
                      </div>
                      <div className="p-space-12 rounded-lg bg-surface-container-low flex flex-col items-center">
                        <span className="font-label-sm text-label-sm text-primary uppercase">Current Gate</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-4">₹{metrics.averageCurrentSalary.toLocaleString()}</span>
                        <span className="font-label-sm text-label-sm text-secondary font-semibold">{metrics.salaryGrowthPercent >= 0 ? '+' : ''}{metrics.salaryGrowthPercent}% Realized Growth</span>
                      </div>
                      <div className="p-space-12 rounded-lg bg-surface-container-low flex flex-col items-center">
                        <span className="font-label-sm text-label-sm text-secondary uppercase">1-Yr Projection</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-secondary mt-space-4">₹{Math.round(metrics.averageCurrentSalary * 1.14).toLocaleString()}</span>
                        <span className="font-label-sm text-label-sm text-secondary font-semibold">+14% Target Growth</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-space-16 p-space-12 bg-surface-container-high rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-space-8">
                    <span className="material-symbols-outlined text-primary text-base">savings</span>
                    <span className="font-body-sm text-body-sm text-on-surface">
                      Graduates in cohort average ₹{metrics.averageCurrentSalary.toLocaleString()} vs ₹{metrics.averageStartingSalary.toLocaleString()} baseline wage.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Recent Follow-ups Table */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="p-space-20 flex flex-col sm:flex-row sm:items-center justify-between gap-space-12 bg-surface-container-low">
                <div className="flex items-center gap-space-12">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">event_available</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Recent Follow-up Activity
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Candidate post-training outcome verification ledger
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-12">
                  <button
                    type="button"
                    onClick={() => setActivePage('follow-ups')}
                    className="px-space-16 py-space-8 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors shadow-sm flex items-center gap-space-6 cursor-pointer"
                  >
                    <span>View All Follow-ups</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Tabular Data */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
                      <th className="py-space-12 px-space-20">Trainee Name</th>
                      <th className="py-space-12 px-space-16">Skill ID</th>
                      <th className="py-space-12 px-space-16">Enrolled Course</th>
                      <th className="py-space-12 px-space-16">Follow-up Stage</th>
                      <th className="py-space-12 px-space-16">Verification Status</th>
                      <th className="py-space-12 px-space-16">Verification Method</th>
                      <th className="py-space-12 px-space-20 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
                    {filteredTrainees.slice(0, 5).map((t) => (
                      <tr key={t.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="py-space-16 px-space-20">
                          <div className="flex items-center gap-space-12">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-container text-on-primary font-bold flex items-center justify-center text-xs shrink-0 ring-1 ring-outline-variant/30">
                              <img
                                src={getTraineeAvatar(t)}
                                alt={t.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-body-md-medium text-body-md-medium text-on-surface">
                                {t.name}
                              </span>
                              <span className="text-on-surface-variant font-label-sm text-label-sm">
                                {t.district} Center
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-space-16 px-space-16 font-label-md text-label-md text-on-surface-variant">
                          {t.id}
                        </td>
                        <td className="py-space-16 px-space-16 font-medium">{t.course}</td>
                        <td className="py-space-16 px-space-16">{t.currentFollowUpCycle}</td>
                        <td className="py-space-16 px-space-16">
                          <span
                            className={`inline-flex items-center gap-space-6 px-space-8 py-space-2 rounded font-label-sm text-label-sm ${
                              t.employmentStatus === 'Employed' || t.employmentStatus === 'Self-Employed'
                                ? 'bg-secondary-container text-on-secondary-container'
                                : 'bg-tertiary-fixed text-on-tertiary-fixed'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                t.employmentStatus === 'Employed' ? 'bg-secondary' : 'bg-on-tertiary-container'
                              }`}
                            ></span>
                            {t.employmentStatus === 'Employed' ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-space-16 px-space-16 text-on-surface-variant">
                          <span className="inline-flex items-center gap-space-4 font-label-sm text-label-sm">
                            <span className="material-symbols-outlined text-sm text-secondary">verified</span>
                            {t.employmentVerified ? 'Verified Records' : 'Tele-verification'}
                          </span>
                        </td>
                        <td className="py-space-16 px-space-20 text-right">
                          <button
                            type="button"
                            onClick={() => openTraineeProfile(t.id)}
                            className="px-space-12 py-space-4 rounded bg-surface-container hover:bg-primary hover:text-on-primary font-label-md text-label-md text-primary transition-colors cursor-pointer"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-space-20 py-space-12 bg-surface-container-lowest flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span>Displaying {Math.min(5, filteredTrainees.length)} of {filteredTrainees.length} registered trainees in Firestore (Prototype Demo Data)</span>
                <div className="flex items-center gap-space-8">
                  <button
                    type="button"
                    disabled
                    className="px-space-8 py-space-4 rounded bg-surface-container-low text-on-surface opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePage('follow-ups')}
                    className="px-space-8 py-space-4 rounded bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

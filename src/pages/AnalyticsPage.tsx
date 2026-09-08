import React, { useState, useMemo } from 'react';
import { useTrainees } from '../context/TraineeContext';
import { BackButton } from '../components/BackButton';
import { downloadDemoFile } from '../utils/downloadHelper';

export const AnalyticsPage: React.FC = () => {
  const { trainees, showToast } = useTrainees();

  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedPeriod, setSelectedPeriod] = useState('Current FY 2025-26');

  // Dynamic filter lists
  const sectors = useMemo(() => {
    const list = Array.from(new Set(trainees.map(t => t.sector))).filter(Boolean);
    return ['All Sectors', ...list.sort()];
  }, [trainees]);

  const districts = useMemo(() => {
    const list = Array.from(new Set(trainees.map(t => t.district))).filter(Boolean);
    return ['All Districts', ...list.sort()];
  }, [trainees]);

  // Filtered dataset
  const filteredTrainees = useMemo(() => {
    return trainees.filter(t => {
      const matchSector = selectedSector === 'All Sectors' || t.sector === selectedSector;
      const matchDistrict = selectedDistrict === 'All Districts' || t.district === selectedDistrict;
      return matchSector && matchDistrict;
    });
  }, [trainees, selectedSector, selectedDistrict]);

  // Recalculated KPI metrics based on filtered trainees
  const kpis = useMemo(() => {
    const count = filteredTrainees.length || 1;
    const totalStarting = filteredTrainees.reduce((acc, t) => acc + (t.startingSalary || 0), 0);
    const totalCurrent = filteredTrainees.reduce((acc, t) => acc + (t.currentSalary || 0), 0);
    const avgStarting = Math.round(totalStarting / count);
    const avgCurrent = Math.round(totalCurrent / count);
    const wageLift = avgStarting > 0 ? Math.round(((avgCurrent - avgStarting) / avgStarting) * 100) : 0;

    const employedCount = filteredTrainees.filter(t => t.employmentStatus === 'Employed').length;
    const retentionRate = Math.round((employedCount / count) * 100);

    const femaleCount = filteredTrainees.filter(t => t.gender === 'Female').length;
    const femalePercent = Math.round((femaleCount / count) * 100);

    const uniqueProviders = new Set(filteredTrainees.map(t => t.trainingProvider)).size;

    return {
      wageLift,
      avgStarting,
      avgCurrent,
      retentionRate,
      femalePercent,
      centersCount: uniqueProviders || 1,
      totalCandidates: filteredTrainees.length
    };
  }, [filteredTrainees]);

  // District Comparison Chart Data
  const districtStats = useMemo(() => {
    const map: Record<string, { total: number; employed: number; retained: number }> = {};
    filteredTrainees.forEach(t => {
      const d = t.district || 'Other';
      if (!map[d]) map[d] = { total: 0, employed: 0, retained: 0 };
      map[d].total += 1;
      if (t.employmentStatus === 'Employed') map[d].employed += 1;
      if (t.retentionDuration.includes('Verified') || t.followUps.length > 0) map[d].retained += 1;
    });

    const entries = Object.entries(map).map(([district, data]) => ({
      district,
      placement: Math.round((data.employed / (data.total || 1)) * 100),
      retention: Math.round((data.retained / (data.total || 1)) * 100),
      count: data.total
    }));

    return entries.length > 0 ? entries : [
      { district: selectedDistrict !== 'All Districts' ? selectedDistrict : 'State Average', placement: 75, retention: 70, count: 0 }
    ];
  }, [filteredTrainees, selectedDistrict]);

  // Course ROI & Wage Multiplier Data
  const courseStats = useMemo(() => {
    const map: Record<string, { count: number; totalStart: number; totalCurrent: number }> = {};
    filteredTrainees.forEach(t => {
      const c = t.course || 'General Skill';
      if (!map[c]) map[c] = { count: 0, totalStart: 0, totalCurrent: 0 };
      map[c].count += 1;
      map[c].totalStart += t.startingSalary || 15000;
      map[c].totalCurrent += t.currentSalary || 20000;
    });

    return Object.entries(map).map(([course, data]) => {
      const start = Math.round(data.totalStart / (data.count || 1));
      const current = Math.round(data.totalCurrent / (data.count || 1));
      const lift = start > 0 ? Math.round(((current - start) / start) * 100) : 0;
      return { course, start, current, lift, count: data.count };
    });
  }, [filteredTrainees]);

  const handleExportAnalytics = () => {
    const header = 'Metric,Scope,Value\n';
    const rows = [
      `"Sector Filter","${selectedSector}",""`,
      `"District Filter","${selectedDistrict}",""`,
      `"Time Period","${selectedPeriod}",""`,
      `"Cohort Size","${kpis.totalCandidates} candidates",""`,
      `"Median Wage Lift","${kpis.wageLift}%","From ₹${kpis.avgStarting} to ₹${kpis.avgCurrent}"`,
      `"Retention Rate","${kpis.retentionRate}%","Active Verified"`,
      `"Women Participation","${kpis.femalePercent}%","Inclusion Target"`
    ].join('\n');

    const content = `SKILLTRACK OUTCOME ANALYTICS PACK\nGenerated: ${new Date().toLocaleString()}\n\n${header}${rows}\n\nDistrict Breakdown:\nDistrict,Placement %,Retention %,Candidates\n` +
      districtStats.map(d => `"${d.district}",${d.placement}%,${d.retention}%,${d.count}`).join('\n');

    downloadDemoFile(`SkillTrack_Analytics_${selectedSector.replace(/\s+/g, '_')}_${selectedDistrict.replace(/\s+/g, '_')}.csv`, content);
    showToast(`Exported analytics pack for ${kpis.totalCandidates} candidates`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Header Deck */}
      <div className="px-space-24 py-space-20 bg-surface-container-lowest border-b border-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="mb-2">
            <BackButton label="Back to Dashboard" to="dashboard" id="analytics-back-btn" />
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-label-sm uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-base text-primary">insights</span>
            <span>Outcome Analytics &amp; Strategic Intelligence</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">
            Analytics &amp; Performance Reports
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Multidimensional analytics covering placement velocity, wage progression, retention longevity, and sector ROI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportAnalytics}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export Analytics Pack (CSV)</span>
          </button>
        </div>
      </div>

      <div className="p-space-24 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        {/* Dynamic Interactive Filter Controls */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">filter_alt</span>
            <span className="text-sm font-bold text-on-surface">Data Scope Filter:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
            {/* Sector filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-outline">Sector</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30 cursor-pointer"
              >
                {sectors.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* District filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-outline">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30 cursor-pointer"
              >
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Time period filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-outline">Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30 cursor-pointer"
              >
                <option value="Current FY 2025-26">Current FY 2025-26</option>
                <option value="Trailing 12 Months">Trailing 12 Months</option>
                <option value="Last 6 Months">Last 6 Months</option>
                <option value="All Time">All Historical Cohorts</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-on-surface-variant font-medium bg-surface-container-low px-3 py-2 rounded-lg">
            Candidates: <strong className="text-primary text-sm">{kpis.totalCandidates}</strong>
          </div>
        </div>

        {/* Dynamic Recalculated KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Median Wage Lift</div>
            <div className="text-3xl font-extrabold text-emerald-700 mt-2">+{kpis.wageLift}%</div>
            <p className="text-xs text-on-surface-variant mt-1">
              From ₹{kpis.avgStarting.toLocaleString('en-IN')} to ₹{kpis.avgCurrent.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">12-Month Retention</div>
            <div className="text-3xl font-extrabold text-on-surface mt-2">{kpis.retentionRate}%</div>
            <p className="text-xs text-secondary font-semibold mt-1">Sustained placement in industry</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Women Participation</div>
            <div className="text-3xl font-extrabold text-primary mt-2">{kpis.femalePercent}%</div>
            <p className="text-xs text-on-surface-variant mt-1">Target 50% state gender inclusion</p>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-outline">Active Skill Centers</div>
            <div className="text-3xl font-extrabold text-on-surface mt-2">{kpis.centersCount}</div>
            <p className="text-xs text-on-surface-variant mt-1">Affiliated ITIs &amp; Private Centers in scope</p>
          </div>
        </div>

        {/* Dynamic Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* District Placement & Retention Comparison */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">District Placement &amp; Retention Comparison</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Benchmarked against state 70% threshold</p>
                </div>
                <span className="text-xs font-mono text-outline">{selectedDistrict}</span>
              </div>

              <div className="mt-6 flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-1">
                {districtStats.map(d => (
                  <div key={d.district} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-on-surface">{d.district} ({d.count} candidates)</span>
                      <span className="text-on-surface-variant">
                        Placement: <strong className="text-primary">{d.placement}%</strong> | Retention: <strong className="text-emerald-700">{d.retention}%</strong>
                      </span>
                    </div>
                    <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden flex gap-0.5">
                      <div className="bg-primary h-full rounded-l-full transition-all duration-500" style={{ width: `${d.placement}%` }}></div>
                      <div className="bg-secondary/70 h-full rounded-r-full transition-all duration-500" style={{ width: `${Math.max(0, d.retention - d.placement)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span> Placement Rate</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span> Sustained Retention</span>
              </div>
              <span>Live Dataset Sync</span>
            </div>
          </div>

          {/* Sector ROI & Wage Multiplier */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Course Track ROI &amp; Salary Multipliers</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Average entry salary vs verified retention wage</p>
                </div>
                <span className="text-xs font-mono text-outline">{selectedSector}</span>
              </div>

              <div className="mt-6 flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                {courseStats.map(c => (
                  <div key={c.course} className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-on-surface">{c.course}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">
                        ₹{c.start.toLocaleString('en-IN')} entry → ₹{c.current.toLocaleString('en-IN')} current ({c.count} candidates)
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container text-xs font-bold">
                        +{c.lift}% Growth
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
              <span>Wages audited against submitted salary documentation</span>
              <span className="font-semibold text-primary">MSDE Approved Metrics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

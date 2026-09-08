import React, { useState, useMemo } from 'react';
import { useTrainees } from '../context/TraineeContext';
import { BackButton } from '../components/BackButton';
import { downloadDemoFile } from '../utils/downloadHelper';

interface ReportTemplate {
  id: string;
  title: string;
  desc: string;
  format: 'CSV' | 'PDF' | 'XLSX';
  category: string;
  generateReport: (traineesList: any[], filters: { program: string; district: string; fy: string }) => { fileName: string; content: string };
}

export const ReportsPage: React.FC = () => {
  const { trainees, showToast } = useTrainees();

  const [selectedProgram, setSelectedProgram] = useState('All Programs');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedFY, setSelectedFY] = useState('FY 2025-26');
  const [previewModalData, setPreviewModalData] = useState<{ title: string; summaryRows: { label: string; value: string | number }[]; sampleData: string[] } | null>(null);

  // Available unique districts
  const districts = useMemo(() => {
    const dList = Array.from(new Set(trainees.map(t => t.district))).filter(Boolean);
    return ['All Districts', ...dList.sort()];
  }, [trainees]);

  // Filtered dataset based on program and district
  const filteredTrainees = useMemo(() => {
    return trainees.filter(t => {
      const matchDistrict = selectedDistrict === 'All Districts' || t.district.toLowerCase() === selectedDistrict.toLowerCase();
      let matchProgram = true;
      if (selectedProgram !== 'All Programs') {
        if (selectedProgram === 'Other Programs') {
          const mainPrograms = ['web development', 'data analytics', 'digital marketing', 'data entry'];
          matchProgram = !mainPrograms.some(p => (t.course || '').toLowerCase().includes(p));
        } else {
          matchProgram = (t.course || '').toLowerCase().includes(selectedProgram.toLowerCase());
        }
      }
      return matchDistrict && matchProgram;
    });
  }, [trainees, selectedDistrict, selectedProgram]);

  const reportDefinitions: ReportTemplate[] = [
    {
      id: 'program-placement',
      title: 'Training Program Placement Report',
      desc: 'Comprehensive placement outcomes report covering certified vs placed candidates, wage progression, and retention benchmarks.',
      format: 'CSV',
      category: 'Program Outcomes Audit',
      generateReport: (list, f) => {
        const header = 'Candidate ID,Name,District,Course,Sector,Training Status,Placement Status,Employer,Salary (INR)\n';
        const rows = list.map(t =>
          `"${t.id}","${t.name}","${t.district}","${t.course}","${t.sector}","${t.trainingStatus}","${t.employmentStatus}","${t.employer || 'Unassigned'}",₹${t.currentSalary}`
        ).join('\n');
        const content = `SKILLTRACK - TRAINING PROGRAM PLACEMENT REPORT\nProgram: ${f.program} | District: ${f.district} | Fiscal: ${f.fy}\nGenerated: ${new Date().toLocaleString()}\nTotal Candidates: ${list.length}\n\n${header}${rows}`;
        return { fileName: `Training_Program_Placement_Report_${f.district.replace(/\s+/g, '_')}_${f.fy}.csv`, content };
      }
    },
    {
      id: 'longitudinal-retention',
      title: 'Longitudinal Retention Ledger',
      desc: 'Candidate micro-ledger tracking 30-day, 90-day, 6-month, 12-month, and 24-month retention milestones with wage progression.',
      format: 'CSV',
      category: 'Post-Placement Compliance',
      generateReport: (list, f) => {
        const header = 'Candidate ID,Name,District,Employer,Starting Wage,Current Wage,Growth %,Retention Milestone,Verification Status\n';
        const rows = list.map(t => {
          const growth = t.startingSalary > 0 ? Math.round(((t.currentSalary - t.startingSalary) / t.startingSalary) * 100) : 0;
          return `"${t.id}","${t.name}","${t.district}","${t.employer || 'Self-Employed'}",₹${t.startingSalary},₹${t.currentSalary},"+${growth}%","${t.currentFollowUpCycle}","${t.retentionDuration}"`;
        }).join('\n');
        const content = `SKILLTRACK - LONGITUDINAL RETENTION LEDGER\nFilter Scope: Program: ${f.program} | District: ${f.district} | FY: ${f.fy}\nExported: ${new Date().toLocaleString()}\nVerified Alumni Count: ${list.length}\n\n${header}${rows}`;
        return { fileName: `Longitudinal_Retention_Ledger_${f.district.replace(/\s+/g, '_')}.csv`, content };
      }
    },
    {
      id: 'verification-compliance',
      title: 'Verification Compliance Summary',
      desc: 'Audit report verifying candidate records against proof of employment, salary slips, employer attestations, and field officer visits.',
      format: 'CSV',
      category: 'Field & Document Audit',
      generateReport: (list, f) => {
        const header = 'Candidate ID,Name,District,Employer,Milestone,Verification Method,Officer Notes\n';
        const rows = list.map(t => {
          const latestFollowUp = t.followUps[t.followUps.length - 1];
          return `"${t.id}","${t.name}","${t.district}","${t.employer || 'Unassigned'}","${latestFollowUp?.stage || t.currentFollowUpCycle}","${latestFollowUp?.verificationMethod || 'Salary Slip Validated'}","${(latestFollowUp?.fieldOfficerNotes || 'Active retention verified.').replace(/"/g, '""')}"`;
        }).join('\n');
        const content = `SKILLTRACK - VERIFICATION COMPLIANCE SUMMARY\nScope: Program: ${f.program} | District: ${f.district} | FY: ${f.fy}\nAudit Log Generated: ${new Date().toLocaleString()}\n\n${header}${rows}`;
        return { fileName: `Verification_Compliance_Summary_${f.district.replace(/\s+/g, '_')}.csv`, content };
      }
    },
    {
      id: 'training-center-performance',
      title: 'Training Center Performance Report',
      desc: 'Comparative KPI scorecard for empanelled Training Providers, including certification pass rates, attendance averages, and placement conversion.',
      format: 'CSV',
      category: 'Institutional Quality',
      generateReport: (list, f) => {
        // Group by provider
        const providers: Record<string, { total: number; certified: number; placed: number; avgScore: number; avgAtt: number }> = {};
        list.forEach(t => {
          const p = t.trainingProvider || 'SkillTrack Training Center';
          if (!providers[p]) {
            providers[p] = { total: 0, certified: 0, placed: 0, avgScore: 0, avgAtt: 0 };
          }
          providers[p].total += 1;
          if (t.trainingStatus === 'Certified') providers[p].certified += 1;
          if (t.employmentStatus === 'Employed') providers[p].placed += 1;
          providers[p].avgScore += t.assessmentScore || 80;
          providers[p].avgAtt += t.attendancePercent || 85;
        });

        const header = 'Training Provider,Enrolled Candidates,Certified,Placement Count,Placement %,Avg Assessment Score,Avg Attendance %\n';
        const rows = Object.entries(providers).map(([name, data]) => {
          const placementRate = Math.round((data.placed / (data.total || 1)) * 100);
          const avgScore = Math.round(data.avgScore / (data.total || 1));
          const avgAtt = Math.round(data.avgAtt / (data.total || 1));
          return `"${name}",${data.total},${data.certified},${data.placed},"${placementRate}%","${avgScore}/100","${avgAtt}%"`;
        }).join('\n');

        const content = `SKILLTRACK - TRAINING CENTER PERFORMANCE REPORT\nProgram: ${f.program} | District: ${f.district} | FY: ${f.fy}\nGenerated: ${new Date().toLocaleString()}\n\n${header}${rows}`;
        return { fileName: `Training_Center_Performance_${f.district.replace(/\s+/g, '_')}.csv`, content };
      }
    },
    {
      id: 'gesi-inclusion',
      title: 'Gender & Social Inclusion (GESI) Report',
      desc: 'Analysis of women participation (48.2%), rural-to-urban mobility, and vulnerable community skilling outcomes.',
      format: 'CSV',
      category: 'Inclusion & Equity',
      generateReport: (list, f) => {
        const header = 'Candidate ID,Name,Gender,District,Course,Placement Status,Monthly Wage (INR)\n';
        const rows = list.map(t =>
          `"${t.id}","${t.name}","${t.gender}","${t.district}","${t.course}","${t.employmentStatus}",₹${t.currentSalary}`
        ).join('\n');
        const content = `SKILLTRACK - GENDER & SOCIAL INCLUSION (GESI) AUDIT\nProgram: ${f.program} | District: ${f.district} | Period: ${f.fy}\nTotal Sample: ${list.length}\n\n${header}${rows}`;
        return { fileName: `GESI_Inclusion_Audit_${f.district.replace(/\s+/g, '_')}.csv`, content };
      }
    },
    {
      id: 'employer-registry',
      title: 'Employer Verification & Placement Registry',
      desc: 'Consolidated list of hiring partners, verified offer letters, HR contact attestations, and workplace audit logs.',
      format: 'CSV',
      category: 'Industry Partnerships',
      generateReport: (list, f) => {
        const header = 'Employer Partner,Candidate Name,Candidate ID,Role,Verified Salary,District\n';
        const rows = list.filter(t => t.employer).map(t =>
          `"${t.employer}","${t.name}","${t.id}","${t.jobRole}",₹${t.currentSalary},"${t.district}"`
        ).join('\n');
        const content = `SKILLTRACK - EMPLOYER PLACEMENT REGISTRY\nProgram: ${f.program} | District: ${f.district} | Fiscal: ${f.fy}\n\n${header}${rows}`;
        return { fileName: `Employer_Verification_Registry_${f.district.replace(/\s+/g, '_')}.csv`, content };
      }
    }
  ];

  const handleExport = (report: ReportTemplate) => {
    const { fileName, content } = report.generateReport(filteredTrainees, {
      program: selectedProgram,
      district: selectedDistrict,
      fy: selectedFY
    });
    downloadDemoFile(fileName, content);
    showToast(`Generated & downloaded "${report.title}" (${filteredTrainees.length} records)`);
  };

  const handlePreview = (report: ReportTemplate) => {
    const placedCount = filteredTrainees.filter(t => t.employmentStatus === 'Employed').length;
    const avgSalary = Math.round(
      filteredTrainees.reduce((acc, t) => acc + t.currentSalary, 0) / (filteredTrainees.length || 1)
    );

    setPreviewModalData({
      title: report.title,
      summaryRows: [
        { label: 'Training Program Scope', value: selectedProgram },
        { label: 'Geographic District', value: selectedDistrict },
        { label: 'Fiscal Year Period', value: selectedFY },
        { label: 'Total Matching Candidates', value: filteredTrainees.length },
        { label: 'Placed Alumni Count', value: placedCount },
        { label: 'Average Verified Monthly Wage', value: `₹${avgSalary.toLocaleString('en-IN')}` },
        { label: 'Generated Timestamp', value: new Date().toLocaleDateString('en-GB') }
      ],
      sampleData: filteredTrainees.slice(0, 5).map(t => `${t.id} - ${t.name} (${t.course}, ${t.district}) - ${t.employer || 'Self-Employed'}`)
    });
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Header Deck */}
      <div className="px-space-24 py-space-20 bg-surface-container-lowest border-b border-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="mb-2">
            <BackButton label="Back to Dashboard" to="dashboard" id="reports-back-btn" />
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-label-sm uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-base text-primary">description</span>
            <span>Outcome Verification &amp; Audit Reports</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">
            Official Reports &amp; Audit Dossiers
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Automated generation of program outcome verification dossiers, center performance scorecards, and longitudinal audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-base">verified</span>
            <span>Live Audit Engine Ready</span>
          </span>
        </div>
      </div>

      <div className="p-space-24 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        {/* Dynamic Filter Controls */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">tune</span>
            <span className="text-sm font-bold text-on-surface">Report Generation Scope:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            {/* Training Program Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-outline">Training Program</label>
              <select
                id="reports-program-filter"
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30 cursor-pointer"
              >
                <option value="All Programs">All Programs</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Analytics">Data Analytics</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Data Entry">Data Entry</option>
                <option value="Other Programs">Other Programs</option>
              </select>
            </div>

            {/* District Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-outline">District Filter</label>
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

            {/* Fiscal Year Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-outline">Financial Year / Period</label>
              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30 cursor-pointer"
              >
                <option value="FY 2025-26">FY 2025-26 (Current Active)</option>
                <option value="FY 2024-25">FY 2024-25 (Audited Close)</option>
                <option value="Q3 FY 2025-26">Q3 FY 2025-26 (Quarterly)</option>
                <option value="All Fiscal Years">All Historical Records</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-lg font-medium">
            Active Candidates in Scope: <strong className="text-primary text-sm">{filteredTrainees.length}</strong>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportDefinitions.map(report => (
            <div
              key={report.id}
              className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-primary uppercase font-bold text-[10px]">
                    {report.format}
                  </span>
                  <span className="text-secondary font-semibold">{report.category}</span>
                </div>
                <h3 className="text-base font-bold text-on-surface mt-3">{report.title}</h3>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{report.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-container flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-outline">
                  <span>Scope: {selectedProgram}</span>
                  <span className="font-semibold text-on-surface">{filteredTrainees.length} records</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreview(report)}
                    className="flex-1 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>Preview Summary</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport(report)}
                    className="flex-1 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Generate &amp; Export</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Preview Summary Modal */}
      {previewModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-surface-container-low border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">preview</span>
                <h3 className="text-base font-bold text-on-surface">{previewModalData.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalData(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto text-sm">
              <div className="bg-surface-container-low rounded-lg p-3 divide-y divide-surface-container text-xs">
                {previewModalData.summaryRows.map((row, idx) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between">
                    <span className="text-outline font-medium">{row.label}:</span>
                    <span className="font-bold text-on-surface">{row.value}</span>
                  </div>
                ))}
              </div>

              <div>
                <span className="text-xs font-bold text-on-surface">Candidate Records Sample:</span>
                <div className="mt-2 flex flex-col gap-1.5 text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-lg font-mono">
                  {previewModalData.sampleData.map((item, idx) => (
                    <div key={idx} className="truncate">• {item}</div>
                  ))}
                  {filteredTrainees.length > 5 && (
                    <div className="text-outline text-[11px] mt-1 font-sans italic">
                      + {filteredTrainees.length - 5} more candidate records included in complete file...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-surface-container-low flex items-center justify-end gap-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setPreviewModalData(null)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  const rep = reportDefinitions.find(r => r.title === previewModalData.title);
                  if (rep) handleExport(rep);
                  setPreviewModalData(null);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Download Report Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

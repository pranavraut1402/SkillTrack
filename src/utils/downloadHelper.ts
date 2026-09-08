/**
 * Utility to download demo CSV / text reports for SkillTrack
 * Clearly marked as Demo Prototype for SIH 2026 Hackathon
 */

export function downloadDemoFile(filename: string, content: string, mimeType = 'text/csv;charset=utf-8;') {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.warn('File download error in preview environment:', err);
    return false;
  }
}

export function generateTraineesCSV(trainees: any[]) {
  const header = 'Skill ID,Name,Course,Batch,District,Center,Attendance %,Assessment Score,Employment Status,Employer,Designation,Starting Salary,Current Salary,Wage Growth %,12-Mo Retention,Milestone Cycle\n';
  const rows = trainees.map(t => {
    const growth = t.startingSalary > 0
      ? Math.round(((t.currentSalary - t.startingSalary) / t.startingSalary) * 100)
      : 0;
    return `"${t.id}","${t.name}","${t.course}","${t.batch}","${t.district}","${t.trainingProvider}",${t.attendancePercent}%,${t.assessmentScore}%,"${t.employmentStatus}","${t.employer || 'N/A'}","${t.jobRole || 'N/A'}",₹${t.startingSalary},₹${t.currentSalary},+${growth}%,"${t.retentionDuration}","${t.currentFollowUpCycle}"`;
  }).join('\n');

  return `SKILLTRACK - STATE SKILL MISSION DEMO OUTCOME EXPORT (SIH 2026 PROTOTYPE)\nGenerated On: ${new Date().toLocaleString()}\nTotal Records: ${trainees.length}\n\n${header}${rows}`;
}

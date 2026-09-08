import React, { useState } from 'react';
import { useTrainees } from '../context/TraineeContext';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const { addTrainee, openTraineeProfile } = useTrainees();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'Female' as 'Female' | 'Male' | 'Other',
    age: 22,
    district: 'Yavatmal',
    course: 'Web Development',
    sector: 'IT-ITeS Sector Skill Council',
    trainingProvider: 'Apex Skills Hub - Yavatmal',
    batch: 'WD-2025-Q1',
    attendancePercent: 92,
    assessmentScore: 85,
    employmentStatus: 'Employed' as 'Employed' | 'Self-Employed' | 'Apprenticeship' | 'Job Seeking',
    employer: 'Tech Solutions Pvt. Ltd.',
    jobRole: 'Junior Frontend Developer',
    startingSalary: 18000,
    currentSalary: 20000,
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Trainee name is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone contact is required.');
      return;
    }
    if (formData.attendancePercent < 0 || formData.attendancePercent > 100) {
      setError('Attendance must be between 0% and 100%.');
      return;
    }
    if (formData.startingSalary < 0) {
      setError('Starting salary cannot be negative.');
      return;
    }

    setError('');
    const newTrainee = addTrainee({
      name: formData.name,
      phone: formData.phone,
      gender: formData.gender,
      age: Number(formData.age),
      district: formData.district,
      center: `${formData.trainingProvider} Center`,
      course: formData.course,
      sector: formData.sector,
      trainingProvider: formData.trainingProvider,
      batch: formData.batch,
      attendancePercent: Number(formData.attendancePercent),
      assessmentScore: Number(formData.assessmentScore),
      employmentStatus: formData.employmentStatus,
      employer: formData.employer,
      jobRole: formData.jobRole,
      startingSalary: Number(formData.startingSalary),
      currentSalary: Number(formData.currentSalary || formData.startingSalary),
      trainingStatus: 'Certified',
      certificationStatus: 'Completed',
      placementStatus: formData.employmentStatus === 'Job Seeking' ? 'Job Seeking' : 'Successful',
    });

    onClose();
    // Open the new trainee's profile right away
    openTraineeProfile(newTrainee.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-space-16">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-space-20 bg-surface-container-low border-b border-surface-container gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              id="registration-modal-back-btn"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container bg-surface-container-lowest border border-outline-variant/30 transition-all cursor-pointer shadow-2xs hover:shadow-xs shrink-0"
              title="Back to Trainee Directory"
              aria-label="Back to Trainee Directory"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back</span>
            </button>
            <div className="h-5 w-px bg-outline-variant/30 hidden sm:block"></div>
            <div className="flex items-center gap-space-12">
              <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Add New Trainee Record
                </h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  State Skill Mission Unified Candidate Registration
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            id="registration-modal-close-icon-btn"
            className="p-space-4 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-space-20 flex flex-col gap-space-16 overflow-y-auto font-body-md text-body-md">
          {error && (
            <div className="p-space-12 rounded-lg bg-error-container text-on-error-container font-label-md text-label-md flex items-center gap-2">
              <span className="material-symbols-outlined text-base">warning</span>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-16">
            <div className="flex flex-col gap-space-4">
              <label className="font-label-md text-label-md font-semibold text-on-surface">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Aniket Kulkarni"
                className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30"
              />
            </div>

            <div className="flex flex-col gap-space-4">
              <label className="font-label-md text-label-md font-semibold text-on-surface">Contact Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98234 56789"
                className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-16">
            <div className="flex flex-col gap-space-4">
              <label className="font-label-md text-label-md font-semibold text-on-surface">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30 cursor-pointer"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-space-4">
              <label className="font-label-md text-label-md font-semibold text-on-surface">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 18 })}
                className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30"
              />
            </div>

            <div className="flex flex-col gap-space-4">
              <label className="font-label-md text-label-md font-semibold text-on-surface">District *</label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30 cursor-pointer"
              >
                <option value="Yavatmal">Yavatmal</option>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Nagpur">Nagpur</option>
                <option value="Nashik">Nashik</option>
                <option value="Aurangabad">Aurangabad</option>
                <option value="Solapur">Solapur</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-16">
            <div className="flex flex-col gap-space-4">
              <label className="font-label-md text-label-md font-semibold text-on-surface">Course Track *</label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30 cursor-pointer"
              >
                <option value="Web Development">Web Development</option>
                <option value="Solar PV Installation">Solar PV Installation</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Healthcare General Duty">Healthcare General Duty</option>
                <option value="Data Entry & Office Admin">Data Entry & Office Admin</option>
                <option value="Full Stack Development">Full Stack Development</option>
                <option value="Electrician & Wiring">Electrician & Wiring</option>
              </select>
            </div>

            <div className="flex flex-col gap-space-4">
              <label className="font-label-md text-label-md font-semibold text-on-surface">Training Institute</label>
              <select
                value={formData.trainingProvider}
                onChange={(e) => setFormData({ ...formData, trainingProvider: e.target.value })}
                className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30 cursor-pointer"
              >
                <option value="Apex Skills Hub - Yavatmal">Apex Skills Hub - Yavatmal</option>
                <option value="Govt ITI Aundh (Pune)">Govt ITI Aundh (Pune)</option>
                <option value="Vidarbha Skill Academy">Vidarbha Skill Academy</option>
                <option value="Sahyadri Tech Training">Sahyadri Tech Training</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-16">
            <div className="flex flex-col gap-space-4">
              <label className="font-label-md text-label-md font-semibold text-on-surface">Attendance Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.attendancePercent}
                onChange={(e) => setFormData({ ...formData, attendancePercent: parseInt(e.target.value, 10) || 0 })}
                className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30"
              />
            </div>

            <div className="flex flex-col gap-space-4">
              <label className="font-label-md text-label-md font-semibold text-on-surface">Assessment Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.assessmentScore}
                onChange={(e) => setFormData({ ...formData, assessmentScore: parseInt(e.target.value, 10) || 0 })}
                className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30"
              />
            </div>
          </div>

          <div className="border-t border-surface-container pt-space-12">
            <h4 className="font-label-md text-label-md font-bold text-primary uppercase mb-space-12">
              Employment Placement Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-16">
              <div className="flex flex-col gap-space-4">
                <label className="font-label-md text-label-md font-semibold text-on-surface">Employment Status</label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as any })}
                  className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30 cursor-pointer"
                >
                  <option value="Employed">Employed (Formal Sector)</option>
                  <option value="Self-Employed">Self-Employed / Entrepreneurship</option>
                  <option value="Apprenticeship">Apprenticeship (NAPS/NATS)</option>
                  <option value="Job Seeking">Job Seeking / In Placement Pipeline</option>
                </select>
              </div>

              <div className="flex flex-col gap-space-4">
                <label className="font-label-md text-label-md font-semibold text-on-surface">Employer / Venture Name</label>
                <input
                  type="text"
                  value={formData.employer}
                  onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                  placeholder="e.g. Tech Solutions Pvt. Ltd."
                  className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30"
                />
              </div>

              <div className="flex flex-col gap-space-4">
                <label className="font-label-md text-label-md font-semibold text-on-surface">Designation / Role</label>
                <input
                  type="text"
                  value={formData.jobRole}
                  onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                  placeholder="e.g. Junior Frontend Developer"
                  className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30"
                />
              </div>

              <div className="flex flex-col gap-space-4">
                <label className="font-label-md text-label-md font-semibold text-on-surface">Monthly Salary (₹)</label>
                <input
                  type="number"
                  value={formData.startingSalary}
                  onChange={(e) => setFormData({ ...formData, startingSalary: parseInt(e.target.value, 10) || 0 })}
                  placeholder="e.g. 18000"
                  className="h-10 px-space-12 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container border border-outline-variant/30"
                />
              </div>
            </div>
          </div>

          <div className="p-space-16 bg-surface-container-low rounded-lg flex items-center justify-end gap-space-12 mt-space-8">
            <button
              type="button"
              onClick={onClose}
              className="px-space-16 py-space-8 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-body-md-medium text-body-md-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-space-20 py-space-8 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors font-body-md-medium text-body-md-medium shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">how_to_reg</span>
              <span>Register & Save Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

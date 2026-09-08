import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trainee, ActivePage, FollowUpRecord } from '../types';
import { initialTrainees } from '../data/initialTrainees';
import { getTraineeAvatar } from '../utils/avatarHelper';
import {
  seedFirestoreIfEmpty,
  fetchAllTraineesFromFirestore,
  createTraineeInFirestore,
  updateTraineeInFirestore,
  saveFollowUpInFirestore,
  subscribeToTrainees,
  deleteTraineeFromFirestore
} from '../services/firestoreService';
import { invalidateTraineeAICache } from '../services/aiService';
import { useAuth } from './AuthContext';

interface ToastState {
  show: boolean;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface TraineeContextType {
  trainees: Trainee[];
  selectedTraineeId: string;
  selectedTrainee: Trainee;
  setSelectedTraineeId: (id: string) => void;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  previousPage: ActivePage | null;
  navigateBack: (fallbackPage?: ActivePage) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  openTraineeProfile: (id: string) => void;
  addTrainee: (data: Partial<Trainee>) => Trainee;
  updateTrainee: (id: string, updates: Partial<Trainee>) => void;
  deleteTrainee: (id: string) => Promise<void>;
  updateFollowUp: (id: string, stage: string, followUpData: Partial<FollowUpRecord>) => void;
  updateTraining: (id: string, trainingData: Partial<Trainee>) => void;
  updateAssessment: (id: string, assessmentData: Partial<Trainee>) => void;
  updateEmployment: (id: string, employmentData: Partial<Trainee>) => void;
  toggleMentorshipFlag: (id: string) => void;
  toast: ToastState;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  hideToast: () => void;
  isLoading: boolean;
  isSyncing: boolean;
  
  // Dynamic stats calculated from real dataset
  metrics: {
    totalTraineesDisplay: string;
    totalRegisteredCount: number;
    placedCount: number;
    employedCount: number;
    retainedCount: number;
    placementRate: number;
    employmentRate: number;
    twelveMonthRetentionRate: number;
    sixMonthRetentionCount: number;
    averageStartingSalary: number;
    averageCurrentSalary: number;
    salaryGrowthPercent: number;
    wageEmployedCount: number;
    selfEmployedCount: number;
    apprenticeshipCount: number;
    seekingCount: number;
    wageEmployedPercent: number;
    selfEmployedPercent: number;
    apprenticeshipPercent: number;
    seekingPercent: number;
    atRiskCount: number;
    courseStats: {
      course: string;
      total: number;
      placed: number;
      rate: number;
    }[];
  };
}

const STORAGE_KEY = 'skilltrack_trainees_v2';

const getPageFromPath = (path: string): ActivePage => {
  const clean = path.replace(/^\/+|\/+$/g, '').toLowerCase();
  const validPages: ActivePage[] = [
    'dashboard',
    'trainees',
    'trainee-profile',
    'training',
    'assessment',
    'placement',
    'employment',
    'follow-ups',
    'analytics',
    'ai-insights',
    'reports',
    'settings'
  ];
  if (validPages.includes(clean as ActivePage)) {
    return clean as ActivePage;
  }
  return 'dashboard';
};

const TraineeContext = createContext<TraineeContextType | undefined>(undefined);

export const TraineeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [trainees, setTrainees] = useState<Trainee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return initialTrainees;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [selectedTraineeId, setSelectedTraineeIdState] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem('skilltrack_selected_trainee_id');
      if (savedId) return savedId;
    } catch {
      // fallback
    }
    return 'ST1001';
  });

  const setSelectedTraineeId = (id: string) => {
    setSelectedTraineeIdState(id);
    try {
      localStorage.setItem('skilltrack_selected_trainee_id', id);
    } catch {
      // ignore
    }
  };

  const [activePage, setActivePageState] = useState<ActivePage>(() => {
    if (typeof window !== 'undefined' && window.location.pathname && window.location.pathname !== '/login') {
      return getPageFromPath(window.location.pathname);
    }
    return 'dashboard';
  });

  const [previousPage, setPreviousPage] = useState<ActivePage | null>(() => {
    try {
      const savedPrev = localStorage.getItem('skilltrack_previous_page');
      if (savedPrev) return savedPrev as ActivePage;
    } catch {
      // fallback
    }
    return null;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const setActivePage = (page: ActivePage) => {
    setActivePageState(current => {
      if (current !== page) {
        setPreviousPage(current);
        try {
          localStorage.setItem('skilltrack_previous_page', current);
        } catch {
          // ignore
        }
      }
      return page;
    });
    if (typeof window !== 'undefined') {
      const targetPath = `/${page}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ page }, '', targetPath);
      }
    }
  };

  const navigateBack = (fallbackPage?: ActivePage) => {
    if (fallbackPage) {
      setActivePage(fallbackPage);
      return;
    }
    switch (activePage) {
      case 'trainee-profile':
        setActivePage('trainees');
        break;
      case 'assessment':
        setActivePage('trainee-profile');
        break;
      case 'ai-insights':
        if (previousPage === 'trainee-profile') {
          setActivePage('trainee-profile');
        } else {
          setActivePage('dashboard');
        }
        break;
      case 'analytics':
      case 'reports':
      case 'settings':
      case 'placement':
        setActivePage('dashboard');
        break;
      case 'employment':
      case 'training':
      case 'follow-ups':
        if (previousPage === 'trainee-profile') {
          setActivePage('trainee-profile');
        } else {
          setActivePage('dashboard');
        }
        break;
      default:
        setActivePage('dashboard');
        break;
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const page = getPageFromPath(window.location.pathname);
        setActivePageState(page);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Save to localStorage as offline cache backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trainees));
    } catch {
      // ignore
    }
  }, [trainees]);

  // Seed and synchronize with Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    async function initFirestore() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsSyncing(true);
      try {
        // 1. Seed demo candidates if needed to Firestore
        await seedFirestoreIfEmpty();

        // 2. Initial fetch
        const remoteList = await fetchAllTraineesFromFirestore();
        if (isMounted && remoteList.length > 0) {
          setTrainees(remoteList);
        }
      } catch (err) {
        console.warn('Firestore initial sync notice:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsSyncing(false);
        }
      }

      // 3. Listen to real-time changes
      try {
        unsubscribe = subscribeToTrainees(
          (updatedList) => {
            if (isMounted && updatedList.length > 0) {
              setTrainees(updatedList);
            }
          },
          (err) => {
            console.warn('Real-time listener warning:', err);
          }
        );
      } catch (e) {
        console.warn('Could not attach real-time listener:', e);
      }
    }

    initFirestore();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const selectedTrainee = trainees.find(t => t.id === selectedTraineeId) || trainees[0] || initialTrainees[0];

  const openTraineeProfile = (id: string) => {
    setSelectedTraineeId(id);
    setActivePage('trainee-profile');
  };

  const addTrainee = (data: Partial<Trainee>): Trainee => {
    // Generate next unique ID e.g. ST1009
    const maxNum = trainees.reduce((max, t) => {
      const num = parseInt(t.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 1008);

    const newId = `ST${maxNum + 1}`;
    const name = data.name || 'New Trainee';
    const nameParts = name.trim().split(' ');
    const initials = nameParts.length > 1 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();

    const gender = data.gender || 'Female';
    const profileImg = data.profileImage || data.photoUrl || data.avatar || getTraineeAvatar({
      id: newId,
      gender
    });

    const newTrainee: Trainee = {
      id: newId,
      name,
      initials,
      phone: data.phone || '+91 98000 00000',
      maskedUid: `•••• •••• ${Math.floor(1000 + Math.random() * 9000)}`,
      email: data.email || `${name.toLowerCase().replace(/\s+/g, '.')}@mssds.gov.in`,
      profileImage: profileImg,
      avatar: profileImg,
      photoUrl: profileImg,
      gender,
      age: data.age || 22,
      district: data.district || 'Yavatmal',
      center: data.center || 'Apex Skills Hub - Yavatmal',
      state: 'Maharashtra',
      course: data.course || 'Web Development',
      sector: data.sector || 'IT-ITeS Sector Skill Council',
      batch: data.batch || `BATCH-2025-Q${Math.floor(Math.random() * 4) + 1}`,
      trainingProvider: data.trainingProvider || 'Apex Skills Hub - Yavatmal',
      trainingStatus: data.trainingStatus || 'Certified',
      trainingStartDate: data.trainingStartDate || '01 Feb 2025',
      trainingEndDate: data.trainingEndDate || '01 May 2025',
      attendancePercent: data.attendancePercent || 90,
      assessmentScore: data.assessmentScore || 85,
      assessmentGrade: data.assessmentScore && data.assessmentScore >= 85 ? 'Grade A' : 'Grade B',
      assessmentStatus: 'Passed',
      certificationStatus: 'Completed',
      certificateId: `CERT-MH-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      certificationDate: '15 May 2025',
      placementStatus: data.placementStatus || (data.employer ? 'Successful' : 'Job Seeking'),
      employmentStatus: data.employmentStatus || (data.employer ? 'Employed' : 'Job Seeking'),
      employer: data.employer || (data.employmentStatus === 'Job Seeking' ? 'Pending Placement' : 'Local Enterprise Partners'),
      jobRole: data.jobRole || 'Junior Trainee',
      employmentType: data.employmentType || 'Full Time',
      joiningDate: data.joiningDate || '01 June 2025',
      startingSalary: data.startingSalary || 18000,
      currentSalary: data.currentSalary || data.startingSalary || 18000,
      retentionDuration: '30 Days Active',
      employmentVerified: true,
      currentFollowUpCycle: '30 Days Completed',
      followUps: [
        {
          stage: '30 Days',
          status: 'Completed',
          date: '01 July 2025',
          verificationMethod: 'Salary Slip Validated',
          currentWage: data.startingSalary || 18000,
          isEmployed: true,
          workingInTrainedField: true,
          jobSatisfaction: 'High / Satisfied',
          candidateFeedback: 'Successfully onboarded.'
        },
        { stage: '90 Days', status: 'Upcoming', dueDate: '01 Oct 2025' },
        { stage: '6 Months', status: 'Scheduled', dueDate: '01 Jan 2026' }
      ],
      skills: data.skills && data.skills.length > 0 ? data.skills : ['Core Practical Skills', 'Problem Solving', 'Team Collaboration'],
      skillGaps: [
        { skill: `${data.course || 'Core'} Advanced Techniques`, level: 45, status: 'High Demand Gap', benchmark: 'Recommended' },
        { skill: 'Cloud & Workplace Digital Tools', level: 35, status: 'Gap Identified — Critical', benchmark: 'Industry Standard' }
      ],
      placementRisk: data.employmentStatus === 'Job Seeking' ? 'High' : 'Low',
      retentionRisk: 'Low Risk (Stable)',
      recommendedPathway: [
        { id: 1, title: 'Advanced Industry Specialization Track', impact: '+40% Wage Growth', duration: 'Est: 35 hrs', type: 'Hybrid', tag: 'Recommended' }
      ],
      trajectoryIndex: 7.8,
      tenureStabilityMonths: 4,
      registeredDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    // Optimistically update
    setTrainees(prev => [newTrainee, ...prev]);
    showToast(`Trainee ${newTrainee.name} registered with ID ${newId}!`);

    // Persist to Firestore
    createTraineeInFirestore(newTrainee).catch((err) => {
      console.error('Failed to create trainee in Firestore:', err);
    });

    return newTrainee;
  };

  const updateTrainee = (id: string, updates: Partial<Trainee>) => {
    setTrainees(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
    showToast(`Updated record for ${id}`);

    updateTraineeInFirestore(id, updates).catch((err) => {
      console.error('Failed to update trainee in Firestore:', err);
    });
  };

  const deleteTrainee = async (id: string): Promise<void> => {
    setIsSyncing(true);
    try {
      // 1. Permanently delete from Firestore across all 6 collections
      await deleteTraineeFromFirestore(id);

      // 2. Fetch fresh list from Firestore to verify and refresh state
      const remoteList = await fetchAllTraineesFromFirestore();
      setTrainees(remoteList);

      // 3. Update localStorage cache
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteList));
      } catch {
        // ignore
      }

      // 4. Update selected trainee ID if the deleted one was selected
      if (selectedTraineeId === id) {
        if (remoteList.length > 0) {
          setSelectedTraineeId(remoteList[0].id);
        } else {
          setSelectedTraineeId('');
        }
      }
    } catch (error) {
      console.error(`Failed to delete trainee ${id}:`, error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const updateFollowUp = (id: string, stage: string, followUpData: Partial<FollowUpRecord>) => {
    setTrainees(prev => prev.map(t => {
      if (t.id !== id) return t;

      let stageFound = false;
      const updatedFollowUps = t.followUps.map(f => {
        if (f.stage === stage) {
          stageFound = true;
          return { ...f, ...followUpData, status: (followUpData.status || 'Completed') as FollowUpRecord['status'] };
        }
        return f;
      });

      if (!stageFound) {
        updatedFollowUps.push({
          stage: stage as FollowUpRecord['stage'],
          status: 'Completed',
          ...followUpData
        });
      }

      const newSalary = followUpData.currentWage || t.currentSalary;
      const updatedStatus: Trainee = {
        ...t,
        followUps: updatedFollowUps,
        currentSalary: newSalary,
        currentFollowUpCycle: `${stage} Completed`,
        retentionDuration: `${stage} Verified`
      };

      if (followUpData.isEmployed !== undefined) {
        updatedStatus.employmentStatus = followUpData.isEmployed ? 'Employed' : 'Job Seeking';
      }

      if (followUpData.employer) {
        updatedStatus.employer = followUpData.employer;
      }

      return updatedStatus;
    }));

    showToast(`Audit follow-up signed and recorded for ${id}`);
    invalidateTraineeAICache(id);

    saveFollowUpInFirestore(id, stage, followUpData).catch((err) => {
      console.error('Failed to save follow-up in Firestore:', err);
    });
  };

  const updateTraining = (id: string, trainingData: Partial<Trainee>) => {
    setTrainees(prev => prev.map(t => (t.id === id ? { ...t, ...trainingData } : t)));
    showToast(`Training and attendance records updated for ${id}`);
    invalidateTraineeAICache(id);

    updateTraineeInFirestore(id, trainingData).catch((err) => {
      console.error('Failed to update training record in Firestore:', err);
    });
  };

  const updateAssessment = (id: string, assessmentData: Partial<Trainee>) => {
    setTrainees(prev => prev.map(t => (t.id === id ? { ...t, ...assessmentData } : t)));
    showToast(`Assessment and certification updated for ${id}`);
    invalidateTraineeAICache(id);

    updateTraineeInFirestore(id, assessmentData).catch((err) => {
      console.error('Failed to update assessment record in Firestore:', err);
    });
  };

  const updateEmployment = (id: string, employmentData: Partial<Trainee>) => {
    setTrainees(prev => prev.map(t => (t.id === id ? { ...t, ...employmentData } : t)));
    showToast(`Employment verification updated for ${id}`);
    invalidateTraineeAICache(id);

    updateTraineeInFirestore(id, employmentData).catch((err) => {
      console.error('Failed to update employment in Firestore:', err);
    });
  };

  const toggleMentorshipFlag = (id: string) => {
    setTrainees(prev => prev.map(t => {
      if (t.id === id) {
        const next = !t.flaggedForMentorship;
        showToast(next ? `Flagged ${t.name} for Mentorship` : `Removed Mentorship flag for ${t.name}`);
        updateTraineeInFirestore(id, { flaggedForMentorship: next }).catch(console.error);
        return { ...t, flaggedForMentorship: next };
      }
      return t;
    }));
  };

  // Calculate dynamic metrics strictly from real Firestore trainee records
  const total = trainees.length;
  const placed = trainees.filter(t => t.placementStatus === 'Successful' || t.employmentStatus === 'Employed' || t.employmentStatus === 'Self-Employed' || t.employmentStatus === 'Apprenticeship').length;
  const employed = trainees.filter(t => t.employmentStatus === 'Employed' || t.employmentStatus === 'Self-Employed' || t.employmentStatus === 'Apprenticeship').length;
  const retained12m = trainees.filter(t => t.retentionDuration?.includes('12') || t.retentionDuration?.includes('6') || (t.tenureStabilityMonths && t.tenureStabilityMonths >= 6) || t.followUps?.some(f => (f.stage === '6 Months' || f.stage === '12 Months') && f.status === 'Completed')).length;

  const placementRate = total > 0 ? Math.round((placed / total) * 100) : 0;
  const employmentRate = total > 0 ? Math.round((employed / total) * 100) : 0;
  const twelveMonthRetentionRate = total > 0 ? Math.round((retained12m / total) * 100) : 0;

  const wageEmployedCount = trainees.filter(t => t.employmentStatus === 'Employed').length;
  const selfEmployedCount = trainees.filter(t => t.employmentStatus === 'Self-Employed').length;
  const apprenticeshipCount = trainees.filter(t => t.employmentStatus === 'Apprenticeship').length;
  const seekingCount = trainees.filter(t => t.employmentStatus === 'Job Seeking' || t.employmentStatus === 'In Training').length;

  const wageEmployedPercent = total > 0 ? Math.round((wageEmployedCount / total) * 100) : 0;
  const selfEmployedPercent = total > 0 ? Math.round((selfEmployedCount / total) * 100) : 0;
  const apprenticeshipPercent = total > 0 ? Math.round((apprenticeshipCount / total) * 100) : 0;
  const seekingPercent = total > 0 ? Math.round((seekingCount / total) * 100) : 0;

  const salariesWithJob = trainees.filter(t => t.currentSalary && t.currentSalary > 0);
  const avgStarting = salariesWithJob.length > 0
    ? Math.round(salariesWithJob.reduce((acc, t) => acc + (t.startingSalary || 18000), 0) / salariesWithJob.length)
    : 18000;
  const avgCurrent = salariesWithJob.length > 0
    ? Math.round(salariesWithJob.reduce((acc, t) => acc + (t.currentSalary || 18000), 0) / salariesWithJob.length)
    : 21000;
  const growthPercent = avgStarting > 0 ? Math.round(((avgCurrent - avgStarting) / avgStarting) * 100) : 0;

  // Course wise breakdown from Firestore records
  const coursesMap = new Map<string, { total: number; placed: number }>();
  trainees.forEach(t => {
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
    rate: Math.round((stats.placed / stats.total) * 100)
  }));

  const metrics = {
    totalTraineesDisplay: total.toString(),
    totalRegisteredCount: total,
    placedCount: placed,
    employedCount: employed,
    retainedCount: retained12m,
    placementRate,
    employmentRate,
    twelveMonthRetentionRate,
    sixMonthRetentionCount: retained12m,
    averageStartingSalary: avgStarting,
    averageCurrentSalary: avgCurrent,
    salaryGrowthPercent: growthPercent,
    wageEmployedCount,
    selfEmployedCount,
    apprenticeshipCount,
    seekingCount,
    wageEmployedPercent,
    selfEmployedPercent,
    apprenticeshipPercent,
    seekingPercent,
    atRiskCount: trainees.filter(t => t.placementRisk === 'High' || t.employmentStatus === 'Job Seeking').length,
    courseStats
  };

  return (
    <TraineeContext.Provider
      value={{
        trainees,
        selectedTraineeId,
        selectedTrainee,
        setSelectedTraineeId,
        activePage,
        setActivePage,
        previousPage,
        navigateBack,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        globalSearchQuery,
        setGlobalSearchQuery,
        openTraineeProfile,
        addTrainee,
        updateTrainee,
        deleteTrainee,
        updateFollowUp,
        updateTraining,
        updateAssessment,
        updateEmployment,
        toggleMentorshipFlag,
        toast,
        showToast,
        hideToast,
        isLoading,
        isSyncing,
        metrics
      }}
    >
      {children}
    </TraineeContext.Provider>
  );
};

export const useTrainees = () => {
  const context = useContext(TraineeContext);
  if (!context) {
    throw new Error('useTrainees must be used within a TraineeProvider');
  }
  return context;
};

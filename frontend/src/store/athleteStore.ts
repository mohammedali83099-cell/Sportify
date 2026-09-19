import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, intakeAPI } from '../api/client';
import {
  Athlete,
  AthleteProfile,
  Assessment,
  Bottleneck,
  TrainingPlan,
  OnboardingData,
} from '../types';

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';
export type ProfileStatus = 'idle' | 'loading' | 'ready' | 'missing' | 'error';

export interface AthleteState {
  // Auth & Token
  athlete: Athlete | null;
  token: string | null;
  isAuthenticated: boolean;
  authStatus: AuthStatus;

  // Profile & Status
  profile: AthleteProfile | null;
  profileStatus: ProfileStatus;
  profileError: string | null;

  // Assessment & Bottlenecks
  currentAssessment: Assessment | null;
  bottlenecks: Bottleneck[];

  // Training Plan
  currentPlan: TrainingPlan | null;

  // Onboarding Wizard State
  onboardingStep: number;
  onboardingData: OnboardingData;
}

export interface AthleteActions {
  login: (athlete: Athlete, token: string, profile?: AthleteProfile | null) => void;
  logout: () => void;
  setProfile: (profile: AthleteProfile | null) => void;
  setProfileStatus: (status: ProfileStatus, error?: string | null) => void;
  setAssessment: (assessment: Assessment | null) => void;
  setBottlenecks: (bottlenecks: Bottleneck[]) => void;
  setPlan: (plan: TrainingPlan | null) => void;
  setOnboardingStep: (step: number) => void;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  hydrateAuthAndProfile: () => Promise<{
    isAuthenticated: boolean;
    profileStatus: ProfileStatus;
    profile?: AthleteProfile | null;
    error?: any;
  }>;
}

export type AthleteStore = AthleteState & AthleteActions;

export const useAthleteStore = create<AthleteStore>()(
  persist(
    (set, get) => ({
      // Auth & Token
      athlete: null,
      token: null,
      isAuthenticated: false,
      authStatus: 'unknown',

      // Profile & Status
      profile: null,
      profileStatus: 'idle',
      profileError: null,

      // Assessment & Bottlenecks
      currentAssessment: null,
      bottlenecks: [],

      // Training Plan
      currentPlan: null,

      // Onboarding Wizard State
      onboardingStep: 0,
      onboardingData: {},

      // Actions
      login: (athlete: Athlete, token: string, profile: AthleteProfile | null = null) => {
        set({
          athlete,
          token,
          isAuthenticated: true,
          authStatus: 'authenticated',
          profile,
          profileStatus: profile ? 'ready' : 'missing',
          profileError: null,
        });
      },

      logout: () => {
        set({
          athlete: null,
          token: null,
          isAuthenticated: false,
          authStatus: 'unauthenticated',
          profile: null,
          profileStatus: 'idle',
          profileError: null,
          currentAssessment: null,
          bottlenecks: [],
          currentPlan: null,
        });
      },

      setProfile: (profile: AthleteProfile | null) => {
        set({
          profile,
          profileStatus: profile ? 'ready' : 'missing',
          profileError: null,
        });
      },

      setProfileStatus: (status: ProfileStatus, error: string | null = null) => {
        set({ profileStatus: status, profileError: error });
      },

      setAssessment: (assessment: Assessment | null) => set({ currentAssessment: assessment }),
      setBottlenecks: (bottlenecks: Bottleneck[]) => set({ bottlenecks }),
      setPlan: (plan: TrainingPlan | null) => set({ currentPlan: plan }),
      setOnboardingStep: (step: number) => set({ onboardingStep: step }),
      updateOnboardingData: (data: Partial<OnboardingData>) =>
        set((state) => ({ onboardingData: { ...state.onboardingData, ...data } })),

      /**
       * Asynchronously hydrate authentication identity and stored profile.
       * Called at app boot or after auth events.
       */
      hydrateAuthAndProfile: async () => {
        const state = get();
        const token = state.token;

        if (!token) {
          set({
            authStatus: 'unauthenticated',
            isAuthenticated: false,
            athlete: null,
            profile: null,
            profileStatus: 'idle',
          });
          return { isAuthenticated: false, profileStatus: 'idle' };
        }

        set({ profileStatus: 'loading' });

        try {
          // 1. Fetch current athlete
          const me = await authAPI.getMe();
          set({ athlete: me, isAuthenticated: true, authStatus: 'authenticated' });

          // 2. Fetch athlete profile
          try {
            const prof = await intakeAPI.getProfile();
            set({ profile: prof, profileStatus: 'ready', profileError: null });
            return { isAuthenticated: true, profileStatus: 'ready', profile: prof };
          } catch (profileErr: any) {
            if (profileErr.response?.status === 404) {
              set({ profile: null, profileStatus: 'missing', profileError: null });
              return { isAuthenticated: true, profileStatus: 'missing', profile: null };
            }
            set({
              profileStatus: 'error',
              profileError: profileErr.response?.data?.detail || profileErr.message,
            });
            return { isAuthenticated: true, profileStatus: 'error', error: profileErr };
          }
        } catch (authErr: any) {
          if (authErr.response?.status === 401) {
            get().logout();
            return { isAuthenticated: false, profileStatus: 'idle' };
          }
          set({
            profileStatus: 'error',
            profileError: authErr.response?.data?.detail || authErr.message,
          });
          return { isAuthenticated: false, profileStatus: 'error', error: authErr };
        }
      },
    }),
    {
      name: 'athlete-storage',
      partialize: (state) => ({
        token: state.token,
        athlete: state.athlete,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

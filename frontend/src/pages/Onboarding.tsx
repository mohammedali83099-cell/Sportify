import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAthleteStore } from '../store/athleteStore';
import { authAPI, intakeAPI, formatErrorMessage } from '../api/client';
import SportifyLogo from '../components/common/SportifyLogo';
import {
  ArrowRightIcon,
  CheckIcon,
} from '../components/common/Icons';
import ProfessionalSportGlyph from '../components/common/ProfessionalSportGlyphs';
import {
  getSportPersonalization,
  getSurfacesForSport,
  getEnvironmentsForSport,
  getSurfacesForSportAndEnvironment,
  getEquipmentForSport,
} from '../config/sportPersonalizationConfig';
import {
  DEFAULT_SPORTS_TAXONOMY,
  DEFAULT_DEVELOPMENT_OBJECTIVES,
} from '../config/sportTaxonomy';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signup'; // 'signup' | 'signin' | 'complete-profile'

  const login = useAthleteStore((state) => state.login);
  const setProfile = useAthleteStore((state) => state.setProfile);
  const athlete = useAthleteStore((state) => state.athlete);

  const isSignIn = mode === 'signin';
  const isCompleteProfile = mode === 'complete-profile';

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Taxonomy & Objectives initialized with instant local defaults
  const [sportsData, setSportsData] = useState<Record<string, any>>(DEFAULT_SPORTS_TAXONOMY);
  const [objectivesData, setObjectivesData] = useState<Record<string, any>>(DEFAULT_DEVELOPMENT_OBJECTIVES);

  // Form State
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    full_name: '',
    recovery_pin: '',
  });

  // Forgot Password / Recovery State
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [resetData, setResetData] = useState({
    email: '',
    recovery_pin: '',
    new_password: '',
  });
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<any>({
    sport: '',
    discipline: '',
    primary_role: '',
    sub_role: '',
    primary_playstyle: '',
    secondary_tendencies: [],
    role_goals: [],
    development_objectives: [],
    playstyle_profile: {
      balance: '',
      batting_style: '',
      bowling_style: '',
      keeping_style: '',
      keeping_tendencies: [],
      batting_goals: [],
      keeping_goals: [],
    },
    dominant_hand: '',
    dominant_foot: '',
    stance: '',
    surface_preference: '',
    training_environment: '',
    equipment_access: [],
    athlete_description: '',
    personal_goals_text: '',
    experience_level: '',
    training_days_per_week: null,
    session_duration_minutes: 60,
    age: '',
    weight_kg: '',
    height_cm: '',
  });

  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [sports, objs] = await Promise.all([
          intakeAPI.getSports().catch(() => null),
          intakeAPI.getObjectives().catch(() => null),
        ]);
        if (sports && typeof sports === 'object' && Object.keys(sports).length > 0) {
          setSportsData(sports as Record<string, any>);
        }
        if (objs && typeof objs === 'object' && Object.keys(objs).length > 0) {
          setObjectivesData(objs as Record<string, any>);
        }
      } catch (err) {
        console.error('Failed to load taxonomy from backend:', err);
      }
    }
    loadTaxonomy();
  }, []);

  const currentSport = sportsData[profileData.sport] || {};
  const currentRoles = currentSport.roles || {};
  const currentSubRoles = currentRoles[profileData.primary_role]?.sub_roles || {};

  // Personalization configuration for active sport & role
  const roleConfig = getSportPersonalization(
    profileData.sport,
    profileData.primary_role,
    profileData.sub_role
  );

  const surfaceOptions = getSurfacesForSport(profileData.sport);
  const environmentOptions = getEnvironmentsForSport(profileData.sport);
  const availableSurfaces = getSurfacesForSportAndEnvironment(
    profileData.sport,
    profileData.training_environment
  );
  const equipmentOptions = getEquipmentForSport(profileData.sport);

  const handleSportSelect = (sportKey: string) => {
    setError(null);
    setProfileData((prev: any) => {
      // If already selected, keep it active (prevents accidental unselect during scroll)
      if (prev.sport === sportKey) {
        return prev;
      }

      // Select new sport: zero presets, user picks role/preferences cleanly
      const sportObj = sportsData[sportKey] || {};
      return {
        ...prev,
        sport: sportKey,
        discipline: sportObj.disciplines?.[0]?.id || sportObj.disciplines?.[0] || '',
        primary_role: '',
        sub_role: '',
        surface_preference: '',
        training_environment: '',
        equipment_access: [],
        primary_playstyle: '',
        secondary_tendencies: [],
        role_goals: [],
        playstyle_profile: {},
      };
    });
  };

  const handleRoleSelect = (roleKey: string) => {
    setError(null);
    setProfileData((prev: any) => {
      // If already selected, keep it active (prevents accidental unselect during scroll)
      if (prev.primary_role === roleKey) {
        return prev;
      }

      // Select new role: zero presets, user picks playstyle & goals cleanly
      return {
        ...prev,
        primary_role: roleKey,
        sub_role: '',
        primary_playstyle: '',
        secondary_tendencies: [],
        role_goals: [],
        playstyle_profile: {},
      };
    });
  };

  // Step 1: Sport & Role validation
  const handleProceedFromStep1 = () => {
    if (!profileData.sport) {
      setError('Please choose your sport before proceeding.');
      return;
    }
    if (!profileData.primary_role) {
      setError('Please choose your playing position before proceeding.');
      return;
    }
    if (Object.keys(currentSubRoles).length > 0 && !profileData.sub_role) {
      setError('Please choose your specialty / tactical focus before proceeding.');
      return;
    }
    setError(null);
    setStep(2);
  };

  // Step 2: Tactical Identity validation
  const handleProceedFromStep2 = () => {
    if (roleConfig?.craftType === 'all_rounder') {
      const hasBalance = !!profileData.playstyle_profile?.balance || !!profileData.primary_playstyle;
      if (!hasBalance) {
        setError('Please choose your tactical balance or playstyle before proceeding.');
        return;
      }
    } else if (roleConfig?.craftType === 'wicketkeeper') {
      const hasKeepingStyle = !!profileData.playstyle_profile?.keeping_style || !!profileData.primary_playstyle;
      if (!hasKeepingStyle) {
        setError('Please choose your wicketkeeping craft style before proceeding.');
        return;
      }
    } else {
      if (!profileData.primary_playstyle) {
        setError('Please choose your primary style / archetype before proceeding.');
        return;
      }
    }
    setError(null);
    setStep(3);
  };

  // Step 3: Goals validation (Textarea is explicitly optional!)
  const handleProceedFromStep3 = () => {
    const totalGoals =
      (profileData.role_goals?.length || 0) +
      (profileData.development_objectives?.length || 0);
    if (totalGoals === 0) {
      setError('Please choose at least one performance goal or development objective before proceeding.');
      return;
    }
    setError(null);
    setStep(4);
  };

  // Step 4: Setup & Environment validation (Textarea is explicitly optional!)
  const handleProceedFromStep4 = () => {
    if (roleConfig?.craftFields && roleConfig.craftFields.length > 0) {
      for (const field of roleConfig.craftFields) {
        if (!profileData[field.id]) {
          setError(`Please choose your ${field.label.toLowerCase()} before proceeding.`);
          return;
        }
      }
    }
    if (!profileData.surface_preference) {
      setError('Please choose your primary surface before proceeding.');
      return;
    }
    if (!profileData.training_environment) {
      setError('Please choose your training environment before proceeding.');
      return;
    }
    if (!profileData.equipment_access || profileData.equipment_access.length === 0) {
      setError('Please select at least one equipment option before proceeding.');
      return;
    }
    setError(null);
    setStep(5);
  };

  // Step 5: Biometrics validation
  const handleProceedFromStep5 = () => {
    const ageNum = Number(profileData.age);
    if (!profileData.age || isNaN(ageNum) || ageNum < 8 || ageNum > 80) {
      setError('Please enter a valid age (between 8 and 80) before proceeding.');
      return;
    }
    const heightNum = Number(profileData.height_cm);
    if (!profileData.height_cm || isNaN(heightNum) || heightNum < 80 || heightNum > 250) {
      setError('Please enter a valid height in cm (between 80 and 250) before proceeding.');
      return;
    }
    const weightNum = Number(profileData.weight_kg);
    if (!profileData.weight_kg || isNaN(weightNum) || weightNum < 25 || weightNum > 250) {
      setError('Please enter a valid weight in kg (between 25 and 250) before proceeding.');
      return;
    }
    if (!profileData.experience_level) {
      setError('Please choose your competitive tier before proceeding.');
      return;
    }
    if (!profileData.training_days_per_week) {
      setError('Please choose your training frequency before proceeding.');
      return;
    }
    setError(null);

    if (isCompleteProfile) {
      handleProfileSubmit();
    } else {
      setStep(6);
    }
  };

  const toggleObjective = (objKey: string) => {
    setProfileData((prev: any) => {
      const current = prev.development_objectives || [];
      return {
        ...prev,
        development_objectives: current.includes(objKey)
          ? current.filter((k: string) => k !== objKey)
          : [...current, objKey],
      };
    });
  };

  const toggleRoleGoal = (goalId: string) => {
    setProfileData((prev: any) => {
      const current = prev.role_goals || [];
      return {
        ...prev,
        role_goals: current.includes(goalId)
          ? current.filter((g: string) => g !== goalId)
          : [...current, goalId],
      };
    });
  };

  const toggleTendency = (tendencyId: string) => {
    setProfileData((prev: any) => {
      const current = prev.secondary_tendencies || [];
      return {
        ...prev,
        secondary_tendencies: current.includes(tendencyId)
          ? current.filter((t: string) => t !== tendencyId)
          : [...current, tendencyId],
      };
    });
  };

  const toggleEquipment = (eqId: string) => {
    setProfileData((prev: any) => {
      const current = prev.equipment_access || [];
      return {
        ...prev,
        equipment_access: current.includes(eqId)
          ? current.filter((e: string) => e !== eqId)
          : [...current, eqId],
      };
    });
  };

  const handleSignInSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loginRes = await authAPI.login({
        email: authData.email,
        password: authData.password,
      });

      const token = loginRes.access_token;
      if (!token) {
        throw new Error('Authentication failed. No access token received.');
      }

      login({ id: 0, email: authData.email, full_name: '' }, token, null);
      const me = await authAPI.getMe();

      try {
        const existingProfile = await intakeAPI.getProfile();
        login(me, token, existingProfile);
      } catch {
        login(me, token, null);
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(
        formatErrorMessage(err, 'Authentication failed. Please verify your connection or credentials.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!resetData.email || !resetData.recovery_pin || !resetData.new_password) {
      setError('Please provide your email, 4-6 digit recovery PIN, and new password.');
      return;
    }
    setLoading(true);
    setError(null);
    setResetSuccess(null);

    try {
      const res = await authAPI.resetPasswordWithPin({
        email: resetData.email,
        recovery_pin: resetData.recovery_pin,
        new_password: resetData.new_password,
      });

      const token = res.access_token;
      login({ id: 0, email: resetData.email, full_name: '' }, token, null);
      const me = await authAPI.getMe().catch(() => ({ id: 0, email: resetData.email, full_name: '' }));

      try {
        const existingProfile = await intakeAPI.getProfile();
        login(me, token, existingProfile);
      } catch {
        login(me, token, null);
      }

      setResetSuccess('Password reset successfully! Launching Athlete Portal...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(
        formatErrorMessage(err, 'Password reset failed. Please check your connection and recovery PIN.')
      );
    } finally {
      setLoading(false);
    }
  };

  const buildProfilePayload = () => {
    const playstyleProfile = {
      role_goals: profileData.role_goals || [],
      balance: profileData.playstyle_profile?.balance,
      batting_style: profileData.playstyle_profile?.batting_style,
      bowling_style: profileData.playstyle_profile?.bowling_style,
      keeping_style: profileData.playstyle_profile?.keeping_style,
      keeping_tendencies: profileData.playstyle_profile?.keeping_tendencies,
      batting_goals: profileData.playstyle_profile?.batting_goals,
      keeping_goals: profileData.playstyle_profile?.keeping_goals,
    };

    return {
      sport: profileData.sport,
      discipline: profileData.discipline,
      primary_role: profileData.primary_role,
      sub_role: profileData.sub_role,
      secondary_role: profileData.secondary_role || profileData.sub_role,
      primary_playstyle: profileData.primary_playstyle,
      secondary_tendencies: profileData.secondary_tendencies || [],
      playstyle_profile: playstyleProfile,
      dominant_hand: profileData.dominant_hand,
      dominant_foot: profileData.dominant_foot,
      stance: profileData.stance,
      surface_preference: profileData.surface_preference,
      training_environment: profileData.training_environment,
      equipment_access: profileData.equipment_access || [],
      athlete_description: profileData.athlete_description,
      personal_goals_text: profileData.personal_goals_text,
      development_objectives: profileData.development_objectives || [],
      goals: [
        ...(profileData.development_objectives || []),
        ...(profileData.role_goals || []),
      ],
      experience_level: profileData.experience_level,
      training_frequency: Number(profileData.training_days_per_week),
      weight_kg: Number(profileData.weight_kg),
      height_cm: Number(profileData.height_cm),
    };
  };

  const handleRegisterAndCreateProfile = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!authData.full_name || !authData.email || !authData.password) {
      setError('Please fill in your full name, email, and password.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const authRes = await authAPI.register({
        email: authData.email,
        password: authData.password,
        full_name: authData.full_name,
        recovery_pin: authData.recovery_pin.trim() || undefined,
      });

      const token = authRes.access_token;
      if (!token) {
        throw new Error('Account creation failed. No token received.');
      }

      login({ id: 0, email: authData.email, full_name: authData.full_name }, token, null);

      const me = await authAPI.getMe().catch(() => ({
        id: 0,
        email: authData.email,
        full_name: authData.full_name,
      }));

      const savedProfile = await intakeAPI.submitProfile(buildProfilePayload());

      login(me, token, savedProfile);
      setProfile(savedProfile);

      navigate('/dashboard');
    } catch (err: any) {
      setError(
        formatErrorMessage(err, 'Registration failed. Backend server may be unreachable. Please verify your connection.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = useAthleteStore.getState().token;
      const me = athlete;

      const savedProfile = await intakeAPI.submitProfile(buildProfilePayload());

      if (token) {
        login(me || { id: 0, email: authData.email, full_name: '' }, token, savedProfile);
      }
      setProfile(savedProfile);

      navigate('/dashboard');
    } catch (err: any) {
      setError(
        formatErrorMessage(err, 'Failed to complete profile configuration. Please check your inputs.')
      );
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Sport' },
    { num: 2, label: 'Identity' },
    { num: 3, label: 'Goals' },
    { num: 4, label: 'Setup' },
    { num: 5, label: 'Biometrics' },
    ...(!isCompleteProfile ? [{ num: 6, label: 'Account' }] : []),
  ];

  return (
    <div className="min-h-[100dvh] bg-[#07080C] text-[#F1F5F9] flex flex-col w-full selection:bg-white/20 select-none relative">
      {/* Ambient background depth */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[400px] bg-white/[0.02] blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed top-1/3 -right-20 w-[400px] h-[400px] bg-emerald-500/[0.02] blur-[150px] rounded-full pointer-events-none" />

      {/* Sticky Top Header */}
      <header className="sticky top-0 z-40 w-full bg-[#07080C]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="w-full max-w-4xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between">
          <SportifyLogo size="xs" showTagline={false} />
          {!isCompleteProfile && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSearchParams({ mode: isSignIn ? 'signup' : 'signin' });
              }}
              className="text-xs font-sans text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/[0.09] bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.08] hover:border-white/20 transition-all shadow-sm"
            >
              {isSignIn ? 'Need Account? Sign Up' : 'Have Account? Sign In'}
            </button>
          )}
        </div>
      </header>

      {/* Step Progress Bar (hidden in sign-in mode) */}
      {!isSignIn && (
        <div className="w-full border-b border-white/[0.06] bg-[#07080C]/80 backdrop-blur-md sticky top-14 z-30">
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between overflow-x-auto no-scrollbar gap-3">
            {stepsList.map((s) => (
              <div key={s.num} className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    step === s.num
                      ? 'bg-white text-slate-950 shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                      : step > s.num
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/[0.03] text-slate-500 border border-white/[0.07]'
                  }`}
                >
                  {step > s.num ? <CheckIcon className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span
                  className={`text-xs font-sans ${
                    step === s.num ? 'text-white font-semibold' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DEDICATED SIGN IN FORM (VERTICALLY & HORIZONTALLY CENTERED) ─── */}
      {isSignIn ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100dvh-4.5rem)] px-4 py-8">
          <div className="w-full max-w-md p-8 sm:p-9 rounded-2xl bg-[#0B0D15]/85 backdrop-blur-2xl border border-white/[0.09] shadow-[0_20px_50px_rgba(0,0,0,0.7)] space-y-5 relative">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

            {/* Error Notification */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2.5 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono uppercase tracking-widest text-slate-300 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Athlete Command Portal</span>
              </div>
              <h1 className="text-2xl font-bold font-heading text-white tracking-tight mb-1">
                {isForgotPassword ? 'Reset Password' : 'Sign In to Sportify'}
              </h1>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {isForgotPassword
                  ? 'Enter your registered email and 4–6 digit security recovery PIN to reset your password.'
                  : 'Access your personalized athlete profile, video telemetry, and 4-week training cycles.'}
              </p>
            </div>

            {isForgotPassword ? (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                {resetSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2 font-sans">
                    <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{resetSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="athlete@sportify.com"
                    value={resetData.email}
                    onChange={(e) =>
                      setResetData({ ...resetData, email: e.target.value })
                    }
                    className="w-full h-11 px-3.5 sportify-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Security Recovery PIN (4–6 Digits)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="••••"
                    value={resetData.recovery_pin}
                    onChange={(e) =>
                      setResetData({ ...resetData, recovery_pin: e.target.value.replace(/\D/g, '') })
                    }
                    className="w-full h-11 px-3.5 sportify-input text-xs font-mono tracking-widest"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    New Password (Min. 6 Characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={resetData.new_password}
                    onChange={(e) =>
                      setResetData({ ...resetData, new_password: e.target.value })
                    }
                    className="w-full h-11 px-3.5 sportify-input text-xs font-mono"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full h-11 btn-primary flex items-center justify-center gap-2 text-xs font-bold shadow-[0_4px_20px_rgba(255,255,255,0.12)] ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span>{loading ? 'Resetting Password...' : 'Reset Password & Sign In'}</span>
                    {!loading && <ArrowRightIcon className="w-4 h-4 text-slate-950" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setIsForgotPassword(false);
                    }}
                    className="w-full h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-xs font-sans text-slate-400 hover:text-white transition-all"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="athlete@sportify.com"
                    value={authData.email}
                    onChange={(e) =>
                      setAuthData({ ...authData, email: e.target.value })
                    }
                    className="w-full h-11 px-3.5 sportify-input text-xs font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setResetData({ ...resetData, email: authData.email });
                        setIsForgotPassword(true);
                      }}
                      className="text-[11px] font-sans text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authData.password}
                    onChange={(e) =>
                      setAuthData({ ...authData, password: e.target.value })
                    }
                    className="w-full h-11 px-3.5 sportify-input text-xs font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full h-11 btn-primary flex items-center justify-center gap-2 text-xs font-bold shadow-[0_4px_20px_rgba(255,255,255,0.12)] ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                    {!loading && <ArrowRightIcon className="w-4 h-4 text-slate-950" />}
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-xs text-slate-400 pt-1 font-sans">
              New athlete?{' '}
              <button
                type="button"
                onClick={() => setSearchParams({ mode: 'signup' })}
                className="text-white hover:underline font-semibold ml-1"
              >
                Create your profile
              </button>
            </p>
          </div>
        </div>
      ) : (
        /* Main Content Area - Open Vertical Flow From Top */
        <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-32 flex-1 flex flex-col justify-start">
          {/* Error Notification */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs mb-6 flex items-center gap-2.5 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: SPORT & POSITION ───────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-7">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono tracking-wider text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="uppercase font-semibold text-white">Step 1 of 5</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">Athletic Calibration</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                  Tell us how you play
                </h1>
                <p className="text-sm text-slate-400 font-sans max-w-xl leading-relaxed">
                  Choose your sport discipline to calibrate computer-vision movement models, positional demand profiles, and role-specific training cycles.
                </p>
              </div>

              {/* Rich Sport Selector Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Primary Sport Discipline
                  </label>
                  <span className="text-[11px] text-slate-500 font-sans">Tap to select or change</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.keys(sportsData).map((sportKey) => {
                    const isSelected = profileData.sport === sportKey;
                    const sportName = sportsData[sportKey].name;

                    const sportMeta: Record<string, { tag: string; roles: string }> = {
                      cricket: { tag: 'Batting, Fast Bowling, Spin & Glovework', roles: '4 Core Roles' },
                      football: { tag: 'Striker, Midfield, Wing & Defense', roles: '4 Core Roles' },
                      basketball: { tag: 'Guard, Forward, Center & Shooting', roles: '4 Core Roles' },
                      athletics: { tag: 'Sprints, Hurdles, Jumps & Distance', roles: '4 Event Categories' },
                    };
                    const meta = sportMeta[sportKey] || { tag: 'Discipline calibration', roles: 'Adaptive roles' };

                    return (
                      <button
                        key={sportKey}
                        type="button"
                        onClick={() => handleSportSelect(sportKey)}
                        className={`p-4 rounded-xl text-left transition-all relative overflow-hidden flex flex-col justify-between gap-3 group ${
                          isSelected
                            ? 'bg-emerald-500/10 border border-emerald-500/50 shadow-[0_0_24px_rgba(16,185,129,0.12)] ring-1 ring-emerald-500/30'
                            : 'bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.05] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                                  : 'bg-white/[0.04] text-slate-400 group-hover:text-white group-hover:bg-white/[0.07]'
                              }`}
                            >
                              <ProfessionalSportGlyph sport={sportKey} className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white tracking-tight">
                                {sportName}
                              </div>
                              <div className="text-[11px] text-slate-400 font-sans">
                                {meta.roles}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                              <CheckIcon className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 font-sans leading-relaxed">
                          {meta.tag}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Role Selector */}
              {Object.keys(currentRoles).length > 0 ? (
                <div className="space-y-3 pt-6 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Playing Position & Role
                    </label>
                    <span className="text-[11px] text-slate-500 font-sans">Tap to select or deselect</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.keys(currentRoles).map((roleKey) => {
                      const isSelected = profileData.primary_role === roleKey;
                      return (
                        <button
                          key={roleKey}
                          type="button"
                          onClick={() => handleRoleSelect(roleKey)}
                          className={`p-3.5 rounded-xl text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm'
                              : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-medium capitalize truncate">
                            {currentRoles[roleKey].title || roleKey.replace(/_/g, ' ')}
                          </span>
                          {isSelected && (
                            <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : profileData.sport ? (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-400 text-xs text-center font-sans">
                  Loading playing positions for {sportsData[profileData.sport]?.name || profileData.sport}...
                </div>
              ) : (
                /* Engine Feature Showcase when NO sport is selected yet (Eliminates empty void) */
                <div className="pt-6 border-t border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Sportify Calibration Engine
                    </span>
                    <span className="text-[11px] text-slate-500 font-sans">Adaptive Kinematic Telemetry</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="text-emerald-400 font-mono font-bold">01</span>
                        <span>Pose Telemetry</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        Joint angles and kinematic velocities calibrated to your sport's real movement patterns.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="text-emerald-400 font-mono font-bold">02</span>
                        <span>4-Week Baselines</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        Dynamic training blocks structured specifically for your positional role demands.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="text-emerald-400 font-mono font-bold">03</span>
                        <span>Clinical Return</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        Rehab intake honoring doctor-prescribed rest days, drills, and red-line restrictions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Role Selector as Clean Inline Grid */}
              {Object.keys(currentSubRoles).length > 0 && (
                <div className="space-y-3 pt-6 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Specialty / Tactical Focus
                    </label>
                    <span className="text-[11px] text-slate-500 font-sans">Tap to select</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.keys(currentSubRoles).map((subKey) => {
                      const isSelected = profileData.sub_role === subKey;
                      const subRoleObj = currentSubRoles[subKey];
                      return (
                        <button
                          key={subKey}
                          type="button"
                          onClick={() => {
                            setProfileData((prev: any) => ({
                              ...prev,
                              sub_role: subKey,
                            }));
                          }}
                          className={`p-3.5 rounded-xl text-left transition-all flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm'
                              : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs sm:text-sm font-semibold truncate">
                              {subRoleObj.title || subKey.replace(/_/g, ' ')}
                            </span>
                            {isSelected && (
                              <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 ml-1.5" />
                            )}
                          </div>
                          {subRoleObj.description && (
                            <p className="text-[11px] text-slate-400 font-sans font-normal leading-relaxed line-clamp-2">
                              {subRoleObj.description}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        {/* ── STEP 2: TACTICAL IDENTITY & TENDENCIES ─────────────────────────── */}
        {!isSignIn && step === 2 && (
          <div className="space-y-7">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight mb-1.5">
                Playstyle & Tactical Identity
              </h1>
              <p className="text-sm text-slate-400 font-sans">
                Define your primary role archetype, tactical tendencies, and craft approach.
              </p>
            </div>

            {/* DUAL CRAFT: ALL-ROUNDER */}
            {roleConfig?.craftType === 'all_rounder' ? (
              <div className="space-y-6">
                {/* Overall Balance */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Tactical Balance
                    </label>
                    <span className="text-[11px] text-slate-500 font-sans">
                      Tap to select or deselect
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(roleConfig.balanceOptions || []).map((opt) => {
                      const isSelected =
                        profileData.playstyle_profile?.balance === opt.id ||
                        profileData.primary_playstyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setProfileData((prev: any) => ({
                              ...prev,
                              primary_playstyle: prev.primary_playstyle === opt.id ? '' : opt.id,
                              playstyle_profile: {
                                ...prev.playstyle_profile,
                                balance: prev.playstyle_profile?.balance === opt.id ? '' : opt.id,
                              },
                            }))
                          }
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-white font-medium'
                              : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-semibold text-white">
                              {opt.label}
                            </span>
                            {isSelected && <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />}
                          </div>
                          {opt.shortDesc && (
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">
                              {opt.shortDesc}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Batting Archetype */}
                <div className="space-y-3 pt-5 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Batting Archetype
                    </label>
                    <span className="text-[11px] text-slate-500 font-sans">
                      Tap to select or deselect
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(roleConfig.battingStyles || []).map((opt) => {
                      const isSelected =
                        profileData.playstyle_profile?.batting_style === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setProfileData((prev: any) => ({
                              ...prev,
                              playstyle_profile: {
                                ...prev.playstyle_profile,
                                batting_style:
                                  prev.playstyle_profile?.batting_style === opt.id ? '' : opt.id,
                              },
                            }))
                          }
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                              : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-medium">{opt.label}</span>
                          {isSelected && (
                            <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bowling Archetype */}
                <div className="space-y-3 pt-5 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Bowling Archetype
                    </label>
                    <span className="text-[11px] text-slate-500 font-sans">
                      Tap to select or deselect
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(roleConfig.bowlingStyles || []).map((opt) => {
                      const isSelected =
                        profileData.playstyle_profile?.bowling_style === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setProfileData((prev: any) => ({
                              ...prev,
                              playstyle_profile: {
                                ...prev.playstyle_profile,
                                bowling_style:
                                  prev.playstyle_profile?.bowling_style === opt.id ? '' : opt.id,
                              },
                            }))
                          }
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                              : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-medium">{opt.label}</span>
                          {isSelected && (
                            <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : roleConfig?.craftType === 'wicketkeeper' ? (
              /* DUAL CRAFT: WICKETKEEPER */
              <div className="space-y-6">
                {/* Wicketkeeping Style */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Wicketkeeping Craft
                    </label>
                    <span className="text-[11px] text-slate-500 font-sans">
                      Tap to select or deselect
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(roleConfig.keepingStyles || roleConfig.playstyles).map((opt) => {
                      const isSelected =
                        profileData.primary_playstyle === opt.id ||
                        profileData.playstyle_profile?.keeping_style === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setProfileData((prev: any) => ({
                              ...prev,
                              primary_playstyle: prev.primary_playstyle === opt.id ? '' : opt.id,
                              playstyle_profile: {
                                ...prev.playstyle_profile,
                                keeping_style:
                                  prev.playstyle_profile?.keeping_style === opt.id ? '' : opt.id,
                              },
                            }))
                          }
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-white font-medium'
                              : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-semibold text-white">
                              {opt.label}
                            </span>
                            {isSelected && <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />}
                          </div>
                          {opt.shortDesc && (
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">
                              {opt.shortDesc}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Keeping Tendencies */}
                <div className="space-y-3 pt-5 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Glovework & Keeping Tendencies
                    </label>
                    <span className="text-[11px] text-slate-500 font-sans">
                      Multi-select • tap to toggle
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(roleConfig.keepingTendencies || roleConfig.tendencies).map((opt) => {
                      const isSelected =
                        profileData.secondary_tendencies?.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => toggleTendency(opt.id)}
                          className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                              : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          {isSelected && <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />}
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Batting Personalization for Wicketkeeper */}
                <div className="space-y-3 pt-5 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Batting Style & Role (Keeper-Batsman)
                    </label>
                    <span className="text-[11px] text-slate-500 font-sans">
                      Tap to select or deselect
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(roleConfig.battingStyles || []).map((opt) => {
                      const isSelected =
                        profileData.playstyle_profile?.batting_style === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setProfileData((prev: any) => ({
                              ...prev,
                              playstyle_profile: {
                                ...prev.playstyle_profile,
                                batting_style:
                                  prev.playstyle_profile?.batting_style === opt.id ? '' : opt.id,
                              },
                            }))
                          }
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                              : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-medium">{opt.label}</span>
                          {isSelected && (
                            <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* STANDARD ROLE (BATSMAN, BOWLER, STRIKER, PG, SPRINTER, ETC.) */
              <div className="space-y-6">
                {/* Primary Playstyle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Primary Style / Archetype
                    </label>
                    <span className="text-[11px] text-slate-500 font-sans">
                      Tap to select or deselect
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(roleConfig?.playstyles || []).map((opt) => {
                      const isSelected = profileData.primary_playstyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setProfileData((prev: any) => ({
                              ...prev,
                              primary_playstyle: prev.primary_playstyle === opt.id ? '' : opt.id,
                            }))
                          }
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-white font-medium'
                              : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-semibold text-white">
                              {opt.label}
                            </span>
                            {isSelected && <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />}
                          </div>
                          {opt.shortDesc && (
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">
                              {opt.shortDesc}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Secondary Movement Tendencies (Multi-select) */}
                {(roleConfig?.tendencies || []).length > 0 && (
                  <div className="space-y-3 pt-5 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Secondary Movement Tendencies
                      </label>
                      <span className="text-[11px] text-slate-500 font-sans">
                        Multi-select • tap to toggle
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {roleConfig?.tendencies.map((opt) => {
                        const isSelected =
                          profileData.secondary_tendencies?.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggleTendency(opt.id)}
                            className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                                : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                            }`}
                          >
                            {isSelected && <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />}
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: GOALS & ATHLETE VOICE ─────────────────────────────────── */}
        {!isSignIn && step === 3 && (
          <div className="space-y-7">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight mb-1.5">
                Goals & Development Focus
              </h1>
              <p className="text-sm text-slate-400 font-sans">
                Select key performance targets and describe your personal development priorities in your own voice.
              </p>
            </div>

            {/* Role-Specific Calibrated Goals */}
            {(roleConfig?.roleGoals || []).length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Role-Calibrated Focus Targets
                  </label>
                  <span className="text-[11px] text-slate-500 font-sans">
                    Tap to select or deselect
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {roleConfig?.roleGoals.map((opt) => {
                    const isSelected = profileData.role_goals?.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleRoleGoal(opt.id)}
                        className={`px-3.5 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                            : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        {isSelected && <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* General Core Movement Objectives */}
            {Object.keys(objectivesData).length > 0 && (
              <div className="space-y-3 pt-5 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Foundational Physical Objectives
                  </label>
                  <span className="text-[11px] text-slate-500 font-sans">
                    Tap to toggle
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(objectivesData).map((objKey) => {
                    const isSelected =
                      profileData.development_objectives?.includes(objKey);
                    return (
                      <button
                        key={objKey}
                        type="button"
                        onClick={() => toggleObjective(objKey)}
                        className={`px-3.5 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-white text-slate-950 font-bold shadow-sm'
                            : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        {isSelected && <CheckIcon className="w-3.5 h-3.5 text-slate-950" />}
                        <span>{objectivesData[objKey].title || objKey.replace(/_/g, ' ')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Free-Text Athlete Voice: "What are you trying to improve?" */}
            <div className="space-y-2 pt-5 border-t border-white/[0.06]">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                What are you trying to improve? (Optional)
              </label>
              <textarea
                rows={3}
                value={profileData.personal_goals_text}
                onChange={(e) =>
                  setProfileData({ ...profileData, personal_goals_text: e.target.value })
                }
                placeholder={
                  roleConfig?.voicePrompts?.goalsPlaceholder ||
                  'e.g., Fixing my head falling over to the off side on the front foot drive and generating more bat speed through the line.'
                }
                className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm font-sans text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all resize-none leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 font-sans">
                The AI coach correlates your exact concerns with measured biomechanical video data without fabricating results.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 4: CRAFT SETUP, SURFACES & ENVIRONMENT ───────────────────── */}
        {!isSignIn && step === 4 && (
          <div className="space-y-7">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight mb-1.5">
                Craft Setup & Environment
              </h1>
              <p className="text-sm text-slate-400 font-sans">
                Calibrate your physical mechanics, training surfaces, and equipment access.
              </p>
            </div>

            {/* Craft Mechanics (Hand / Arm / Stance) */}
            {(roleConfig?.craftFields || []).length > 0 && (
              <div className="space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Craft Mechanics & Stance
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {roleConfig?.craftFields.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-300">
                          {field.label}
                        </label>
                        <span className="text-[10px] text-slate-500 font-sans">Tap to deselect</span>
                      </div>
                      <div className="flex gap-2">
                        {field.options.map((opt) => {
                          const isSelected = profileData[field.id] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() =>
                                setProfileData((prev: any) => ({
                                  ...prev,
                                  [field.id]: prev[field.id] === opt.id ? '' : opt.id,
                                }))
                              }
                              className={`flex-1 h-10 px-2.5 rounded-lg border text-xs font-medium transition-all ${
                                isSelected
                                  ? 'bg-white text-slate-950 font-bold shadow-sm'
                                  : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Training Environment Selection */}
            <div className="space-y-3 pt-5 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Training Environment
                </label>
                <span className="text-[11px] text-slate-500 font-sans">Tap to select or change</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {environmentOptions.map((env) => {
                  const isSelected = profileData.training_environment === env.id;
                  return (
                    <button
                      key={env.id}
                      type="button"
                      onClick={() => {
                        const newEnvId = env.id;
                        const validSurfaces = getSurfacesForSportAndEnvironment(
                          profileData.sport,
                          newEnvId
                        );
                        const isSurfaceStillValid = validSurfaces.some(
                          (s) => s.id === profileData.surface_preference
                        );
                        setProfileData((prev: any) => ({
                          ...prev,
                          training_environment: newEnvId,
                          surface_preference: isSurfaceStillValid
                            ? prev.surface_preference
                            : '',
                        }));
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                          : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          {env.label}
                        </span>
                        {isSelected && (
                          <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 ml-1.5" />
                        )}
                      </div>
                      {env.shortDesc && (
                        <span className="text-[11px] text-slate-400 font-sans leading-tight">
                          {env.shortDesc}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personalized Surface Selector as Clean Inline Grid */}
            <div className="space-y-3 pt-5 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Playing Surface
                </label>
                <span className="text-[11px] text-slate-500 font-sans">
                  {profileData.training_environment
                    ? 'Personalized to your environment'
                    : 'Select environment first'}
                </span>
              </div>

              {profileData.training_environment ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availableSurfaces.map((surf) => {
                    const isSelected = profileData.surface_preference === surf.id;
                    return (
                      <button
                        key={surf.id}
                        type="button"
                        onClick={() => {
                          setProfileData((prev: any) => ({
                            ...prev,
                            surface_preference: surf.id,
                          }));
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold shadow-sm'
                            : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs sm:text-sm font-semibold text-white">
                            {surf.label}
                          </span>
                          {isSelected && (
                            <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 ml-1.5" />
                          )}
                        </div>
                        {surf.shortDesc && (
                          <p className="text-[11px] text-slate-400 font-sans font-normal leading-relaxed mt-0.5">
                            {surf.shortDesc}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.08] text-slate-500 text-xs text-center font-sans">
                  Select a training environment above to see available surfaces
                </div>
              )}
            </div>

            {/* Equipment Access */}
            <div className="space-y-3 pt-5 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Equipment Access
                </label>
                <span className="text-[11px] text-slate-500 font-sans">
                  Multi-select • tap to toggle
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {equipmentOptions.map((eq) => {
                  const isSelected = profileData.equipment_access?.includes(eq.id);
                  return (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => toggleEquipment(eq.id)}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                          : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      {isSelected && <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{eq.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Free-Text Athlete Description */}
            <div className="space-y-2 pt-5 border-t border-white/[0.06]">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Tell us about your game (Optional)
              </label>
              <textarea
                rows={3}
                value={profileData.athlete_description}
                onChange={(e) =>
                  setProfileData({ ...profileData, athlete_description: e.target.value })
                }
                placeholder={
                  roleConfig?.voicePrompts?.descriptionPlaceholder ||
                  'e.g., I usually bat at #3 or #4. I feel comfortable driving through the covers, but against tall left-arm pacers angling into me, I tend to get caught on the crease.'
                }
                className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm font-sans text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ── STEP 5: BIOMETRICS & TIER ─────────────────────────────────────── */}
        {!isSignIn && step === 5 && (
          <div className="space-y-7">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight mb-1.5">
                Physical Biometrics
              </h1>
              <p className="text-sm text-slate-400 font-sans">
                Calibrates force metrics, workload limits, and baseline conditioning.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  min="10"
                  max="65"
                  placeholder="24"
                  value={profileData.age}
                  onChange={(e) =>
                    setProfileData({ ...profileData, age: e.target.value })
                  }
                  className="w-full h-11 px-3 sportify-input text-xs font-mono text-center"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="100"
                  max="240"
                  placeholder="180"
                  value={profileData.height_cm}
                  onChange={(e) =>
                    setProfileData({ ...profileData, height_cm: e.target.value })
                  }
                  className="w-full h-11 px-3 sportify-input text-xs font-mono text-center"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="30"
                  max="200"
                  placeholder="75"
                  value={profileData.weight_kg}
                  onChange={(e) =>
                    setProfileData({ ...profileData, weight_kg: e.target.value })
                  }
                  className="w-full h-11 px-3 sportify-input text-xs font-mono text-center"
                />
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-3 pt-5 border-t border-white/[0.06]">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Competitive Tier
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['beginner', 'intermediate', 'advanced', 'elite'].map((lvl) => {
                  const isSelected = profileData.experience_level === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() =>
                        setProfileData({ ...profileData, experience_level: lvl })
                      }
                      className={`h-10 rounded-lg border text-xs font-medium capitalize flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-white text-slate-950 font-bold shadow-sm'
                          : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Training Days Per Week */}
            <div className="space-y-3 pt-5 border-t border-white/[0.06]">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Training Frequency (Days / Week)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[2, 3, 4, 5, 6].map((days) => {
                  const isSelected = Number(profileData.training_days_per_week) === days;
                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() =>
                        setProfileData({ ...profileData, training_days_per_week: days })
                      }
                      className={`h-10 rounded-lg border text-xs font-mono font-medium flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-white text-slate-950 font-bold shadow-sm'
                          : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      {days}d
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 6: ACCOUNT CREATION (SIGNUP ONLY) ───────────────────────── */}
        {!isSignIn && !isCompleteProfile && step === 6 && (
          <div className="space-y-7">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight mb-1.5">
                Create Athlete Account
              </h1>
              <p className="text-sm text-slate-400 font-sans">
                Your profile and assessments sync securely across all your devices.
              </p>
            </div>

            <form onSubmit={handleRegisterAndCreateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Virat Sharma"
                  value={authData.full_name}
                  onChange={(e) =>
                    setAuthData({ ...authData, full_name: e.target.value })
                  }
                  className="w-full h-11 px-3.5 sportify-input text-xs font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="athlete@sportify.com"
                  value={authData.email}
                  onChange={(e) =>
                    setAuthData({ ...authData, email: e.target.value })
                  }
                  className="w-full h-11 px-3.5 sportify-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authData.password}
                  onChange={(e) =>
                    setAuthData({ ...authData, password: e.target.value })
                  }
                  className="w-full h-11 px-3.5 sportify-input text-xs font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Security Recovery PIN (4–6 Digits)
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono">Recommended</span>
                </div>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="e.g. 4829"
                  value={authData.recovery_pin}
                  onChange={(e) =>
                    setAuthData({ ...authData, recovery_pin: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full h-11 px-3.5 sportify-input text-xs font-mono tracking-widest"
                />
                <p className="text-[11px] text-slate-500 font-sans mt-1">
                  Used to instantly recover your account if you ever forget your password.
                </p>
              </div>
            </form>
          </div>
        )}
      </main>
      )}

      {/* ── STICKY BOTTOM ACTION BAR (CARD-FREE NAVIGATION) ────────────────── */}
      {!isSignIn && (
        <footer className="fixed bottom-0 inset-x-0 bg-[#07080C]/90 backdrop-blur-xl border-t border-white/[0.07] py-3.5 px-4 sm:px-6 z-30">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep((prev) => prev - 1);
                }}
                className="px-4 h-11 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-xs font-sans text-slate-300 hover:text-white transition-all"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={handleProceedFromStep1}
                className="h-11 px-6 btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
              >
                <span>Continue: Tactical Identity</span>
                <ArrowRightIcon className="w-4 h-4 text-slate-950" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleProceedFromStep2}
                className="h-11 px-6 btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
              >
                <span>Continue: Goals</span>
                <ArrowRightIcon className="w-4 h-4 text-slate-950" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleProceedFromStep3}
                className="h-11 px-6 btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
              >
                <span>Continue: Setup</span>
                <ArrowRightIcon className="w-4 h-4 text-slate-950" />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={handleProceedFromStep4}
                className="h-11 px-6 btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
              >
                <span>Continue: Biometrics</span>
                <ArrowRightIcon className="w-4 h-4 text-slate-950" />
              </button>
            )}

            {step === 5 && (
              isCompleteProfile ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleProceedFromStep5}
                  className={`h-11 px-6 btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.12)] ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>{loading ? 'Saving...' : 'Save Profile'}</span>
                  {!loading && <ArrowRightIcon className="w-4 h-4 text-slate-950" />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleProceedFromStep5}
                  className="h-11 px-6 btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
                >
                  <span>Continue: Account</span>
                  <ArrowRightIcon className="w-4 h-4 text-slate-950" />
                </button>
              )
            )}

            {step === 6 && (
              <button
                type="button"
                onClick={handleRegisterAndCreateProfile}
                disabled={loading}
                className={`h-11 px-6 btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.12)] ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
                {!loading && <ArrowRightIcon className="w-4 h-4 text-slate-950" />}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};

export default Onboarding;

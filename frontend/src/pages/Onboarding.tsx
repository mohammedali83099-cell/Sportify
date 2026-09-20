import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAthleteStore } from '../store/athleteStore';
import { authAPI, intakeAPI } from '../api/client';
import SportifyLogo from '../components/common/SportifyLogo';
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  SportIcon,
} from '../components/common/Icons';
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
  const [isSpecialtyOpen, setIsSpecialtyOpen] = useState<boolean>(false);
  const [isSurfaceOpen, setIsSurfaceOpen] = useState<boolean>(false);

  // Taxonomy & Objectives initialized with instant local defaults
  const [sportsData, setSportsData] = useState<Record<string, any>>(DEFAULT_SPORTS_TAXONOMY);
  const [objectivesData, setObjectivesData] = useState<Record<string, any>>(DEFAULT_DEVELOPMENT_OBJECTIVES);

  // Form State
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    full_name: '',
  });

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
      // Toggle off if already selected
      if (prev.sport === sportKey) {
        return {
          ...prev,
          sport: '',
          discipline: '',
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
      // Toggle off if already selected
      if (prev.primary_role === roleKey) {
        return {
          ...prev,
          primary_role: '',
          sub_role: '',
          primary_playstyle: '',
          secondary_tendencies: [],
          role_goals: [],
          playstyle_profile: {},
        };
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
        err.response?.data?.detail ||
        'Incorrect email or password. Please verify your credentials.'
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
        err.response?.data?.detail ||
        'Registration failed. Please check your information and try again.'
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
        err.response?.data?.detail ||
        'Failed to complete profile configuration. Please check your inputs.'
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
    <div className="min-h-[100dvh] bg-[#07080C] text-[#F1F5F9] flex flex-col w-full selection:bg-white/20 select-none relative overflow-hidden">
      {/* Ambient background depth */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-white/[0.02] blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-[300px] h-[300px] bg-emerald-500/[0.02] blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-3xl mx-auto min-h-[100dvh] flex flex-col justify-center px-4 py-6 sm:py-10 relative z-10">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <SportifyLogo size="xs" showTagline={false} />
          {!isCompleteProfile && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSearchParams({ mode: isSignIn ? 'signup' : 'signin' });
              }}
              className="text-xs font-sans text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg border border-white/[0.09] bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.07] hover:border-white/20 transition-all shadow-sm"
            >
              {isSignIn ? 'Need Account? Sign Up' : 'Have Account? Sign In'}
            </button>
          )}
        </div>

        {/* Main Form Container */}
        <div className="w-full p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-b from-[#10131E]/95 via-[#0B0D15]/95 to-[#07080E]/98 backdrop-blur-2xl border border-white/[0.09] shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative flex flex-col overflow-hidden">
          {/* Top specular hairline */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* Step Progress Bar (hidden in sign-in mode) */}
          {!isSignIn && (
            <div className="flex items-center justify-between mb-7 pb-4 border-b border-white/[0.07]">
              {stepsList.map((s) => (
                <div key={s.num} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      step === s.num
                        ? 'bg-white text-slate-950 shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                        : step > s.num
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm'
                        : 'bg-white/[0.03] text-slate-500 border border-white/[0.07] backdrop-blur-sm'
                    }`}
                  >
                    {step > s.num ? <CheckIcon className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-sans hidden sm:inline ${
                      step === s.num ? 'text-white font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs mb-3 flex items-center gap-2 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── DEDICATED SIGN IN FORM ─────────────────────────────────────────── */}
          {isSignIn && (
            <div className="space-y-4 my-auto">
              <div>
                <h2 className="text-lg font-bold font-heading text-white mb-0.5">
                  Sign In to Sportify
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Access your personalized athlete profile and training pathway.
                </p>
              </div>

              <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
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
                  <label className="text-xs font-medium text-slate-300 block mb-1">
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

              <p className="text-center text-xs text-slate-400 pt-2 font-sans">
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
          )}

          {/* ── STEP 1: SPORT & POSITION ───────────────────────────────────────── */}
          {!isSignIn && step === 1 && (
            <div className="space-y-6 sm:space-y-7">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight mb-1">
                  Tell us how you play
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-sans">
                  Choose your sport, playing position, and tactical specialty.
                </p>
              </div>

              {/* Sport Selector */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-200 block mb-2.5">
                  Sport
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.keys(sportsData).map((sportKey) => {
                    const isSelected = profileData.sport === sportKey;
                    return (
                      <button
                        key={sportKey}
                        type="button"
                        onClick={() => handleSportSelect(sportKey)}
                        className={`p-4 rounded-2xl border text-left flex flex-col items-center justify-center gap-2.5 transition-all group ${
                          isSelected
                            ? 'bg-white/[0.09] backdrop-blur-md border-emerald-500/50 text-white shadow-[0_4px_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/30'
                            : 'bg-white/[0.02] backdrop-blur-sm border-white/[0.07] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-white/[0.04] text-slate-300 group-hover:text-white'
                          }`}
                        >
                          <SportIcon sport={sportKey} className="w-5 h-5" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold capitalize truncate text-center">
                          {sportsData[sportKey].name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Role Selector */}
              {Object.keys(currentRoles).length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-200">
                      Playing Position
                    </label>
                    <span className="text-[10px] text-slate-500 font-sans">Tap to select or deselect</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.keys(currentRoles).map((roleKey) => {
                      const isSelected = profileData.primary_role === roleKey;
                      return (
                        <button
                          key={roleKey}
                          type="button"
                          onClick={() => handleRoleSelect(roleKey)}
                          className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-white/[0.09] border-emerald-500/50 text-white font-semibold ring-1 ring-emerald-500/20'
                              : 'bg-white/[0.02] border-white/[0.07] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-semibold capitalize truncate">
                            {currentRoles[roleKey].title || roleKey.replace(/_/g, ' ')}
                          </span>
                          {isSelected && (
                            <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
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
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-500 text-xs text-center font-sans">
                  Choose a sport above to view playing positions
                </div>
              )}

              {/* Sub-Role Selector as Custom Dropdown */}
              {Object.keys(currentSubRoles).length > 0 && (
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs sm:text-sm font-semibold text-slate-200">
                      Specialty / Tactical Focus
                    </label>
                    <span className="text-[10px] text-slate-500 font-sans">Tap to select or change</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSpecialtyOpen((prev) => !prev)}
                    className="w-full h-12 px-4 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.09] hover:border-white/25 text-left flex items-center justify-between transition-all focus:outline-none focus:border-white/40 focus:bg-white/[0.05]"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-white truncate">
                      {currentSubRoles[profileData.sub_role]?.title ||
                        profileData.sub_role?.replace(/_/g, ' ') ||
                        'Select Specialty'}
                    </span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${
                        isSpecialtyOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isSpecialtyOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsSpecialtyOpen(false)}
                      />
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-30 p-2 rounded-2xl bg-[#0B0D15]/95 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.85)] space-y-1">
                        {Object.keys(currentSubRoles).map((subKey) => {
                          const isSelected = profileData.sub_role === subKey;
                          return (
                            <button
                              key={subKey}
                              type="button"
                              onClick={() => {
                                setProfileData((prev: any) => ({
                                  ...prev,
                                  sub_role: prev.sub_role === subKey ? '' : subKey,
                                }));
                                setIsSpecialtyOpen(false);
                              }}
                              className={`w-full p-3 rounded-xl text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-white/[0.1] text-white'
                                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                              }`}
                            >
                              <span className="truncate">
                                {currentSubRoles[subKey].title || subKey.replace(/_/g, ' ')}
                              </span>
                              {isSelected && (
                                <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProceedFromStep1}
                  className="w-full h-12 btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.14)]"
                >
                  <span>Continue: Tactical Identity</span>
                  <ArrowRightIcon className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: TACTICAL IDENTITY & TENDENCIES ─────────────────────────── */}
          {!isSignIn && step === 2 && (
            <div className="space-y-6 sm:space-y-7">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight mb-1">
                  Playstyle & Tactical Identity
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-sans">
                  Define your primary role archetype, tactical tendencies, and craft approach.
                </p>
              </div>

              {/* DUAL CRAFT: ALL-ROUNDER */}
              {roleConfig?.craftType === 'all_rounder' ? (
                <div className="space-y-6">
                  {/* Overall Balance */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs sm:text-sm font-semibold text-slate-200">
                        Tactical Balance
                      </label>
                      <span className="text-[11px] text-slate-400 font-sans">
                        Tap to select or deselect
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            className={`p-4 sm:p-4.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                              isSelected
                                ? 'bg-white/[0.09] backdrop-blur-md border-emerald-500/50 text-white shadow-[0_4px_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/30'
                                : 'bg-white/[0.02] backdrop-blur-sm border-white/[0.07] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-sm font-bold tracking-tight text-white group-hover:text-white">
                                {opt.label}
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                  isSelected
                                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                    : 'border border-white/15 bg-white/[0.03] group-hover:border-white/30'
                                }`}
                              >
                                {isSelected && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                            {opt.shortDesc && (
                              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans">
                                {opt.shortDesc}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Batting Archetype */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs sm:text-sm font-semibold text-slate-200">
                        Batting Archetype
                      </label>
                      <span className="text-[11px] text-slate-400 font-sans">
                        Tap to select or deselect
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-white/[0.09] border-emerald-500/50 text-white font-semibold ring-1 ring-emerald-500/20'
                                : 'bg-white/[0.02] border-white/[0.07] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                          >
                            <span className="text-xs sm:text-sm font-semibold">{opt.label}</span>
                            {isSelected && (
                              <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 ml-1.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bowling Archetype */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs sm:text-sm font-semibold text-slate-200">
                        Bowling Archetype
                      </label>
                      <span className="text-[11px] text-slate-400 font-sans">
                        Tap to select or deselect
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-white/[0.09] border-emerald-500/50 text-white font-semibold ring-1 ring-emerald-500/20'
                                : 'bg-white/[0.02] border-white/[0.07] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                          >
                            <span className="text-xs sm:text-sm font-semibold">{opt.label}</span>
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
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs sm:text-sm font-semibold text-slate-200">
                        Wicketkeeping Craft
                      </label>
                      <span className="text-[11px] text-slate-400 font-sans">
                        Tap to select or deselect
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            className={`p-4 sm:p-4.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                              isSelected
                                ? 'bg-white/[0.09] backdrop-blur-md border-emerald-500/50 text-white shadow-[0_4px_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/30'
                                : 'bg-white/[0.02] backdrop-blur-sm border-white/[0.07] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-sm font-bold tracking-tight text-white group-hover:text-white">
                                {opt.label}
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                  isSelected
                                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                    : 'border border-white/15 bg-white/[0.03] group-hover:border-white/30'
                                }`}
                              >
                                {isSelected && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                            {opt.shortDesc && (
                              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans">
                                {opt.shortDesc}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Keeping Tendencies */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs sm:text-sm font-semibold text-slate-200">
                        Glovework & Keeping Tendencies
                      </label>
                      <span className="text-[11px] text-slate-400 font-sans">
                        Multi-select • tap to toggle
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-2.5">
                      {(roleConfig.keepingTendencies || roleConfig.tendencies).map((opt) => {
                        const isSelected =
                          profileData.secondary_tendencies?.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggleTendency(opt.id)}
                            className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm ring-1 ring-emerald-500/20'
                                : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
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
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs sm:text-sm font-semibold text-slate-200">
                        Batting Style & Role (Keeper-Batsman)
                      </label>
                      <span className="text-[11px] text-slate-400 font-sans">
                        Tap to select or deselect
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-white/[0.09] border-emerald-500/50 text-white font-semibold ring-1 ring-emerald-500/20'
                                : 'bg-white/[0.02] border-white/[0.07] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                          >
                            <span className="text-xs sm:text-sm font-semibold">{opt.label}</span>
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
                  {/* Primary Playstyle Cards */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs sm:text-sm font-semibold text-slate-200">
                        Primary Style / Archetype
                      </label>
                      <span className="text-[11px] text-slate-400 font-sans">
                        Tap to select or deselect
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            className={`p-4 sm:p-4.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                              isSelected
                                ? 'bg-white/[0.09] backdrop-blur-md border-emerald-500/50 text-white shadow-[0_4px_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/30'
                                : 'bg-white/[0.02] backdrop-blur-sm border-white/[0.07] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-sm font-bold tracking-tight text-white group-hover:text-white">
                                {opt.label}
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                  isSelected
                                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                    : 'border border-white/15 bg-white/[0.03] group-hover:border-white/30'
                                }`}
                              >
                                {isSelected && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                            {opt.shortDesc && (
                              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans">
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
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <label className="text-xs sm:text-sm font-semibold text-slate-200">
                          Secondary Movement Tendencies
                        </label>
                        <span className="text-[11px] text-slate-400 font-sans">
                          Multi-select • tap to toggle
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-2.5">
                        {roleConfig?.tendencies.map((opt) => {
                          const isSelected =
                            profileData.secondary_tendencies?.includes(opt.id);
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => toggleTendency(opt.id)}
                              className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm ring-1 ring-emerald-500/20'
                                  : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
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

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep(1);
                  }}
                  className="w-1/3 h-12 btn-secondary text-xs sm:text-sm font-semibold flex items-center justify-center rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleProceedFromStep2}
                  className="w-2/3 h-12 btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.14)]"
                >
                  <span>Continue: Goals & Focus</span>
                  <ArrowRightIcon className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: GOALS & ATHLETE VOICE ─────────────────────────────────── */}
          {!isSignIn && step === 3 && (
            <div className="space-y-6 sm:space-y-7">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight mb-1">
                  Goals & Development Focus
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-sans">
                  Select key performance targets and describe your personal development priorities in your own voice.
                </p>
              </div>

              {/* Role-Specific Calibrated Goals */}
              {(roleConfig?.roleGoals || []).length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-200">
                      Role-Calibrated Focus Targets
                    </label>
                    <span className="text-[11px] text-slate-400 font-sans">
                      Tap to select or deselect
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
                    {roleConfig?.roleGoals.map((opt) => {
                      const isSelected = profileData.role_goals?.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => toggleRoleGoal(opt.id)}
                          className={`px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm ring-1 ring-emerald-500/20'
                              : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
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
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-200">
                      Foundational Physical Objectives
                    </label>
                    <span className="text-[11px] text-slate-400 font-sans">
                      Tap to toggle
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
                    {Object.keys(objectivesData).map((objKey) => {
                      const isSelected =
                        profileData.development_objectives?.includes(objKey);
                      return (
                        <button
                          key={objKey}
                          type="button"
                          onClick={() => toggleObjective(objKey)}
                          className={`px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'bg-white/[0.1] border-white/40 text-white font-semibold shadow-sm ring-1 ring-white/10'
                              : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                          }`}
                        >
                          {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                          <span>{objectivesData[objKey].title || objKey.replace(/_/g, ' ')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Free-Text Athlete Voice: "What are you trying to improve?" */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-200 block mb-2">
                  What are you trying to improve? (In your own words)
                </label>
                <textarea
                  rows={4}
                  value={profileData.personal_goals_text}
                  onChange={(e) =>
                    setProfileData({ ...profileData, personal_goals_text: e.target.value })
                  }
                  placeholder={
                    roleConfig?.voicePrompts?.goalsPlaceholder ||
                    'e.g., Fixing my head falling over to the off side on the front foot drive and generating more bat speed through the line.'
                  }
                  className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/[0.1] text-xs sm:text-sm font-sans text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-white/35 focus:bg-white/[0.06] transition-all resize-none leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 font-sans leading-relaxed">
                  The AI coach correlates your exact concerns with measured biomechanical video data without fabricating results.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep(2);
                  }}
                  className="w-1/3 h-12 btn-secondary text-xs sm:text-sm font-semibold flex items-center justify-center rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleProceedFromStep3}
                  className="w-2/3 h-12 btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.14)]"
                >
                  <span>Continue: Craft Setup</span>
                  <ArrowRightIcon className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: CRAFT SETUP, SURFACES & ENVIRONMENT ───────────────────── */}
          {!isSignIn && step === 4 && (
            <div className="space-y-6 sm:space-y-7">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight mb-1">
                  Craft Setup & Environment
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-sans">
                  Calibrate your physical mechanics, training surfaces, and equipment access.
                </p>
              </div>

              {/* Craft Mechanics (Hand / Arm / Stance) */}
              {(roleConfig?.craftFields || []).length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] space-y-4">
                  <div className="text-xs sm:text-sm font-semibold text-slate-200">
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
                                className={`flex-1 h-11 px-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                                  isSelected
                                    ? 'bg-white/[0.1] border-white/40 text-white font-semibold ring-1 ring-white/15'
                                    : 'bg-white/[0.02] border-white/[0.07] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
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

              {/* Interconnected Training Environment & Playing Surface */}
              <div className="space-y-4">
                {/* 1. Training Environment Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-semibold text-slate-200">
                      Training Environment
                    </label>
                    <span className="text-[10px] text-slate-500 font-sans">Tap to select or change</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {environmentOptions.map((env) => {
                      const isSelected = profileData.training_environment === env.id;
                      return (
                        <button
                          key={env.id}
                          type="button"
                          onClick={() => {
                            const newEnvId = isSelected ? '' : env.id;
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
                            setIsSurfaceOpen(false);
                          }}
                          className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 group ${
                            isSelected
                              ? 'bg-white/[0.09] border-emerald-500/50 text-white font-semibold ring-1 ring-emerald-500/20 shadow-sm'
                              : 'bg-white/[0.02] border-white/[0.07] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
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

                {/* 2. Personalized Surface Dropdown (Interconnected with Environment) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-semibold text-slate-200">
                      Playing Surface
                    </label>
                    <span className="text-[10px] text-slate-500 font-sans">
                      {profileData.training_environment
                        ? 'Personalized to your environment'
                        : 'Select environment first'}
                    </span>
                  </div>

                  {profileData.training_environment ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsSurfaceOpen((prev) => !prev)}
                        className="w-full h-12 px-4 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.09] hover:border-white/25 text-left flex items-center justify-between transition-all focus:outline-none focus:border-white/40 focus:bg-white/[0.05]"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-white truncate">
                          {availableSurfaces.find(
                            (s) => s.id === profileData.surface_preference
                          )?.label || 'Choose Playing Surface'}
                        </span>
                        <ChevronDownIcon
                          className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${
                            isSurfaceOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isSurfaceOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setIsSurfaceOpen(false)}
                          />
                          <div className="absolute left-0 right-0 top-full mt-1.5 z-30 p-2 rounded-2xl bg-[#0B0D15]/95 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.85)] space-y-1 max-h-64 overflow-y-auto">
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
                                    setIsSurfaceOpen(false);
                                  }}
                                  className={`w-full p-3 rounded-xl text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                                    isSelected
                                      ? 'bg-white/[0.1] text-white'
                                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                                  }`}
                                >
                                  <div>
                                    <div className="text-white">{surf.label}</div>
                                    {surf.shortDesc && (
                                      <div className="text-[11px] text-slate-400 font-sans font-normal mt-0.5">
                                        {surf.shortDesc}
                                      </div>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 ml-1.5" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.08] text-slate-500 text-xs text-center font-sans">
                      Select a training environment above to see available surfaces
                    </div>
                  )}
                </div>
              </div>

              {/* Equipment Access */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-200">
                    Equipment Access
                  </label>
                  <span className="text-[11px] text-slate-400 font-sans">
                    Multi-select • tap to toggle
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {equipmentOptions.map((eq) => {
                    const isSelected = profileData.equipment_access?.includes(eq.id);
                    return (
                      <button
                        key={eq.id}
                        type="button"
                        onClick={() => toggleEquipment(eq.id)}
                        className={`px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm ring-1 ring-emerald-500/20'
                            : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                        }`}
                      >
                        {isSelected && <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>{eq.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Free-Text Athlete Voice: "Tell us about your game" */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-200 block mb-2">
                  Tell us about your game (Context & tendencies)
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
                  className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/[0.1] text-xs sm:text-sm font-sans text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-white/35 focus:bg-white/[0.06] transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep(3);
                  }}
                  className="w-1/3 h-12 btn-secondary text-xs sm:text-sm font-semibold flex items-center justify-center rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleProceedFromStep4}
                  className="w-2/3 h-12 btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.14)]"
                >
                  <span>Continue: Biometrics</span>
                  <ArrowRightIcon className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: BIOMETRICS & TIER ─────────────────────────────────────── */}
          {!isSignIn && step === 5 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold font-heading text-white mb-0.5">
                  Physical Biometrics
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Calibrates force metrics, workload limits, and baseline conditioning.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="65"
                    value={profileData.age}
                    onChange={(e) =>
                      setProfileData({ ...profileData, age: e.target.value })
                    }
                    className="w-full h-11 px-2 sportify-input text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="240"
                    value={profileData.height_cm}
                    onChange={(e) =>
                      setProfileData({ ...profileData, height_cm: e.target.value })
                    }
                    className="w-full h-11 px-2 sportify-input text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    value={profileData.weight_kg}
                    onChange={(e) =>
                      setProfileData({ ...profileData, weight_kg: e.target.value })
                    }
                    className="w-full h-11 px-2 sportify-input text-xs font-mono text-center"
                  />
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
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
                        className={`h-10 rounded-xl border text-xs font-medium capitalize flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-white/[0.08] backdrop-blur-md border-white/35 text-white font-semibold ring-1 ring-white/10'
                            : 'bg-white/[0.02] backdrop-blur-sm border-white/[0.06] text-slate-400 hover:text-white hover:border-white/15 hover:bg-white/[0.04]'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Training Days Per Week */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
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
                        className={`h-10 rounded-xl border text-xs font-mono font-medium flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-white/[0.08] backdrop-blur-md border-white/35 text-white font-bold ring-1 ring-white/10'
                            : 'bg-white/[0.02] backdrop-blur-sm border-white/[0.06] text-slate-400 hover:text-white hover:border-white/15 hover:bg-white/[0.04]'
                        }`}
                      >
                        {days}d
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep(4);
                  }}
                  className="w-1/3 h-11 btn-secondary text-xs flex items-center justify-center"
                >
                  Back
                </button>

                {isCompleteProfile ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleProceedFromStep5}
                    className={`w-2/3 h-11 btn-primary flex items-center justify-center gap-2 text-xs font-bold shadow-[0_4px_20px_rgba(255,255,255,0.12)] ${
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
                    className="w-2/3 h-11 btn-primary flex items-center justify-center gap-2 text-xs font-bold shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
                  >
                    <span>Continue: Account</span>
                    <ArrowRightIcon className="w-4 h-4 text-slate-950" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 6: ACCOUNT CREATION (SIGNUP ONLY) ───────────────────────── */}
          {!isSignIn && !isCompleteProfile && step === 6 && (
            <form onSubmit={handleRegisterAndCreateProfile} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold font-heading text-white mb-0.5">
                  Create Athlete Account
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Your profile and assessments sync securely across all your devices.
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
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
                <label className="text-xs font-medium text-slate-300 block mb-1">
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
                <label className="text-xs font-medium text-slate-300 block mb-1">
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

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="w-1/3 h-11 btn-secondary text-xs flex items-center justify-center"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-2/3 h-11 btn-primary flex items-center justify-center gap-2 text-xs font-bold shadow-[0_4px_20px_rgba(255,255,255,0.12)] ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
                  {!loading && <ArrowRightIcon className="w-4 h-4 text-slate-950" />}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

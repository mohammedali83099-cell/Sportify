import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAthleteStore } from '../store/athleteStore';
import { authAPI, intakeAPI } from '../api/client';
import SportifyLogo from '../components/common/SportifyLogo';
import OTPInput from '../components/auth/OTPInput';
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  SportIcon,
} from '../components/common/Icons';

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

  // OTP Verification & Dual-Mode States
  const [isVerifyingSignupOtp, setIsVerifyingSignupOtp] = useState<boolean>(false);
  const [signInMethod, setSignInMethod] = useState<'password' | 'otp'>('password');
  const [isVerifyingSignInOtp, setIsVerifyingSignInOtp] = useState<boolean>(false);
  const [otpCooldown, setOtpCooldown] = useState<number>(60);

  // Taxonomy & Objectives from backend
  const [sportsData, setSportsData] = useState<Record<string, any>>({});
  const [objectivesData, setObjectivesData] = useState<Record<string, any>>({});

  // Form State
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    full_name: '',
  });

  const [profileData, setProfileData] = useState<any>({
    sport: 'cricket',
    discipline: '',
    primary_role: 'batsman',
    sub_role: 'opening_batsman',
    development_objectives: ['explosiveness'],
    experience_level: 'intermediate',
    training_days_per_week: 4,
    session_duration_minutes: 60,
    age: 21,
    weight_kg: 72,
    height_cm: 178,
  });

  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [sports, objs] = await Promise.all([
          intakeAPI.getSports().catch(() => ({})),
          intakeAPI.getObjectives().catch(() => ({})),
        ]);
        setSportsData(sports as Record<string, any>);
        setObjectivesData(objs as Record<string, any>);

        if (sports && (sports as any)['cricket']) {
          const firstRoleKey = Object.keys((sports as any)['cricket'].roles || {})[0] || 'batsman';
          const firstSubKey = Object.keys((sports as any)['cricket'].roles[firstRoleKey]?.sub_roles || {})[0] || '';
          setProfileData((prev: any) => ({
            ...prev,
            primary_role: firstRoleKey,
            sub_role: firstSubKey,
          }));
        }
      } catch (err) {
        console.error('Failed to load taxonomy:', err);
      }
    }
    loadTaxonomy();
  }, []);

  const currentSport = sportsData[profileData.sport] || {};
  const currentRoles = currentSport.roles || {};
  const currentSubRoles = currentRoles[profileData.primary_role]?.sub_roles || {};

  const handleSportSelect = (sportKey: string) => {
    const sportObj = sportsData[sportKey] || {};
    const firstRoleKey = Object.keys(sportObj.roles || {})[0] || '';
    const firstSubKey = Object.keys(sportObj.roles?.[firstRoleKey]?.sub_roles || {})[0] || '';
    setProfileData((prev: any) => ({
      ...prev,
      sport: sportKey,
      discipline: sportObj.disciplines?.[0]?.id || sportObj.disciplines?.[0] || '',
      primary_role: firstRoleKey,
      sub_role: firstSubKey,
    }));
  };

  const handleRoleSelect = (roleKey: string) => {
    const subRoles = currentRoles[roleKey]?.sub_roles || {};
    const firstSub = Object.keys(subRoles)[0] || '';
    setProfileData((prev: any) => ({
      ...prev,
      primary_role: roleKey,
      sub_role: firstSub,
    }));
  };

  const toggleObjective = (objKey: string) => {
    setProfileData((prev: any) => {
      const current = prev.development_objectives || [];
      if (current.includes(objKey)) {
        return {
          ...prev,
          development_objectives: current.filter((k: string) => k !== objKey),
        };
      } else {
        return {
          ...prev,
          development_objectives: [...current, objKey],
        };
      }
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

  const handleSignInSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!authData.email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await authAPI.sendOTP({
        email: authData.email,
        purpose: 'login',
      });
      setOtpCooldown(res.cooldown_seconds || 60);
      setIsVerifyingSignInOtp(true);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Failed to dispatch sign-in code. Please check your email and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignInOtp = async (otpCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const authRes = await authAPI.verifyOTP({
        email: authData.email,
        otp: otpCode,
        purpose: 'login',
      });

      const token = authRes.access_token;
      if (!token) {
        throw new Error('Verification failed. No token received.');
      }

      login({ id: 0, email: authData.email, full_name: '' }, token, null);
      const me = await authAPI.getMe().catch(() => ({ id: 0, email: authData.email, full_name: '' }));

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
        'Invalid or expired verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRequestOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!authData.full_name || !authData.email || !authData.password) {
      setError('Please fill in your full name, email, and password.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await authAPI.sendOTP({
        email: authData.email,
        purpose: 'registration',
      });
      setOtpCooldown(res.cooldown_seconds || 60);
      setIsVerifyingSignupOtp(true);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Failed to send verification code. Please check your email and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignupAndCreateProfile = async (otpCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const authRes = await authAPI.verifyOTP({
        email: authData.email,
        otp: otpCode,
        purpose: 'registration',
        full_name: authData.full_name,
        password: authData.password,
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

      const savedProfile = await intakeAPI.submitProfile({
        sport: profileData.sport,
        discipline: profileData.discipline,
        primary_role: profileData.primary_role,
        secondary_role: profileData.sub_role,
        experience_level: profileData.experience_level,
        training_frequency: Number(profileData.training_days_per_week),
        weight_kg: Number(profileData.weight_kg),
        height_cm: Number(profileData.height_cm),
      });

      login(me, token, savedProfile);
      setProfile(savedProfile);

      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Verification failed. Please check the code and try again.'
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

      const savedProfile = await intakeAPI.submitProfile({
        sport: profileData.sport,
        discipline: profileData.discipline,
        primary_role: profileData.primary_role,
        secondary_role: profileData.sub_role,
        experience_level: profileData.experience_level,
        training_frequency: Number(profileData.training_days_per_week),
        weight_kg: Number(profileData.weight_kg),
        height_cm: Number(profileData.height_cm),
      });

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

  return (
    <div className="min-h-[100dvh] bg-[#07080C] text-[#F1F5F9] flex flex-col w-full selection:bg-white/20 select-none relative overflow-hidden">
      {/* Ambient background depth for glass refraction */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-white/[0.02] blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-[300px] h-[300px] bg-emerald-500/[0.02] blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg mx-auto min-h-[100dvh] flex flex-col justify-center px-4 py-6 sm:py-10 relative z-10">
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
        <div className="w-full p-5 sm:p-7 rounded-2xl bg-gradient-to-b from-[#10131E]/90 via-[#0B0D15]/90 to-[#07080E]/95 backdrop-blur-2xl border border-white/[0.09] shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative flex flex-col overflow-hidden">
          {/* Top specular hairline */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* Step Progress Bar (hidden in sign-in mode) */}
          {!isSignIn && (
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.07]">
              {[
                { num: 1, label: 'Sport' },
                { num: 2, label: 'Goals' },
                { num: 3, label: 'Biometrics' },
                ...(!isCompleteProfile ? [{ num: 4, label: 'Account' }] : []),
              ].map((s) => (
                <div key={s.num} className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${step === s.num
                      ? 'bg-white text-slate-950 shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                      : step > s.num
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm'
                        : 'bg-white/[0.03] text-slate-500 border border-white/[0.07] backdrop-blur-sm'
                      }`}
                  >
                    {step > s.num ? <CheckIcon className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-sans ${step === s.num ? 'text-white font-medium' : 'text-slate-400'
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

          {/* ── DEDICATED SIGN IN FORM (DUAL MODE: PASSWORD / OTP) ─────────────── */}
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

              {/* Method Switcher Pill (hidden while verifying OTP) */}
              {!isVerifyingSignInOtp && (
                <div className="flex rounded-xl p-1 bg-white/[0.04] border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod('password');
                      setError(null);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${signInMethod === 'password'
                        ? 'bg-white/15 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod('otp');
                      setError(null);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${signInMethod === 'otp'
                        ? 'bg-white/15 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    One-Time Code (OTP)
                  </button>
                </div>
              )}

              {/* Password Login Flow */}
              {signInMethod === 'password' && (
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-300 block">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setSignInMethod('otp');
                          setError(null);
                        }}
                        className="text-[11px] text-emerald-400 hover:underline"
                      >
                        Sign in with OTP instead?
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
                      className={`w-full h-11 btn-primary flex items-center justify-center gap-2 text-xs font-bold shadow-[0_4px_20px_rgba(255,255,255,0.12)] ${loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                      {!loading && <ArrowRightIcon className="w-4 h-4 text-slate-950" />}
                    </button>
                  </div>
                </form>
              )}

              {/* OTP Login Flow */}
              {signInMethod === 'otp' && (
                <>
                  {isVerifyingSignInOtp ? (
                    <OTPInput
                      email={authData.email}
                      purpose="login"
                      loading={loading}
                      error={error}
                      cooldownSeconds={otpCooldown}
                      onVerify={handleVerifySignInOtp}
                      onResend={() =>
                        authAPI.sendOTP({ email: authData.email, purpose: 'login' })
                      }
                      onCancel={() => {
                        setIsVerifyingSignInOtp(false);
                        setError(null);
                      }}
                    />
                  ) : (
                    <form onSubmit={handleSignInSendOtp} className="space-y-3.5">
                      <div>
                        <label className="text-xs font-medium text-slate-300 block mb-1">
                          Registered Email Address
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
                        <p className="text-[11px] text-slate-500 mt-1">
                          We will send a 6-digit one-time code to this address.
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={loading || !authData.email}
                          className={`w-full h-11 btn-primary flex items-center justify-center gap-2 text-xs font-bold shadow-[0_4px_20px_rgba(255,255,255,0.12)] ${loading || !authData.email ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                          <span>{loading ? 'Dispatching Code...' : 'Send Sign-In Code'}</span>
                          {!loading && <ArrowRightIcon className="w-4 h-4 text-slate-950" />}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

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
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold font-heading text-white mb-0.5">
                  Tell us how you play
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Choose your sport, playing position, and tactical specialty.
                </p>
              </div>

              {/* Sport Selector */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Sport
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(sportsData).map((sportKey) => {
                    const isSelected = profileData.sport === sportKey;
                    return (
                      <button
                        key={sportKey}
                        type="button"
                        onClick={() => handleSportSelect(sportKey)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${isSelected
                          ? 'bg-gradient-to-b from-white/[0.08] to-white/[0.04] backdrop-blur-md border-white/35 text-white shadow-sm ring-1 ring-white/10'
                          : 'bg-white/[0.02] backdrop-blur-sm border-white/[0.06] text-slate-400 hover:text-white hover:border-white/15 hover:bg-white/[0.04]'
                          }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/[0.04] backdrop-blur-sm border border-white/10 flex items-center justify-center shrink-0">
                          <SportIcon sport={sportKey} className="w-4 h-4 text-slate-200" />
                        </div>
                        <span className="text-xs font-semibold capitalize truncate">
                          {sportsData[sportKey].name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Role Selector */}
              {Object.keys(currentRoles).length > 0 && (
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Playing Position
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(currentRoles).map((roleKey) => {
                      const isSelected = profileData.primary_role === roleKey;
                      return (
                        <button
                          key={roleKey}
                          type="button"
                          onClick={() => handleRoleSelect(roleKey)}
                          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex items-center justify-between ${isSelected
                              ? 'bg-white/[0.08] backdrop-blur-md border-white/35 text-white shadow-sm ring-1 ring-white/10'
                              : 'bg-white/[0.02] backdrop-blur-sm border-white/[0.06] text-slate-400 hover:text-white hover:border-white/15 hover:bg-white/[0.04]'
                            }`}
                        >
                          <span className="text-xs font-semibold capitalize truncate">
                            {currentRoles[roleKey].title || roleKey.replace(/_/g, ' ')}
                          </span>
                          {isSelected && (
                            <CheckIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-Role Selector as Custom Dropdown */}
              {Object.keys(currentSubRoles).length > 0 && (
                <div className="relative">
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Specialty / Tactical Focus
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSpecialtyOpen((prev) => !prev)}
                    className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.09] hover:border-white/25 text-left flex items-center justify-between transition-all focus:outline-none focus:border-white/40 focus:bg-white/[0.05]"
                  >
                    <span className="text-xs font-semibold text-white truncate">
                      {currentSubRoles[profileData.sub_role]?.title ||
                        profileData.sub_role?.replace(/_/g, ' ') ||
                        'Select Specialty'}
                    </span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${isSpecialtyOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {isSpecialtyOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsSpecialtyOpen(false)}
                      />
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-30 p-1.5 rounded-xl bg-[#0B0D15]/95 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.85)] space-y-1">
                        {Object.keys(currentSubRoles).map((subKey) => {
                          const isSelected = profileData.sub_role === subKey;
                          return (
                            <button
                              key={subKey}
                              type="button"
                              onClick={() => {
                                setProfileData((prev: any) => ({ ...prev, sub_role: subKey }));
                                setIsSpecialtyOpen(false);
                              }}
                              className={`w-full p-2.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-all ${isSelected
                                  ? 'bg-white/[0.1] text-white'
                                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                                }`}
                            >
                              <span className="truncate">
                                {currentSubRoles[subKey].title || subKey.replace(/_/g, ' ')}
                              </span>
                              {isSelected && (
                                <CheckIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full h-11 btn-primary flex items-center justify-center gap-2 text-xs font-bold mt-3 shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
              >
                <span>Continue: Objectives</span>
                <ArrowRightIcon className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          )}

          {/* ── STEP 2: OBJECTIVES ────────────────────────────────────────────── */}
          {!isSignIn && step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold font-heading text-white mb-0.5">
                  What do you want to improve?
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Select your primary physical and movement priorities.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-0.5">
                {Object.keys(objectivesData).map((objKey) => {
                  const isSelected = profileData.development_objectives?.includes(objKey);
                  return (
                    <button
                      key={objKey}
                      type="button"
                      onClick={() => toggleObjective(objKey)}
                      className={`p-3 rounded-xl border text-left transition-all ${isSelected
                        ? 'bg-gradient-to-b from-white/[0.08] to-white/[0.04] backdrop-blur-md border-white/35 text-white shadow-sm ring-1 ring-white/10'
                        : 'bg-white/[0.02] backdrop-blur-sm border-white/[0.06] text-slate-400 hover:text-white hover:border-white/15 hover:bg-white/[0.04]'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold capitalize">
                          {objectivesData[objKey].title || objKey.replace(/_/g, ' ')}
                        </span>
                        {isSelected && <CheckIcon className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans line-clamp-2">
                        {objectivesData[objKey].description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 h-11 btn-secondary text-xs flex items-center justify-center"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-2/3 h-11 btn-primary flex items-center justify-center gap-2 text-xs font-bold shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
                >
                  <span>Continue: Biometrics</span>
                  <ArrowRightIcon className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: BIOMETRICS & TIER ─────────────────────────────────────── */}
          {!isSignIn && step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold font-heading text-white mb-0.5">
                  Physical Biometrics
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Calibrates force metrics and workload limits.
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
                        className={`h-10 rounded-xl border text-xs font-medium capitalize flex items-center justify-center transition-all ${isSelected
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

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 h-11 btn-secondary text-xs flex items-center justify-center"
                >
                  Back
                </button>

                {isCompleteProfile ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleProfileSubmit}
                    className={`w-2/3 h-11 btn-primary flex items-center justify-center gap-2 text-xs font-bold shadow-[0_4px_20px_rgba(255,255,255,0.12)] ${loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    <span>{loading ? 'Saving...' : 'Save Profile'}</span>
                    {!loading && <ArrowRightIcon className="w-4 h-4 text-slate-950" />}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="w-2/3 h-11 btn-primary flex items-center justify-center gap-2 text-xs font-bold shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
                  >
                    <span>Continue: Account</span>
                    <ArrowRightIcon className="w-4 h-4 text-slate-950" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 4: ACCOUNT CREATION & OTP VERIFICATION (SIGNUP ONLY) ───── */}
          {!isSignIn && !isCompleteProfile && step === 4 && (
            <>
              {isVerifyingSignupOtp ? (
                <OTPInput
                  email={authData.email}
                  purpose="registration"
                  loading={loading}
                  error={error}
                  cooldownSeconds={otpCooldown}
                  onVerify={handleVerifySignupAndCreateProfile}
                  onResend={() =>
                    authAPI.sendOTP({ email: authData.email, purpose: 'registration' })
                  }
                  onCancel={() => {
                    setIsVerifyingSignupOtp(false);
                    setError(null);
                  }}
                />
              ) : (
                <form onSubmit={handleSignupRequestOtp} className="space-y-4">
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
                      placeholder="e.g. Alex Morgan"
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
                    <p className="text-[11px] text-slate-500 mt-1">
                      A 6-digit verification code will be dispatched to this email.
                    </p>
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
                      onClick={() => setStep(3)}
                      className="w-1/3 h-11 btn-secondary text-xs flex items-center justify-center"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-2/3 h-11 btn-primary flex items-center justify-center gap-2 text-xs font-bold shadow-[0_4px_20px_rgba(255,255,255,0.12)] ${loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      <span>{loading ? 'Sending Code...' : 'Verify Email & Complete'}</span>
                      {!loading && <ArrowRightIcon className="w-4 h-4 text-slate-950" />}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

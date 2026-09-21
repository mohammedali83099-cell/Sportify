import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAthleteStore } from '../../store/athleteStore';
import { videoAPI } from '../../api/client';
import {
  UploadIcon,
  VideoIcon,
  ZapIcon,
  AlertTriangleIcon,
  CloseIcon,
} from '../common/Icons';

const VALID_EXTENSIONS = ['mp4', 'mov', 'avi', 'webm', 'mkv'];

export interface AssessmentUploaderProps {
  sportKey?: string;
  primaryRole?: string | null;
  subRole?: string | null;
  activeProtocolId?: string | null;
  activeProtocolName?: string;
  uploadLabel?: string;
  analyzeButtonLabel?: string;
}

export type UploadStage = 'idle' | 'uploading' | 'quality_gate' | 'analyzing' | 'preparing' | 'ai_coaching';

export const AssessmentUploader: React.FC<AssessmentUploaderProps> = ({
  sportKey,
  primaryRole,
  subRole,
  activeProtocolId,
  activeProtocolName,
  uploadLabel,
  analyzeButtonLabel,
}) => {
  const navigate = useNavigate();
  const setAssessment = useAthleteStore((state) => state.setAssessment);
  const setBottlenecks = useAthleteStore((state) => state.setBottlenecks);
  const profile = useAthleteStore((state) => state.profile);
  const athlete = useAthleteStore((state) => state.athlete);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const chooseInputRef = useRef<HTMLInputElement | null>(null);
  const recordInputRef = useRef<HTMLInputElement | null>(null);
  const pollTimerRef = useRef<any>(null);
  const timeoutTimerRef = useRef<any>(null);

  // Clean up timers & preview URLs on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current as any);
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current as any);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  const handleFile = (file: File) => {
    setErrorMsg(null);
    if (!file) return;

    const ext = (file.name || 'video.mp4').split('.').pop()?.toLowerCase() || '';
    if (!VALID_EXTENSIONS.includes(ext)) {
      setErrorMsg(`Unsupported format (${ext.toUpperCase()}). Please upload MP4, MOV, AVI, or WebM.`);
      return;
    }

    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  };

  const handleRecordClick = () => {
    setErrorMsg(null);
    recordInputRef.current?.click();
  };

  const handleChooseClick = () => {
    setErrorMsg(null);
    chooseInputRef.current?.click();
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select or record a video first.');
      return;
    }

    setErrorMsg(null);
    setStage('uploading');

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('sport', sportKey || 'cricket');
      formData.append('role', primaryRole || 'athlete');
      if (subRole) {
        formData.append('sub_role', subRole);
      }
      formData.append('protocol', activeProtocolId || 'auto');

      if (profile) {
        const athleteContext = {
          athlete_id: athlete?.id || profile.athlete_id || (profile as any).id,
          sport: profile.sport || sportKey,
          role: profile.primary_role || primaryRole,
          sub_role: profile.sub_role || subRole,
          primary_playstyle: profile.primary_playstyle,
          secondary_tendencies: profile.secondary_tendencies,
          playstyle_profile: profile.playstyle_profile,
          dominant_hand: profile.dominant_hand,
          dominant_foot: profile.dominant_foot,
          stance: profile.stance,
          surface_preference: profile.surface_preference,
          training_environment: profile.training_environment,
          equipment_access: profile.equipment_access,
          athlete_description: profile.athlete_description,
          personal_goals_text: profile.personal_goals_text,
          development_objectives: profile.development_objectives || profile.goals,
          experience_level: profile.experience_level,
        };
        formData.append('athlete_context', JSON.stringify(athleteContext));
      }

      const uploadRes = await videoAPI.coach(formData);
      const jobId = uploadRes?.job_id;

      if (!jobId) {
        throw new Error('No job ID returned from assessment server.');
      }

      // Visual progress progression while waiting for CV and AI pipeline
      setStage('quality_gate');
      const stageTimer1 = setTimeout(() => setStage('analyzing'), 2500);
      const stageTimer2 = setTimeout(() => setStage('preparing'), 6000);
      const stageTimer3 = setTimeout(() => setStage('ai_coaching'), 12000);

      let consecutive404Count = 0;
      // Start polling backend job status
      pollTimerRef.current = setInterval(async () => {
        try {
          const statusRes = await videoAPI.getStatus(jobId);
          consecutive404Count = 0;
          if (statusRes.status === 'completed') {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current as any);
            if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current as any);
            clearTimeout(stageTimer1);
            clearTimeout(stageTimer2);
            clearTimeout(stageTimer3);

            setAssessment(statusRes);
            if (statusRes.bottlenecks) setBottlenecks(statusRes.bottlenecks);
            navigate(`/analysis/${jobId}`, { state: { result: statusRes } });
          } else if (statusRes.status === 'failed') {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current as any);
            if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current as any);
            clearTimeout(stageTimer1);
            clearTimeout(stageTimer2);
            clearTimeout(stageTimer3);
            setStage('idle');
            setErrorMsg(
              statusRes.message ||
                'Movement analysis could not detect required keypoints. Please ensure full body is in frame.'
            );
          }
        } catch (err: any) {
          if (err?.response?.status === 404) {
            consecutive404Count += 1;
            if (consecutive404Count >= 5) {
              if (pollTimerRef.current) clearInterval(pollTimerRef.current as any);
              if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current as any);
              clearTimeout(stageTimer1);
              clearTimeout(stageTimer2);
              clearTimeout(stageTimer3);
              setStage('idle');
              setErrorMsg(
                'Assessment session was not found or the server restarted. Please try recording or uploading again.'
              );
            }
          }
        }
      }, 1500);

      // Timeout guard after 45 seconds (optimized pipeline completes in ~4-10s)
      timeoutTimerRef.current = setTimeout(() => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current as any);
        clearTimeout(stageTimer1);
        clearTimeout(stageTimer2);
        clearTimeout(stageTimer3);
        if (stage !== 'idle') {
          setStage('idle');
          setErrorMsg('Analysis timed out. Please ensure full body is visible and try a 3-5 second clip.');
        }
      }, 45000);
    } catch (err: any) {
      setStage('idle');
      setErrorMsg(
        err.response?.data?.detail ||
          err.message ||
          'Failed to upload video for assessment. Check server connection.'
      );
    }
  };

  const getStageLabel = () => {
    switch (stage) {
      case 'uploading':
        return 'Uploading video recording...';
      case 'quality_gate':
        return 'Checking video clarity and athlete framing...';
      case 'analyzing':
        return 'Analyzing movement kinematics and joint angles...';
      case 'preparing':
        return 'Evaluating movement benchmarks and phase mechanics...';
      case 'ai_coaching':
        return 'Synthesizing personalized AI coaching advice...';
      default:
        return 'Processing movement assessment...';
    }
  };

  const isBusy = stage !== 'idle';

  return (
    <div id="recording-uploader" className="space-y-3 select-none">
      {/* Hidden native file/camera inputs */}
      <input
        type="file"
        ref={chooseInputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        accept="video/mp4,video/mov,video/avi,video/webm,video/mkv"
        className="hidden"
      />
      <input
        type="file"
        ref={recordInputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        accept="video/*"
        capture="environment"
        className="hidden"
      />

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 font-sans leading-relaxed">
            <span className="font-bold block">Assessment Notice</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Dominant Viewfinder & Capture Card */}
      <div className="rounded-2xl bg-[#0A0C13]/90 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 relative overflow-hidden shadow-xl hover:border-white/15 transition-all">
        {/* Reticle brackets */}
        <div className="viewfinder-corner-tl" />
        <div className="viewfinder-corner-tr" />
        <div className="viewfinder-corner-bl" />
        <div className="viewfinder-corner-br" />

        {videoPreviewUrl ? (
          /* Video Review Mode */
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Recording Ready</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setVideoPreviewUrl(null);
                }}
                disabled={isBusy}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <CloseIcon className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/15 bg-black">
              <video
                src={videoPreviewUrl}
                controls
                playsInline
                className="w-full max-h-[240px] object-contain mx-auto"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
              <span className="truncate max-w-[200px]">{selectedFile?.name || 'video_recording.mp4'}</span>
              <span>{selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(1) : 0} MB</span>
            </div>
          </div>
        ) : (
          /* Empty Capture Mode */
          <div className="py-4 text-center space-y-3 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/15 flex items-center justify-center mx-auto text-white">
              <VideoIcon className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                {uploadLabel || (activeProtocolName ? `Capture ${activeProtocolName}` : 'Record or Upload Movement Video')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                {activeProtocolName
                  ? 'Full-body framing • High contrast • 30–60 FPS'
                  : 'Auto-Detection Active: System will automatically detect movement kinematics (squat, jump, sprint, or technique).'}
              </p>
            </div>

            {/* Clear, dominant mobile action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto pt-1">
              <button
                type="button"
                onClick={handleRecordClick}
                disabled={isBusy}
                className="flex-1 h-11 btn-primary text-xs flex items-center justify-center gap-2"
              >
                <VideoIcon className="w-4 h-4 text-slate-950" />
                <span>Record Video</span>
              </button>

              <button
                type="button"
                onClick={handleChooseClick}
                disabled={isBusy}
                className="flex-1 h-11 btn-secondary text-xs flex items-center justify-center gap-2"
              >
                <UploadIcon className="w-4 h-4 text-slate-300" />
                <span>Choose File</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Processing State or Dominant Analyze Button */}
      {isBusy ? (
        <div className="p-6 rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] text-center space-y-2.5 shadow-lg">
          <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-bold font-heading text-white">
            {getStageLabel()}
          </p>
          <p className="text-xs text-slate-400 font-sans">
            Please keep this tab open while kinematic processing completes.
          </p>
        </div>
      ) : (
        selectedFile && (
          <button
            type="button"
            onClick={handleStartAnalysis}
            className="btn-primary w-full h-12 text-xs font-bold tracking-wide flex items-center justify-center gap-2"
          >
            <ZapIcon className="w-4 h-4 text-slate-950" />
            <span>{analyzeButtonLabel || `Analyze ${activeProtocolName || 'Movement (Auto-Detect)'}`}</span>
          </button>
        )
      )}
    </div>
  );
};

export default AssessmentUploader;

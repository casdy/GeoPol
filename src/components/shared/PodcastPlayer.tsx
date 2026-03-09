"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Square, Loader2, Headphones, Volume2, PauseCircle, Lock } from "lucide-react";
import { generateConversationalScript, generateAudioBuffer, type PodcastLine } from "@/app/actions/podcast";
import { geminiCooldownMs } from "@/lib/ai-router";

type State =
  | "idle"
  | "generating_script"
  | "fetching_audio"
  | "playing"
  | "interrupted"
  | "quota_paused"; // Gemini quota exhausted — audio paused until reset

interface PodcastPlayerProps {
  type: 'overview' | 'deep-dive';
  data: any;
  isPremium?: boolean;
  onSubscribeClick?: () => void;
}

const HOST_NAME = "Alex";

export default function PodcastPlayer({ type, data, isPremium = false, onSubscribeClick }: PodcastPlayerProps) {
  const [state, setState] = useState<State>("idle");
const [statusText, setStatusText] = useState(
    type === 'overview' ? "Listen to podcast briefing" : "Listen to deep dive analysis"
  );
  const [visualizerSeeds, setVisualizerSeeds] = useState<number[]>([]);

  // Stable random seeds for visualizer to avoid hydration mismatch
  useEffect(() => {
    setVisualizerSeeds(Array.from({ length: 6 }, () => Math.random()));
  }, []);
  const [script, setScript] = useState<PodcastLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const stopPlayback = () => {
    cancelledRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setState("interrupted");
    setIsPlaying(false);
    setStatusText("Playback interrupted.");
  };

  const handleGenerate = async () => {
    if (!isPremium) {
      onSubscribeClick?.();
      return;
    }

    if (!data || (Array.isArray(data) && data.length === 0)) return;
    
    cancelledRef.current = false;
    setState("generating_script");
    setStatusText("Writing script...");
    setScript([]);
    setCurrentLineIndex(-1);

    try {
      const generatedScript = await generateConversationalScript({ 
        type, 
        data,
        hostName: HOST_NAME
      });
      setScript(generatedScript);

      if (cancelledRef.current) return;

      setState("fetching_audio");
      setStatusText(`Synthesizing audio (${HOST_NAME} is prepping)...`);

      // Pre-fetch all audio buffers in parallel
      const audioBuffers = await Promise.all(
        generatedScript.map(line => generateAudioBuffer(line.text, line.speaker))
      );

      if (cancelledRef.current) return;

      // Play sequentially using pre-fetched buffers
      for (let i = 0; i < generatedScript.length; i++) {
        if (cancelledRef.current) break;

        setCurrentLineIndex(i);
        const currentSpeaker = HOST_NAME;
        
        setState("playing");
        setIsPlaying(true);
        setStatusText(`Playing: ${currentSpeaker}`);

        await playAudio(audioBuffers[i]);
        
        setIsPlaying(false);
      }

      if (!cancelledRef.current) {
        setState("idle");
        setCurrentLineIndex(-1);
        setStatusText("Podcast finished.");
      }
    } catch (error: any) {
      console.error(error);
      if (!cancelledRef.current) {
        // Gemini quota exhausted — show paused state, not a generic error
        if (error?.code === "GEMINI_QUOTA_EXHAUSTED" || error?.message?.includes("quota")) {
          const cooldownSec = Math.ceil(geminiCooldownMs() / 1000);
          setState("quota_paused");
          setIsPlaying(false);
          setStatusText(
            cooldownSec > 0
              ? `Audio paused — Gemini quota resets in ~${cooldownSec}s. Script generation still works via fallback.`
              : "Audio paused — Gemini quota exhausted. Try again shortly."
          );
        } else {
          setState("idle");
          setIsPlaying(false);
          setStatusText(`Error: ${error.message}`);
        }
      }
    }
  };

  const playAudio = (dataUri: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(dataUri);
      audioRef.current = audio;

      audio.onended = () => resolve();
      audio.onerror = (e) => {
        console.error("Audio Element Error Event:", e);
        console.error("Audio Error State:", audio.error);
        reject(new Error(`Audio playback failed. DOMException: ${audio.error?.message || audio.error?.code || 'Unknown'}`));
      };

      audio.play().catch((playError) => {
        console.error("Audio Play Promise Rejected:", playError);
        reject(new Error(`Autoplay/Decode failed: ${playError.message}`));
      });
    });
  };

  // Helper to determine speaker name
  const getCurrentSpeakerName = () => {
    if (currentLineIndex >= 0 && script[currentLineIndex]) {
      return HOST_NAME;
    }
    return "";
  };

  const isDataEmpty = !data || (Array.isArray(data) && data.length === 0);

  return (
    <div className="bg-neutral-900 border border-neutral-700/50 rounded-xl p-6 shadow-2xl flex flex-col gap-5 relative overflow-hidden transition-all hover:border-neutral-600/50">
      
      {/* Header Area */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 p-2.5 rounded-full text-orange-500 border border-orange-500/20">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              Audio Overview
              {!isPremium && <span className="bg-orange-500 text-[8px] px-1 rounded-sm text-black font-black">PRO</span>}
            </h2>
            <p className="text-sm text-neutral-400 font-mono tracking-wide">{type === 'overview' ? 'Global Briefing' : 'Deep Dive Analysis'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {state === "quota_paused" ? (
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-800/30 hover:bg-yellow-800/50 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors"
            >
              <PauseCircle className="w-4 h-4" />
              <span>Retry Audio</span>
            </button>
          ) : ["idle", "interrupted"].includes(state) ? (
            <button
              onClick={handleGenerate}
              disabled={isDataEmpty && isPremium}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(234,88,12,0.2)] hover:shadow-[0_0_25px_rgba(234,88,12,0.4)] ${
                isPremium 
                  ? "bg-orange-600 hover:bg-orange-500 text-black" 
                  : "bg-neutral-800 hover:bg-neutral-700 text-orange-500 border border-orange-500/30"
              }`}
            >
              {!isPremium ? <Lock className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{type === 'overview' ? 'Listen to Briefing' : 'Listen to Deep Dive'}</span>
            </button>
          ) : (
            <button
              onClick={stopPlayback}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-500 border border-red-500/30 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Playback</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-black/40 rounded-lg p-5 min-h-[140px] flex flex-col justify-center relative border border-white/5">
        
        {/* Status Indicator */}
        <div className="flex items-center gap-3 z-10 mb-2">
          {state === "generating_script" || state === "fetching_audio" ? (
            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
          ) : state === "quota_paused" ? (
            <PauseCircle className="w-5 h-5 text-yellow-400" />
          ) : isPlaying ? (
            <Volume2 className="w-5 h-5 text-orange-500 animate-pulse" />
          ) : null}
          <p className={`text-sm font-mono ${state === "quota_paused" ? "text-yellow-400" : "text-neutral-300"}`}>
            {statusText}
          </p>
        </div>

        {/* Script Subtitles */}
        {script.length > 0 && currentLineIndex >= 0 && state !== "idle" && state !== "generating_script" && (
          <div className="mt-4 border-t border-neutral-800 pt-4 z-10">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 text-orange-500 mb-2">
              {getCurrentSpeakerName()}
            </span>
            <p className="text-base lg:text-lg text-white font-serif italic tracking-wide">
              "{script[currentLineIndex]?.text}"
            </p>
          </div>
        )}

        {/* Animated Waveform Visualizer */}
        {isPlaying && (
          <div className="absolute right-6 bottom-6 flex items-end gap-1.5 h-12 opacity-80 pointer-events-none">
            {visualizerSeeds.map((seed, i) => (
              <div
                key={i}
                className="w-1.5 bg-orange-500 rounded-t-full h-full origin-bottom"
                style={{
                  animation: `pulse-waveform ${0.3 + seed * 0.4}s ease-in-out infinite alternate`,
                  animationDelay: `${seed * 0.5}s`,
                  boxShadow: '0 0 10px rgba(236, 110, 42, 0.5)'
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-waveform {
          0% { transform: scaleY(0.2); }
          100% { transform: scaleY(1.0); }
        }
      `}} />
    </div>
  );
}

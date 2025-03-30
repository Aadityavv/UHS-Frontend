import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Volume2, VolumeX, Wind, Settings } from 'lucide-react';
import AmbientAnimation from './AmbientAnimation';
import { AmbientMode } from './types';

const ambientSounds = [
  {
    id: 1,
    name: "Ocean Waves",
    file: "/sounds/ocean-waves.mp3",
    colorFrom: "#06b6d4",
    colorTo: "#3b82f6",
    ambientMode: 'ocean' as AmbientMode
  },
  {
    id: 2,
    name: "Forest Rain",
    file: "/sounds/forest-rain.mp3",
    colorFrom: "#10b981",
    colorTo: "#14b8a6",
    ambientMode: 'rain' as AmbientMode
  },
  {
    id: 3,
    name: "Birds Chirping",
    file: "/sounds/birds.mp3",
    colorFrom: "#84cc16",
    colorTo: "#22c55e",
    ambientMode: 'mountain' as AmbientMode
  },
];

const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(ambientSounds[0]);
  const [volume, setVolume] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const [ambientMode, setAmbientMode] = useState<AmbientMode>('none');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    setAmbientMode(isActive ? currentTrack.ambientMode : 'none');
  }, [isActive, currentTrack]);


  // Preload audio files
  useEffect(() => {
    ambientSounds.forEach(track => {
      const audio = new Audio(track.file);
      audio.load();
    });
  }, []);

  const breathingSequence = [
    { 
      phase: 'inhale', 
      duration: 4, 
      scale: [1, 1.2], 
      colorFrom: "#22d3ee", // cyan-400
      colorTo: "#3b82f6"    // blue-500
    },
    { 
      phase: 'hold-in', 
      duration: 4, 
      scale: [1.2, 1.2], 
      colorFrom: "#3b82f6", // blue-500
      colorTo: "#6366f1"    // indigo-500
    },
    { 
      phase: 'exhale', 
      duration: 6, 
      scale: [1.2, 1], 
      colorFrom: "#6366f1", // indigo-500
      colorTo: "#8b5cf6"    // purple-500
    },
    { 
      phase: 'hold-out', 
      duration: 2, 
      scale: [1, 1], 
      colorFrom: "#8b5cf6", // purple-500
      colorTo: "#a855f7"    // violet-500
    },
  ];

  // Initialize audio and cleanup
  useEffect(() => {
    audioRef.current = new Audio(currentTrack.file);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentTrack, volume]);

  // Handle breathing animation and audio
  useEffect(() => {
    let startTime: number | null = null;
    let currentStep = 0;
    let frameId: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const currentPhase = breathingSequence[currentStep];
      const progress = elapsed / (currentPhase.duration * 1000);

      if (progress >= 1) {
        currentStep = (currentStep + 1) % breathingSequence.length;
        if (currentStep === 0) setCycles(c => c + 1);
        startTime = timestamp;
        setPhase(breathingSequence[currentStep].phase);
        setTimeLeft(breathingSequence[currentStep].duration);
      } else {
        setTimeLeft(Math.ceil(currentPhase.duration - (progress * currentPhase.duration)));
      }

      if (audioRef.current) {
        const breathModulation = currentPhase.phase === 'inhale' 
          ? 0.2 * Math.sin(progress * Math.PI) 
          : currentPhase.phase === 'exhale'
          ? -0.1 * Math.sin(progress * Math.PI)
          : 0;
        audioRef.current.volume = Math.min(1, Math.max(0, volume + breathModulation));
      }

      frameId = requestAnimationFrame(animate);
    };

    if (isActive) {
      setPhase(breathingSequence[0].phase);
      setTimeLeft(breathingSequence[0].duration);
      if (audioRef.current && !isMuted) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      frameId = requestAnimationFrame(animate);
      animationRef.current = frameId;
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isActive, isMuted, volume]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const getCurrentPhaseConfig = () => {
    return breathingSequence.find(seq => seq.phase === phase) || breathingSequence[0];
  };

  const getPhaseLabel = (phase: string) => {
    switch(phase) {
      case 'inhale': return 'Breathe In';
      case 'exhale': return 'Breathe Out';
      case 'hold-in': return 'Hold';
      case 'hold-out': return 'Rest';
      default: return phase;
    }
  };

  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden max-w-md mx-auto">

<AmbientAnimation mode={ambientMode} intensity={volume} />

      {/* Header with controls */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <HeartPulse className="text-rose-500 h-5 w-5" /> 
          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Breathing Exercise
          </span>
        </h3>
        
        <button 
          onClick={toggleSettings}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Settings"
        >
          <Settings className={`h-5 w-5 text-gray-500 transition-all ${showSettings ? 'rotate-90 text-blue-500' : ''}`} />
        </button>
      </div>
      
      {/* Settings panel */}
      <motion.div 
        initial={false}
        animate={{ 
          height: showSettings ? 'auto' : 0,
          opacity: showSettings ? 1 : 0,
          marginBottom: showSettings ? '1.5rem' : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="flex flex-col gap-4 pb-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Ambient Sound</label>
            <select 
              value={currentTrack.id}
              onChange={(e) => setCurrentTrack(ambientSounds.find(t => t.id === Number(e.target.value))!)}
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:outline-none text-sm"
              disabled={isActive}
            >
              {ambientSounds.map(track => (
                <option key={track.id} value={track.id}>{track.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Volume</label>
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleMute}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-gray-500" />
                ) : (
                  <Volume2 className="h-4 w-4 text-blue-500" />
                )}
              </button>
              
              {!isMuted && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex flex-col items-center space-y-6 relative z-10">
        {/* Breathing circle */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <motion.div
            animate={isActive ? {
              scale: getCurrentPhaseConfig().scale,
              background: `linear-gradient(135deg, ${getCurrentPhaseConfig().colorFrom}, ${getCurrentPhaseConfig().colorTo})`
            } : {
              scale: 1,
              background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)'
            }}
            transition={{ 
              duration: isActive ? 
                (phase === 'inhale' ? 4 : 
                 phase === 'exhale' ? 6 : 
                 0.5) : 0.5,
              ease: phase === 'inhale' ? 'easeOut' : 
                    phase === 'exhale' ? 'easeIn' : 
                    'linear'
            }}
            className="absolute w-full h-full rounded-full flex items-center justify-center shadow-lg"
            style={{
              boxShadow: isActive ? 
                `0 0 30px ${phase === 'inhale' ? 'rgba(34, 211, 238, 0.3)' : 
                  phase === 'exhale' ? 'rgba(168, 85, 247, 0.3)' : 
                  'rgba(99, 102, 241, 0.3)'}` : 
                '0 0 15px rgba(0, 0, 0, 0.1)'
            }}
          />
          
          <div className="relative z-10 text-center">
            {isActive ? (
              <>
                <motion.p 
                  key={phase}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-sm font-medium text-white mb-1"
                >
                  {getPhaseLabel(phase)}
                </motion.p>
                <motion.p
                  key={`time-${phase}`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold text-white"
                >
                  {timeLeft}
                </motion.p>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <Wind className="h-8 w-8 text-gray-400 mx-auto" />
                </div>
                <p className="text-sm text-gray-500">Ready to begin?</p>
              </>
            )}
          </div>
        </div>

        {/* Dynamic content */}
        {isActive ? (
          <div className="w-full space-y-6">
            <div className="flex justify-between items-center px-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Cycle:</span> {cycles}
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Time:</span> {cycles * 16}s
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsActive(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium shadow-md transition-all"
            >
              Stop Exercise
            </motion.button>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsActive(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium shadow-md transition-all"
            >
              Start Breathing
            </motion.button>

            {/* Instructions */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-500 space-y-3"
            >
              <p className="font-medium flex items-center justify-center gap-2">
                <Wind className="h-4 w-4" /> Instructions:
              </p>
              <ul className="space-y-2">
                {breathingSequence.map((step, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="flex items-center gap-2"
                  >
                    <span className={`h-2 w-2 rounded-full ${
                      step.phase === 'inhale' ? 'bg-cyan-500' :
                      step.phase === 'exhale' ? 'bg-indigo-500' :
                      step.phase === 'hold-in' ? 'bg-blue-500' :
                      'bg-purple-500'
                    }`} />
                    <span>
                      {getPhaseLabel(step.phase)} - {step.duration}s
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreathingExercise;
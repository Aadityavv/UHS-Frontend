import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Volume2, VolumeX, Wind, ChevronDown } from 'lucide-react';

const ambientSounds = [
  {
    id: 1,
    name: "Ocean Waves",
    file: "/sounds/ocean-waves.mp3",
  },
  {
    id: 2,
    name: "Forest Rain",
    file: "/sounds/forest-rain.mp3",
  },
  {
    id: 3,
    name: "Birds Chirping",
    file: "/sounds/birds.mp3",
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Preload audio files
  useEffect(() => {
    ambientSounds.forEach(track => {
      const audio = new Audio(track.file);
      audio.load();
    });
  }, []);

  const breathingSequence = [
    { phase: 'inhale', duration: 4, color: 'from-teal-400 to-blue-400' },
    { phase: 'hold', duration: 4, color: 'from-blue-400 to-indigo-400' },
    { phase: 'exhale', duration: 6, color: 'from-indigo-400 to-purple-400' },
    { phase: 'hold', duration: 2, color: 'from-purple-400 to-violet-400' },
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
          : -0.1 * Math.sin(progress * Math.PI);
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

  return (
    <div className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with controls */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <HeartPulse className="text-rose-500" /> Breathing Exercise
          </h3>
          
          <button 
            onClick={toggleSettings}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors lg:hidden"
            aria-label="Settings"
          >
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {/* Settings panel */}
        <div className={`${showSettings ? 'block' : 'hidden'} lg:block`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <select 
              value={currentTrack.id}
              onChange={(e) => setCurrentTrack(ambientSounds.find(t => t.id === Number(e.target.value))!)}
              className="text-xs w-full sm:w-auto border rounded-lg px-2 py-1 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              disabled={isActive}
            >
              {ambientSounds.map(track => (
                <option key={track.id} value={track.id}>{track.name}</option>
              ))}
            </select>
            
            <div className="flex items-center gap-2 w-full">
              <button 
                onClick={toggleMute}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
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
                  className="w-full accent-blue-500"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center space-y-4 relative z-10">
        {/* Breathing circle */}
        <motion.div
          animate={isActive ? {
            scale: phase === 'inhale' ? [1, 1.2] : phase === 'exhale' ? [1.2, 1] : [1, 1],
            background: phase === 'inhale' 
              ? 'linear-gradient(135deg, #2dd4bf, #60a5fa)' 
              : phase === 'exhale' 
              ? 'linear-gradient(135deg, #818cf8, #a78bfa)' 
              : 'linear-gradient(135deg, #60a5fa, #818cf8)'
          } : {
            scale: 1,
            background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)'
          }}
          transition={{ 
            duration: isActive ? (phase === 'inhale' ? 4 : phase === 'exhale' ? 6 : 0.5) : 0.3,
            repeat: isActive ? Infinity : 0,
            repeatType: 'reverse'
          }}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-white shadow-lg"
          style={{
            boxShadow: isActive ? '0 0 20px rgba(129, 140, 248, 0.5)' : '0 0 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          {isActive ? (
            <span className="text-lg sm:text-xl font-bold">{timeLeft}</span>
          ) : (
            <Wind className="h-6 w-6 sm:h-7 sm:w-7 text-gray-400" />
          )}
        </motion.div>

        {/* Dynamic content */}
        {isActive ? (
          <>
            <motion.div
              animate={{
                color: phase === 'inhale' ? '#2dd4bf' : phase === 'exhale' ? '#a78bfa' : '#60a5fa'
              }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-xl sm:text-2xl font-semibold capitalize mb-1 sm:mb-2">{phase}</p>
              <p className="text-sm sm:text-base text-gray-600">Cycles: {cycles}</p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsActive(false)}
              className="px-4 py-1.5 sm:px-6 sm:py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md transition-all text-sm sm:text-base"
            >
              Stop Exercise
            </motion.button>
          </>
        ) : (
          <>
            <div className="text-center text-gray-600">
              <p className="text-lg sm:text-xl font-medium mb-1 sm:mb-2">Ready to relax?</p>
              <p className="text-xs sm:text-sm">Follow the breathing pattern</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsActive(true)}
              className="px-4 py-1.5 sm:px-6 sm:py-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-md transition-all text-sm sm:text-base"
            >
              Start Breathing
            </motion.button>
          </>
        )}

        {/* Session summary */}
        {!isActive && cycles > 0 && (
          <div className="mt-3 p-2 bg-green-50 rounded-lg text-center w-full max-w-xs">
            <p className="text-sm sm:text-base text-green-700">Completed {cycles} cycles</p>
            <p className="text-xs sm:text-sm text-green-600 mt-0.5">
              Practiced for {cycles * 16} seconds
            </p>
          </div>
        )}

        {/* Instructions */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xs sm:text-sm text-gray-500 mt-3 space-y-1 sm:space-y-2 w-full max-w-xs"
        >
          <p className="font-medium flex items-center justify-center gap-1">
            <Wind className="h-3 w-3 sm:h-4 sm:w-4" /> Instructions:
          </p>
          <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1">
            <motion.li 
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="py-0.5"
            >Inhale deeply for 4 seconds</motion.li>
            <motion.li 
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="py-0.5"
            >Hold breath for 4 seconds</motion.li>
            <motion.li 
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="py-0.5"
            >Exhale slowly for 6 seconds</motion.li>
            <motion.li 
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="py-0.5"
            >Hold for 2 seconds</motion.li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default BreathingExercise;
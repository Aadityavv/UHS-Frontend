import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Waves, BirdIcon } from 'lucide-react';
import { AmbientMode } from '@/components/types';

type AmbientAnimationProps = {
  mode: AmbientMode;
  intensity?: number;
};

const AmbientAnimation = ({ mode, intensity = 1 }: AmbientAnimationProps) => {
  console.log('AmbientAnimation mode:', mode, 'intensity:', intensity);

  const rainCount = Math.floor(50 * intensity);
  const waveCount = Math.floor(3 * intensity);
  const birdLeafCount = Math.floor(20 * intensity);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[999]">
      <AnimatePresence>
        {/* Rain Animation (working) */}
        {mode === 'rain' && (
          <>
            {Array.from({ length: rainCount }).map((_, i) => (
              <motion.div
                key={`rain-${i}`}
                initial={{ y: -50, x: Math.random() * window.innerWidth, opacity: 0 }}
                animate={{
                  y: window.innerHeight + 50,
                  x: Math.random() * 100 - 50 + (i % 5) * 100,
                  opacity: [0, 0.7 * intensity, 0],
                }}
                transition={{
                  duration: 1 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'linear',
                }}
                className="absolute text-blue-300/50"
              >
                <Droplets className="h-4 w-4" />
              </motion.div>
            ))}
          </>
        )}

        {/* Fixed Ocean Animation */}
        {mode === 'ocean' && (
          <>
            {Array.from({ length: waveCount }).map((_, i) => {
              const waveHeight = 30 + i * 10; // Vary wave heights
              const animationDuration = 8 + i * 2; // Vary durations
              
              return (
                <motion.div
                  key={`wave-${i}`}
                  initial={{ 
                    x: '-100%',
                    y: window.innerHeight - waveHeight,
                    opacity: 0.3 * intensity
                  }}
                  animate={{
                    x: '100%',
                    opacity: [0.3 * intensity, 0.7 * intensity, 0.3 * intensity],
                  }}
                  transition={{
                    duration: animationDuration,
                    repeat: Infinity,
                    delay: i * 1.5,
                    ease: 'linear',
                  }}
                  style={{
                    position: 'absolute',
                    height: `${waveHeight}px`,
                    width: '200%',
                    bottom: '0',
                  }}
                >
                  <Waves 
                    className="text-blue-400/40" 
                    style={{
                      width: '100%',
                      height: '100%',
                    }} 
                  />
                </motion.div>
              );
            })}
          </>
        )}

        {/* Fixed Mountain Animation */}
        {mode === 'mountain' && (
          <>
            {Array.from({ length: birdLeafCount }).map((_, i) => {
              const startX = Math.random() * window.innerWidth;
              const startY = Math.random() * window.innerHeight * 0.7;
              const endX = startX + (Math.random() - 0.5) * 200;
              const endY = startY + (Math.random() - 0.5) * 100;
              
              return (
                <motion.div
                  key={`leaf-${i}`}
                  initial={{
                    x: startX,
                    y: startY,
                    rotate: 0,
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    x: endX,
                    y: endY,
                    rotate: 360,
                    opacity: [0, 0.6 * intensity, 0],
                    scale: 1,
                  }}
                  transition={{
                    duration: 5 + Math.random() * 5,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 3,
                    ease: 'easeInOut',
                  }}
                  style={{
                    position: 'absolute',
                    willChange: 'transform',
                  }}
                >
                  <BirdIcon 
                    className="text-green-400/60" 
                    style={{
                      width: '24px',
                      height: '24px',
                    }} 
                  />
                </motion.div>
              );
            })}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AmbientAnimation;
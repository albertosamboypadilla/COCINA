import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  // Dimensions based on size
  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const textSizes = {
    sm: {
      title: 'text-lg',
      sub: 'text-[7px] tracking-[0.2em]',
      container: 'gap-3',
    },
    md: {
      title: 'text-2xl sm:text-3xl',
      sub: 'text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.28em]',
      container: 'gap-4',
    },
    lg: {
      title: 'text-4xl sm:text-5xl',
      sub: 'text-xs tracking-[0.3em] sm:tracking-[0.35em]',
      container: 'gap-6',
    },
  };

  const currentTextSize = textSizes[size];

  // Animation variants
  const pathVariants: any = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (custom: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: { 
        pathLength: { delay: custom * 0.15, type: 'spring', duration: 1.8, bounce: 0 },
        opacity: { delay: custom * 0.15, duration: 0.3 }
      }
    })
  };

  const textVariants: any = {
    hidden: { opacity: 0, x: -15 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { delay: 0.6, duration: 0.8, ease: "easeOut" }
    }
  };

  const subtitleVariants: any = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { delay: 1.0, duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className={`flex items-center ${showText ? currentTextSize.container : ''} ${className}`}>
      {/* Icon frame matching the image exactly */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`${iconSizes[size]} bg-[#0e1420]/90 rounded-2xl flex items-center justify-center border border-slate-800/85 shadow-2xl p-1 relative overflow-hidden`}
        style={{
          boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.9), inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Glow behind the icon */}
        <div className="absolute inset-0 bg-red-600/5 mix-blend-color-dodge rounded-2xl animate-pulse pointer-events-none" />

        {/* The Animated SVG Icon */}
        <svg 
          viewBox="0 0 160 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full text-[#ff3b30]"
        >
          <defs>
            {/* Soft high-quality glow filter */}
            <filter id="logo-neon-red" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="4" result="blur2" />
              <feGaussianBlur stdDeviation="1.5" result="blur1" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Underlay with filter for the neon reflection/glow */}
          <g filter="url(#logo-neon-red)" opacity="0.65" className="animate-pulse duration-3000">
            {/* Base line */}
            <path d="M 15 62 h 130" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Columns */}
            <path d="M 28 62 V 42 l 6 -6 V 62" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" />
            <path d="M 37 62 V 22 l 9 -12 V 62" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 49 62 V 38 l 6 -6 V 62" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" />
            <path d="M 58 62 V 54 h 3 V 62" stroke="#ef4444" strokeWidth="1.5" />

            {/* Triangular Trusses */}
            <path d="M 64 62 L 86 32 L 122 62 Z" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 72 62 L 86 42 L 110 62" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" />
            
            {/* Core details */}
            <path d="M 78 62 L 86 51 L 98 62" stroke="#ef4444" strokeWidth="1.5" />
            <path d="M 86 51 V 62" stroke="#ef4444" strokeWidth="1.5" />
            <path d="M 82 57 V 62" stroke="#ef4444" strokeWidth="1.2" />
            <path d="M 90 57 V 62" stroke="#ef4444" strokeWidth="1.2" />
          </g>

          {/* Foreground sharp clean lines */}
          <g>
            {/* Base line */}
            <motion.path 
              d="M 15 62 h 130" 
              stroke="#ff4d4d" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              custom={0}
            />
            
            {/* Col 1 */}
            <motion.path 
              d="M 28 62 V 42 l 6 -6 V 62 Z" 
              stroke="#ff3b30" 
              strokeWidth="2" 
              strokeLinejoin="round"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              custom={1}
            />
            
            {/* Col 2 */}
            <motion.path 
              d="M 37 62 V 22 l 9 -12 V 62 Z" 
              stroke="#ff3b30" 
              strokeWidth="2.5" 
              strokeLinejoin="round"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              custom={2}
            />
            
            {/* Col 3 */}
            <motion.path 
              d="M 49 62 V 38 l 6 -6 V 62 Z" 
              stroke="#ff3b30" 
              strokeWidth="2" 
              strokeLinejoin="round"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              custom={3}
            />

            {/* Col 4 */}
            <motion.path 
              d="M 58 62 V 54 h 3 V 62 Z" 
              stroke="#ff3b30" 
              strokeWidth="1.5" 
              strokeLinejoin="round"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              custom={4}
            />

            {/* Triangular Truss outer */}
            <motion.path 
              d="M 64 62 L 86 32 L 122 62 Z" 
              stroke="#ff3b30" 
              strokeWidth="2.5" 
              strokeLinejoin="round"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              custom={5}
            />

            {/* Triangular Truss inner */}
            <motion.path 
              d="M 72 62 L 86 42 L 110 62" 
              stroke="#ff4d4d" 
              strokeWidth="2" 
              strokeLinejoin="round"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              custom={6}
            />

            {/* Detailed inner lattice */}
            <motion.path 
              d="M 78 62 L 86 51 L 98 62" 
              stroke="#ff4d4d" 
              strokeWidth="1.5" 
              strokeLinejoin="round"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              custom={7}
            />
            <motion.path 
              d="M 86 51 V 62" 
              stroke="#ff3b30" 
              strokeWidth="1.5" 
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              custom={8}
            />
            <motion.path 
              d="M 82 57 V 62" 
              stroke="#ff4d4d" 
              strokeWidth="1.2" 
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              custom={9}
            />
            <motion.path 
              d="M 90 57 V 62" 
              stroke="#ff4d4d" 
              strokeWidth="1.2" 
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              custom={9}
            />
          </g>
        </svg>
      </motion.div>

      {/* Typography from the image with flickering and fade-in neon behavior */}
      {showText && (
        <div className="flex flex-col select-none">
          <motion.h1 
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className={`${currentTextSize.title} font-[900] tracking-tight uppercase leading-none font-sans`}
          >
            <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.05)]">HARMONY</span>
            <motion.span 
              animate={{ 
                opacity: [1, 0.85, 1, 0.9, 0.95, 0.8, 1],
                textShadow: [
                  '0 0 10px rgba(239, 68, 68, 0.5)',
                  '0 0 4px rgba(239, 68, 68, 0.3)',
                  '0 0 10px rgba(239, 68, 68, 0.5)',
                  '0 0 12px rgba(239, 68, 68, 0.6)',
                  '0 0 8px rgba(239, 68, 68, 0.4)',
                  '0 0 3px rgba(239, 68, 68, 0.2)',
                  '0 0 10px rgba(239, 68, 68, 0.5)',
                ]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "mirror"
              }}
              className="text-[#ef4444] ml-2 font-black"
            >
              GLASS
            </motion.span>
          </motion.h1>

          <motion.p 
            variants={subtitleVariants}
            initial="hidden"
            animate="visible"
            className={`${currentTextSize.sub} text-slate-400 font-bold uppercase tracking-[0.22em] mt-1.5 font-sans`}
          >
            CONTROL DE OBRAS
          </motion.p>
        </div>
      )}
    </div>
  );
}

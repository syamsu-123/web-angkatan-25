import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useAnimationFrame,
  useMotionValue
} from 'framer-motion';

export default function PaperPlaneAnimation() {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // Dapatkan progres scroll halaman
  const { scrollYProgress } = useScroll();

  // Spring physics yang lebih halus dan natural (seperti melayang di udara)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 24,
    mass: 0.65,
    restDelta: 0.0001
  });

  // Kecepatan scroll untuk efek miring/banking 3D pesawat yang realistis
  const scrollVelocity = useVelocity(smoothProgress);
  const smoothVelocity = useSpring(scrollVelocity, {
    stiffness: 90,
    damping: 26,
    mass: 0.4
  });

  // Osilasi halus (idle floating) agar pesawat tetap hidup & bernapas di udara
  const floatOffsetY = useMotionValue(0);
  const floatRoll = useMotionValue(0);

  // Transform untuk mengikuti lintasan path
  const pathProgress = useTransform(smoothProgress, [0, 1], [0, 1]);

  // Animasi pesawat (opasitas & skala halus saat masuk dan keluar layar)
  const planeOpacity = useTransform(
    smoothProgress,
    [0, 0.02, 0.06, 0.94, 0.985, 1],
    [0, 0.65, 1, 1, 0.65, 0]
  );

  // Warna hijau muda transparan untuk lintasan
  const trailColor = 'rgba(127, 214, 142, 0.45)';
  const trailGlowColor = 'rgba(183, 214, 191, 0.22)';

  // SVG Path untuk lintasan (kurva S organik yang mengalir anggun dari kiri atas ke kanan bawah)
  const getPathD = (width, height) => {
    if (width <= 0 || height <= 0) return '';
    const x1 = -0.06 * width;
    const y1 = 0.16 * height;

    const cp1x = 0.26 * width;
    const cp1y = 0.24 * height;
    const cp2x = 0.34 * width;
    const cp2y = 0.58 * height;
    const midX = 0.54 * width;
    const midY = 0.52 * height;

    const cp3x = 0.74 * width;
    const cp3y = 0.46 * height;
    const cp4x = 0.82 * width;
    const cp4y = 0.76 * height;
    const x4 = 1.06 * width;
    const y4 = 0.84 * height;

    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${midX} ${midY} C ${cp3x} ${cp3y}, ${cp4x} ${cp4y}, ${x4} ${y4}`;
  };

  // SVG pesawat kertas dengan detail lipatan origami 3D, gradasi cahaya, dan bayangan halus
  const PaperPlane = ({ width = 46, height = 30 }) => (
    <svg
      viewBox="0 0 46 30"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Gradasi sayap atas untuk kesan pencahayaan alami */}
        <linearGradient id="wingTopGrad" x1="2" y1="2" x2="42" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#f4fbf6" />
          <stop offset="100%" stopColor="#e2f2e6" />
        </linearGradient>

        {/* Gradasi sayap bawah untuk efek kedalaman bidang kertas */}
        <linearGradient id="wingBottomGrad" x1="4" y1="27" x2="42" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#eaf5ed" />
          <stop offset="55%" stopColor="#f8fcf9" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* Gradasi lipatan tengah (center fuselage valley fold) */}
        <linearGradient id="centerFoldGrad" x1="6" y1="15" x2="42" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a5cbb0" />
          <stop offset="50%" stopColor="#c7e2ce" />
          <stop offset="100%" stopColor="#e3f1e7" />
        </linearGradient>

        {/* Gradasi garis angin halus di belakang sayap */}
        <linearGradient id="windSlipGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(127,214,142,0.65)" />
        </linearGradient>

        {/* Drop shadow lembut di bawah pesawat */}
        <filter id="planeShadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="-2" dy="5" stdDeviation="3.2" floodColor="#071f14" floodOpacity="0.32" />
        </filter>
      </defs>

      {/* Jejak pusaran angin tipis di ujung sayap (wingtip vortices) */}
      <path
        d="M -10 4 Q -3 4.5 3 4"
        stroke="url(#windSlipGrad)"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M -12 26 Q -4 25.5 3 26"
        stroke="url(#windSlipGrad)"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.7"
      />

      <g filter="url(#planeShadow)">
        {/* Lipatan dalam (under-fold fuselage) */}
        <path
          d="M43 15 L9.5 12.2 L6.5 15 L9.5 17.8 Z"
          fill="url(#centerFoldGrad)"
          stroke="#0f3d2a"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* Bayangan dalam lipatan tengah */}
        <path
          d="M43 15 L9.5 15 L7.2 17.2 Z"
          fill="#8ab899"
          fillOpacity="0.55"
        />

        {/* Sayap Bawah (Right/Lower Wing) */}
        <path
          d="M43 15 L9.5 16.4 L3 27.5 Z"
          fill="url(#wingBottomGrad)"
          stroke="#0f3d2a"
          strokeWidth="0.95"
          strokeLinejoin="round"
        />

        {/* Sayap Atas (Left/Upper Wing) */}
        <path
          d="M43 15 L3 2.5 L9.5 13.6 Z"
          fill="url(#wingTopGrad)"
          stroke="#0f3d2a"
          strokeWidth="0.95"
          strokeLinejoin="round"
        />

        {/* Detail garis lipatan kertas halus pada sayap */}
        <path
          d="M43 15 L9.5 15"
          stroke="#0f3d2a"
          strokeOpacity="0.45"
          strokeWidth="0.65"
          strokeLinecap="round"
        />
        <path
          d="M4.8 5.6 L9.5 13.6"
          stroke="#0f3d2a"
          strokeOpacity="0.22"
          strokeWidth="0.5"
        />
        <path
          d="M4.8 24.4 L9.5 16.4"
          stroke="#0f3d2a"
          strokeOpacity="0.22"
          strokeWidth="0.5"
        />
        {/* Highlight tepi depan sayap kertas */}
        <path
          d="M41.5 14.5 L4.5 3.1"
          stroke="#ffffff"
          strokeOpacity="0.85"
          strokeWidth="0.6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );

  // Update ukuran viewport
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        setViewportSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Ukur panjang SVG path setiap kali ukuran viewport berubah dan path selesai dirender
  useEffect(() => {
    if (pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength();
        if (len > 0) {
          setPathLength(len);
        }
      } catch {
        setPathLength(Math.hypot(viewportSize.width, viewportSize.height));
      }
    }
  }, [viewportSize.width, viewportSize.height]);

  // Cek prefers-reduced-motion
  const reduceMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // Gerakan melayang mikro (idle bobbing & subtle wing roll)
  useAnimationFrame((time) => {
    if (reduceMotion) return;
    const t = time * 0.001;
    floatOffsetY.set(Math.sin(t * 2.1) * 3.5);
    floatRoll.set(Math.cos(t * 1.6) * 2.2);
  });

  // Hitung posisi & sudut kemiringan pesawat secara presisi berdasarkan progres scroll
  const getPlaneSample = (progress) => {
    const pathEl = pathRef.current;
    if (!pathEl || pathLength <= 0) {
      return {
        x: viewportSize.width * 0.5,
        y: viewportSize.height * 0.5,
        rotation: 20,
        curvature: 0
      };
    }

    const clampedProgress = Math.max(0, Math.min(1, progress));
    const currentDist = clampedProgress * pathLength;
    const delta = Math.max(2, pathLength * 0.008);

    const p0 = pathEl.getPointAtLength(Math.max(0, currentDist - delta));
    const p1 = pathEl.getPointAtLength(currentDist);
    const p2 = pathEl.getPointAtLength(Math.min(pathLength, currentDist + delta));

    // Sudut arah terbang dengan central difference agar transisi rotasi ekstra mulus
    const angle = Math.atan2(p2.y - p0.y, p2.x - p0.x) * (180 / Math.PI);

    // Estimasi kelengkungan kurva untuk efek banking sayap otomatis saat berbelok
    const anglePrev = Math.atan2(p1.y - p0.y, p1.x - p0.x) * (180 / Math.PI);
    const angleNext = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
    const curvature = Math.max(-18, Math.min(18, (angleNext - anglePrev) * 3.5));

    return { x: p1.x, y: p1.y, rotation: angle, curvature };
  };

  const planeX = useTransform(pathProgress, (p) => getPlaneSample(p).x);
  const planeY = useTransform(
    [pathProgress, floatOffsetY],
    ([p, dy]) => getPlaneSample(p).y + (dy || 0)
  );
  const planeRotate = useTransform(
    [pathProgress, smoothVelocity, floatRoll],
    ([p, vel, roll]) => {
      const sample = getPlaneSample(p);
      const velocityPitch = Math.max(-8, Math.min(8, (vel || 0) * 14));
      return sample.rotation + velocityPitch + (roll || 0) * 0.35;
    }
  );

  // Efek 3D banking (miring sayap saat menukik/berbelok)
  const planeScaleY = useTransform(
    [pathProgress, smoothVelocity, floatRoll],
    ([p, vel, roll]) => {
      const sample = getPlaneSample(p);
      const bank = Math.abs(sample.curvature) * 0.008 + Math.min(0.12, Math.abs(vel || 0) * 0.18);
      const breath = (roll || 0) * 0.012;
      return Math.max(0.82, Math.min(1.08, 1 - bank + breath));
    }
  );

  const planeScale = useTransform(
    smoothProgress,
    [0, 0.08, 0.5, 0.92, 1],
    [0.86, 1, 1.06, 1, 0.9]
  );

  // Kalau viewport belum terdeteksi, return placeholder
  if (viewportSize.width === 0 || viewportSize.height === 0 || reduceMotion) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-40"
        aria-hidden="true"
      />
    );
  }

  const pathD = getPathD(viewportSize.width, viewportSize.height);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${viewportSize.width} ${viewportSize.height}`}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Masking agar garis putus-putus tergambar dengan sangat mulus mengikuti pesawat */}
          <mask id="paperPlaneTrailMask" maskUnits="userSpaceOnUse">
            <motion.path
              d={pathD}
              fill="none"
              stroke="#ffffff"
              strokeWidth="12"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              style={{ pathLength: pathProgress }}
            />
          </mask>

          <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(127, 214, 142, 0.12)" />
            <stop offset="45%" stopColor={trailColor} />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.55)" />
          </linearGradient>
        </defs>

        {/* Pendar cahaya lembut di belakang garis lintasan */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={trailGlowColor}
          strokeWidth="5"
          strokeLinecap="round"
          style={{
            pathLength: pathProgress,
            filter: 'blur(3px)'
          }}
        />

        {/* Lintasan garis putus-putus (dashed path) ter-masking secara presisi */}
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="url(#trailGradient)"
          strokeWidth="2"
          strokeDasharray="7 9"
          strokeLinecap="round"
          mask="url(#paperPlaneTrailMask)"
        />
      </svg>

      {/* Pesawat kertas yang bergerak mulus mengikuti lintasan */}
      <motion.div
        className="absolute top-0 left-0"
        style={{
          x: planeX,
          y: planeY,
          rotate: planeRotate,
          scale: planeScale,
          opacity: planeOpacity,
          willChange: 'transform, opacity'
        }}
      >
        <motion.div
          style={{
            scaleY: planeScaleY,
            transform: 'translate(-58%, -50%)'
          }}
          className="origin-center"
        >
          <PaperPlane width={46} height={30} />
        </motion.div>
      </motion.div>
    </div>
  );
}

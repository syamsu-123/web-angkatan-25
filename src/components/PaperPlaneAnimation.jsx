import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useMotionValue, useTransform } from 'framer-motion';
import './PaperPlaneAnimation.css';

const CREAM = '#F5F0E8';
const INK = '#171717';

export default function PaperPlaneAnimation() {
  const wrapRef = useRef(null);
  const measureRef = useRef(null);
  const planeBoxRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [done, setDone] = useState(false);

  const { scrollYProgress } = useScroll();

  const p = useMotionValue(0);
  const ribbon = useMotionValue(0);
  const px = useMotionValue(-200);
  const py = useMotionValue(-200);
  const rot = useMotionValue(0);
  const planeOpacity = useMotionValue(0);
  const planeBlur = useMotionValue(0);
  const planeFilter = useTransform(planeBlur, (v) =>
    v > 0.15
      ? `blur(${v.toFixed(1)}px) drop-shadow(0 10px 18px rgba(23,23,23,.28))`
      : 'drop-shadow(0 10px 18px rgba(23,23,23,.28))'
  );

  const { w, h } = size;

  const d = useMemo(() => {
    if (!w || !h) return '';
    const X = (v) => +(v * w).toFixed(2);
    const Y = (v) => +(v * h).toFixed(2);
    return `M ${X(-0.08)} ${Y(1.1)} C ${X(0.2)} ${Y(1.04)}, ${X(0.34)} ${Y(0.86)}, ${X(0.55)} ${Y(0.7)} S ${X(0.88)} ${Y(0.4)}, ${X(1.08)} ${Y(-0.06)}`;
  }, [w, h]);

  const ribbonW = Math.max(26, Math.min(w || 800, h || 600) * 0.055);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) =>
        !s.w || Math.abs(s.w - width) > 60 || Math.abs(s.h - height) > 60
          ? { w: width, h: height }
          : s
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const path = measureRef.current;
    if (!path || !w) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      p.set(1);
      ribbon.set(1);
      planeOpacity.set(0);
      planeBlur.set(0);
      setDone(true);
      return;
    }

    const L = path.getTotalLength();
    const box = planeBoxRef.current?.getBoundingClientRect();
    const hw = (box?.width || 54) / 2;
    const hh = (box?.height || 34) / 2;
    let last = 0;
    let ribbonCur = 0;

    const unsubP = p.on('change', (v) => {
      const pt = path.getPointAtLength(L * v);
      const ahead = path.getPointAtLength(Math.min(L, L * v + 10));
      const ang = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
      px.set(pt.x - hw);
      py.set(pt.y - hh + Math.sin(v * Math.PI * 7) * 5);
      rot.set(ang + Math.sin(v * Math.PI * 5) * 2.5);
      planeOpacity.set(v < 0.05 ? v / 0.05 : v > 0.9 ? Math.max(0, (1 - v) / 0.1) : 1);
      planeBlur.set(Math.min(5, Math.abs(v - last) * 260));
      last = v;
      ribbonCur += (v - ribbonCur) * 0.22;
      ribbon.set(Math.min(v, ribbonCur));
    });

    p.set(scrollYProgress.get());
    const unsubScroll = scrollYProgress.on('change', (v) => {
      p.set(v);
      setDone(v > 0.98);
    });

    return () => {
      unsubScroll();
      unsubP();
    };
  }, [w, h, scrollYProgress]);

  return (
    <div ref={wrapRef} className={`ppa-root${done ? ' ppa-done' : ''}`} aria-hidden="true">
      {w > 0 && (
        <svg className="ppa-svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
          <defs>
            <linearGradient id="ppa-cream" x1="0" y1="0" x2="0" y2={h} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="0.5" stopColor={CREAM} />
              <stop offset="1" stopColor="#EAE2D4" />
            </linearGradient>
          </defs>

          <path ref={measureRef} d={d} fill="none" stroke="none" />

          <g className="ppa-paper">
            <g transform="translate(0 5)">
              <motion.path
                d={d}
                stroke="#D8CFBE"
                strokeWidth={ribbonW + 5}
                strokeLinecap="round"
                style={{ pathLength: ribbon }}
              />
            </g>
            <motion.path
              d={d}
              stroke="url(#ppa-cream)"
              strokeWidth={ribbonW}
              strokeLinecap="round"
              style={{ pathLength: ribbon }}
            />
            <g transform={`translate(0 ${-ribbonW * 0.26})`}>
              <motion.path
                d={d}
                stroke="#FFFFFF"
                strokeOpacity={0.55}
                strokeWidth={ribbonW * 0.34}
                strokeLinecap="round"
                style={{ pathLength: ribbon }}
              />
            </g>
            <motion.path
              d={d}
              stroke={INK}
              strokeOpacity={0.12}
              strokeWidth={1.4}
              strokeLinecap="round"
              style={{ pathLength: ribbon }}
            />
            <path
              className="ppa-shimmer"
              d={d}
              stroke="#FFFFFF"
              strokeOpacity={0.4}
              strokeWidth={ribbonW * 0.2}
              strokeLinecap="round"
              strokeDasharray="70 210"
            />
          </g>
        </svg>
      )}

      <motion.div
        ref={planeBoxRef}
        className="ppa-plane"
        style={{ x: px, y: py, opacity: planeOpacity, filter: planeFilter }}
      >
        <motion.div className="ppa-plane-rot" style={{ rotate: rot }}>
          <svg viewBox="0 0 64 40" width="54" height="34" fill="none" aria-hidden="true">
            <path
              d="M62 20 L28 20 L2 36 Z"
              fill="#EBE4D6"
              stroke={INK}
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path
              d="M62 20 L2 4 L28 20 Z"
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path d="M62 20 L28 20" stroke={INK} strokeOpacity="0.45" strokeWidth="1" />
            <path d="M14 8.5 L28 20" stroke={INK} strokeOpacity="0.18" strokeWidth="0.8" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';

const TAU = 2 * Math.PI;
const SAMPLES = 4096;
const FORM_TIME = 2.8;
const CYCLE_TIME = 18;
const LAYERS = [
  { count: 670, color: '#577b9f', glow: 4, width: .65, opacity: .34 },
  { count: 680, color: '#7197bd', glow: 7, width: .54, opacity: .45 },
  { count: 650, color: '#9ebbd9', glow: 9, width: .48, opacity: .56 },
  { count: 360, color: '#d5e5f5', glow: 11, width: .45, opacity: .76 },
];

const outline = Array.from({ length: SAMPLES }, (_, index) => {
  const t = index / SAMPLES * TAU;
  return {
    x: 16 * Math.sin(t) ** 3,
    y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
  };
});

function outlinePoint(turn) {
  return outline[Math.floor(turn * SAMPLES) & (SAMPLES - 1)];
}

export default function AnimatedHeart() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const layers = LAYERS.map((layer, layerIndex) => ({
      ...layer,
      particles: Array.from({ length: layer.count }, (_, index) => ({
        turn: (index + Math.random()) / layer.count,
        radius: layerIndex === 3
          ? .91 + Math.random() * .12
          : .41 + Math.pow(Math.random(), .35) * .59,
        length: .0015 + Math.random() * .006,
        phase: Math.random() * TAU,
        delay: Math.random() * 1.5,
        speed: index % 5 === 0 ? -1 : index % 3 + 1,
      })),
    }));

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frame;
    let start;

    function draw(elapsed) {
      const flowingTime = Math.max(0, elapsed - FORM_TIME);
      const loop = flowingTime % CYCLE_TIME / CYCLE_TIME;
      const beatPhase = flowingTime % 1.55 / 1.55;
      const pulse = 1 + .039 * Math.sin(Math.PI * beatPhase) ** 8;
      const scale = Math.min(width / 43, height / 38) * pulse;
      const centerX = width / 2;
      const centerY = height / 2 - 2.5 * scale;

      context.clearRect(0, 0, width, height);
      context.lineCap = 'round';
      context.globalCompositeOperation = 'lighter';

      for (const layer of layers) {
        context.beginPath();
        for (const particle of layer.particles) {
          const age = Math.max(0, Math.min(1, (elapsed - particle.delay) / 1.3));
          if (age === 0) continue;

          const drift = Math.sin(particle.phase + loop * TAU * 4);
          const remaining = (1 - age) ** 2;
          const turn = particle.turn + loop * particle.speed + remaining * .18;
          const radius = particle.radius + drift * .035 + remaining * .38;
          const head = outlinePoint(turn);
          const tail = outlinePoint(turn - particle.length * Math.sign(particle.speed));

          context.moveTo(centerX + tail.x * radius * scale, centerY + tail.y * radius * scale);
          context.lineTo(centerX + head.x * radius * scale, centerY + head.y * radius * scale);
        }

        context.lineWidth = layer.width;
        context.strokeStyle = layer.color;
        context.shadowColor = layer.color;
        context.shadowBlur = layer.glow * pixelRatio;
        context.globalAlpha = layer.opacity * Math.min(1, elapsed / 1.5);
        context.stroke();
      }

      context.globalAlpha = 1;
      context.shadowBlur = 0;
      context.globalCompositeOperation = 'source-over';
    }

    function animate(timestamp) {
      start ??= timestamp;
      draw((timestamp - start) / 1000);
      frame = requestAnimationFrame(animate);
    }

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      if (motion.matches) draw(FORM_TIME);
    }

    function updateMotion() {
      cancelAnimationFrame(frame);
      start = undefined;
      if (motion.matches) draw(FORM_TIME);
      else frame = requestAnimationFrame(animate);
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    motion.addEventListener('change', updateMotion);
    updateMotion();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      motion.removeEventListener('change', updateMotion);
    };
  }, []);

  return <canvas className="animated-heart" ref={canvasRef} aria-hidden="true" />;
}

import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
  phase: number;
  speed: number;
  size: number;
};

export default function SignalField({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const points: Point[] = Array.from({ length: 74 }, (_, index) => ({
      x: ((index * 47.137) % 100) / 100,
      y: ((index * 71.311) % 100) / 100,
      phase: index * 1.71,
      speed: 0.25 + ((index * 13) % 10) / 28,
      size: index % 13 === 0 ? 2.3 : 0.8,
    }));
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let pointer = { x: 0.5, y: 0.5, active: false };
    const pulses: { x: number; y: number; start: number }[] = [];
    let lastPaint = 0;

    const paint = (time: number) => {
      const still = paused || reduceMotion.matches;
      const t = still ? 0 : time / 1000;
      context.clearRect(0, 0, width, height);
      const nodes = points.map((point) => {
        const x =
          point.x * width +
          (still ? 0 : Math.sin(t * point.speed + point.phase) * 20);
        const y =
          point.y * height +
          (still ? 0 : Math.cos(t * point.speed * 0.8 + point.phase) * 16);
        if (!pointer.active || still) return { x, y, size: point.size };
        const dx = x - pointer.x * width;
        const dy = y - pointer.y * height;
        const distance = Math.hypot(dx, dy);
        const force = Math.max(0, 1 - distance / 140) ** 2 * 34;
        return {
          x: x + (dx / (distance || 1)) * force,
          y: y + (dy / (distance || 1)) * force,
          size: point.size,
        };
      });

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > 105) continue;
          context.strokeStyle = `rgba(227, 233, 216, ${0.13 * (1 - distance / 105)})`;
          context.lineWidth = 0.75;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
        context.fillStyle =
          i % 13 === 0 ? "#ff794b" : "rgba(236, 242, 223, 0.56)";
        context.beginPath();
        context.arc(a.x, a.y, a.size, 0, Math.PI * 2);
        context.fill();
      }

      // The signal crosses the network. It responds to the pointer without
      // being required to understand or navigate any of the content.
      const signalX = still ? width * 0.72 : ((t * 48) % (width + 220)) - 110;
      const signalY = height * (0.5 + Math.sin(t * 0.65) * 0.17);
      const glow = context.createRadialGradient(
        signalX,
        signalY,
        1,
        signalX,
        signalY,
        130,
      );
      glow.addColorStop(0, "rgba(236, 91, 45, 0.24)");
      glow.addColorStop(1, "rgba(236, 91, 45, 0)");
      context.fillStyle = glow;
      context.fillRect(signalX - 130, signalY - 130, 260, 260);
      context.fillStyle = "#fb7549";
      context.beginPath();
      context.arc(signalX, signalY, 3.3, 0, Math.PI * 2);
      context.fill();
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        const age = time - pulse.start;
        if (age > 900) {
          pulses.splice(i, 1);
          continue;
        }
        const radius = 7 + (age / 900) * 125;
        context.strokeStyle = `rgba(251, 117, 73, ${0.65 * (1 - age / 900)})`;
        context.lineWidth = 1.3;
        context.beginPath();
        context.arc(pulse.x, pulse.y, radius, 0, Math.PI * 2);
        context.stroke();
      }
    };

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      width = box.width;
      height = box.height;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      paint(performance.now());
    };
    const animate = (time: number) => {
      if (visible && !document.hidden && time - lastPaint > 32) {
        paint(time);
        lastPaint = time;
      }
      frame = requestAnimationFrame(animate);
    };
    const move = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer = {
        x: (event.clientX - box.left) / box.width,
        y: (event.clientY - box.top) / box.height,
        active: true,
      };
    };
    const leave = () => {
      pointer.active = false;
    };
    const ping = (event: PointerEvent) => {
      if (paused || reduceMotion.matches) return;
      const box = canvas.getBoundingClientRect();
      pulses.push({
        x: event.clientX - box.left,
        y: event.clientY - box.top,
        start: performance.now(),
      });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersection.observe(canvas);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("pointerdown", ping);
    const start = () => {
      cancelAnimationFrame(frame);
      if (paused || reduceMotion.matches) paint(0);
      else frame = requestAnimationFrame(animate);
    };
    reduceMotion.addEventListener("change", start);
    start();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointerdown", ping);
      reduceMotion.removeEventListener("change", start);
    };
  }, [paused]);

  return (
    <canvas ref={canvasRef} className="signal-canvas" aria-hidden="true" />
  );
}

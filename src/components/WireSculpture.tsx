import { useEffect, useRef } from "react";

export default function WireSculpture({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      visible = true,
      width = 0,
      height = 0;
    let pointer = { x: 0, y: 0 };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    };
    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const t = paused || reduced.matches ? 0.7 : time * 0.00013;
      const scale = Math.min(width, height) * 0.29;
      const rotation = t + 0.45 + pointer.x * 0.15;
      const tilt = 0.73 + pointer.y * 0.1;
      const lines: { points: number[][]; depth: number }[] = [];
      for (let i = 0; i < 64; i++) {
        const u = (i / 64) * Math.PI * 2;
        const points: number[][] = [];
        let depth = 0;
        for (let j = 0; j <= 100; j++) {
          const v = (j / 100) * Math.PI * 2;
          const r = 0.48 + 0.11 * Math.sin(u * 3 + t * 2);
          const radius = 1 + r * Math.cos(v);
          const x = radius * Math.cos(u),
            y = radius * Math.sin(u),
            z = r * Math.sin(v) + 0.13 * Math.sin(u * 2 + t);
          const rx = x * Math.cos(rotation) - z * Math.sin(rotation);
          const rz = x * Math.sin(rotation) + z * Math.cos(rotation);
          const ry = y * Math.cos(tilt) - rz * Math.sin(tilt);
          const zz = y * Math.sin(tilt) + rz * Math.cos(tilt);
          const angle = -0.48;
          points.push([
            width / 2 + (rx * Math.cos(angle) - ry * Math.sin(angle)) * scale,
            height / 2 + (rx * Math.sin(angle) + ry * Math.cos(angle)) * scale,
          ]);
          depth += zz;
        }
        lines.push({ points, depth: depth / 101 });
      }
      lines.sort((a, b) => a.depth - b.depth);
      for (const line of lines) {
        ctx.beginPath();
        line.points.forEach(([x, y], index) =>
          index ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
        );
        ctx.strokeStyle = `rgba(34, 36, 32, ${0.2 + ((line.depth + 1.5) / 3) * 0.65})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    };
    const animate = (time: number) => {
      if (visible && !document.hidden) draw(time);
      frame = requestAnimationFrame(animate);
    };
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer = {
        x: (e.clientX - r.left) / r.width - 0.5,
        y: (e.clientY - r.top) / r.height - 0.5,
      };
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersection.observe(canvas);
    canvas.addEventListener("pointermove", move);
    const start = () => {
      cancelAnimationFrame(frame);
      if (!paused && !reduced.matches) frame = requestAnimationFrame(animate);
      else draw(0);
    };
    reduced.addEventListener("change", start);
    start();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      canvas.removeEventListener("pointermove", move);
      reduced.removeEventListener("change", start);
    };
  }, [paused]);
  return (
    <canvas
      ref={ref}
      className="wire-canvas"
      aria-label="A slowly rotating, intricately woven torus sculpture"
      role="img"
    />
  );
}

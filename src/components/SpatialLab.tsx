import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Box, Move3D, RotateCcw } from "lucide-react";
import "./SpatialLab.css";

const points = Array.from({ length: 24 }, (_, i) => {
  const y = 1 - (i / 23) * 2;
  const radius = Math.sqrt(1 - y * y);
  const angle = i * Math.PI * (3 - Math.sqrt(5));
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    y,
    Math.sin(angle) * radius,
  ).multiplyScalar(2.05);
});

export default function SpatialLab({ paused }: { paused: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  const sceneState = useRef<{
    group: THREE.Group;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
  } | null>(null);
  const pausedRef = useRef(paused);
  const orbitRef = useRef(true);
  const [orbiting, setOrbiting] = useState(true);
  const [available, setAvailable] = useState(true);
  const [reduced, setReduced] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    orbitRef.current = orbiting;
  }, [orbiting]);

  useEffect(() => {
    if (window.location.hash !== "#spatial") return;
    const frame = requestAnimationFrame(() => document.getElementById("spatial")?.scrollIntoView({ behavior: "instant" }));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduced(query.matches);
    syncMotion();
    query.addEventListener("change", syncMotion);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setAvailable(false);
      query.removeEventListener("change", syncMotion);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      "aria-label",
      "Interactive three-dimensional network sculpture. Drag to rotate.",
    );
    renderer.domElement.setAttribute("role", "img");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.3, 8.6);
    const group = new THREE.Group();
    group.rotation.set(0.17, -0.35, 0.15);
    scene.add(group);
    scene.add(new THREE.AmbientLight(0xfff7e7, 1.8));
    const orangeLight = new THREE.PointLight(0xf18f5b, 52, 14);
    orangeLight.position.set(4, 4, 5);
    scene.add(orangeLight);
    const greenLight = new THREE.PointLight(0xa0e9bd, 35, 14);
    greenLight.position.set(-4, -3, 2);
    scene.add(greenLight);

    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.3, 2),
      new THREE.MeshPhysicalMaterial({
        color: 0x1d382f,
        metalness: 0.58,
        roughness: 0.18,
        transparent: true,
        opacity: 0.62,
        side: THREE.DoubleSide,
      }),
    );
    group.add(inner);
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.4, 1)),
      new THREE.LineBasicMaterial({
        color: 0xf2a06e,
        transparent: true,
        opacity: 0.5,
      }),
    );
    group.add(wire);
    const nodeGeometry = new THREE.SphereGeometry(0.085, 10, 10);
    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8f1cc,
      emissive: 0x62c894,
      emissiveIntensity: 1.4,
      metalness: 0.3,
      roughness: 0.25,
    });
    points.forEach((position, i) => {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.copy(position);
      node.scale.setScalar(i % 5 === 0 ? 1.65 : 1);
      group.add(node);
    });
    const edges: number[] = [];
    points.forEach((point, i) => {
      const nearest = points
        .map((other, j) => ({ j, distance: point.distanceTo(other) }))
        .filter(({ j }) => j !== i)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
      nearest.forEach(({ j }) => {
        if (j > i) edges.push(...point.toArray(), ...points[j].toArray());
      });
    });
    const connections = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.Float32BufferAttribute(edges, 3),
      ),
      new THREE.LineBasicMaterial({
        color: 0x80b9a1,
        transparent: true,
        opacity: 0.48,
      }),
    );
    group.add(connections);
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.45 + i * 0.24, 0.009, 5, 140),
        new THREE.MeshBasicMaterial({
          color: i === 1 ? 0xe18d60 : 0x8acbad,
          transparent: true,
          opacity: i === 1 ? 0.7 : 0.4,
        }),
      );
      ring.rotation.set(0.55 + i * 0.7, 0.25 + i * 0.55, i * 0.8);
      group.add(ring);
      rings.push(ring);
    }
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffaa73 }),
    );
    group.add(halo);
    const dustPositions = new Float32Array(180 * 3);
    for (let i = 0; i < 180; i++) {
      const angle = i * 2.399963;
      const radius = 2.8 + (i % 13) * 0.12;
      dustPositions[i * 3] = Math.cos(angle) * radius;
      dustPositions[i * 3 + 1] = ((i * 37) % 100) / 20 - 2.5;
      dustPositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const dust = new THREE.Points(
      new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.BufferAttribute(dustPositions, 3),
      ),
      new THREE.PointsMaterial({
        color: 0x9ac6ad,
        size: 0.025,
        transparent: true,
        opacity: 0.65,
      }),
    );
    scene.add(dust);
    sceneState.current = { group, camera, renderer };
    const resize = () => {
      const width = host.clientWidth,
        height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 600 ? 13 : 8.6;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    let visible = true;
    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "150px" },
    );
    intersection.observe(host);
    let frame = 0;
    const start = performance.now();
    const tick = (time: number) => {
      frame = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      if (!pausedRef.current && !query.matches) {
        if (orbitRef.current && !drag.current) group.rotation.y += 0.0024;
        rings[0].rotation.z += 0.0012;
        rings[1].rotation.y -= 0.0016;
        halo.position.copy(
          points[Math.floor((Math.max(0, time - start) / 520) % points.length)],
        );
      }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      query.removeEventListener("change", syncMotion);
      sceneState.current = null;
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const materials = mesh.material
          ? Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material]
          : [];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !sceneState.current || reduced) return;
    const deltaX = event.clientX - drag.current.x,
      deltaY = event.clientY - drag.current.y;
    sceneState.current.group.rotation.y += deltaX * 0.008;
    sceneState.current.group.rotation.x += deltaY * 0.008;
    drag.current = { x: event.clientX, y: event.clientY };
  };
  const reset = () => {
    if (sceneState.current)
      sceneState.current.group.rotation.set(0.17, -0.35, 0.15);
  };

  return (
    <section
      id="spatial"
      className="spatial-section section-shell"
      aria-labelledby="spatial-title"
    >
      <div className="spatial-head">
        <div>
          <span className="eyebrow">
            <span className="tiny-cross">+</span> INTERACTIVE SYSTEMS LAB / 02
          </span>
          <h2 id="spatial-title">
            See the system
            <br />
            <em>from every side.</em>
          </h2>
        </div>
        <p>
          Architecture is spatial. Drag the object to inspect its nodes, links,
          and paths in actual 3D.
        </p>
      </div>
      <div className="spatial-stage">
        <div className="spatial-corner spatial-corner-top">
          <span>
            <i /> LIVE OBJECT / NETWORK 024
          </span>
          <span>THREE-DIMENSIONAL STUDY</span>
        </div>
        <div className="spatial-orbit-label" aria-hidden="true">
          A SYSTEM
          <br />
          IN MOTION<span>↗</span>
        </div>
        <div
          ref={mount}
          className="spatial-canvas"
          onPointerDown={(event) => {
            if (reduced) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerMove={move}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          {!available && (
            <div className="spatial-fallback">
              <Box size={45} />
              <span>3D preview is unavailable in this browser.</span>
            </div>
          )}
        </div>
        <div className="spatial-axis" aria-hidden="true">
          <span>Y</span>
          <i />
          <span>X</span>
        </div>
        <div className="spatial-corner spatial-corner-bottom">
          <div>
            <Move3D size={16} /> DRAG TO ROTATE <span>·</span> 24 NODES /
            CONNECTED GRAPH
          </div>
          <div className="spatial-actions">
            <button
              aria-pressed={orbiting}
              onClick={() => setOrbiting(!orbiting)}
            >
              {orbiting ? "PAUSE ORBIT" : "AUTO ORBIT"}
            </button>
            <button aria-label="Reset 3D view" onClick={reset}>
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>
      <p className="spatial-note">
        A speculative visualization of connected architecture, built with WebGL.
        The graph above is interactive; the object here is a spatial study.
      </p>
    </section>
  );
}

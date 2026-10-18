import { lazy, Suspense, useEffect, useState } from "react";
import { motion, MotionConfig } from "motion/react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Check,
  Code2,
  Eye,
  GitBranch as Github,
  SquareArrowOutUpRight as Linkedin,
  Menu,
  Pause,
  Play,
  Plus,
  Search,
  X,
} from "lucide-react";
import WireSculpture from "./components/WireSculpture";
import SignalField from "./components/SignalField";
import PetStudio from "./components/PetStudio";
import NetworkPlayground from "./components/NetworkPlayground";
import WelcomeExperience from "./components/WelcomeExperience";
import { ProjectPeek, QuickFinder } from "./components/PortfolioOverlays";
import { profile, projects, realProjects } from "./config";

const ProjectPage = lazy(() => import("./projects/ProjectPage"));
const SpatialLab = lazy(() => import("./components/SpatialLab"));
const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.65 },
};

function Clock() {
  const format = () =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: profile.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = window.setInterval(() => setTime(format()), 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <span>
      {profile.location} <span className="clock-dot">↗</span> {time}
    </span>
  );
}

export function Header({
  project = false,
  onOpenFinder,
}: {
  project?: boolean;
  onOpenFinder?: () => void;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="site-header">
      <a href="/" className="wordmark" aria-label={`${profile.name}, home`}>
        anant<span className="brand-star">✳</span>
      </a>
      <nav
        className={open ? "main-nav open" : "main-nav"}
        aria-label="Main navigation"
      >
        {["Work", "Network", "About", "Contact"].map((item) => (
          <a
            key={item}
            href={`${project ? "/" : ""}#${item.toLowerCase()}`}
            onClick={() => setOpen(false)}
          >
            {item}
            <span>↗</span>
          </a>
        ))}
      </nav>
      <a className="availability" href={`${project ? "/" : ""}#contact`}>
        <span /> {profile.available ? "Open to opportunities" : "Let’s connect"}
      </a>
      {onOpenFinder && (
        <button
          className="finder-trigger"
          onClick={onOpenFinder}
          aria-label="Open quick finder"
        >
          <Search size={15} />
          <span>Explore</span>
          <kbd>⌘ K</kbd>
        </button>
      )}
      <button
        className="menu-toggle icon-button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}

function Home() {
  useEffect(() => {
    // React mounts after the browser's initial fragment scroll on a fresh load.
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(window.location.hash.slice(1));
      target?.scrollIntoView({ behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const [paused, setPaused] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [peekId, setPeekId] = useState<string | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(
    () => new URLSearchParams(window.location.search).get("intro") !== "0",
  );
  const closeWelcome = () => {
    setWelcomeOpen(false);
    const url = new URL(window.location.href);
    if (url.searchParams.get("intro") === "1") {
      url.searchParams.delete("intro");
      window.history.replaceState(
        null,
        "",
        url.pathname + url.search + url.hash,
      );
    }
  };
  const peekProject = projects.find((project) => project.id === peekId);
  useEffect(() => {
    const openFinder = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.matches(
        "input, textarea, select, [contenteditable='true']",
      );
      if (typing || finderOpen || peekId) return;
      if (
        (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey)
      ) {
        event.preventDefault();
        setFinderOpen(true);
      }
    };
    window.addEventListener("keydown", openFinder);
    return () => window.removeEventListener("keydown", openFinder);
  }, [finderOpen, peekId]);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(id);
  }, [copied]);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };
  return (
    <div className={paused ? "site motion-paused" : "site"}>
      <div
        className="reading-progress"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header onOpenFinder={() => setFinderOpen(true)} />
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-topline">
            <span className="eyebrow">
              <span className="tiny-cross">+</span> ANANT SINGH /{" "}
              {profile.role.toUpperCase()}
            </span>
            <span className="hero-index">PORTFOLIO — 2026</span>
          </div>
          <div className="hero-layout">
            <div className="hero-copy">
              <motion.div
                className="hero-byline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <span className="hero-byline-line" /> HI, I’M{" "}
                <strong>ANANT SINGH</strong>
              </motion.div>
              <motion.h1
                id="hero-title"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Interfaces
                <br />
                with a pulse.
                <br />
                <span>
                  Built to <em>hold up.</em>
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                I’m Anant Singh. I build expressive frontends with a full stack
                <br className="desktop-break" /> understanding of what makes
                them work.
              </motion.p>
              <motion.a
                href="#work"
                className="round-link"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="circle-button">
                  <ArrowDown size={19} />
                </span>{" "}
                Explore my work
              </motion.a>
            </div>
            <div
              className="hero-art"
              onPointerMove={(event) => {
                if (paused) return;
                const bounds = event.currentTarget.getBoundingClientRect();
                const x =
                  ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
                const y =
                  ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
                event.currentTarget.style.setProperty(
                  "--depth-x",
                  `${x * 15}px`,
                );
                event.currentTarget.style.setProperty(
                  "--depth-y",
                  `${y * 15}px`,
                );
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.setProperty("--depth-x", "0px");
                event.currentTarget.style.setProperty("--depth-y", "0px");
              }}
            >
              <div className="hero-depth-halo" aria-hidden="true" />
              <div className="hero-depth-orbit" aria-hidden="true" />
              <div className="hero-depth-chip hero-chip-a" aria-hidden="true">
                01 / MOTION
              </div>
              <div className="hero-depth-chip hero-chip-b" aria-hidden="true">
                REACT ↗ SYSTEMS
              </div>
              <div className="art-coordinate top-left">FIG. 001</div>
              <div className="art-cross top-right">+</div>
              <WireSculpture paused={paused} />
              <div className="orbit-label">
                <span /> FRONTEND × SYSTEMS
              </div>
              <div className="art-caption">
                <span>INPUT → INTERACTION → FEELING</span>
                <button
                  className="motion-toggle"
                  onClick={() => setPaused(!paused)}
                  aria-label={paused ? "Play animations" : "Pause animations"}
                >
                  {paused ? <Play size={12} /> : <Pause size={12} />}{" "}
                  {paused ? "PLAY" : "PAUSE"}
                </button>
              </div>
            </div>
          </div>
          <div className="hero-footer">
            <span>
              <span className="tiny-cross">+</span> From the first pixel to the
              systems behind it.
            </span>
            <Clock />
          </div>
        </section>
        <div className="skills-strip" aria-label="Technologies and interests">
          <div className="skills-track">
            {[0, 1].map((copy) => (
              <div className="skills-set" key={copy} aria-hidden={copy === 1}>
                {[
                  "REACT",
                  "TYPESCRIPT",
                  "GO",
                  "RUST",
                  "REAL-TIME SYSTEMS",
                  "CREATIVE DEVELOPMENT",
                ].map((skill) => (
                  <span key={skill}>
                    {skill}
                    <Asterisk size={17} />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <section
          id="work"
          className="work-section section-shell"
          aria-labelledby="work-title"
        >
          <motion.div className="section-heading" {...reveal}>
            <div>
              <span className="eyebrow">
                <span className="tiny-cross">+</span> SELECTED WORK / 01—04
              </span>
              <h2 id="work-title">
                Ideas, made tangible<span className="orange">.</span>
              </h2>
            </div>
            <p>
              Four explorations in making the web
              <br />a more useful, beautiful place.
            </p>
          </motion.div>
          <div className="project-grid">
            {projects.map((project) => (
              <motion.article
                key={project.id}
                className={`project-card project-${project.id}`}
                {...reveal}
              >
                <div className="project-media">
                  <a
                    href={`/projects/${project.id}`}
                    className="project-image-link"
                    aria-label={`Explore ${project.name} project`}
                  >
                    <div
                      className="project-cover"
                      onPointerMove={(event) => {
                        const bounds =
                          event.currentTarget.getBoundingClientRect();
                        const x =
                          ((event.clientX - bounds.left) / bounds.width - 0.5) *
                          2;
                        const y =
                          ((event.clientY - bounds.top) / bounds.height - 0.5) *
                          2;
                        event.currentTarget.style.setProperty(
                          "--tilt-x",
                          `${-y * 7}deg`,
                        );
                        event.currentTarget.style.setProperty(
                          "--tilt-y",
                          `${x * 7}deg`,
                        );
                        event.currentTarget.style.setProperty(
                          "--spot-x",
                          `${(x + 1) * 50}%`,
                        );
                        event.currentTarget.style.setProperty(
                          "--spot-y",
                          `${(y + 1) * 50}%`,
                        );
                      }}
                      onPointerLeave={(event) => {
                        event.currentTarget.style.setProperty(
                          "--tilt-x",
                          "0deg",
                        );
                        event.currentTarget.style.setProperty(
                          "--tilt-y",
                          "0deg",
                        );
                      }}
                    >
                      <div className="cover-meta">
                        <span>{project.type}</span>
                        <span>{project.number} / 04</span>
                      </div>
                      <div className="preview-container" aria-hidden="true">
                        <img
                          className="preview-window preview-image"
                          src={`/previews/${project.id}.png`}
                          alt=""
                          loading="lazy"
                          width="980"
                          height="592"
                        />
                      </div>
                      <span className="project-open">
                        <ArrowUpRight size={22} />
                      </span>
                      <span className="preview-live">
                        <span /> INTERACTIVE DEMO
                      </span>
                    </div>
                  </a>
                  <button
                    className="project-peek-button"
                    onClick={() => setPeekId(project.id)}
                    aria-label={`Quick preview of ${project.name}`}
                  >
                    <Eye size={13} /> QUICK PEEK <span>+</span>
                  </button>
                </div>
                <div className="project-details">
                  <div>
                    <a href={`/projects/${project.id}`}>
                      <h3>{project.name}</h3>
                    </a>
                    <p>{project.description}</p>
                  </div>
                  <a
                    className="project-arrow"
                    href={`/projects/${project.id}`}
                    aria-label={`View ${project.name}`}
                  >
                    <ArrowUpRight size={24} />
                  </a>
                </div>
                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                  <span className="project-year">{project.year}</span>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="work-note">
            <Code2 size={15} />
            <span>
              Four original concept projects. Designed, built, and ready to
              explore.
            </span>
            <a href={profile.github} target="_blank" rel="noreferrer">
              More on GitHub <ArrowUpRight size={14} />
            </a>
          </div>
        </section>
        <section
          id="proof"
          className="proof-section section-shell"
          aria-labelledby="proof-title"
        >
          <motion.div className="proof-heading" {...reveal}>
            <span className="eyebrow">
              <span className="tiny-cross">+</span> IN THE OPEN / ENGINEERING
              WORK
            </span>
            <h2 id="proof-title">
              The work goes <em>deeper.</em>
            </h2>
            <p>
              These are real public repositories from my GitHub. They show the
              range behind the interfaces: product UI, collaboration, and
              distributed delivery.
            </p>
          </motion.div>
          <div className="signal-panel">
            <SignalField paused={paused} />
            <div className="signal-panel-content">
              <span className="signal-kicker">
                <span /> ANANT / BUILD GRAPH
              </span>
              <div className="signal-core" aria-hidden="true">
                <span>A</span>
                <i />
                <i />
              </div>
              <div className="signal-bottom">
                <span>Interface is where people meet the system.</span>
                <span>MOVE / TAP TO PING ↗</span>
              </div>
            </div>
          </div>
          <div className="real-project-list">
            {realProjects.map((project) => (
              <motion.article
                className="real-project"
                key={project.name}
                {...reveal}
              >
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`View ${project.name} source on GitHub`}
                >
                  <span className="real-number">{project.number} / 03</span>
                  <span
                    className="real-project-symbol"
                    style={{ background: project.accent }}
                    aria-hidden="true"
                  >
                    {project.name === "Inspectra"
                      ? "↗"
                      : project.name === "Raft"
                        ? "≋"
                        : "◌"}
                  </span>
                  <span className="real-project-copy">
                    <small>{project.kind}</small>
                    <strong>{project.name}</strong>
                    <span>{project.summary}</span>
                    <small className="real-stack">{project.detail}</small>
                  </span>
                  <span className="real-project-action">
                    <ArrowUpRight size={22} />
                  </span>
                </a>
              </motion.article>
            ))}
          </div>
        </section>
        <NetworkPlayground paused={paused} />
        <Suspense
          fallback={
            <div className="spatial-loading section-shell">
              Preparing the 3D view…
            </div>
          }
        >
          <SpatialLab paused={paused} />
        </Suspense>
        <section
          id="about"
          className="about-section section-shell"
          aria-labelledby="about-title"
        >
          <motion.div className="about-left" {...reveal}>
            <span className="eyebrow">
              <span className="tiny-cross">+</span> THE PERSON BEHIND THE PIXELS
            </span>
            <h2 id="about-title">
              Pixels, protocols
              <br />
              &amp; <span className="serif-word">everything between.</span>
            </h2>
            <div className="about-graphic" aria-hidden="true">
              <div className="graphic-lines">
                {Array.from({ length: 8 }, (_, i) => (
                  <span
                    key={i}
                    style={{ transform: `rotate(${i * 22.5}deg)` }}
                  />
                ))}
              </div>
              <div className="graphic-label">
                BUILD. LEARN. REPEAT.
                <ArrowDownRight size={24} />
              </div>
            </div>
          </motion.div>
          <motion.div className="about-right" {...reveal}>
            <h3>
              I’m Anant. I like the part you see,
              <br />
              and the machinery that makes it possible.
            </h3>
            <p>{profile.bio}</p>
            <p>
              My projects have taken me from a React code review interface to
              real-time document sync and peer-to-peer file delivery. I bring
              that range back to the browser, where I care about performance,
              accessibility, and the small interactions people actually notice.
            </p>
            <div className="principles">
              {[
                [
                  "01",
                  "In the browser",
                  "React and TypeScript interfaces, responsive layouts, and intentional motion.",
                ],
                [
                  "02",
                  "In real time",
                  "Raft pairs a Rust CRDT core with a Go sync server and a TypeScript SDK.",
                ],
                [
                  "03",
                  "Across the network",
                  "PeerCDN uses verified chunks, WebSockets, and direct peer transfers.",
                ],
              ].map(([n, title, text]) => (
                <div key={n}>
                  <span>{n}</span>
                  <div>
                    <h4>{title}</h4>
                    <p>{text}</p>
                  </div>
                  <Plus size={15} />
                </div>
              ))}
            </div>
            <div className="about-links">
              <a href={profile.github} target="_blank" rel="noreferrer">
                <Github size={16} /> GitHub <ArrowUpRight size={14} />
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                <Linkedin size={16} /> LinkedIn <ArrowUpRight size={14} />
              </a>
              <a href={profile.leetcode} target="_blank" rel="noreferrer">
                LeetCode <ArrowUpRight size={14} />
              </a>
              {profile.resume && (
                <a href={profile.resume} target="_blank" rel="noreferrer">
                  Résumé <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </motion.div>
        </section>
        <section
          id="contact"
          className="contact-section section-shell"
          aria-labelledby="contact-title"
        >
          <div className="contact-top">
            <span className="eyebrow">
              <span className="tiny-cross">+</span> NEXT CHAPTER
            </span>
            <span className="availability">
              <span />{" "}
              {profile.available
                ? "AVAILABLE FOR THE RIGHT OPPORTUNITY"
                : "ALWAYS OPEN TO A GOOD CONVERSATION"}
            </span>
          </div>
          <motion.div className="contact-main" {...reveal}>
            <div>
              <h2 id="contact-title">
                Let’s make
                <br />
                <span>
                  something <em>great.</em>
                </span>
              </h2>
              <p>
                Have an interesting role or a project in mind?
                <br />
                I’d love to hear what you’re thinking.
              </p>
            </div>
            <a
              className="contact-arrow"
              href={
                profile.email ? `mailto:${profile.email}` : profile.linkedin
              }
              target={profile.email ? undefined : "_blank"}
              rel="noreferrer"
              aria-label={
                profile.email ? "Email Anant" : "Connect with Anant on LinkedIn"
              }
            >
              <ArrowUpRight strokeWidth={1.2} />
            </a>
          </motion.div>
          <div className="contact-bottom">
            <a
              href={
                profile.email ? `mailto:${profile.email}` : profile.linkedin
              }
              target={profile.email ? undefined : "_blank"}
              rel="noreferrer"
            >
              {profile.email || "Say hello on LinkedIn"}
              <ArrowUpRight size={19} />
            </a>
            {profile.email && (
              <button onClick={copyEmail}>
                {copied ? <Check size={16} /> : <Plus size={16} />}
                {copied ? "Copied" : "Copy email"}
              </button>
            )}
            <span role="status">
              {copyError
                ? `Email: ${profile.email}`
                : "Good conversations are where good things begin."}
            </span>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a href="/" className="wordmark">
          anant<span className="brand-star">✳</span>
        </a>
        <span>
          © {new Date().getFullYear()} {profile.name}. Made with intention.
        </span>
        <div>
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={13} />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn <ArrowUpRight size={13} />
          </a>
          <a href={profile.leetcode} target="_blank" rel="noreferrer">
            LeetCode <ArrowUpRight size={13} />
          </a>
          <a href="#" className="back-top">
            Back to top <ArrowRight size={13} />
          </a>
          <button className="replay-intro" onClick={() => setWelcomeOpen(true)}>
            Replay intro <ArrowUpRight size={13} />
          </button>
        </div>
      </footer>
      {welcomeOpen && <WelcomeExperience onClose={closeWelcome} />}
      {finderOpen && <QuickFinder onClose={() => setFinderOpen(false)} />}
      {peekProject && (
        <ProjectPeek project={peekProject} onClose={() => setPeekId(null)} />
      )}
      <PetStudio paused={paused} />
    </div>
  );
}

export default function App() {
  const path = window.location.pathname;
  const projectId = path.match(/^\/projects\/([^/]+)\/?$/)?.[1];
  const validProject = Boolean(
    projectId && projects.some((p) => p.id === projectId),
  );
  return (
    <MotionConfig reducedMotion="user">
      {path === "/" ? (
        <Home />
      ) : validProject && projectId ? (
        <Suspense
          fallback={
            <div className="loading-screen">
              Loading the good stuff<span>…</span>
            </div>
          }
        >
          <ProjectPage id={projectId} />
        </Suspense>
      ) : (
        <div className="not-found">
          <span className="eyebrow">404 / A SMALL DETOUR</span>
          <h1>
            Nothing here.
            <br />
            Plenty over there.
          </h1>
          <a className="dark-button" href="/">
            Back to the portfolio <ArrowUpRight size={18} />
          </a>
        </div>
      )}
      {validProject && <PetStudio paused={false} />}
    </MotionConfig>
  );
}

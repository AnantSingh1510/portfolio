import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Box,
  Network,
  Sparkles,
} from "lucide-react";
import { Dialog } from "../projects/shared";
import "./WelcomeExperience.css";

const paths = [
  {
    id: "work",
    number: "01",
    icon: Sparkles,
    title: "See what I build",
    detail: "Four live ideas you can actually use",
    tone: "orange",
  },
  {
    id: "network",
    number: "02",
    icon: Network,
    title: "Break the network",
    detail: "Route packets and trace the system",
    tone: "green",
  },
  {
    id: "spatial",
    number: "03",
    icon: Box,
    title: "Enter the 3D lab",
    detail: "Grab the object and turn it around",
    tone: "cream",
  },
] as const;

export default function WelcomeExperience({
  onClose,
}: {
  onClose: () => void;
}) {
  const [preview, setPreview] = useState<(typeof paths)[number] | null>(null);
  const go = (id: string) => {
    onClose();
    window.setTimeout(() => {
      const hash = `#${id}`;
      window.history.pushState(null, "", hash);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };
  return (
    <Dialog
      title="Welcome to Anant’s portfolio"
      onClose={onClose}
      className="welcome-dialog"
    >
      <div className="welcome-body">
        <div
          className="welcome-art"
          data-route={preview?.id ?? "home"}
          aria-hidden="true"
        >
          <div className="welcome-art-grid" />
          <div className="welcome-art-top">
            <span>
              <i /> SYSTEMS ONLINE
            </span>
            <span>01 / 01</span>
          </div>
          <div className="welcome-orbit orbit-outer" />
          <div className="welcome-orbit orbit-middle" />
          <div className="welcome-orbit orbit-inner" />
          <div className="welcome-monogram">
            A<span>✳</span>
          </div>
          <span className="welcome-node node-one" />
          <span className="welcome-node node-two" />
          <span className="welcome-node node-three" />
          <div className="welcome-art-bottom">
            <span>
              {preview
                ? `ROUTE ${preview.number} / ${preview.title.toUpperCase()}`
                : "FRONTEND × SYSTEMS"}
            </span>
            <span>{preview ? "READY TO ENTER ↗" : "BUILT TO EXPLORE ↗"}</span>
          </div>
        </div>
        <div className="welcome-copy">
          <span className="welcome-kicker">
            <span>✳</span> A NOTE FROM ANANT / WELCOME IN
          </span>
          <h3>
            Welcome to
            <br />
            the <em>workshop.</em>
          </h3>
          <p>
            I’m Anant Singh, a full stack developer who makes expressive
            interfaces and enjoys the systems beneath them. This place is meant
            to be explored, not just scrolled.
          </p>
          <span className="welcome-path-label">
            PICK A WAY IN <ArrowDownRight size={15} />
          </span>
          <div className="welcome-paths">
            {paths.map((path, index) => {
              const { id, number, icon: Icon, title, detail, tone } = path;
              return (
                <button
                  key={id}
                  className={`welcome-path tone-${tone}`}
                  data-autofocus={index === 0 ? "" : undefined}
                  onMouseEnter={() => setPreview(path)}
                  onMouseLeave={() => setPreview(null)}
                  onFocus={() => setPreview(path)}
                  onClick={() => go(id)}
                >
                  <span className="welcome-path-number">{number}</span>
                  <span className="welcome-path-icon">
                    <Icon size={18} />
                  </span>
                  <span className="welcome-path-copy">
                    <strong>{title}</strong>
                    <small>{detail}</small>
                  </span>
                  <ArrowUpRight className="welcome-path-arrow" size={18} />
                </button>
              );
            })}
          </div>
          <button className="welcome-skip" onClick={onClose}>
            I’ll explore on my own <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </Dialog>
  );
}

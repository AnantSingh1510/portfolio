import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  FolderOpen,
  Search,
  Sparkles,
} from "lucide-react";
import { projects, profile, realProjects } from "../config";
import { Dialog } from "../projects/shared";
import "./PortfolioOverlays.css";

type Project = (typeof projects)[number];

const destinations = [
  {
    label: "Selected work",
    detail: "Four interactive concept projects",
    group: "PAGE",
    href: "#work",
  },
  ...projects.map((project) => ({
    label: project.name,
    detail: project.description,
    group: "PROJECT",
    href: `/projects/${project.id}`,
  })),
  {
    label: "Engineering work",
    detail: "Inspectra, Raft, and PeerCDN",
    group: "PAGE",
    href: "#proof",
  },
  {
    label: "Networking playground",
    detail: "Route packets, fail links, compare TCP and UDP",
    group: "INTERACTIVE",
    href: "#network",
  },
  {
    label: "3D architecture study",
    detail: "Drag and rotate a WebGL network object",
    group: "INTERACTIVE",
    href: "#spatial",
  },
  ...realProjects.map((project) => ({
    label: project.name,
    detail: project.kind,
    group: "GITHUB",
    href: project.url,
  })),
  {
    label: "About Anant",
    detail: "The person behind the pixels",
    group: "PAGE",
    href: "#about",
  },
  {
    label: "Get in touch",
    detail: "Connect on LinkedIn",
    group: "CONTACT",
    href: profile.linkedin,
  },
];

export function QuickFinder({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term
      ? destinations.filter((item) =>
          `${item.label} ${item.detail} ${item.group}`
            .toLowerCase()
            .includes(term),
        )
      : destinations;
  }, [query]);
  const open = (href: string) => {
    if (href.startsWith("#")) {
      onClose();
      window.setTimeout(() => {
        window.history.pushState(null, "", href);
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }, 30);
    } else if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
      onClose();
    } else {
      window.location.assign(href);
    }
  };
  return (
    <Dialog
      title="Find your way"
      onClose={onClose}
      className="portfolio-dialog finder-dialog"
    >
      <div className="finder-intro">
        <Sparkles size={15} /> A faster way to explore the portfolio.
      </div>
      <div className="finder-input-wrap">
        <Search size={19} />
        <input
          data-autofocus
          type="search"
          aria-label="Search pages and projects"
          placeholder="Search projects, work, contact…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setSelected((index) => Math.min(index + 1, results.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setSelected((index) => Math.max(0, index - 1));
            }
            if (event.key === "Enter" && results[selected]) {
              event.preventDefault();
              open(results[selected].href);
            }
          }}
        />
        <kbd>/</kbd>
      </div>
      <div className="finder-results" aria-label="Search results">
        {results.length ? (
          results.map((item, index) => (
            <button
              key={`${item.group}-${item.label}`}
              className={
                selected === index ? "finder-result selected" : "finder-result"
              }
              onMouseEnter={() => setSelected(index)}
              onClick={() => open(item.href)}
            >
              <span className="finder-result-icon">
                {item.group === "PROJECT" ? (
                  <FolderOpen size={17} />
                ) : item.group === "GITHUB" ? (
                  <ArrowUpRight size={17} />
                ) : (
                  <ArrowRight size={17} />
                )}
              </span>
              <span className="finder-result-copy">
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </span>
              <span className="finder-result-kind">{item.group}</span>
            </button>
          ))
        ) : (
          <div className="finder-empty">
            No matches. Try “React,” “Raft,” or “contact.”
          </div>
        )}
      </div>
      <div className="finder-footer">
        <span>
          ↑ ↓ TO MOVE <b>·</b> ↵ TO OPEN
        </span>
        <span>ESC TO CLOSE</span>
      </div>
    </Dialog>
  );
}

export function ProjectPeek({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <Dialog
      title={`${project.name} project preview`}
      onClose={onClose}
      className="portfolio-dialog project-peek-dialog"
    >
      <div className="peek-layout">
        <div className={`peek-art peek-${project.id}`}>
          <span>PROJECT / {project.number}</span>
          <img
            src={`/previews/${project.id}.png`}
            alt={`${project.name} interface preview`}
            width="980"
            height="592"
          />
          <span>INTERACTIVE CONCEPT ↗</span>
        </div>
        <div className="peek-content">
          <span className="peek-kicker">
            {project.type} / {project.year}
          </span>
          <h3>
            {project.name}
            <span>.</span>
          </h3>
          <p>{project.detail}</p>
          <div className="peek-facts">
            <div>
              <span>THE CHALLENGE</span>
              <p>{project.challenge}</p>
            </div>
            <div>
              <span>THE APPROACH</span>
              <p>{project.approach}</p>
            </div>
          </div>
          <div className="peek-bottom">
            <div>
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <a href={`/projects/${project.id}`}>
              Explore the live demo <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

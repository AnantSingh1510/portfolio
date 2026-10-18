import { useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
} from "lucide-react";
import { Header } from "../App";
import { projects } from "../config";
import Orbit from "./Orbit";
import Store from "./Store";
import Margin from "./Margin";
import Prism from "./Prism";
import "./projects.css";

export default function ProjectPage({ id }: { id: string }) {
  const project = projects.find((p) => p.id === id)!;
  const next =
    projects[(projects.findIndex((p) => p.id === id) + 1) % projects.length];
  useEffect(() => {
    document.title = `${project.name} — Anant Singh`;
  }, [project.name]);
  return (
    <div className="project-page">
      <a className="skip-link" href="#playground">
        Skip to interactive demo
      </a>
      <Header project />
      <main>
        <div className="project-intro">
          <a className="back-link" href="/#work">
            <ArrowLeft size={15} /> Back to selected work
          </a>
          <div className="project-page-heading">
            <div>
              <span className="eyebrow">
                PROJECT {project.number} / {project.type}
              </span>
              <h1>
                {project.name}
                <span>.</span>
              </h1>
              <p>{project.detail}</p>
            </div>
            <a className="dark-button" href="#playground">
              Try the live demo <ArrowRight size={16} />
            </a>
          </div>
          <div className="project-facts">
            <div>
              <span>ROLE</span>
              <p>Design & frontend development</p>
            </div>
            <div>
              <span>BUILT WITH</span>
              <p>{project.tags.join(" · ")}</p>
            </div>
            <div>
              <span>CONTEXT</span>
              <p>Original concept project · {project.year}</p>
            </div>
          </div>
        </div>
        <section
          className="playground-section"
          id="playground"
          aria-label={`${project.name} interactive demo`}
        >
          <div className="playground-label">
            <span>
              <i /> LIVE PLAYGROUND
            </span>
            <span>Go ahead. Make yourself at home.</span>
          </div>
          {id === "orbit" ? (
            <Orbit />
          ) : id === "form" ? (
            <Store />
          ) : id === "margin" ? (
            <Margin />
          ) : (
            <Prism />
          )}
        </section>
        <section className="project-story" aria-label="Project details">
          <div>
            <span className="eyebrow">THE CHALLENGE</span>
            <h2>
              Thoughtfully considered.
              <br />
              Purposefully built.
            </h2>
            <p>{project.challenge}</p>
          </div>
          <div>
            <span className="eyebrow">THE APPROACH</span>
            <p>{project.approach}</p>
            <ul>
              {project.features.map((f) => (
                <li key={f}>
                  <Check size={15} />
                  {f}
                </li>
              ))}
            </ul>
            <p className="project-honesty">
              <Code2 size={15} /> Frontend concept demo. Data is stored locally
              in your browser; there is no backend or user account.
            </p>
          </div>
        </section>
        <a className="next-project" href={`/projects/${next.id}`}>
          <div>
            <span className="eyebrow">UP NEXT / {next.number}</span>
            <h2>{next.name}</h2>
          </div>
          <ArrowUpRight size={42} strokeWidth={1} />
        </a>
      </main>
      <footer className="project-footer">
        <span>© {new Date().getFullYear()} Anant Singh</span>
        <a href="/">
          Back to the portfolio <ArrowUpRight size={14} />
        </a>
      </footer>
    </div>
  );
}

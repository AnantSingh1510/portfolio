import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  RotateCcw,
  Router,
  Send,
  ShieldAlert,
} from "lucide-react";
import {
  linkLatency,
  nodes,
  routeLinkIds,
  shortestRoute,
  simulatePackets,
  topologies,
  type Protocol,
  type Topology,
} from "./networkSim";
import "./NetworkPlayground.css";

const labels: Record<Topology, string> = {
  mesh: "Mesh",
  ring: "Ring",
  star: "Star",
};
const nodeById = Object.fromEntries(
  nodes.map((node) => [node.id, node]),
) as Record<(typeof nodes)[number]["id"], (typeof nodes)[number]>;

export default function NetworkPlayground({ paused }: { paused: boolean }) {
  const [topology, setTopology] = useState<Topology>("mesh");
  const [protocol, setProtocol] = useState<Protocol>("TCP");
  const [congestion, setCongestion] = useState(20);
  const [loss, setLoss] = useState(12);
  const [count, setCount] = useState(6);
  const [blocked, setBlocked] = useState<Set<string>>(() => new Set());
  const [run, setRun] = useState(0);
  const [result, setResult] = useState<ReturnType<
    typeof simulatePackets
  > | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const links = topologies[topology];
  const route = useMemo(
    () => shortestRoute(links, blocked, congestion),
    [links, blocked, congestion],
  );
  const activeIds = routeLinkIds(route);
  const baseOneWay = route
    ? route.slice(1).reduce(
        (sum, id, index) =>
          sum +
          linkLatency(
            links.find(
              (link) => link.id === [route[index], id].sort().join("-"),
            )!,
            congestion,
          ),
        0,
      )
    : 0;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!run || paused || reduceMotion || !route) {
      setProgress(null);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const draw = (time: number) => {
      const next = Math.min(1, (time - start) / 1550);
      setProgress(next);
      if (next < 1) frame = requestAnimationFrame(draw);
      else setProgress(null);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [run, paused, reduceMotion, route]);

  const configure = (change: () => void) => {
    change();
    setResult(null);
    setProgress(null);
  };
  const toggleLink = (id: string) =>
    configure(() =>
      setBlocked((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    );
  const launch = () => {
    setResult(
      simulatePackets({
        links,
        route,
        protocol,
        congestion,
        loss,
        count,
        run: run + 1,
      }),
    );
    setRun((value) => value + 1);
  };
  const point = (() => {
    if (progress === null || !route) return null;
    const scaled = progress * (route.length - 1);
    const index = Math.min(route.length - 2, Math.floor(scaled));
    const fraction = scaled - index;
    const a = nodeById[route[index]];
    const b = nodeById[route[index + 1]];
    return { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction };
  })();

  return (
    <section
      className="network-section section-shell"
      id="network"
      aria-labelledby="network-title"
    >
      <div className="network-heading">
        <div>
          <span className="eyebrow">
            <span className="tiny-cross">+</span> INTERACTIVE SYSTEMS LAB / 01
          </span>
          <h2 id="network-title">
            Packets have a <em>story.</em>
          </h2>
        </div>
        <p>
          Shape the network. Break a link. Watch the route change.
          <br />A hands-on look at the systems behind an interface.
        </p>
      </div>
      <div className="network-console">
        <div className="network-console-top">
          <span>
            <i /> NETWORK / ROUTING PLAYGROUND
          </span>
          <span>
            SIMULATION ENGINE v1.0 <Activity size={13} />
          </span>
        </div>
        <div className="network-main">
          <div className="network-visual">
            <div className="network-visual-top">
              <span>TOPOLOGY // {topology.toUpperCase()}</span>
              <span>
                {route
                  ? `BEST PATH · ${route.length - 1} HOPS`
                  : "NO PATH TO ORIGIN"}
              </span>
            </div>
            <div className="network-graph-scroll">
              <svg
                className="network-graph"
                viewBox="0 0 600 420"
                aria-label={`${labels[topology]} network graph. Activate a link to fail or restore it.`}
              >
                <defs>
                  <pattern
                    id="network-grid"
                    width="24"
                    height="24"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M24 0H0V24"
                      fill="none"
                      stroke="#c2e1cb"
                      strokeOpacity=".075"
                    />
                  </pattern>
                  <filter id="packet-glow">
                    <feGaussianBlur stdDeviation="5" />
                  </filter>
                </defs>
                <rect width="600" height="420" fill="url(#network-grid)" />
                {links.map((link) => {
                  const a = nodeById[link.a];
                  const b = nodeById[link.b];
                  const broken = blocked.has(link.id);
                  const active = activeIds.has(link.id);
                  return (
                    <g
                      key={link.id}
                      className={`network-link ${active ? "active" : ""} ${broken ? "broken" : ""}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${broken ? "Restore" : "Fail"} ${a.label} to ${b.label} link`}
                      onClick={() => toggleLink(link.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleLink(link.id);
                        }
                      }}
                    >
                      <line
                        className="network-link-visible"
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                      />
                      <line
                        className="network-link-hit"
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                      />
                      <text
                        x={(a.x + b.x) / 2}
                        y={(a.y + b.y) / 2 - 8}
                        textAnchor="middle"
                      >
                        {broken
                          ? "OFFLINE"
                          : `${linkLatency(link, congestion)}ms`}
                      </text>
                    </g>
                  );
                })}
                {nodes.map((node) => (
                  <g
                    className={`network-node ${route?.includes(node.id) ? "on-route" : ""}`}
                    key={node.id}
                    transform={`translate(${node.x} ${node.y})`}
                    aria-hidden="true"
                  >
                    <circle className="network-node-glow" r="27" />
                    <circle className="network-node-body" r="17" />
                    <circle className="network-node-core" r="4" />
                    <text y="-34" textAnchor="middle">
                      {node.label}
                    </text>
                    <title>
                      {node.label}: {node.role}
                    </title>
                  </g>
                ))}
                {point && (
                  <g aria-hidden="true">
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="18"
                      fill="#ed8659"
                      opacity=".3"
                      filter="url(#packet-glow)"
                    />
                    <circle cx={point.x} cy={point.y} r="5" fill="#ff9866" />
                    <circle cx={point.x} cy={point.y} r="2" fill="#fff5dc" />
                  </g>
                )}
              </svg>
            </div>
            <div
              className="network-link-switches"
              aria-label="Link status controls"
            >
              <span>LINK STATUS / FAIL OR RESTORE</span>
              <div>
                {links.map((link) => (
                  <button
                    key={link.id}
                    className={blocked.has(link.id) ? "is-down" : ""}
                    aria-pressed={blocked.has(link.id)}
                    onClick={() => toggleLink(link.id)}
                    aria-label={`${blocked.has(link.id) ? "Restore" : "Fail"} ${link.a.toUpperCase()} to ${link.b.toUpperCase()} connection`}
                  >
                    <i />
                    {link.a.slice(0, 3).toUpperCase()} /{" "}
                    {link.b.slice(0, 3).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="network-visual-foot">
              <span>
                <span className="route-line" /> ACTIVE ROUTE
              </span>
              <span>
                <span className="broken-line" /> FAILED LINK
              </span>
              <span>SELECT A LINK TO TOGGLE IT ↗</span>
            </div>
          </div>
          <div className="network-controls">
            <div className="network-controls-heading">
              <Router size={19} />
              <div>
                <span>CONFIGURE THE NETWORK</span>
                <h3>Route a packet.</h3>
              </div>
            </div>
            <div className="network-control-group">
              <span className="network-control-label">01 / TOPOLOGY</span>
              <div
                className="network-segment"
                role="group"
                aria-label="Network topology"
              >
                {(["mesh", "ring", "star"] as Topology[]).map((value) => (
                  <button
                    key={value}
                    aria-pressed={topology === value}
                    onClick={() =>
                      configure(() => {
                        setTopology(value);
                        setBlocked(new Set());
                      })
                    }
                  >
                    {labels[value]}
                  </button>
                ))}
              </div>
            </div>
            <div className="network-control-group">
              <span className="network-control-label">02 / TRANSPORT</span>
              <div
                className="network-segment"
                role="group"
                aria-label="Transport protocol"
              >
                {(["TCP", "UDP"] as Protocol[]).map((value) => (
                  <button
                    key={value}
                    aria-pressed={protocol === value}
                    onClick={() => configure(() => setProtocol(value))}
                  >
                    {value}
                    <small>
                      {value === "TCP" ? "reliable" : "best effort"}
                    </small>
                  </button>
                ))}
              </div>
            </div>
            <label className="network-range">
              <span>
                03 / CONGESTION <strong>{congestion}%</strong>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={congestion}
                onChange={(event) =>
                  configure(() => setCongestion(Number(event.target.value)))
                }
                aria-label="Congestion percentage"
              />
              <small>Queue delay grows around the core router.</small>
            </label>
            <label className="network-range">
              <span>
                04 / END-TO-END LOSS <strong>{loss}%</strong>
              </span>
              <input
                type="range"
                min="0"
                max="80"
                step="2"
                value={loss}
                onChange={(event) =>
                  configure(() => setLoss(Number(event.target.value)))
                }
                aria-label="Packet loss percentage"
              />
              <small>TCP retries dropped packets; UDP does not.</small>
            </label>
            <label className="network-packet-count">
              05 / PACKETS{" "}
              <select
                value={count}
                aria-label="Packets to send"
                onChange={(event) =>
                  configure(() => setCount(Number(event.target.value)))
                }
              >
                {[3, 6, 10].map((value) => (
                  <option key={value} value={value}>
                    {value} packets
                  </option>
                ))}
              </select>
            </label>
            <div className="network-actions">
              <button className="network-run" onClick={launch}>
                <Send size={15} /> RUN SIMULATION <ArrowUpRight size={14} />
              </button>
              <button
                className="network-reset"
                onClick={() => configure(() => setBlocked(new Set()))}
                aria-label="Restore all links"
              >
                <RotateCcw size={16} />
              </button>
            </div>
            <p className="network-disclaimer">
              <ShieldAlert size={14} /> Illustrative browser simulation. No
              network traffic is sent.
            </p>
          </div>
        </div>
        <div className="network-readout">
          <div className="network-metrics">
            <div>
              <span>ROUTE</span>
              <strong>
                {route
                  ? route.map((id) => id.toUpperCase()).join(" → ")
                  : "NO ROUTE"}
              </strong>
            </div>
            <div>
              <span>ONE-WAY EST.</span>
              <strong>
                {result ? result.oneWay : baseOneWay} <small>ms</small>
              </strong>
            </div>
            <div>
              <span>DELIVERED</span>
              <strong>{result ? `${result.delivered}/${count}` : "—"}</strong>
            </div>
            <div>
              <span>RETRANSMITS</span>
              <strong>{result ? result.retransmits : "—"}</strong>
            </div>
          </div>
          <div className="network-log">
            <div className="network-log-heading">
              <span>TRACE / EVENT STREAM</span>
              <span aria-live="polite">
                {result
                  ? `${result.delivered} of ${count} packets delivered`
                  : "READY TO RUN"}
              </span>
            </div>
            <div className="network-log-lines">
              {result ? (
                result.lines.map((line, index) => (
                  <div
                    key={`${run}-${index}`}
                    className={`network-log-line ${line.kind}`}
                  >
                    <span>+{String(line.time).padStart(4, "0")}ms</span>
                    <span>{line.text}</span>
                  </div>
                ))
              ) : (
                <div className="network-log-idle">
                  &gt; Configure the network and run a packet trace. Click any
                  connection to take it offline.
                </div>
              )}
            </div>
          </div>
          <div className="network-inspector">
            <div>
              <span>ROUTING ALGORITHM</span>
              <strong>DIJKSTRA / WEIGHTED GRAPH</strong>
              <small>Lowest total latency across online links</small>
            </div>
            <div>
              <span>TRANSPORT</span>
              <strong>
                {protocol === "TCP"
                  ? "3-WAY HANDSHAKE + ACK"
                  : "CONNECTIONLESS DATAGRAM"}
              </strong>
              <small>
                {protocol === "TCP"
                  ? "Up to 2 retries per dropped packet"
                  : "No delivery guarantee or retry"}
              </small>
            </div>
            <div>
              <span>PATH TELEMETRY</span>
              <strong>
                TTL {route ? route.length + 2 : "—"} · RTT{" "}
                {route ? baseOneWay * 2 : "—"} MS
              </strong>
              <small>
                Core queue penalty: +{Math.round(congestion * 0.35)} ms / link
              </small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

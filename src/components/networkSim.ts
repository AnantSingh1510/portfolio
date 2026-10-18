export type Topology = "mesh" | "ring" | "star";
export type Protocol = "TCP" | "UDP";
export type NodeId = "client" | "edge" | "relay" | "core" | "cache" | "origin";
export type Link = { a: NodeId; b: NodeId; base: number; id: string };
export type TraceLine = {
  time: number;
  kind: "info" | "send" | "drop" | "success";
  text: string;
};

export const nodes: {
  id: NodeId;
  label: string;
  role: string;
  x: number;
  y: number;
}[] = [
  { id: "client", label: "CLIENT", role: "browser", x: 72, y: 216 },
  { id: "edge", label: "EDGE", role: "point of presence", x: 214, y: 96 },
  { id: "relay", label: "RELAY", role: "transit", x: 212, y: 334 },
  { id: "core", label: "CORE", role: "router", x: 376, y: 151 },
  { id: "cache", label: "CACHE", role: "regional cache", x: 376, y: 300 },
  { id: "origin", label: "ORIGIN", role: "server", x: 536, y: 216 },
];

const makeLink = (a: NodeId, b: NodeId, base: number): Link => ({
  a,
  b,
  base,
  id: [a, b].sort().join("-"),
});
export const topologies: Record<Topology, Link[]> = {
  mesh: [
    makeLink("client", "edge", 24),
    makeLink("client", "relay", 35),
    makeLink("edge", "core", 19),
    makeLink("edge", "cache", 29),
    makeLink("edge", "origin", 48),
    makeLink("relay", "core", 31),
    makeLink("relay", "cache", 12),
    makeLink("core", "cache", 17),
    makeLink("core", "origin", 16),
    makeLink("cache", "origin", 30),
  ],
  ring: [
    makeLink("client", "edge", 24),
    makeLink("edge", "core", 28),
    makeLink("core", "origin", 22),
    makeLink("origin", "cache", 33),
    makeLink("cache", "relay", 18),
    makeLink("relay", "client", 36),
  ],
  star: [
    makeLink("client", "core", 42),
    makeLink("edge", "core", 20),
    makeLink("relay", "core", 24),
    makeLink("cache", "core", 18),
    makeLink("core", "origin", 28),
  ],
};

export function linkLatency(link: Link, congestion: number) {
  const hot = link.a === "core" || link.b === "core" ? 0.35 : 0.12;
  return Math.round(link.base + congestion * hot);
}

export function shortestRoute(
  links: Link[],
  blocked: Set<string>,
  congestion: number,
): NodeId[] | null {
  const distance = new Map<NodeId, number>(
    nodes.map((node) => [node.id, Infinity]),
  );
  const previous = new Map<NodeId, NodeId>();
  const remaining = new Set<NodeId>(nodes.map((node) => node.id));
  distance.set("client", 0);
  while (remaining.size) {
    const current = [...remaining].reduce((best, id) =>
      distance.get(id)! < distance.get(best)! ? id : best,
    );
    if (distance.get(current) === Infinity || current === "origin") break;
    remaining.delete(current);
    for (const link of links) {
      if (blocked.has(link.id)) continue;
      const next =
        link.a === current ? link.b : link.b === current ? link.a : null;
      if (!next || !remaining.has(next)) continue;
      const candidate = distance.get(current)! + linkLatency(link, congestion);
      if (candidate < distance.get(next)!) {
        distance.set(next, candidate);
        previous.set(next, current);
      }
    }
  }
  if (distance.get("origin") === Infinity) return null;
  const route: NodeId[] = ["origin"];
  while (route[0] !== "client") {
    const parent = previous.get(route[0]);
    if (!parent) return null;
    route.unshift(parent);
  }
  return route;
}

export function routeLinkIds(route: NodeId[] | null) {
  if (!route) return new Set<string>();
  return new Set(
    route.slice(1).map((node, index) => [route[index], node].sort().join("-")),
  );
}

export function simulatePackets(options: {
  links: Link[];
  route: NodeId[] | null;
  protocol: Protocol;
  congestion: number;
  loss: number;
  count: number;
  run: number;
}) {
  const { links, route, protocol, congestion, loss, count, run } = options;
  const lines: TraceLine[] = [];
  if (!route)
    return {
      lines: [
        {
          time: 0,
          kind: "drop" as const,
          text: "NO ROUTE · Restore a link to reach ORIGIN.",
        },
      ],
      delivered: 0,
      retransmits: 0,
      drops: count,
      oneWay: 0,
      rtt: 0,
    };
  const routeEdges = route
    .slice(1)
    .map((node, index) =>
      links.find((link) => link.id === [route[index], node].sort().join("-"))!,
    );
  const oneWay = routeEdges.reduce(
    (sum, link) => sum + linkLatency(link, congestion),
    0,
  );
  const rtt = oneWay * 2;
  let time = 0;
  let seed =
    (run * 1664525 + congestion * 101 + loss * 113 + count * 137) >>> 0;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const log = (kind: TraceLine["kind"], text: string) =>
    lines.push({ time: Math.round(time), kind, text });
  log(
    "info",
    `ROUTE ${route.map((id) => id.toUpperCase()).join(" → ")} · TTL ${route.length + 2}`,
  );
  if (protocol === "TCP") {
    log("send", "SYN → ORIGIN · establishing a connection");
    time += rtt;
    log("success", `SYN-ACK ← ORIGIN · handshake complete (${rtt} ms)`);
  }
  let delivered = 0;
  let retransmits = 0;
  let drops = 0;
  for (let packet = 1; packet <= count; packet++) {
    let received = false;
    const attempts = protocol === "TCP" ? 3 : 1;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      const failed = random() * 100 < loss;
      log(
        "send",
        `SEQ ${String(packet).padStart(2, "0")} ${attempt > 1 ? `RETRY ${attempt - 1}` : "SEND"} · ${route.length - 1} hops`,
      );
      time += oneWay;
      if (failed) {
        drops++;
        log(
          "drop",
          `SEQ ${String(packet).padStart(2, "0")} DROPPED · ${protocol === "TCP" && attempt < attempts ? "retransmit scheduled" : "no delivery"}`,
        );
        if (protocol === "TCP" && attempt < attempts) {
          retransmits++;
          time += rtt;
        }
      } else {
        delivered++;
        received = true;
        log(
          "success",
          `SEQ ${String(packet).padStart(2, "0")} DELIVERED · ACK ${protocol === "TCP" ? "received" : "not required"}`,
        );
        if (protocol === "TCP") time += oneWay;
        break;
      }
    }
    if (!received && protocol === "TCP")
      log(
        "drop",
        `SEQ ${String(packet).padStart(2, "0")} FAILED · retry limit reached`,
      );
  }
  return { lines, delivered, retransmits, drops, oneWay, rtt };
}

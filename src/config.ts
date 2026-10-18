// Add your real contact information before sharing the site with recruiters.
// Empty links are intentionally omitted from the interface.
export const profile = {
  name: "Anant Singh",
  role: "Full Stack Developer",
  location: "Lucknow, India",
  timezone: "Asia/Kolkata",
  email: "",
  github: "https://github.com/AnantSingh1510",
  linkedin: "https://www.linkedin.com/in/AnantSingh1510",
  leetcode: "https://leetcode.com/u/AnantSingh1510/",
  resume: "", // Put your PDF in public/ and use '/resume.pdf'.
  available: true,
  bio: "Based in Lucknow, I build interfaces that feel good to use and systems that hold up behind them. My work runs from React applications to real-time collaboration and peer-to-peer infrastructure.",
};

// Public repositories verified against Anant's GitHub profile and READMEs.
export const realProjects = [
  {
    name: "Inspectra",
    kind: "FRONTEND / AI TOOLING",
    summary:
      "A React interface for reviewing GitHub pull requests with AI, built around code quality, security, and merge readiness.",
    detail: "React · Chakra UI · Redux",
    url: "https://github.com/AnantSingh1510/Inspectra-Frontend",
    accent: "#e9d8c6",
    number: "01",
  },
  {
    name: "Raft",
    kind: "REAL-TIME COLLABORATION",
    summary:
      "A collaboration engine pairing a Rust CRDT core with a Go WebSocket server and a TypeScript client SDK.",
    detail: "Rust · Go · TypeScript",
    url: "https://github.com/AnantSingh1510/raft",
    accent: "#dce4dd",
    number: "02",
  },
  {
    name: "PeerCDN",
    kind: "DISTRIBUTED SYSTEMS",
    summary:
      "A peer-to-peer file delivery experiment with chunk verification, a WebSocket tracker, and direct peer transfers.",
    detail: "Go · WebSockets · SHA-256",
    url: "https://github.com/AnantSingh1510/PeerCDN",
    accent: "#e6e3d5",
    number: "03",
  },
] as const;

export const projects = [
  {
    id: "orbit",
    name: "Orbit",
    type: "PRODUCTIVITY",
    description: "A little less chaos. A lot more clarity.",
    tags: ["React", "TypeScript", "Drag & drop"],
    number: "01",
    year: "2026",
    detail:
      "A focused task board that makes the next step obvious. Organize work across three stages, filter by priority, and keep your momentum.",
    challenge:
      "Make a flexible workflow feel approachable without burying everyday actions inside menus.",
    approach:
      "A compact board, clear status colors, and direct manipulation. Tasks can be dragged between columns or moved with a keyboard-accessible select.",
    features: [
      "Create, edit, and delete tasks",
      "Drag-and-drop status changes",
      "Search and priority filtering",
      "Local persistence with graceful fallback",
    ],
  },
  {
    id: "form",
    name: "Form & Field",
    type: "E-COMMERCE",
    description: "Everyday objects, thoughtfully considered.",
    tags: ["React", "Cart state", "CSS illustration"],
    number: "02",
    year: "2026",
    detail:
      "A quiet shopping experience for objects with character. Browse an original collection, discover product details, and build a shopping bag.",
    challenge:
      "Let a small collection feel rich and tactile while keeping the shopping journey fast and straightforward.",
    approach:
      "Warm materials, original CSS product illustrations, a responsive product grid, and a persistent shopping bag with a transparent order summary.",
    features: [
      "Filter by product category",
      "Product detail drawer",
      "Persistent cart and quantity controls",
      "Simulated checkout; no payment collected",
    ],
  },
  {
    id: "margin",
    name: "Margin",
    type: "WRITING TOOL",
    description: "Room for your next good idea.",
    tags: ["React", "Markdown", "Local-first"],
    number: "03",
    year: "2026",
    detail:
      "A minimal workspace for thinking out loud. Capture ideas in Markdown, find them instantly, and export your writing when it is ready.",
    challenge:
      "Balance useful writing tools with a calm environment that keeps attention on the words.",
    approach:
      "A restrained two-pane layout, instant local saves, a safe Markdown preview, and portable plain-text exports. Your notes stay in this browser.",
    features: [
      "Create, search, and delete notes",
      "Markdown editor and safe preview",
      "Live word and character counts",
      "Download notes as Markdown",
    ],
  },
  {
    id: "prism",
    name: "Prism",
    type: "CREATIVE TOOL",
    description: "Find a palette. Set a mood.",
    tags: ["React", "Color theory", "Generative UI"],
    number: "04",
    year: "2026",
    detail:
      "A playful color studio for finding your next visual direction. Generate harmonious palettes, lock your favorites, and take the result into your CSS.",
    challenge:
      "Make color exploration feel spontaneous while providing useful, accessible information about each choice.",
    approach:
      "Hue-based palette generation, individual color locks, editable hex values, and WCAG contrast calculations for black and white text.",
    features: [
      "Generate coordinated color palettes",
      "Lock and edit individual colors",
      "Live text contrast ratios",
      "Copy individual hex values or export CSS",
    ],
  },
] as const;

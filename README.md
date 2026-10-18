# Anant Singh — Developer Portfolio

A responsive portfolio for Anant Singh, a full stack developer based in Lucknow. It includes a procedural wire sculpture, a reactive signal field, a packet-routing playground, an interactive Three.js network sculpture, pointer-responsive depth effects, a roaming pixel-art site companion called Pixel, three verified public engineering projects, and four original interactive frontend demos. Built with React, TypeScript, Vite, Motion, Three.js, Lucide, and CSS. Fonts are self-hosted; no API keys or paid services are needed.

The homepage also has layered project cards with quick-preview dialogs and a searchable quick finder. Open the finder with the header button, `/`, or `Cmd/Ctrl+K`; use arrow keys and Enter to jump to a destination. Each project card offers a concise preview of its challenge and approach before opening the live demo.

## Run locally

Use Node.js 22.12+ (or a current supported release).

```sh
npm ci
npm run dev
```

The development server opens at http://localhost:5173.

## Production and Vercel

```sh
npm run build
npm run preview
```

Push this folder to your GitHub repository and import the repository in Vercel. Select **Vite**, with build command `npm run build` and output directory `dist`. The included `vercel.json` handles direct links to `/projects/*`. No environment variables are required. Alternatively, run `npx vercel` from this folder and follow its prompts when you are ready to deploy.

## Make it yours

Edit `src/config.ts` for your name, role, bio, location, availability, GitHub, LinkedIn, LeetCode, email, résumé URL, and real project links. Your supplied GitHub and LinkedIn are already included. Your public GitHub also confirms Lucknow, LeetCode, Inspectra, Raft, and PeerCDN. Email and résumé are intentionally unset; the primary contact action opens LinkedIn until you supply an email. Add a real PDF to `public/resume.pdf` and set `resume: '/resume.pdf'` to enable the résumé link.

The homepage copy is in `src/App.tsx`. Update `index.html` for page title and social metadata if you change your identity or positioning. Employment history, client results, and performance metrics are not invented. The public GitHub profile lists Munshot and a CSE undergraduate background, but those are left off the site until their current status is confirmed.

Pixel is a fictional pixel-art dog, not Anant's real pet. Four crisp sprite frames animate its legs while it walks along the bottom of the viewport; its body stays grounded. It pauses on hover or keyboard focus and responds when clicked. The floating paw button opens its controls; visitors can pet it, offer a treat, choose a coat, or put it to sleep. Its choices and visit counts persist in this browser. The companion appears on the homepage and project pages.

The networking playground is a browser-only teaching simulation. It uses a weighted shortest-path algorithm to route packets through mesh, ring, or star topologies. Visitors can fail and restore individual links, add core congestion, set end-to-end packet loss, compare TCP-style handshake/retries with UDP-style best effort, and inspect a timestamped trace. No actual traffic is transmitted. The WebGL sculpture is a separate spatial study with drag rotation and orbit controls; it loads as a separate page chunk and falls back gracefully when WebGL is unavailable.

## The projects

The "In the open" section links to three of Anant's actual public repositories: [Inspectra](https://github.com/AnantSingh1510/Inspectra-Frontend), [Raft](https://github.com/AnantSingh1510/raft), and [PeerCDN](https://github.com/AnantSingh1510/PeerCDN). Their descriptions come from the public repository metadata and READMEs.

- **Orbit** — Create, edit, delete, search, and filter tasks. Move them with native drag-and-drop or an accessible status select. Board data persists locally.
- **Form & Field** — Six original CSS product illustrations, category filters, product details, persistent shopping bag, quantity controls, shipping calculation, and explicitly simulated checkout. No real orders, payments, or personal details are collected.
- **Margin** — Create, search, edit, preview, delete, and export Markdown notes. A deliberately small Markdown renderer uses React text nodes rather than raw HTML. Notes persist locally. Supports headings, bold, inline code, lists, and quotes.
- **Prism** — Generate coordinated color palettes, lock and edit colors, inspect WCAG text contrast ratios, and copy or download CSS custom properties. Palette persists locally.

These are frontend concept demos with browser-local storage, not backend-connected production services. Data is not synced between devices. Storage failures are surfaced without preventing in-session use.

## Verification

```sh
npx playwright install chromium
npm test
```

Playwright tests cover the main user flows, routing and protocol controls, the 3D scene, local persistence, invalid storage, drag-and-drop, safe Markdown rendering, downloads, dialogs, mobile overflow, runtime errors, and automated WCAG 2.1 AA accessibility checks. Automated accessibility checks complement manual keyboard and visual review; they are not a certification.

## Motion and accessibility

The canvas sculpture and signal field are procedural and react to the pointer. The Three.js scene is also pointer-controlled. The renderers pause offscreen or when the tab is hidden, cap device pixel ratio at 2, honor `prefers-reduced-motion`, and share a pause control. The technology strip, signal rings, hero depth, project-card tilt, and Pixel's animation also stop or settle under reduced motion. All interactive project functions have keyboard equivalents, native modal dialogs trap focus, and the site includes skip links and visible focus states. The homepage previews are decorative; the real interfaces are on project pages.

## Structure

```text
src/config.ts                  Profile and project descriptions
src/App.tsx                    Homepage, navigation, route selection
src/components/WireSculpture.tsx  Procedural canvas artwork
src/components/SignalField.tsx    Reactive network artwork
src/components/PetStudio.tsx      Floating, persistent pixel-art companion
src/components/PixelDogSprite.tsx Four-frame pixel dog artwork
src/components/NetworkPlayground.tsx Packet-routing controls and trace UI
src/components/networkSim.ts     Weighted routing and packet simulation
src/components/SpatialLab.tsx    Three.js network sculpture
src/components/PortfolioOverlays.tsx  Search and project-preview dialogs
src/components/Previews.tsx    Original project previews and product art
src/projects/                 Four demos and shared UI/persistence helpers
src/styles.css                Portfolio and responsive styles
public/fonts/                 Locally hosted Google Fonts
```

Fonts: Manrope and DM Sans, distributed under the SIL Open Font License (see `public/fonts/`).

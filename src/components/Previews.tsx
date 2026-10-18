import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Circle,
  Command,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react";

export function OrbitPreview() {
  return (
    <div className="orbit-preview preview-window">
      <aside>
        <strong>
          <Command size={18} /> orbit<span>®</span>
        </strong>
        <div className="preview-workspace">
          Studio workspace <ChevronDown size={10} />
        </div>
        <span className="preview-nav active">
          <LayoutGrid size={12} /> Overview
        </span>
        <span className="preview-nav">
          <Circle size={12} /> My tasks
        </span>
        <span className="preview-nav">
          <Star size={12} /> Favorites
        </span>
        <small>WORKSPACE</small>
        <span className="preview-nav">▦ &nbsp; Website redesign</span>
        <span className="preview-nav">◈ &nbsp; Brand exploration</span>
        <div className="preview-avatar">
          A <span>Anant’s workspace</span>
        </div>
      </aside>
      <div className="orbit-board">
        <div className="preview-topline">
          Workspace / <b>Website redesign</b>
          <Search size={12} />
        </div>
        <div className="preview-board-heading">
          <h3>
            Website redesign <span>✦</span>
          </h3>
          <span className="tiny-dark">+ New task</span>
        </div>
        <p>A fresh perspective. One task at a time.</p>
        <div className="preview-tabs">
          <b>▦ Board</b>
          <span>☰ List</span>
          <span>◷ Timeline</span>
          <span className="preview-filter">⚙ Filter</span>
        </div>
        <div className="mini-columns">
          {[
            {
              name: "To do",
              color: "#b3b5bd",
              tasks: [
                [
                  "Design",
                  "Explore visual directions",
                  "Moodboard & references",
                ],
                [
                  "Research",
                  "Map out the user journey",
                  "Understanding the flow",
                ],
              ],
            },
            {
              name: "In progress",
              color: "#8470d7",
              tasks: [
                [
                  "Development",
                  "Build the component library",
                  "Buttons, inputs & cards",
                ],
                ["Design", "Refine the homepage", "A little more personality"],
              ],
            },
            {
              name: "Done",
              color: "#65a28f",
              tasks: [
                ["Research", "Kickoff & discovery", "A good place to start"],
                ["Design", "Define the color palette", "Set the right mood"],
              ],
            },
          ].map((col) => (
            <div className="mini-column" key={col.name}>
              <div className="mini-column-name">
                <i style={{ background: col.color }} />
                {col.name}
                <span>2</span>
                <Plus size={10} />
              </div>
              {col.tasks.map((task, i) => (
                <div className="mini-task" key={task[1]}>
                  <span className={`mini-tag tag-${task[0].toLowerCase()}`}>
                    {task[0]}
                  </span>
                  <h4>{task[1]}</h4>
                  <p>{task[2]}</p>
                  <div>
                    <span>☷ &nbsp; {i + 2}</span>
                    <span className="mini-avatar">{i ? "M" : "A"}</span>
                  </div>
                </div>
              ))}
              <span className="mini-add">+ Add task</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductArt({ kind, color }: { kind: string; color?: string }) {
  return (
    <div
      className={`product-art art-${kind}`}
      style={color ? { backgroundColor: color } : undefined}
    >
      <div className="art-shadow" />
      <div className="object">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

export function FormPreview() {
  return (
    <div className="form-preview preview-window">
      <div className="form-nav">
        <b>
          form<span>&</span>field
        </b>
        <span>
          Objects &nbsp;&nbsp;&nbsp; Our story &nbsp;&nbsp;&nbsp; Journal
        </span>
        <ShoppingBag size={12} />
      </div>
      <div className="form-hero">
        <small>LESS, BUT BETTER.</small>
        <h3>
          Good things.
          <br />
          Everyday.
        </h3>
        <p>Considered objects for the way you live.</p>
        <span>
          Explore the collection <ArrowUpRight size={11} />
        </span>
        <div className="hero-vase">
          <ProductArt kind="vase" />
        </div>
        <span className="form-edition">THE EVERYDAY COLLECTION — 01</span>
      </div>
      <div className="form-collection">
        <b>Made for your everyday</b>
        <span>View all objects ↗</span>
      </div>
      <div className="form-products">
        {[
          ["lamp", "The Arc Lamp", "$89"],
          ["chair", "Sunday Chair", "$249"],
          ["bowl", "Still Bowl", "$32"],
        ].map(([kind, name, price]) => (
          <div key={kind}>
            <ProductArt kind={kind} />
            <span>
              {name}
              <b>{price}</b>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MarginPreview() {
  return (
    <div className="margin-preview preview-window">
      <aside>
        <strong>
          m<span>argin</span>
          <span className="margin-dot">.</span>
        </strong>
        <div className="margin-search">
          <Search size={11} /> Find a little inspiration <span>⌘ K</span>
        </div>
        <p>
          YOUR SPACE <Plus size={11} />
        </p>
        <div className="margin-note active">
          <b>On making things</b>
          <span>Some thoughts on the creative process…</span>
          <small>Today · 2 min read</small>
        </div>
        <div className="margin-note">
          <b>Little things, noticed</b>
          <span>The best ideas start with paying attention.</span>
          <small>Yesterday · 1 min read</small>
        </div>
        <div className="margin-note">
          <b>A place to begin</b>
          <span>A few ideas for what comes next.</span>
          <small>Oct 12 · 3 min read</small>
        </div>
        <div className="margin-bottom">
          <Circle size={8} /> All changes saved <span>☼</span>
        </div>
      </aside>
      <div className="margin-paper">
        <div className="paper-toolbar">
          <span>PERSONAL / THOUGHTS</span>
          <MoreHorizontal size={15} />
        </div>
        <small>OCTOBER 18, 2026</small>
        <h3>
          On making
          <br />
          things.
        </h3>
        <p>
          There is something quietly wonderful about
          <br />
          turning a thought into something real.
        </p>
        <p>
          Not perfect. Not finished. Just <em>real.</em>
        </p>
        <h4>Start with curiosity</h4>
        <p>
          The best work often begins with a simple question:
          <br />
          what if? Give yourself room to find out.
        </p>
        <blockquote>Make something you wish existed.</blockquote>
        <div className="paper-status">
          <span>126 words</span>
          <Check size={11} /> Saved locally
        </div>
      </div>
    </div>
  );
}

export function PrismPreview() {
  const colors = ["#e7edb8", "#a8b78b", "#45644c", "#e9ad85", "#b4573c"];
  return (
    <div className="prism-preview preview-window">
      <div className="prism-nav">
        <b>
          <Sparkles size={17} /> prism
        </b>
        <span>A little color goes a long way.</span>
        <span className="prism-export">Export ↗</span>
      </div>
      <div className="prism-heading">
        <small>YOUR NEXT GREAT PALETTE</small>
        <h3>A feeling, in five colors.</h3>
        <p>Explore. Experiment. Find your kind of color.</p>
      </div>
      <div className="preview-swatches">
        {colors.map((color, i) => (
          <div
            style={{
              background: color,
              color: i === 2 || i === 4 ? "#fff" : "#253127",
            }}
            key={color}
          >
            <span>0{i + 1}</span>
            <div>
              <b>{color.toUpperCase()}</b>
              <small>
                {
                  [
                    "Soft lime",
                    "Sage advice",
                    "Forest floor",
                    "Apricot hour",
                    "Terracotta",
                  ][i]
                }
              </small>
            </div>
            <span>⌑</span>
          </div>
        ))}
      </div>
      <div className="prism-bottom">
        <span>
          <Sparkles size={12} /> Made for happy accidents
        </span>
        <span className="prism-generate">
          ↻ &nbsp; Generate palette <kbd>space</kbd>
        </span>
      </div>
    </div>
  );
}

export default function Preview({ id }: { id: string }) {
  return id === "orbit" ? (
    <OrbitPreview />
  ) : id === "form" ? (
    <FormPreview />
  ) : id === "margin" ? (
    <MarginPreview />
  ) : (
    <PrismPreview />
  );
}

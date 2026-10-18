import { useEffect, useRef, useState } from "react";
import {
  Check,
  Download,
  Eye,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Dialog, downloadText, StorageNotice, useStoredState } from "./shared";

interface Note {
  id: string;
  title: string;
  body: string;
  updated: string;
}
const seed: Note[] = [
  {
    id: "making",
    title: "On making things",
    body: "# On making things.\n\nThere is something quietly wonderful about turning a thought into something real.\n\nNot perfect. Not finished. Just **real**.\n\n## Start with curiosity\n\nThe best work often begins with a simple question: what if? Give yourself room to find out.\n\n> Make something you wish existed.\n\n## A few things to remember\n\n- Start small, and keep going.\n- Pay attention to the details.\n- Leave room for happy accidents.\n\nGood things take practice. And a little patience.",
    updated: "2026-10-18T10:00:00Z",
  },
  {
    id: "noticed",
    title: "Little things, noticed",
    body: "# Little things, noticed\n\nThe best ideas start with paying attention.\n\n- The way light moves across a wall.\n- A perfectly timed animation.\n- The quiet satisfaction of a useful tool.\n\n## Collect what catches your eye\n\nYou never know where the next idea will come from.",
    updated: "2026-10-17T09:00:00Z",
  },
  {
    id: "begin",
    title: "A place to begin",
    body: "# A place to begin\n\nEvery project starts somewhere. This one starts here.\n\n## The idea\n\nBuild something simple, useful, and a little unexpected.\n\n## Next steps\n\n- Sketch the first version\n- Find the core interaction\n- Make a small prototype\n- Put it in someone’s hands\n\n> You learn by making.",
    updated: "2026-10-12T09:00:00Z",
  },
];
function valid(value: unknown): value is Note[] {
  return (
    Array.isArray(value) &&
    value.every(
      (n) =>
        n &&
        typeof n.id === "string" &&
        typeof n.title === "string" &&
        typeof n.body === "string" &&
        typeof n.updated === "string" &&
        Number.isFinite(Date.parse(n.updated)),
    )
  );
}
function inline(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .map((part, i) =>
      part.startsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : part.startsWith("`") ? (
        <code key={i}>{part.slice(1, -1)}</code>
      ) : (
        part
      ),
    );
}
function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (line.startsWith("### "))
      blocks.push(<h4 key={i}>{inline(line.slice(4))}</h4>);
    else if (line.startsWith("## "))
      blocks.push(<h3 key={i}>{inline(line.slice(3))}</h3>);
    else if (line.startsWith("# "))
      blocks.push(<h2 key={i}>{inline(line.slice(2))}</h2>);
    else if (line.startsWith("> "))
      blocks.push(<blockquote key={i}>{inline(line.slice(2))}</blockquote>);
    else if (line.startsWith("- ")) {
      const start = i;
      const items = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(<li key={i}>{inline(lines[i].slice(2))}</li>);
        i++;
      }
      i--;
      blocks.push(<ul key={start}>{items}</ul>);
    } else blocks.push(<p key={i}>{inline(line)}</p>);
  }
  return (
    <div className="markdown-content">
      {blocks.length ? (
        blocks
      ) : (
        <p className="note-placeholder">A blank page. A good place to start.</p>
      )}
    </div>
  );
}

export default function Margin() {
  const [notes, setNotes, error] = useStoredState(
    "anant-margin-v1",
    seed,
    valid,
  );
  const [activeId, setActiveId] = useState(notes[0]?.id || "");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const focusNew = useRef(false);
  const active = notes.find((n) => n.id === activeId);
  const visible = notes.filter((n) =>
    `${n.title} ${n.body}`.toLowerCase().includes(query.toLowerCase()),
  );
  const words = active?.body.trim().split(/\s+/).filter(Boolean).length || 0;
  useEffect(() => {
    if (focusNew.current) {
      titleRef.current?.focus();
      titleRef.current?.select();
      focusNew.current = false;
    }
  }, [activeId]);
  const create = () => {
    const note = {
      id: crypto.randomUUID(),
      title: "Untitled thought",
      body: "",
      updated: new Date().toISOString(),
    };
    setNotes((ns) => [note, ...ns]);
    setActiveId(note.id);
    setPreview(false);
    setQuery("");
    focusNew.current = true;
    setMessage("New note created.");
  };
  const update = (patch: Partial<Note>) =>
    setNotes((ns) =>
      ns.map((n) =>
        n.id === activeId
          ? { ...n, ...patch, updated: new Date().toISOString() }
          : n,
      ),
    );
  return (
    <div className="demo-margin">
      <aside className="notes-sidebar">
        <div className="notes-brand">
          margin<span>.</span>
          <button
            className="icon-button"
            onClick={create}
            aria-label="Create a new note"
          >
            <Plus size={18} />
          </button>
        </div>
        <label className="search-field">
          <Search size={14} />
          <input
            aria-label="Search notes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a thought…"
          />
        </label>
        <div className="notes-list-heading">
          <span>YOUR SPACE</span>
          <span>{notes.length} notes</span>
        </div>
        <div className="notes-list">
          {visible.map((n) => (
            <button
              key={n.id}
              onClick={() => setActiveId(n.id)}
              className={`note-item ${activeId === n.id ? "active" : ""}`}
              aria-pressed={activeId === n.id}
            >
              <strong>{n.title || "Untitled thought"}</strong>
              <span>
                {n.body.replace(/[#>*`\n]/g, " ").trim() ||
                  "A blank page, waiting for you."}
              </span>
              <small>
                {new Date(n.updated).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                ·{" "}
                {Math.max(
                  1,
                  Math.ceil(n.body.trim().split(/\s+/).length / 200),
                )}{" "}
                min read
              </small>
            </button>
          ))}
          {visible.length === 0 && (
            <p className="empty-notes">
              {query
                ? "No matching thoughts. Try another search."
                : "Your next idea starts with a new note."}
            </p>
          )}
        </div>
        <button className="new-note-button" onClick={create}>
          <Plus size={15} /> A new thought
        </button>
        <span className="notes-local">
          <span /> Your words stay in this browser.
        </span>
      </aside>
      <div className="note-workspace">
        {active ? (
          <>
            <div className="note-toolbar">
              <span className="demo-eyebrow">PERSONAL / THOUGHTS</span>
              <div>
                <button
                  className={`icon-button ${!preview ? "active" : ""}`}
                  aria-label="Edit note"
                  aria-pressed={!preview}
                  onClick={() => setPreview(false)}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className={`icon-button ${preview ? "active" : ""}`}
                  aria-label="Preview note"
                  aria-pressed={preview}
                  onClick={() => setPreview(true)}
                >
                  <Eye size={17} />
                </button>
                <button
                  className="icon-button"
                  aria-label="Download note as Markdown"
                  onClick={() => {
                    downloadText(
                      active.body,
                      `${active.title.replace(/[^a-zA-Z0-9 -]/g, "").trim() || "note"}.md`,
                      "text/markdown",
                    );
                    setMessage("Note downloaded as Markdown.");
                  }}
                >
                  <Download size={16} />
                </button>
                <button
                  className="icon-button"
                  aria-label="Delete note"
                  onClick={() => setDeleting(true)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <StorageNotice error={error} />
            <div className="note-canvas">
              <span className="note-date">
                {new Date(active.updated)
                  .toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                  .toUpperCase()}
              </span>
              <label className="sr-only" htmlFor="note-title">
                Note title
              </label>
              <input
                ref={titleRef}
                id="note-title"
                className="note-title"
                maxLength={100}
                value={active.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Untitled thought"
              />
              {preview ? (
                <Markdown text={active.body} />
              ) : (
                <>
                  <p className="markdown-hint">
                    # Heading &nbsp; **bold** &nbsp; - list &nbsp; &gt; quote
                    &nbsp; `code`
                  </p>
                  <textarea
                    className="note-editor"
                    aria-label="Note content"
                    value={active.body}
                    onChange={(e) => update({ body: e.target.value })}
                    placeholder="Start with a thought. See where it goes."
                    spellCheck
                  />
                </>
              )}
            </div>
            <div className="note-footer">
              <span>
                {words} {words === 1 ? "word" : "words"} · {active.body.length}{" "}
                characters
              </span>
              <span>
                <Check size={12} /> {error ? "Session only" : "Saved locally"}
              </span>
            </div>
          </>
        ) : (
          <div className="notes-empty-state">
            <FileText size={36} strokeWidth={1} />
            <h3>Room for a new idea.</h3>
            <p>Create your first note and make yourself at home.</p>
            <button className="dark-button" onClick={create}>
              <Plus size={15} /> Start writing
            </button>
          </div>
        )}
        <span className="sr-only" role="status">
          {message}
        </span>
      </div>
      {deleting && active && (
        <Dialog title="Let this thought go?" onClose={() => setDeleting(false)}>
          <p className="dialog-description">
            “{active.title || "Untitled thought"}” will be deleted from this
            browser. Download a copy first if you want to keep it.
          </p>
          <div className="dialog-actions">
            <button className="light-button" onClick={() => setDeleting(false)}>
              Keep note
            </button>
            <button
              className="dark-button"
              onClick={() => {
                const remaining = notes.filter((n) => n.id !== activeId);
                setNotes(remaining);
                setActiveId(remaining[0]?.id || "");
                setDeleting(false);
                setMessage("Note deleted.");
              }}
            >
              Delete note
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

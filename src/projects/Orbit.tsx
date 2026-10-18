import { useState } from "react";
import type { FormEvent } from "react";
import {
  Check,
  Command,
  LayoutGrid,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Dialog, StorageNotice, useStoredState } from "./shared";

type Status = "To do" | "In progress" | "Done";
type Priority = "Low" | "Medium" | "High";
interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  label: string;
}
const statuses: Status[] = ["To do", "In progress", "Done"];
const priorities: Priority[] = ["Low", "Medium", "High"];
const seed: Task[] = [
  {
    id: "1",
    title: "Explore visual directions",
    description:
      "Build a moodboard with references for typography, color, and interaction.",
    status: "To do",
    priority: "Medium",
    label: "Design",
  },
  {
    id: "2",
    title: "Map out the user journey",
    description:
      "Keep the main flow simple, from arrival to the first meaningful action.",
    status: "To do",
    priority: "High",
    label: "Research",
  },
  {
    id: "3",
    title: "Build the component library",
    description: "Start with buttons, inputs, cards, and accessible dialogs.",
    status: "In progress",
    priority: "High",
    label: "Development",
  },
  {
    id: "4",
    title: "Refine the homepage",
    description: "A little more personality. A little less visual noise.",
    status: "In progress",
    priority: "Medium",
    label: "Design",
  },
  {
    id: "5",
    title: "Kickoff & discovery",
    description: "Define the scope, the audience, and what success looks like.",
    status: "Done",
    priority: "Low",
    label: "Research",
  },
  {
    id: "6",
    title: "Define the color palette",
    description: "Choose a small, expressive palette with accessible contrast.",
    status: "Done",
    priority: "Medium",
    label: "Design",
  },
];
function valid(value: unknown): value is Task[] {
  return (
    Array.isArray(value) &&
    value.every(
      (t) =>
        t &&
        typeof t.id === "string" &&
        typeof t.title === "string" &&
        typeof t.description === "string" &&
        typeof t.label === "string" &&
        statuses.includes(t.status) &&
        priorities.includes(t.priority),
    )
  );
}

export default function Orbit() {
  const [tasks, setTasks, error] = useStoredState(
    "anant-orbit-v1",
    seed,
    valid,
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All priorities");
  const [editing, setEditing] = useState<Task | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [dragged, setDragged] = useState<string | null>(null);
  const [over, setOver] = useState<Status | null>(null);
  const [message, setMessage] = useState("");
  const shown = tasks.filter(
    (t) =>
      `${t.title} ${t.description}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "All priorities" || t.priority === filter),
  );
  const move = (id: string, status: Status) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));
    setMessage(`Task moved to ${status}.`);
    setDragged(null);
    setOver(null);
  };
  const create = (status: Status = "To do") => {
    setIsNew(true);
    setEditing({
      id: crypto.randomUUID(),
      title: "",
      description: "",
      status,
      priority: "Medium",
      label: "Design",
    });
  };
  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!editing?.title.trim()) return;
    const task = {
      ...editing,
      title: editing.title.trim(),
      description: editing.description.trim(),
    };
    setTasks((ts) =>
      isNew ? [...ts, task] : ts.map((t) => (t.id === task.id ? task : t)),
    );
    setMessage(isNew ? "Task created." : "Task updated.");
    setEditing(null);
  };
  return (
    <div className="demo-orbit">
      <div className="app-bar">
        <span className="app-brand">
          <Command size={23} /> orbit<sup>®</sup>
        </span>
        <span className="app-bar-caption">
          A little less chaos. A lot more clarity.
        </span>
        <span className="user-avatar">AS</span>
      </div>
      <div className="board-content">
        <div className="demo-title-row">
          <div>
            <span className="demo-eyebrow">YOUR WORKSPACE</span>
            <h2>
              Website redesign <span>✦</span>
            </h2>
            <p>A fresh perspective. One task at a time.</p>
          </div>
          <button className="dark-button" onClick={() => create()}>
            <Plus size={16} /> New task
          </button>
        </div>
        <div className="board-tools">
          <span className="board-view">
            <LayoutGrid size={15} /> Board <span>{tasks.length}</span>
          </span>
          <label className="search-field">
            <Search size={15} />
            <input
              aria-label="Search tasks"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
            />
          </label>
          <select
            aria-label="Filter by priority"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All priorities</option>
            {priorities.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <StorageNotice error={error} />
        <p className="sr-only" role="status">
          {message}
        </p>
        <div className="task-columns">
          {statuses.map((status, index) => (
            <section
              className={`task-column ${over === status ? "drag-over" : ""}`}
              key={status}
              aria-label={status}
              onDragOver={(e) => {
                if (dragged) {
                  e.preventDefault();
                  setOver(status);
                }
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node))
                  setOver(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragged) move(dragged, status);
              }}
            >
              <div className="column-heading">
                <i className={`status-dot status-${index}`} />
                <h3>{status}</h3>
                <span>{shown.filter((t) => t.status === status).length}</span>
                <button
                  className="icon-button"
                  onClick={() => create(status)}
                  aria-label={`Add task to ${status}`}
                >
                  <Plus size={15} />
                </button>
              </div>
              {shown
                .filter((t) => t.status === status)
                .map((task) => (
                  <article
                    draggable
                    onDragStart={(e) => {
                      setDragged(task.id);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", task.id);
                    }}
                    onDragEnd={() => {
                      setDragged(null);
                      setOver(null);
                    }}
                    className={`task-card ${dragged === task.id ? "dragging" : ""}`}
                    key={task.id}
                  >
                    <div className="task-top">
                      <span
                        className={`task-label label-${task.label.toLowerCase()}`}
                      >
                        {task.label}
                      </span>
                      <button
                        className="icon-button"
                        aria-label={`Edit ${task.title}`}
                        onClick={() => {
                          setEditing(task);
                          setIsNew(false);
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                    <div className="task-bottom">
                      <span
                        className={`priority priority-${task.priority.toLowerCase()}`}
                      >
                        ◈ {task.priority}
                      </span>
                      <label className="task-status-select">
                        <span className="sr-only">Status for {task.title}</span>
                        <select
                          value={task.status}
                          onChange={(e) =>
                            move(task.id, e.target.value as Status)
                          }
                        >
                          {statuses.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </article>
                ))}
              {shown.filter((t) => t.status === status).length === 0 && (
                <div className="empty-column">
                  {query || filter !== "All priorities"
                    ? "No matching tasks."
                    : "A little room for what’s next."}
                </div>
              )}
              <button className="add-task" onClick={() => create(status)}>
                <Plus size={14} /> Add task
              </button>
            </section>
          ))}
        </div>
        <div className="demo-status">
          <span>
            <Check size={12} />{" "}
            {error ? "Session only" : "Saved in this browser"}
          </span>
          <span>Drag cards to move them, or use their status menu.</span>
        </div>
      </div>
      {editing && (
        <Dialog
          title={isNew ? "A new task" : "Edit task"}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save} className="task-form">
            <label>
              Task name
              <input
                data-autofocus
                required
                maxLength={100}
                placeholder="What’s the next step?"
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
              />
            </label>
            <label>
              Description
              <textarea
                rows={3}
                maxLength={1000}
                placeholder="A little context goes a long way."
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </label>
            <div className="form-row">
              <label>
                Status
                <select
                  aria-label="Status"
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({ ...editing, status: e.target.value as Status })
                  }
                >
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Priority
                <select
                  aria-label="Priority"
                  value={editing.priority}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      priority: e.target.value as Priority,
                    })
                  }
                >
                  {priorities.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Category
              <select
                aria-label="Category"
                value={editing.label}
                onChange={(e) =>
                  setEditing({ ...editing, label: e.target.value })
                }
              >
                {["Design", "Research", "Development"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <div className="dialog-actions">
              {!isNew && (
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => {
                    setTasks((ts) => ts.filter((t) => t.id !== editing.id));
                    setEditing(null);
                    setMessage("Task deleted.");
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <button
                type="button"
                className="light-button"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                className="dark-button"
                type="submit"
                disabled={!editing.title.trim()}
              >
                {isNew ? "Create task" : "Save changes"}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}

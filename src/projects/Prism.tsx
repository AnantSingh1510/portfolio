import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Download,
  LockKeyhole,
  RefreshCw,
  Sparkles,
  UnlockKeyhole,
} from "lucide-react";
import { Dialog, downloadText, useStoredState, StorageNotice } from "./shared";

interface Swatch {
  hex: string;
  locked: boolean;
}
const seed: Swatch[] = [
  "#E7EDB8",
  "#A8B78B",
  "#45644C",
  "#E9AD85",
  "#B4573C",
].map((hex) => ({ hex, locked: false }));
function valid(value: unknown): value is Swatch[] {
  return (
    Array.isArray(value) &&
    value.length === 5 &&
    value.every(
      (s) =>
        s &&
        typeof s.hex === "string" &&
        /^#[a-f0-9]{6}$/i.test(s.hex) &&
        typeof s.locked === "boolean",
    )
  );
}
function hslHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}
function contrast(hex: string) {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4));
  const l = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return { black: (l + 0.05) / 0.05, white: 1.05 / (l + 0.05) };
}
function ColorSwatch({
  swatch,
  index,
  onChange,
  onLock,
  onCopy,
}: {
  swatch: Swatch;
  index: number;
  onChange: (hex: string) => void;
  onLock: () => void;
  onCopy: () => void;
}) {
  const [draft, setDraft] = useState(swatch.hex);
  const [error, setError] = useState(false);
  useEffect(() => {
    setDraft(swatch.hex);
    setError(false);
  }, [swatch.hex]);
  const ratios = contrast(swatch.hex);
  const darkText = ratios.black >= ratios.white;
  const text = darkText ? "#000000" : "#FFFFFF";
  const ratio = Math.max(ratios.black, ratios.white);
  const commit = () => {
    const hex = draft.startsWith("#") ? draft : `#${draft}`;
    if (/^#[a-f0-9]{6}$/i.test(hex)) {
      onChange(hex.toUpperCase());
      setError(false);
    } else setError(true);
  };
  return (
    <div
      className="color-swatch"
      style={{ backgroundColor: swatch.hex, color: text }}
    >
      <div className="swatch-top">
        <span>0{index + 1}</span>
        <button
          className="icon-button"
          style={{ color: text }}
          onClick={onCopy}
          aria-label={`Copy color ${index + 1}`}
        >
          <Copy size={17} />
        </button>
      </div>
      <div className="swatch-middle">
        <label htmlFor={`hex-${index}`} className="sr-only">
          Hex color {index + 1}
        </label>
        <input
          id={`hex-${index}`}
          style={{ color: text }}
          value={draft}
          maxLength={7}
          onChange={(e) => {
            setDraft(e.target.value.toUpperCase());
            setError(false);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commit();
              e.currentTarget.blur();
            }
            if (e.key === "Escape") {
              setDraft(swatch.hex);
              setError(false);
            }
          }}
          aria-invalid={error}
          aria-describedby={error ? `color-error-${index}` : undefined}
          spellCheck={false}
        />
        <span>
          {ratio.toFixed(2)}:1 {darkText ? "black" : "white"} text
        </span>
        <small>{ratio >= 7 ? "AAA" : "AA"} contrast</small>
        {error && (
          <p className="hex-error" id={`color-error-${index}`}>
            Use 6 hex digits, e.g. #A8B78B.
          </p>
        )}
      </div>
      <button
        className={`swatch-lock ${swatch.locked ? "locked" : ""}`}
        style={{ color: text }}
        onClick={onLock}
        aria-label={`${swatch.locked ? "Unlock" : "Lock"} color ${index + 1}`}
        aria-pressed={swatch.locked}
      >
        {swatch.locked ? (
          <LockKeyhole size={19} />
        ) : (
          <UnlockKeyhole size={19} />
        )}
        <span>{swatch.locked ? "Locked" : "Lock color"}</span>
      </button>
    </div>
  );
}

export default function Prism() {
  const [colors, setColors, error] = useStoredState(
    "anant-prism-v1",
    seed,
    valid,
  );
  const [scheme, setScheme] = useState("Earthy");
  const [message, setMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  const allLocked = colors.every((c) => c.locked);
  const generate = () => {
    if (allLocked) {
      setMessage("Unlock a color to keep exploring.");
      return;
    }
    const base = Math.random() * 360;
    const offsets =
      scheme === "Analogous"
        ? [-35, -15, 0, 15, 35]
        : scheme === "Complementary"
          ? [0, 12, 180, 192, 0]
          : [0, 20, 40, 165, 185];
    const lightness = [84, 65, 30, 72, 43];
    setColors((cs) =>
      cs.map((c, i) =>
        c.locked
          ? c
          : {
              hex: hslHex(
                (base + offsets[i] + 360) % 360,
                scheme === "Earthy"
                  ? 20 + Math.random() * 20
                  : 40 + Math.random() * 30,
                lightness[i] + Math.random() * 8 - 4,
              ),
              locked: false,
            },
      ),
    );
    setMessage("A new palette, a new possibility.");
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !exporting &&
        !(
          e.target instanceof HTMLElement &&
          e.target.closest(
            "input, textarea, select, button, a, [contenteditable]",
          )
        )
      ) {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join("\n")}\n}`;
  const copy = async (text: string, success: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(success);
    } catch {
      setMessage(
        "Clipboard unavailable. Export and download the palette, or select a hex value to copy it.",
      );
    }
  };
  return (
    <div className="demo-prism">
      <div className="prism-app-nav">
        <span className="app-brand">
          <Sparkles size={25} /> prism
        </span>
        <span>A little color goes a long way.</span>
        <button className="light-button" onClick={() => setExporting(true)}>
          Export palette <Download size={15} />
        </button>
      </div>
      <div className="prism-intro">
        <span className="demo-eyebrow">YOUR NEXT GREAT PALETTE</span>
        <h2>A feeling, in five colors.</h2>
        <p>Explore. Experiment. Find your kind of color.</p>
      </div>
      <div className="palette-tools">
        <label>
          Palette mood{" "}
          <select value={scheme} onChange={(e) => setScheme(e.target.value)}>
            <option>Earthy</option>
            <option>Analogous</option>
            <option>Complementary</option>
          </select>
        </label>
        <span>Click a hex value to make it your own.</span>
      </div>
      <StorageNotice error={error} />
      <div className="palette">
        {colors.map((color, i) => (
          <ColorSwatch
            key={i}
            swatch={color}
            index={i}
            onChange={(hex) =>
              setColors((cs) => cs.map((c, j) => (j === i ? { ...c, hex } : c)))
            }
            onLock={() =>
              setColors((cs) =>
                cs.map((c, j) => (j === i ? { ...c, locked: !c.locked } : c)),
              )
            }
            onCopy={() => copy(color.hex, `${color.hex} copied to clipboard.`)}
          />
        ))}
      </div>
      <div className="palette-bottom">
        <span role="status">
          <Sparkles size={14} /> {message || "Made for happy accidents."}
        </span>
        <button className="dark-button" onClick={generate} disabled={allLocked}>
          <RefreshCw size={15} /> Generate palette <kbd>space</kbd>
        </button>
      </div>
      {allLocked && (
        <p className="palette-help">
          All colors are locked. Unlock one to generate new possibilities.
        </p>
      )}
      <div className="palette-info">
        <span>
          <Check size={13} /> Contrast ratios use WCAG relative luminance.
        </span>
        <span>
          {error
            ? "Palette available for this session."
            : "Your palette is saved in this browser."}
        </span>
      </div>
      {exporting && (
        <Dialog
          title="Take these colors with you."
          onClose={() => setExporting(false)}
        >
          <p className="dialog-description">
            CSS custom properties, ready for your next project.
          </p>
          <div className="export-palette">
            {colors.map((c, i) => (
              <span key={i} style={{ background: c.hex }} />
            ))}
          </div>
          <pre className="css-export">
            <code>{css}</code>
          </pre>
          <p className="export-message" role="status">
            {message}
          </p>
          <div className="dialog-actions">
            <button
              className="light-button"
              onClick={() => downloadText(css, "prism-palette.css", "text/css")}
            >
              <Download size={15} /> Download CSS
            </button>
            <button
              className="dark-button"
              onClick={() => copy(css, "CSS copied. Go make something good.")}
            >
              <Copy size={15} /> Copy CSS
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowUpRight,
  Cookie,
  Heart,
  Moon,
  PawPrint,
  Sun,
  X,
} from "lucide-react";
import { useStoredState } from "../projects/shared";
import PixelDogSprite from "./PixelDogSprite";
import "./PetStudio.css";

type Species = "cat" | "dog";
type Coat = "ember" | "moss" | "night";
type PetState = {
  species: Species;
  coat: Coat;
  pets: number;
  treats: number;
  sleeping: boolean;
};

const coats = {
  ember: {
    light: "#F6BC7C",
    base: "#D98248",
    shadow: "#AB5737",
    label: "Ember",
  },
  moss: { light: "#BCC7A3", base: "#84966C", shadow: "#536D56", label: "Moss" },
  night: {
    light: "#A5A3A2",
    base: "#696F77",
    shadow: "#444853",
    label: "Night",
  },
} as const;

const initial: PetState = {
  species: "dog",
  coat: "ember",
  pets: 0,
  treats: 0,
  sleeping: false,
};
function isPetState(value: unknown): value is PetState {
  if (!value || typeof value !== "object") return false;
  const pet = value as Partial<PetState>;
  return (
    pet.species === "dog" &&
    (pet.coat === "ember" || pet.coat === "moss" || pet.coat === "night") &&
    typeof pet.pets === "number" &&
    Number.isInteger(pet.pets) &&
    pet.pets >= 0 &&
    pet.pets <= 9999 &&
    typeof pet.treats === "number" &&
    Number.isInteger(pet.treats) &&
    pet.treats >= 0 &&
    pet.treats <= 9999 &&
    typeof pet.sleeping === "boolean"
  );
}

export default function PetStudio({ paused }: { paused: boolean }) {
  const [open, setOpen] = useState(false);
  const [roamBurst, setRoamBurst] = useState(0);
  const [roamDuration, setRoamDuration] = useState(() =>
    typeof window === "undefined"
      ? 22
      : Math.max(4, (window.innerWidth - 263) / 35),
  );
  const dockRef = useRef<HTMLElement>(null);
  const [pet, setPet, storageError] = useStoredState<PetState>(
    "anant-pixel-pet-v1",
    initial,
    isPetState,
  );
  const [message, setMessage] = useState("Pixel is ready to meet you.");
  const [burst, setBurst] = useState(0);
  const coat = coats[pet.coat];
  const isStill = paused || pet.sleeping;
  useEffect(() => {
    const resize = () =>
      setRoamDuration(Math.max(4, (window.innerWidth - 263) / 35));
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: globalThis.PointerEvent) => {
      if (!dockRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const givePet = () => {
    setPet((current) => ({
      ...current,
      sleeping: false,
      pets: Math.min(current.pets + 1, 9999),
    }));
    setMessage(
      pet.sleeping
        ? "Pixel woke up for a head scratch."
        : "That’s the spot. Pixel is very pleased.",
    );
    setBurst((value) => value + 1);
  };
  const giveTreat = () => {
    setPet((current) => ({
      ...current,
      sleeping: false,
      treats: Math.min(current.treats + 1, 9999),
    }));
    setMessage("A tiny treat. A very big day for Pixel.");
    setBurst((value) => value + 1);
  };
  const toggleNap = () => {
    setPet((current) => ({ ...current, sleeping: !current.sleeping }));
    setMessage(
      pet.sleeping
        ? "Pixel is awake and curious again."
        : "Pixel is dreaming in CSS.",
    );
  };
  return (
    <>
      <div
        className={`pixel-roamer-track ${isStill ? "pixel-roamer-paused" : ""}`}
      >
        <button
          className="pixel-roamer"
          style={{ "--roam-duration": `${roamDuration}s` } as CSSProperties}
          aria-label={`Pet Pixel the roaming ${pet.species}`}
          title={
            pet.sleeping
              ? "Pixel is napping. Click to wake and pet."
              : "Pixel is exploring. Click to pet."
          }
          onClick={() => {
            givePet();
            setRoamBurst((value) => value + 1);
          }}
        >
          <span className="pixel-roamer-sprite">
            <PixelDogSprite coat={coat} sleeping={pet.sleeping} />
          </span>
          {roamBurst > 0 && (
            <span
              className="pixel-roamer-heart"
              key={roamBurst}
              aria-hidden="true"
            >
              ♥
            </span>
          )}
        </button>
      </div>
      <aside className="pixel-dock" ref={dockRef} aria-label="Pixel companion">
        <button
          className="pixel-dock-trigger"
          aria-label={open ? "Close Pixel companion" : "Meet Pixel companion"}
          aria-expanded={open}
          aria-controls="pixel-panel"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="pixel-dock-icon" aria-hidden="true">
            <PawPrint size={19} />
          </span>
          <span className="pixel-dock-label">
            PIXEL <span>↗</span>
          </span>
        </button>
        {open && (
          <div
            className="pixel-popover"
            id="pixel-panel"
            aria-labelledby="pet-title"
          >
            <div className="pixel-popover-top">
              <span>
                <PawPrint size={12} /> THE SITE COMPANION
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close Pixel panel"
              >
                <X size={17} />
              </button>
            </div>
            <div className="pet-lab-grid">
              <div
                className={`pet-scene ${isStill ? "pet-still" : ""} ${pet.sleeping ? "pet-asleep" : ""}`}
              >
                <div className="pet-scene-grid" aria-hidden="true" />
                <div className="pet-sun" aria-hidden="true" />
                <div className="pet-orbit orbit-one" aria-hidden="true" />
                <div className="pet-orbit orbit-two" aria-hidden="true" />
                <span className="pet-scene-coordinate">
                  FIG. 002 / THE LITTLE STUDIO RESIDENT
                </span>
                <span className="pet-scene-spark spark-one" aria-hidden="true">
                  ✳
                </span>
                <span className="pet-scene-spark spark-two" aria-hidden="true">
                  ✧
                </span>
                <span
                  className="pet-scene-spark spark-three"
                  aria-hidden="true"
                >
                  +
                </span>
                <div className="pet-platform" aria-hidden="true" />
                <button
                  className="pet-touch"
                  onClick={givePet}
                  aria-label={`Pet Pixel the ${pet.species}`}
                  title="Pet Pixel"
                >
                  <PixelDogSprite coat={coat} sleeping={pet.sleeping} />
                </button>
                {burst > 0 && (
                  <div
                    key={burst}
                    className="pet-heart-burst"
                    aria-hidden="true"
                  >
                    <span>♥</span>
                    <span>✦</span>
                    <span>♥</span>
                  </div>
                )}
                {pet.sleeping && (
                  <div className="pet-zzz" aria-hidden="true">
                    z<span>z</span>
                    <span>z</span>
                  </div>
                )}
                <span className="pet-stage-tip">
                  TAP THE PET FOR A HEAD SCRATCH ↗
                </span>
              </div>
              <div className="pet-control-panel">
                <span className="pet-mini-label">
                  <PawPrint size={14} /> LIVE CREATIVE EXPERIMENT
                </span>
                <h2 id="pet-title">
                  Meet <em>Pixel.</em>
                </h2>
                <p className="pet-intro">
                  The portfolio’s tiny resident. Drawn pixel by pixel, with a
                  proper four-step walk. Pixel isn’t a real pet; it’s a small
                  experiment in making an interface feel alive.
                </p>
                <div className="pet-control-buttons">
                  <button onClick={givePet}>
                    <Heart size={16} /> Pet <span>↗</span>
                  </button>
                  <button onClick={giveTreat}>
                    <Cookie size={16} /> Treat <span>↗</span>
                  </button>
                  <button onClick={toggleNap}>
                    {pet.sleeping ? <Sun size={16} /> : <Moon size={16} />}
                    {pet.sleeping ? "Wake" : "Nap"} <span>↗</span>
                  </button>
                </div>
                <div className="pet-coat-label">CHOOSE A COAT</div>
                <div
                  className="pet-coats"
                  role="group"
                  aria-label="Choose Pixel’s coat"
                >
                  {(Object.keys(coats) as Coat[]).map((name) => (
                    <button
                      key={name}
                      onClick={() => {
                        setPet((current) => ({ ...current, coat: name }));
                        setMessage(
                          `Pixel is wearing ${coats[name].label.toLowerCase()}.`,
                        );
                      }}
                      aria-label={`${coats[name].label} coat`}
                      aria-pressed={pet.coat === name}
                      className={pet.coat === name ? "active" : ""}
                    >
                      <span style={{ background: coats[name].base }} />
                      {coats[name].label}
                    </button>
                  ))}
                </div>
                <div className="pet-status">
                  <span role="status">{message}</span>
                  <span>
                    {pet.pets} pets · {pet.treats} treats
                  </span>
                </div>
                <div className="pet-footnote">
                  <span>
                    {storageError
                      ? "Your session is still playable."
                      : "Pixel remembers your visits in this browser."}
                  </span>
                  <span>
                    BUILT FOR THE JOY OF IT <ArrowUpRight size={11} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

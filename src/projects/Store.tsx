import { useState } from "react";
import { ArrowRight, Check, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { ProductArt } from "../components/Previews";
import { Dialog, StorageNotice, useStoredState } from "./shared";

const products = [
  {
    id: "vase",
    name: "Solstice Vase",
    price: 48,
    category: "Objects",
    material: "Terracotta · 24 cm",
    description:
      "A sculptural silhouette with a softly ribbed surface. An earthy accent for a single stem, a dried arrangement, or simply a quiet corner.",
  },
  {
    id: "lamp",
    name: "The Arc Lamp",
    price: 89,
    category: "Lighting",
    material: "Powder-coated steel · 32 cm",
    description:
      "A gentle pool of light for late-night reading and slow evenings. A mushroom-shaped shade in a warm, understated oat finish.",
  },
  {
    id: "chair",
    name: "Sunday Chair",
    price: 249,
    category: "Furniture",
    material: "Oak & woven cane · 76 cm",
    description:
      "Made for staying a little longer. A curved oak frame and woven cane back create an easy silhouette with a natural warmth.",
  },
  {
    id: "bowl",
    name: "Still Bowl",
    price: 32,
    category: "Objects",
    material: "Stoneware · 22 cm",
    description:
      "A simple, generous shape with a sandy matte glaze. A home for seasonal fruit, collected objects, or whatever the day brings.",
  },
  {
    id: "stool",
    name: "Gather Stool",
    price: 115,
    category: "Furniture",
    material: "Solid walnut · 45 cm",
    description:
      "An extra seat, a bedside companion, a place to set a book. Beautifully simple proportions, designed to find a place anywhere.",
  },
  {
    id: "cup",
    name: "Morning Cup",
    price: 24,
    category: "Objects",
    material: "Glazed ceramic · 300 ml",
    description:
      "Your daily ritual, a little more considered. A generous handle and a soft forest-green glaze for coffee, tea, and unhurried mornings.",
  },
];
type Product = (typeof products)[number];
type Cart = Record<string, number>;
function valid(value: unknown): value is Cart {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.entries(value).every(
      ([key, qty]) =>
        products.some((p) => p.id === key) &&
        typeof qty === "number" &&
        Number.isInteger(qty) &&
        qty > 0 &&
        qty <= 20,
    )
  );
}
const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export default function Store() {
  const [cart, setCart, error] = useStoredState<Cart>(
    "anant-form-cart-v1",
    {},
    valid,
  );
  const [category, setCategory] = useState("All objects");
  const [selected, setSelected] = useState<Product | null>(null);
  const [bag, setBag] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [message, setMessage] = useState("");
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = products.reduce(
    (sum, p) => sum + p.price * (cart[p.id] || 0),
    0,
  );
  const shipping = total >= 150 || total === 0 ? 0 : 8;
  const add = (p: Product) => {
    setCart((c) => ({ ...c, [p.id]: Math.min(20, (c[p.id] || 0) + 1) }));
    setMessage(`${p.name} added to your bag.`);
  };
  const quantity = (id: string, change: number) =>
    setCart((c) => {
      const next = { ...c };
      const qty = Math.min(20, (next[id] || 0) + change);
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  return (
    <div className="demo-store">
      <div className="store-announcement">
        Considered objects. Everyday rituals. &nbsp; Complimentary demo shipping
        over $150.
      </div>
      <div className="store-nav">
        <span className="store-brand">
          form<span>&</span>field
        </span>
        <span className="store-nav-caption">FEWER THINGS. BETTER THINGS.</span>
        <button
          className="bag-button"
          onClick={() => {
            setBag(true);
            setOrdered(false);
          }}
        >
          <ShoppingBag size={18} />
          <span>Bag ({count})</span>
        </button>
      </div>
      <div className="store-hero">
        <div>
          <span className="demo-eyebrow">THE EVERYDAY COLLECTION — 01</span>
          <h2>
            Good things.
            <br />
            Everyday.
          </h2>
          <p>
            A small collection of thoughtful objects.
            <br />
            For the spaces and rituals that make a life.
          </p>
          <a href="#collection">
            Find your everyday <ArrowRight size={17} />
          </a>
        </div>
        <ProductArt kind="vase" />
        <span className="store-hero-caption">
          THE SOLSTICE VASE / TERRACOTTA
        </span>
      </div>
      <div className="store-collection" id="collection">
        <div className="collection-heading">
          <h3>Made for your everyday</h3>
          <span>
            {
              products.filter(
                (p) => category === "All objects" || p.category === category,
              ).length
            }{" "}
            considered objects
          </span>
        </div>
        <div
          className="store-filters"
          role="group"
          aria-label="Product categories"
        >
          {["All objects", "Objects", "Lighting", "Furniture"].map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              className={category === c ? "active" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <StorageNotice error={error} />
        <p className="store-feedback" role="status">
          {message ||
            "An original concept collection. Explore the objects and try the shopping bag."}
        </p>
        <div className="store-grid">
          {products
            .filter(
              (p) => category === "All objects" || p.category === category,
            )
            .map((p) => (
              <article key={p.id}>
                <button
                  className="product-art-button"
                  onClick={() => setSelected(p)}
                  aria-label={`View ${p.name} details`}
                >
                  <ProductArt kind={p.id} />
                  <span className="product-view">
                    Discover <Plus size={15} />
                  </span>
                </button>
                <div className="product-info">
                  <div>
                    <h4>
                      <button onClick={() => setSelected(p)}>{p.name}</button>
                    </h4>
                    <p>{p.material}</p>
                  </div>
                  <span>{money(p.price)}</span>
                </div>
                <button
                  className="product-add"
                  onClick={() => add(p)}
                  disabled={(cart[p.id] || 0) >= 20}
                >
                  {(cart[p.id] || 0) >= 20 ? "Bag limit reached" : "Add to bag"}{" "}
                  <Plus size={13} />
                </button>
              </article>
            ))}
        </div>
        <div className="store-bottom">
          <span>Original objects, illustrated entirely in CSS.</span>
          <span>CONCEPT STOREFRONT / NO REAL PURCHASES</span>
        </div>
      </div>
      {selected && (
        <Dialog
          title={selected.name}
          className="product-dialog"
          onClose={() => setSelected(null)}
        >
          <ProductArt kind={selected.id} />
          <div className="product-modal-info">
            <span className="demo-eyebrow">{selected.material}</span>
            <p>{selected.description}</p>
            <button
              className="dark-button"
              disabled={(cart[selected.id] || 0) >= 20}
              onClick={() => {
                add(selected);
                setSelected(null);
                setBag(true);
                setOrdered(false);
              }}
            >
              Add to bag — {money(selected.price)} <Plus size={15} />
            </button>
          </div>
        </Dialog>
      )}
      {bag && (
        <Dialog
          title={ordered ? "A lovely choice." : `Your bag (${count})`}
          onClose={() => setBag(false)}
          className="cart-dialog"
        >
          {ordered ? (
            <div className="order-success">
              <span>
                <Check size={30} />
              </span>
              <h3>Your demo order is complete.</h3>
              <p>
                This was a simulated checkout. No payment was collected and
                nothing will be shipped.
              </p>
              <button className="dark-button" onClick={() => setBag(false)}>
                Keep exploring <ArrowRight size={16} />
              </button>
            </div>
          ) : count === 0 ? (
            <div className="empty-bag">
              <ShoppingBag size={35} strokeWidth={1} />
              <h3>A little room for something good.</h3>
              <p>
                Your bag is empty. Explore the collection to find your everyday.
              </p>
              <button className="dark-button" onClick={() => setBag(false)}>
                Explore objects <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {products
                  .filter((p) => cart[p.id])
                  .map((p) => (
                    <div className="cart-item" key={p.id}>
                      <ProductArt kind={p.id} />
                      <div>
                        <h3>{p.name}</h3>
                        <p>{money(p.price)} each</p>
                        <div className="quantity-control">
                          <button
                            className="icon-button"
                            aria-label={`Decrease ${p.name} quantity`}
                            onClick={() => quantity(p.id, -1)}
                          >
                            <Minus size={12} />
                          </button>
                          <span aria-label={`${p.name} quantity`}>
                            {cart[p.id]}
                          </span>
                          <button
                            className="icon-button"
                            aria-label={`Increase ${p.name} quantity`}
                            disabled={cart[p.id] >= 20}
                            onClick={() => quantity(p.id, 1)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="cart-item-end">
                        <button
                          className="icon-button"
                          aria-label={`Remove ${p.name}`}
                          onClick={() =>
                            setCart((c) => {
                              const next = { ...c };
                              delete next[p.id];
                              return next;
                            })
                          }
                        >
                          <X size={14} />
                        </button>
                        <span>{money(p.price * cart[p.id])}</span>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="cart-summary">
                <p>
                  <span>Subtotal</span>
                  <span>{money(total)}</span>
                </p>
                <p>
                  <span>Demo shipping</span>
                  <span>{shipping ? money(shipping) : "On us"}</span>
                </p>
                <p className="cart-total">
                  <span>Total</span>
                  <span>{money(total + shipping)}</span>
                </p>
                <button
                  className="dark-button"
                  onClick={() => {
                    setOrdered(true);
                    setCart({});
                    setMessage("Demo order completed. Your bag is empty.");
                  }}
                >
                  Complete demo order <ArrowRight size={16} />
                </button>
                <small>
                  Interactive demonstration only. No payment or personal details
                  required.
                </small>
              </div>
            </>
          )}
        </Dialog>
      )}
    </div>
  );
}

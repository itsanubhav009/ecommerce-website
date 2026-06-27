import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

// ---- seed data (runs only the first time, when db.json doesn't exist) ----
function seed() {
  const now = () => new Date().toISOString();
  const adminPass = bcrypt.hashSync("admin123", 10);
  const userPass = bcrypt.hashSync("user123", 10);

  return {
    users: [
      {
        id: crypto.randomUUID(),
        name: "Store Admin",
        email: "admin@spiderthreads.com",
        password: adminPass,
        role: "ADMIN",
        phone: "",
        createdAt: now(),
      },
      {
        id: crypto.randomUUID(),
        name: "Miles M.",
        email: "user@example.com",
        password: userPass,
        role: "USER",
        phone: "",
        createdAt: now(),
      },
    ],
    products: [
      {
        id: crypto.randomUUID(),
        name: "Across-the-Verse Hoodie",
        description:
          "Heavyweight 420gsm fleece with a halftone web print on the back. Boxy fit, ribbed cuffs.",
        price: 64.0,
        stock: 12,
        category: "Hoodies",
        images: ["/uploads/sample-hoodie.svg"],
        createdAt: now(),
      },
      {
        id: crypto.randomUUID(),
        name: "Glitch Panel Tee",
        description:
          "Oversized cotton tee with a chromatic-aberration comic panel graphic. Pre-shrunk.",
        price: 32.0,
        stock: 25,
        category: "Tees",
        images: ["/uploads/sample-tee.svg"],
        createdAt: now(),
      },
      {
        id: crypto.randomUUID(),
        name: "Pop-Art Bomber",
        description:
          "Satin bomber jacket with embroidered burst patch and ben-day dot lining.",
        price: 98.0,
        stock: 6,
        category: "Jackets",
        images: ["/uploads/sample-bomber.svg"],
        createdAt: now(),
      },
      {
        id: crypto.randomUUID(),
        name: "Spectro Cargo Pants",
        description:
          "Tech-cargo with magenta-and-cyan taping. Adjustable hem, six pockets.",
        price: 78.0,
        stock: 0,
        category: "Pants",
        images: ["/uploads/sample-pants.svg"],
        createdAt: now(),
      },
    ],
    orders: [],
    notifications: [],
  };
}

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(seed(), null, 2));
  }
}

function read() {
  ensure();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function write(db) {
  ensure();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

// ---------- USERS ----------
export function getUserByEmail(email) {
  return read().users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}
export function getUserById(uid) {
  return read().users.find((u) => u.id === uid) || null;
}
export function createUser({ name, email, password, role = "USER" }) {
  const db = read();
  const user = {
    id: id(),
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    role,
    phone: "",
    createdAt: now(),
  };
  db.users.push(user);
  write(db);
  return user;
}

// ---------- PRODUCTS ----------
export function getProducts() {
  return read().products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function getProduct(pid) {
  return read().products.find((p) => p.id === pid) || null;
}
export function createProduct(data) {
  const db = read();
  const product = {
    id: id(),
    name: data.name,
    description: data.description || "",
    price: Number(data.price) || 0,
    stock: Number(data.stock) || 0,
    category: data.category || "Apparel",
    images: Array.isArray(data.images) ? data.images : [],
    createdAt: now(),
  };
  db.products.push(product);
  write(db);
  return product;
}
export function updateProduct(pid, data) {
  const db = read();
  const i = db.products.findIndex((p) => p.id === pid);
  if (i === -1) return null;
  const p = db.products[i];
  db.products[i] = {
    ...p,
    name: data.name ?? p.name,
    description: data.description ?? p.description,
    price: data.price != null ? Number(data.price) : p.price,
    stock: data.stock != null ? Number(data.stock) : p.stock,
    category: data.category ?? p.category,
    images: data.images ?? p.images,
  };
  write(db);
  return db.products[i];
}
export function deleteProduct(pid) {
  const db = read();
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== pid);
  write(db);
  return db.products.length < before;
}

// ---------- ORDERS ----------
export function getOrders() {
  return read().orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function getOrdersByUser(uid) {
  return getOrders().filter((o) => o.userId === uid);
}
export function getOrder(oid) {
  return read().orders.find((o) => o.id === oid) || null;
}
export function createOrder({ userId, userName, items, total, phone, callTime, address }) {
  const db = read();
  const order = {
    id: id(),
    userId,
    userName,
    items, // [{ productId, name, price, quantity }]
    total: Number(total) || 0,
    phone,
    callTime,
    address,
    status: "PENDING", // PENDING | CONFIRMED | REJECTED
    createdAt: now(),
  };
  db.orders.push(order);
  // notify the admin
  db.notifications.push({
    id: id(),
    type: "ORDER",
    message: `New order from ${userName} — ${items.reduce((n, it) => n + it.quantity, 0)} item(s), $${order.total.toFixed(2)}. Call ${phone} at ${callTime}.`,
    orderId: order.id,
    read: false,
    createdAt: now(),
  });
  write(db);
  return order;
}

// Confirm = "yes, it was bought" -> decrement stock. Reject = no change.
export function setOrderStatus(oid, status) {
  const db = read();
  const order = db.orders.find((o) => o.id === oid);
  if (!order) return { error: "Order not found" };
  if (order.status === status) return { order };

  if (status === "CONFIRMED" && order.status !== "CONFIRMED") {
    // verify stock for every item first
    for (const it of order.items) {
      const p = db.products.find((pr) => pr.id === it.productId);
      if (!p) return { error: `Product "${it.name}" no longer exists` };
      if (p.stock < it.quantity)
        return { error: `Not enough stock for "${it.name}" (have ${p.stock}, need ${it.quantity})` };
    }
    // decrement
    for (const it of order.items) {
      const p = db.products.find((pr) => pr.id === it.productId);
      p.stock -= it.quantity;
    }
  }

  order.status = status;
  write(db);
  return { order };
}

// ---------- NOTIFICATIONS ----------
export function getNotifications() {
  return read().notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function getUnreadCount() {
  return read().notifications.filter((n) => !n.read).length;
}
export function markNotificationRead(nid) {
  const db = read();
  const n = db.notifications.find((x) => x.id === nid);
  if (n) n.read = true;
  write(db);
  return n || null;
}
export function markAllRead() {
  const db = read();
  db.notifications.forEach((n) => (n.read = true));
  write(db);
  return true;
}

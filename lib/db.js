import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Data layer backed by Supabase (Postgres). Every function is async.
// Database columns are snake_case; the rest of the app expects camelCase, so
// we map at the boundary here and nothing else in the app has to change.
// ---------------------------------------------------------------------------

// ---- row mappers (db row -> app shape) ----
const mapUser = (r) =>
  r && {
    id: r.id,
    name: r.name,
    email: r.email,
    password: r.password,
    role: r.role,
    phone: r.phone || "",
    createdAt: r.created_at,
  };

const mapProduct = (r) =>
  r && {
    id: r.id,
    name: r.name,
    description: r.description || "",
    price: Number(r.price) || 0,
    stock: Number(r.stock) || 0,
    category: r.category || "Apparel",
    images: Array.isArray(r.images) ? r.images : [],
    createdAt: r.created_at,
  };

const mapOrder = (r) =>
  r && {
    id: r.id,
    userId: r.user_id,
    userName: r.user_name,
    items: Array.isArray(r.items) ? r.items : [],
    total: Number(r.total) || 0,
    phone: r.phone,
    callTime: r.call_time,
    address: r.address,
    status: r.status,
    createdAt: r.created_at,
  };

const mapNotification = (r) =>
  r && {
    id: r.id,
    type: r.type,
    message: r.message,
    orderId: r.order_id,
    read: !!r.read,
    createdAt: r.created_at,
  };

// ---------- USERS ----------
export async function getUserByEmail(email) {
  const { data, error } = await supabase()
    .from("users")
    .select("*")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return mapUser(data) || null;
}

export async function getUserById(uid) {
  const { data, error } = await supabase()
    .from("users")
    .select("*")
    .eq("id", uid)
    .maybeSingle();
  if (error) throw error;
  return mapUser(data) || null;
}

export async function createUser({ name, email, password, role = "USER" }) {
  const { data, error } = await supabase()
    .from("users")
    .insert({
      name,
      email,
      password: bcrypt.hashSync(password, 10),
      role,
      phone: "",
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapUser(data);
}

// ---------- PRODUCTS ----------
export async function getProducts() {
  const { data, error } = await supabase()
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapProduct);
}

export async function getProduct(pid) {
  const { data, error } = await supabase()
    .from("products")
    .select("*")
    .eq("id", pid)
    .maybeSingle();
  if (error) throw error;
  return mapProduct(data) || null;
}

export async function createProduct(data) {
  const { data: row, error } = await supabase()
    .from("products")
    .insert({
      name: data.name,
      description: data.description || "",
      price: Number(data.price) || 0,
      stock: Number(data.stock) || 0,
      category: data.category || "Apparel",
      images: Array.isArray(data.images) ? data.images : [],
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapProduct(row);
}

export async function updateProduct(pid, data) {
  const patch = {};
  if (data.name != null) patch.name = data.name;
  if (data.description != null) patch.description = data.description;
  if (data.price != null) patch.price = Number(data.price);
  if (data.stock != null) patch.stock = Number(data.stock);
  if (data.category != null) patch.category = data.category;
  if (data.images != null) patch.images = data.images;

  const { data: row, error } = await supabase()
    .from("products")
    .update(patch)
    .eq("id", pid)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapProduct(row) || null;
}

export async function deleteProduct(pid) {
  const { data, error } = await supabase()
    .from("products")
    .delete()
    .eq("id", pid)
    .select("id");
  if (error) throw error;
  return (data || []).length > 0;
}

// ---------- ORDERS ----------
export async function getOrders() {
  const { data, error } = await supabase()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapOrder);
}

export async function getOrdersByUser(uid) {
  const { data, error } = await supabase()
    .from("orders")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapOrder);
}

export async function getOrder(oid) {
  const { data, error } = await supabase()
    .from("orders")
    .select("*")
    .eq("id", oid)
    .maybeSingle();
  if (error) throw error;
  return mapOrder(data) || null;
}

export async function createOrder({ userId, userName, items, total, phone, callTime, address }) {
  const { data: row, error } = await supabase()
    .from("orders")
    .insert({
      user_id: userId,
      user_name: userName,
      items, // [{ productId, name, price, quantity }]
      total: Number(total) || 0,
      phone,
      call_time: callTime,
      address,
      status: "PENDING",
    })
    .select("*")
    .single();
  if (error) throw error;
  const order = mapOrder(row);

  // notify the admin
  const count = items.reduce((n, it) => n + it.quantity, 0);
  await supabase()
    .from("notifications")
    .insert({
      type: "ORDER",
      message: `New order from ${userName} — ${count} item(s), $${order.total.toFixed(
        2
      )}. Call ${phone} at ${callTime}.`,
      order_id: order.id,
      read: false,
    });

  return order;
}

// Confirm = "yes, it was bought" -> decrement stock. Reject = no change.
export async function setOrderStatus(oid, status) {
  const order = await getOrder(oid);
  if (!order) return { error: "Order not found" };
  if (order.status === status) return { order };

  if (status === "CONFIRMED" && order.status !== "CONFIRMED") {
    // verify stock for every item first
    for (const it of order.items) {
      const p = await getProduct(it.productId);
      if (!p) return { error: `Product "${it.name}" no longer exists` };
      if (p.stock < it.quantity)
        return {
          error: `Not enough stock for "${it.name}" (have ${p.stock}, need ${it.quantity})`,
        };
    }
    // decrement
    for (const it of order.items) {
      const p = await getProduct(it.productId);
      const { error } = await supabase()
        .from("products")
        .update({ stock: p.stock - it.quantity })
        .eq("id", it.productId);
      if (error) throw error;
    }
  }

  const { data: row, error } = await supabase()
    .from("orders")
    .update({ status })
    .eq("id", oid)
    .select("*")
    .single();
  if (error) throw error;
  return { order: mapOrder(row) };
}

// ---------- NOTIFICATIONS ----------
export async function getNotifications() {
  const { data, error } = await supabase()
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapNotification);
}

export async function getUnreadCount() {
  const { count, error } = await supabase()
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("read", false);
  if (error) throw error;
  return count || 0;
}

export async function markNotificationRead(nid) {
  const { data, error } = await supabase()
    .from("notifications")
    .update({ read: true })
    .eq("id", nid)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapNotification(data) || null;
}

export async function markAllRead() {
  const { error } = await supabase()
    .from("notifications")
    .update({ read: true })
    .eq("read", false);
  if (error) throw error;
  return true;
}

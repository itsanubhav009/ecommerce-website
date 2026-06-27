"use client";

import { useEffect, useRef, useState } from "react";

const EMPTY = { name: "", description: "", price: "", stock: "", category: "Tees", images: [] };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  async function load() {
    const res = await fetch("/api/products", { cache: "no-store" });
    const data = await res.json();
    setProducts(data.products || []);
  }
  useEffect(() => {
    load();
  }, []);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function resetForm() {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
      category: p.category,
      images: p.images || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) return setError(data.error || "Upload failed.");
    set("images", [...form.images, ...data.urls]);
  }

  function removeImage(url) {
    set("images", form.images.filter((u) => u !== url));
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    if (form.images.length === 0) {
      setError("Add at least one photo.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      images: form.images,
    };
    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setError(data.error || "Could not save.");
    resetForm();
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px,1fr]">
      {/* form */}
      <form onSubmit={save} className="panel-dark h-fit space-y-3 p-5">
        <h2 className="font-display text-2xl">{editingId ? "Edit product" : "Add product"}</h2>
        {error && <p className="bg-web px-3 py-2 text-sm font-semibold text-cream">{error}</p>}

        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full border-2 border-cream/40 bg-ink px-3 py-2 text-cream"
        />
        <textarea
          placeholder="Description"
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="w-full border-2 border-cream/40 bg-ink px-3 py-2 text-cream"
        />
        <div className="flex gap-3">
          <input
            required
            type="number"
            step="0.01"
            min="0"
            placeholder="Price"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className="w-1/2 border-2 border-cream/40 bg-ink px-3 py-2 text-cream"
          />
          <input
            required
            type="number"
            min="0"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            className="w-1/2 border-2 border-cream/40 bg-ink px-3 py-2 text-cream"
          />
        </div>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className="w-full border-2 border-cream/40 bg-ink px-3 py-2 text-cream"
        >
          {["Tees", "Hoodies", "Jackets", "Pants", "Accessories"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* image upload */}
        <div>
          <label className="mb-1 block text-sm font-semibold">Photos (one or more)</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="w-full text-xs text-cream/70 file:mr-3 file:border-2 file:border-cream/40 file:bg-pop file:px-3 file:py-1 file:font-impact file:text-ink"
          />
          {uploading && <p className="mt-1 text-xs text-pop">Uploading…</p>}
          {form.images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.images.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="h-16 w-16 border-2 border-cream/40 object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-web text-xs text-cream"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button disabled={saving || uploading} className="btn btn-primary flex-1 py-2">
            {saving ? "Saving…" : editingId ? "Update" : "Add product"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn btn-ghost px-4 py-2">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* list */}
      <div className="space-y-3">
        {products.length === 0 && <p className="text-cream/60">No products yet. Add your first fit.</p>}
        {products.map((p) => (
          <div key={p.id} className="panel-dark flex items-center gap-4 p-3">
            <img
              src={p.images?.[0] || "/uploads/placeholder.svg"}
              alt={p.name}
              className="h-16 w-16 flex-shrink-0 object-cover"
            />
            <div className="flex-1">
              <p className="font-display text-xl tracking-wide">{p.name}</p>
              <p className="text-sm text-cream/60">
                {p.category} · ${p.price.toFixed(2)} ·{" "}
                <span className={p.stock <= 0 ? "text-web" : p.stock <= 5 ? "text-pop" : ""}>
                  {p.stock <= 0 ? "Sold out" : `${p.stock} in stock`}
                </span>
              </p>
            </div>
            <button onClick={() => startEdit(p)} className="btn btn-ghost px-3 py-1 text-xs">
              Edit
            </button>
            <button
              onClick={() => remove(p.id)}
              className="btn px-3 py-1 text-xs"
              style={{ background: "var(--web)", color: "var(--cream)", borderColor: "var(--ink)" }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

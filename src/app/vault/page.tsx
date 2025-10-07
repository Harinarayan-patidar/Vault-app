"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { motion } from "framer-motion";

interface VaultItemType {
  _id: string;
  title?: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

interface FormType {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

export default function VaultPage() {
  const [items, setItems] = useState<VaultItemType[]>([]);
  const [filtered, setFiltered] = useState<VaultItemType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<VaultItemType | null>(null);
  const [form, setForm] = useState<FormType>({
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
  });

  async function fetchItems(token: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/vault/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: VaultItemType[] = await res.json();

      if (!res.ok) throw new Error((data as any).error || "Failed to fetch items");

      setItems(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchItems(token);
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(
      items.filter(
        (i) =>
          i.title?.toLowerCase().includes(lower) ||
          i.username?.toLowerCase().includes(lower)
      )
    );
  }, [search, items]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddEdit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login required");

    const method = editItem ? "PATCH" : "POST";
    const url = editItem
      ? `/api/vault/update/${editItem._id}`
      : `/api/vault/add`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data: VaultItemType = await res.json();
    if (!res.ok) return alert((data as any).error || "Something went wrong");

    if (editItem) {
      setItems((prev) =>
        prev.map((i) => (i._id === editItem._id ? { ...i, ...form } : i))
      );
    } else {
      setItems((prev) => [...prev, data]);
    }

    setFiltered((prev) =>
      editItem
        ? prev.map((i) => (i._id === editItem._id ? { ...i, ...form } : i))
        : [...prev, data]
    );

    setModalOpen(false);
    setEditItem(null);
    setForm({ title: "", username: "", password: "", url: "", notes: "" });
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login required");

    if (!confirm("Are you sure you want to delete this item?")) return;

    const res = await fetch(`/api/vault/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setItems((prev) => prev.filter((i) => i._id !== id));
      setFiltered((prev) => prev.filter((i) => i._id !== id));
    } else {
      alert("Failed to delete item.");
    }
  };

  const handleEdit = (item: VaultItemType) => {
    setEditItem(item);
    setForm({
      title: item.title || "",
      username: item.username || "",
      password: item.password || "",
      url: item.url || "",
      notes: item.notes || "",
    });
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🔐 Your Vault</h1>

      <input
        type="text"
        placeholder="Search by title or username..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 text-white mb-4"
      />

      <button
        onClick={() => {
          setEditItem(null);
          setForm({ title: "", username: "", password: "", url: "", notes: "" });
          setModalOpen(true);
        }}
        className="bg-blue-600 px-4 py-2 rounded mb-6"
      >
        + Add New
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <motion.div
              key={item._id}
              className="bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-blue-500/30 transition"
              whileHover={{ scale: 1.03 }}
            >
              <h2 className="text-xl font-semibold mb-2">
                {item.title || "No Title"}
              </h2>
              <p className="text-sm text-gray-300">
                <strong>Username:</strong> {item.username || "-"}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Password:</strong> {item.password || "-"}
              </p>

              {item.url && (
                <p className="text-sm text-gray-300 break-all">
                  <strong>URL:</strong> {item.url}
                </p>
              )}

              {item.notes && (
                <p className="text-sm text-gray-400 mt-1 italic">{item.notes}</p>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-500 px-3 py-1 rounded text-black"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-red-600 px-3 py-1 rounded text-white"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gray-800 p-6 rounded-xl w-96">
            <h2 className="text-xl font-semibold mb-4">
              {editItem ? "Edit Item" : "Add New Item"}
            </h2>
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              className="w-full p-2 mb-2 bg-gray-700 rounded"
            />
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full p-2 mb-2 bg-gray-700 rounded"
            />
            <input
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-2 mb-2 bg-gray-700 rounded"
            />
            <input
              name="url"
              placeholder="URL"
              value={form.url}
              onChange={handleChange}
              className="w-full p-2 mb-2 bg-gray-700 rounded"
            />
            <textarea
              name="notes"
              placeholder="Notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full p-2 mb-3 bg-gray-700 rounded"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEdit}
                className="px-4 py-2 bg-blue-600 rounded"
              >
                {editItem ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

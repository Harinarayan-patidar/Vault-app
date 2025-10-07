"use client";

import React, { useState, useEffect, useRef } from "react";
import { generatePassword as gen } from "@/utils/generator";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type GenOptions = {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeLookAlikes: boolean;
};

export default function HomePage() {
  const router = useRouter();
  const [options, setOptions] = useState<GenOptions>({
    length: 16,
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
    excludeLookAlikes: true,
  });

  const [password, setPassword] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const clearTimerRef = useRef<number | null>(null);

  // Save form states
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    handleGenerate();
    return () => {
      if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
    };
  }, []);

  function handleGenerate() {
    const opt = { ...options };
    const pwd = gen(
      opt.length,
      opt.upper,
      opt.lower,
      opt.numbers,
      opt.symbols,
      opt.excludeLookAlikes
    );
    setPassword(pwd);
    setCopied(false);
    if (clearTimerRef.current) {
      window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
  }

  async function handleCopy() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      clearTimerRef.current = window.setTimeout(async () => {
        try {
          await navigator.clipboard.writeText("");
          setCopied(false);
        } catch {
          setCopied(false);
        }
      }, 15000);
    } catch (err) {
      console.error("Clipboard error:", err);
      setMessage("Could not copy (browser restriction).");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to save items.");
      setTimeout(() => router.push("/login"), 800);
      return;
    }

    const item = {
      title: title || "Untitled",
      username,
      password,
      url,
      notes,
    };

    setSaving(true);
    try {
      const res = await fetch("/api/vault/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });

      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Save failed");
      else {
        setMessage("✅ Saved to vault successfully!");
        setTitle("");
        setUsername("");
        setUrl("");
        setNotes("");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error saving item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white flex items-start justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.08),transparent_70%)] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-3xl backdrop-blur-sm bg-gray-900/40 rounded-2xl shadow-[0_0_25px_rgba(0,255,255,0.2)] border border-cyan-500/30 p-6"
      >
        <h1 className="text-4xl font-extrabold mb-6 text-center text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]">
          ⚡ Secure Password Generator
        </h1>

        {/* Generator Card */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gray-900/70 rounded-xl shadow-inner p-5 mb-8 border border-gray-800"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-400">Generated password</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    readOnly
                    value={password}
                    className="flex-1 bg-black text-cyan-300 border border-cyan-700 rounded p-2 text-sm font-mono select-all shadow-inner"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopy}
                    className="px-4 py-2 bg-cyan-600 text-black font-semibold rounded hover:bg-cyan-400 transition"
                  >
                    {copied ? "✅ Copied" : "Copy"}
                  </motion.button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Copied text auto-clears after ~15s
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerate}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold rounded-lg shadow-md hover:shadow-cyan-400/30 transition"
              >
                Generate 🔄
              </motion.button>
            </div>

            {/* Slider + Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/60">
                <label className="block text-sm text-gray-400 mb-2">
                  Length: <span className="text-cyan-400">{options.length}</span>
                </label>
                <input
                  type="range"
                  min={8}
                  max={64}
                  value={options.length}
                  onChange={(e) =>
                    setOptions({ ...options, length: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/60">
                <label className="block text-sm text-gray-400 mb-2">Include:</label>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                  {[
                    ["Uppercase", "upper"],
                    ["Lowercase", "lower"],
                    ["Numbers", "numbers"],
                    ["Symbols", "symbols"],
                  ].map(([label, key]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={options[key as keyof GenOptions] as boolean}
                        onChange={(e) =>
                          setOptions({ ...options, [key]: e.target.checked })
                        }
                        className="accent-cyan-500"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm mt-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={options.excludeLookAlikes}
                    onChange={(e) =>
                      setOptions({ ...options, excludeLookAlikes: e.target.checked })
                    }
                    className="accent-cyan-500"
                  />
                  Exclude look-alike chars (O, 0, l, 1)
                </label>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Save Form */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-gray-900/70 rounded-xl p-6 border border-gray-800 shadow-inner"
        >
          <h2 className="text-xl font-semibold mb-4 text-cyan-300">
            💾 Save to Vault
          </h2>

          <form onSubmit={handleSave} className="flex flex-col gap-3">
            {["Title", "Username / Email", "URL (optional)"].map((ph, i) => (
              <input
                key={i}
                placeholder={ph}
                value={i === 0 ? title : i === 1 ? username : url}
                onChange={(e) =>
                  i === 0
                    ? setTitle(e.target.value)
                    : i === 1
                    ? setUsername(e.target.value)
                    : setUrl(e.target.value)
                }
                className="p-2 rounded bg-black border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600"
              />
            ))}
            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="p-2 rounded bg-black border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-600"
            />

            <div className="flex items-center gap-3 mt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black px-5 py-2 rounded-lg font-bold hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save to Vault"}
              </motion.button>

              <button
                type="button"
                onClick={() => {
                  setTitle("");
                  setUsername("");
                  setUrl("");
                  setNotes("");
                }}
                className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-800 transition"
              >
                Clear
              </button>

              <p className="text-sm text-gray-500 ml-auto">
                Stored as plain text ⚠️
              </p>
            </div>

            {message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-center mt-2 text-cyan-400"
              >
                {message}
              </motion.p>
            )}
          </form>
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-right"
        >
          <button
            onClick={() => router.push("/vault")}
            className="text-sm text-cyan-400 underline hover:text-cyan-300 transition"
          >
            → Go to Vault
          </button>
        </motion.div>
      </motion.div>
    </main>
  );
}

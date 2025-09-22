"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import { MobileMenuProvider } from "@/contexts/MobileMenuContext";
import styles from "./broadcast.module.css";

export default function BroadcastClient() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceAuthor, setSourceAuthor] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [type, setType] = useState<"OFFICIAL" | "LEAK" | "PREDICTION">("OFFICIAL");
  const [isLoading, setIsLoading] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !subtitle.trim() || !content.trim() || !sourceAuthor.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/transmissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim(),
          content: content.trim(),
          sourceAuthor: sourceAuthor.trim(),
          sourceUrl: sourceUrl.trim() || null,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create transmission");
      }

      // Reset form
      setTitle("");
      setSubtitle("");
      setContent("");
      setSourceAuthor("");
      setSourceUrl("");
      setType("OFFICIAL");

      // Redirect to home
      router.push("/");
    } catch (error) {
      console.error("Error creating transmission:", error);
      alert("Failed to create transmission. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileMenuProvider>
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.content}>
            <header className={styles.header}>
              <h1 className={styles.title}>BROADCAST_TRANSMISSION</h1>
              <p className={styles.subtitle}>Create a new transmission for the verse</p>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>
                  TITLE *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.input}
                  placeholder="Enter transmission title..."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subtitle" className={styles.label}>
                  SUBTITLE *
                </label>
                <input
                  id="subtitle"
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className={styles.input}
                  placeholder="Brief description or summary..."
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="type" className={styles.label}>
                    TYPE *
                  </label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className={styles.select}
                    required
                  >
                    <option value="OFFICIAL">OFFICIAL</option>
                    <option value="LEAK">LEAK</option>
                    <option value="PREDICTION">PREDICTION</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="sourceAuthor" className={styles.label}>
                    SOURCE AUTHOR *
                  </label>
                  <input
                    id="sourceAuthor"
                    type="text"
                    value={sourceAuthor}
                    onChange={(e) => setSourceAuthor(e.target.value)}
                    className={styles.input}
                    placeholder="Who reported this?"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="sourceUrl" className={styles.label}>
                  SOURCE URL
                </label>
                <input
                  id="sourceUrl"
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className={styles.input}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="content" className={styles.label}>
                  CONTENT *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={styles.textarea}
                  placeholder="Write your transmission content here..."
                  rows={12}
                  required
                />
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className={styles.cancelButton}
                  disabled={isLoading}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? "BROADCASTING..." : "BROADCAST_TRANSMISSION"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </MobileMenuProvider>
  );
}
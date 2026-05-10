"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ResourceForm } from "@/components/resource-form";
import { ResourceList } from "@/components/resource-list";
import { clearAuth, getToken } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { Resource, ResourcePayload } from "@/lib/types";
import styles from "@/styles/dashboard.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const activeTags = useMemo(
    () =>
      tagFilter
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    [tagFilter],
  );

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search.trim()) {
        params.set("search", search.trim());
      }
      activeTags.forEach((tag) => params.append("tags", tag));
      const query = params.toString();
      const data = await apiRequest<Resource[]>(`/resources${query ? `?${query}` : ""}`);
      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [activeTags, search]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    void loadResources();
  }, [loadResources, router]);

  async function handleSave(payload: ResourcePayload) {
    setSubmitting(true);
    setError(null);

    try {
      if (editingResource) {
        await apiRequest<Resource>(`/resources/${editingResource.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest<Resource>("/resources", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setEditingResource(null);
      await loadResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save resource");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(resource: Resource) {
    setError(null);
    try {
      await apiRequest<void>(`/resources/${resource.id}`, { method: "DELETE" });
      if (editingResource?.id === resource.id) {
        setEditingResource(null);
      }
      await loadResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete resource");
    }
  }

  function handleLogout() {
    clearAuth();
    router.replace("/login");
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Personal Knowledge Hub</p>
          <h1>Keep articles, videos, and links easy to find.</h1>
          <p className={styles.subtitle}>
            Save useful resources, tag them for later, and search your library without friction.
          </p>
        </div>
        <button className={styles.secondaryButton} onClick={handleLogout}>
          Log out
        </button>
      </section>

      <section className={styles.grid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>{editingResource ? "Edit resource" : "Add a resource"}</h2>
            {editingResource ? (
              <button className={styles.linkButton} onClick={() => setEditingResource(null)}>
                Cancel edit
              </button>
            ) : null}
          </div>
          <ResourceForm resource={editingResource} onSubmit={handleSave} submitting={submitting} />
        </div>

        <div className={styles.panel}>
          <div className={styles.toolbar}>
            <div className={styles.fieldGroup}>
              <label htmlFor="search">Search by title</label>
              <input
                id="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search saved resources"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="tags">Filter by tags</label>
              <input
                id="tags"
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
                placeholder="frontend, ai, tutorial"
              />
            </div>
            <button className={styles.primaryButton} onClick={() => void loadResources()}>
              Apply filters
            </button>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}
          {loading ? (
            <p className={styles.helper}>Loading resources...</p>
          ) : (
            <ResourceList
              resources={resources}
              onDelete={handleDelete}
              onEdit={setEditingResource}
            />
          )}
        </div>
      </section>
    </main>
  );
}

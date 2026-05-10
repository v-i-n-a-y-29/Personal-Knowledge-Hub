"use client";

import { FormEvent, useEffect, useState } from "react";

import { Resource, ResourcePayload } from "@/lib/types";
import styles from "@/styles/resource-form.module.css";

const emptyForm: ResourcePayload = {
  title: "",
  url: "",
  description: "",
  tags: [],
};

export function ResourceForm({
  resource,
  onSubmit,
  submitting,
}: {
  resource: Resource | null;
  onSubmit: (payload: ResourcePayload) => Promise<void>;
  submitting: boolean;
}) {
  const [title, setTitle] = useState(emptyForm.title);
  const [url, setUrl] = useState(emptyForm.url);
  const [description, setDescription] = useState(emptyForm.description ?? "");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (!resource) {
      setTitle("");
      setUrl("");
      setDescription("");
      setTags("");
      return;
    }

    setTitle(resource.title);
    setUrl(resource.url);
    setDescription(resource.description ?? "");
    setTags(resource.tags.join(", "));
  }, [resource]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      title,
      url,
      description,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    if (!resource) {
      setTitle("");
      setUrl("");
      setDescription("");
      setTags("");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label>
        Title
        <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>

      <label>
        URL
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com"
          required
        />
      </label>

      <label>
        Description
        <textarea
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Optional notes about why this resource matters"
        />
      </label>

      <label>
        Tags
        <input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="mongodb, fastapi, design"
        />
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : resource ? "Update resource" : "Save resource"}
      </button>
    </form>
  );
}

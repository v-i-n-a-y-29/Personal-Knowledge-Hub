"use client";

import { Resource } from "@/lib/types";
import styles from "@/styles/resource-list.module.css";

export function ResourceList({
  resources,
  onEdit,
  onDelete,
}: {
  resources: Resource[];
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
}) {
  if (resources.length === 0) {
    return <p className={styles.empty}>No resources match your current search.</p>;
  }

  return (
    <div className={styles.list}>
      {resources.map((resource) => (
        <article key={resource.id} className={styles.card}>
          <div className={styles.header}>
            <div>
              <h3>{resource.title}</h3>
              <a href={resource.url} target="_blank" rel="noreferrer">
                {resource.url}
              </a>
            </div>
            <div className={styles.actions}>
              <button onClick={() => onEdit(resource)}>Edit</button>
              <button className={styles.danger} onClick={() => onDelete(resource)}>
                Delete
              </button>
            </div>
          </div>

          {resource.description ? <p>{resource.description}</p> : null}

          <div className={styles.meta}>
            <div className={styles.tags}>
              {resource.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <small>Added {new Date(resource.created_at).toLocaleString()}</small>
          </div>
        </article>
      ))}
    </div>
  );
}

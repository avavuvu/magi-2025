import type { CollectionEntry } from "astro:content";

export type ProjectData = CollectionEntry<"projects">["data"] & { description: string, id: string }
export type StudentData = CollectionEntry<"students">["data"] & { description: string, id: string }
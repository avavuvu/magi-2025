import type { CollectionEntry } from "astro:content";

export type ProjectData = CollectionEntry<"projects">["data"] & { description: string, id: string }
import { glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";
import { optional } from "astro:schema";

const students = defineCollection({
    schema: z.object({
        name: z.string(),
        links: z.object({
            instagram: z.string().optional(),
            website: z.string().url().optional(),
            youtube: z.string().optional(),
        })
    }),
    loader: glob({
        pattern: "src/collections/students/*.md"
    })
})

const projects = defineCollection({
    schema: z.object({
        title: z.string(),
        students: z.array(z.string()),
        image: z.string(),
        category: z.union([
            z.literal("animation"),
            z.literal("games"),
            z.literal("interactivity"),
            z.literal("research"),
        ])
    }),
    loader: glob({
        pattern: "src/collections/projects/*.md"
    })
})

export const collections =  {
    students, projects
}
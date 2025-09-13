import { glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";

const students = defineCollection({
    schema: ({image}) => z.object({
        name: z.string(),
        image: image().optional(),
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
    schema: ({image}) => z.object({
        title: z.string(),
        students: z.array(z.string()),
        image: image(),
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
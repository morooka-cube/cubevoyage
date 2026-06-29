import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      order: z.number().default(0),
      date: z.coerce.date().optional(),
      coverImage: image().optional(),
    }),
});

export const collections = { docs };

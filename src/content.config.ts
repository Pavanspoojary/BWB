import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const CategoryEnum = z.enum([
  'Active Sacrilege',
  'Clean Loophole',
  'The Graveyard',
]);

export const RiskLevelEnum = z.enum([
  'Low',
  'TOS Gray Area',
  'Nuclear',
]);

export const SaasTargetEnum = z.enum([
  'Auth',
  'Storage',
  'Database',
  'Logging',
  'Email',
]);

export const hackSchema = z.object({
  category: CategoryEnum,
  risk_level: RiskLevelEnum,
  saas_target: SaasTargetEnum,
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  replaces_saas: z.string().min(1, 'replaces_saas is required'),
  estimated_monthly_savings: z.number().int().positive('Savings must be a positive integer'),
  primitives_abused: z.array(z.string().min(1)).min(1, 'At least one abused primitive must be listed'),
  author_github: z.string().min(1, 'author_github is required'),
  date_added: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date_added must be formatted as YYYY-MM-DD'),
  warning_banner: z.string().optional(),
  is_deprecated: z.boolean().optional().default(false),
});

export type HackFrontmatter = z.infer<typeof hackSchema>;

export const collections = {
  hacks: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/hacks' }),
    schema: hackSchema,
  }),
};

import * as z from 'zod'
import { SCAFFOLD } from '../brief/blockFields'
import {
    ACTIONS,
    ITEM_PARTS,
    JOBS,
    SECTION_PARTS,
    type InterviewOption,
} from '../inspire/blockInterview'
import { SECTOR_IDS, VIBE_IDS } from '../inspire/direction'
import { PALETTE_ROLES } from '../inspire/palettes'

/** The shape of every answer Claude can give. Structured outputs enforce them. */

const KEEP = ['token', 'block', 'studio', 'readme'] as const
const POLICIES = [
    'photography',
    'illustration',
    'generated abstract',
    'product UI',
    'none',
] as const

export const suggestionsSchema = z.object({
    options: z.array(z.string()),
})

export const featureSchema = z.object({
    text: z.string(),
    kind: z.enum(['block', 'art', 'site']),
    ref: z.string(),
})

export const ruleSchema = z.object({
    rule: z.string(),
    keep: z.enum(KEEP),
    how: z.string(),
})

export const featuresSchema = z.object({ features: z.array(featureSchema) })
export const rulesSchema = z.object({ rules: z.array(ruleSchema) })

export const conceptDraftSchema = z.object({
    mood: z.string(),
    vibes: z.array(z.enum(VIBE_IDS)),
    sector: z.enum(SECTOR_IDS),
})

export const productDraftSchema = z.object({
    positioning: z.string(),
    audience: z.string(),
    refs: z.string(),
    features: z.array(featureSchema),
})

export const identityDraftSchema = z.object({
    identity: z.string(),
    rules: z.array(ruleSchema),
})

export const artDraftSchema = z.object({
    policy: z.enum(POLICIES),
    note: z.string(),
    primitives: z.array(
        z.object({
            cls: z.string(),
            draws: z.string(),
            variants: z.string(),
            motion: z.string(),
        })
    ),
})

export const paletteSchema = z.object({
    name: z.string(),
    note: z.string(),
    colours: z.object(
        Object.fromEntries(
            PALETTE_ROLES.map((role) => [role, z.string()])
        ) as Record<(typeof PALETTE_ROLES)[number], z.ZodString>
    ),
})

type Choices = [string, ...string[]]
const ids = (options: InterviewOption[]) =>
    options.map((option) => option.id) as Choices

export const blockAnswersSchema = z.object({
    job: z.enum(ids(JOBS)),
    shape: z.enum(['single', 'list', 'both']),
    itemParts: z.array(z.enum(ids(ITEM_PARTS))),
    sectionParts: z.array(z.enum(ids(SECTION_PARTS))),
    actions: z.array(z.enum(ids(ACTIONS))),
})

export const blockPlanSchema = z.object({
    restyle: z.array(
        z.object({ type: z.string(), treatment: z.string(), why: z.string() })
    ),
    build: z.array(
        z.object({
            slug: z.string(),
            purpose: z.string(),
            why: z.string(),
            fullWidth: z.boolean(),
            answers: blockAnswersSchema,
        })
    ),
})

const itemFieldSchema = z.object({
    name: z.string(),
    type: z.enum(SCAFFOLD.types.filter((type) => type !== 'list') as Choices),
    required: z.boolean(),
})

/** Every field has `of`, empty unless it is a list: no optional keys to miss. */
export const blockFieldsSchema = z.object({
    fields: z.array(
        z.object({
            name: z.string(),
            type: z.enum(SCAFFOLD.types as Choices),
            required: z.boolean(),
            of: z.array(itemFieldSchema),
            note: z.string(),
        })
    ),
})

export type Suggestions = z.infer<typeof suggestionsSchema>
export type FeatureAnswer = z.infer<typeof featureSchema>
export type RuleAnswer = z.infer<typeof ruleSchema>
export type ConceptDraft = z.infer<typeof conceptDraftSchema>
export type ProductDraft = z.infer<typeof productDraftSchema>
export type IdentityDraft = z.infer<typeof identityDraftSchema>
export type ArtDraft = z.infer<typeof artDraftSchema>
export type PaletteAnswer = z.infer<typeof paletteSchema>
export type BlockPlan = z.infer<typeof blockPlanSchema>
export type BlockFieldsAnswer = z.infer<typeof blockFieldsSchema>
export type DraftAnswer =
    ConceptDraft | ProductDraft | IdentityDraft | ArtDraft | BlockPlan

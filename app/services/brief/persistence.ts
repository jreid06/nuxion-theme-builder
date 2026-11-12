import { fieldsFromNames } from './blockFields'
import { exampleBrief } from './example'
import {
    blankAnswers,
    blankBrief,
    blankLayout,
    defaultStudioOptions,
    SCHEMA_VERSION,
    type BlockAnswers,
    type BlockField,
    type Brief,
    type ThemeBlock,
} from './model'

/**
 * Saved briefs: one storage entry per brief, so two tabs editing different
 * briefs never overwrite each other. The list is read straight from the keys,
 * with no separate index that two writers could both update.
 *
 * The storage, clock and ids all come in as arguments so tests can fix them.
 */

export const BRIEF_PREFIX = 'nuxion-theme-builder:brief:'
/** Where the single brief lived before there could be several. */
export const LEGACY_KEY = 'nuxion-theme-builder'

export type BriefStorage = Pick<
    Storage,
    'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'
>

export interface SavedBrief {
    id: string
    /** Milliseconds since 1970, from the clock passed in when it was saved. */
    updatedAt: number
    brief: Brief
}

const isBriefShaped = (value: unknown): value is Partial<Brief> => {
    if (!value || typeof value !== 'object') return false
    const candidate = value as Partial<Brief>
    return candidate.v === SCHEMA_VERSION && Array.isArray(candidate.swatches)
}

/** A theme block as saved before fields were typed: names in one string. */
type SavedBlock = Partial<Omit<ThemeBlock, 'fields' | 'answers'>> & {
    fields?: BlockField[] | string
    answers?: Partial<BlockAnswers>
}

const migrateBlock = (block: SavedBlock): ThemeBlock => ({
    slug: block.slug ?? '',
    purpose: block.purpose ?? '',
    answers: { ...blankAnswers(), ...block.answers },
    fields:
        typeof block.fields === 'string'
            ? fieldsFromNames(block.fields)
            : (block.fields ?? []),
    fullWidth: block.fullWidth ?? true,
})

/** Fills anything a saved brief doesn't have yet. */
export const withDefaults = (saved: Partial<Brief>): Brief => {
    const base = saved.example ? exampleBrief() : blankBrief()
    return {
        ...base,
        ...saved,
        layout: {
            ...blankLayout(),
            ...(saved.layout ?? base.layout),
        },
        studio: { ...defaultStudioOptions(), ...saved.studio },
        blocks: (saved.blocks ?? base.blocks).map((block) =>
            migrateBlock(block as SavedBlock)
        ),
    }
}

const parseSaved = (id: string, text: string | null): SavedBrief | null => {
    if (!text) return null
    try {
        const parsed: unknown = JSON.parse(text)
        if (!parsed || typeof parsed !== 'object') return null
        const { updatedAt, brief } = parsed as Partial<SavedBrief>
        if (typeof updatedAt !== 'number' || !isBriefShaped(brief)) return null
        return { id, updatedAt, brief: withDefaults(brief) }
    } catch {
        return null
    }
}

export const readBrief = (storage: BriefStorage, id: string) =>
    parseSaved(id, storage.getItem(`${BRIEF_PREFIX}${id}`))

/** Every readable saved brief, most recently edited first. */
export const listBriefs = (storage: BriefStorage): SavedBrief[] => {
    const ids: string[] = []
    for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index)
        if (key?.startsWith(BRIEF_PREFIX))
            ids.push(key.slice(BRIEF_PREFIX.length))
    }
    return ids
        .map((id) => readBrief(storage, id))
        .filter((saved): saved is SavedBrief => saved !== null)
        .sort((a, b) => b.updatedAt - a.updatedAt)
}

export const writeBrief = (storage: BriefStorage, saved: SavedBrief) => {
    storage.setItem(
        `${BRIEF_PREFIX}${saved.id}`,
        JSON.stringify({ updatedAt: saved.updatedAt, brief: saved.brief })
    )
}

export const removeBrief = (storage: BriefStorage, id: string) => {
    storage.removeItem(`${BRIEF_PREFIX}${id}`)
}

/**
 * Moves a brief saved by the single-brief version into the list, once.
 * Returns its new id, or null when there was nothing to move.
 */
export const migrateLegacyBrief = (
    storage: BriefStorage,
    id: string,
    now: number
): string | null => {
    const text = storage.getItem(LEGACY_KEY)
    if (!text) return null
    storage.removeItem(LEGACY_KEY)
    try {
        const parsed: unknown = JSON.parse(text)
        if (!isBriefShaped(parsed)) return null
        writeBrief(storage, { id, updatedAt: now, brief: withDefaults(parsed) })
        return id
    } catch {
        return null
    }
}

/** A copy that reads as a copy, so it can't be mistaken for the original. */
export const duplicateBrief = (brief: Brief): Brief => {
    // A JSON round trip, not structuredClone, which rejects Vue's reactive proxies.
    const copy = JSON.parse(JSON.stringify(brief)) as Brief
    copy.title = copy.title ? `${copy.title} (copy)` : ''
    copy.autoName = false
    copy.example = false
    return copy
}

/** A brief as a downloadable .json file, which `parseBriefFile` reads back. */
export const briefFile = (brief: Brief) => ({
    filename: `${brief.name || 'theme'}-brief.json`,
    text: JSON.stringify(brief, null, 2),
})

export type ParsedBrief =
    { ok: true; brief: Brief } | { ok: false; error: string }

export const parseBriefFile = (text: string): ParsedBrief => {
    let parsed: unknown
    try {
        parsed = JSON.parse(text)
    } catch {
        return {
            ok: false,
            error: 'That file isn’t valid JSON. Check it’s the complete file you saved.',
        }
    }
    return isBriefShaped(parsed)
        ? { ok: true, brief: withDefaults(parsed) }
        : {
              ok: false,
              error: 'That file isn’t a saved theme brief. Open a .json file saved from this tool.',
          }
}

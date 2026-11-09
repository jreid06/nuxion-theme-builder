import { exampleBrief } from './example'
import {
    blankBrief,
    blankLayout,
    defaultStudioOptions,
    SCHEMA_VERSION,
    type Brief,
} from './model'

/** Reading and writing a brief. The storage is passed in so tests can fake it. */

export const STORAGE_KEY = 'nuxion-theme-builder'

type BriefStorage = Pick<Storage, 'getItem' | 'setItem'>

const isBriefShaped = (value: unknown): value is Partial<Brief> => {
    if (!value || typeof value !== 'object') return false
    const candidate = value as Partial<Brief>
    return candidate.v === SCHEMA_VERSION && Array.isArray(candidate.swatches)
}

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
    }
}

export const loadBrief = (storage: BriefStorage): Brief | null => {
    const saved = storage.getItem(STORAGE_KEY)
    if (!saved) return null
    try {
        const parsed: unknown = JSON.parse(saved)
        return isBriefShaped(parsed) ? withDefaults(parsed) : null
    } catch {
        return null
    }
}

export const saveBrief = (storage: BriefStorage, brief: Brief) => {
    storage.setItem(STORAGE_KEY, JSON.stringify(brief))
}

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

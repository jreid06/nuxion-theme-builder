import type { Brief } from '../brief/model'

/**
 * The theme's direction: up to three mood words and a sector, picked on the
 * Concept step. Every idea option carries tags from the same lists, so the
 * options that fit the concept can be shown first.
 */

export const VIBE_IDS = [
    'calm',
    'bold',
    'warm',
    'technical',
    'editorial',
    'playful',
    'luxurious',
    'natural',
] as const

export const SECTOR_IDS = [
    'software',
    'hospitality',
    'creative',
    'nonprofit',
    'services',
    'retail',
] as const

export type VibeId = (typeof VIBE_IDS)[number]
export type SectorId = (typeof SECTOR_IDS)[number]
export type DirectionTag = VibeId | SectorId

export const MAX_VIBES = 3

export const VIBE_LABELS: Record<VibeId, string> = {
    calm: 'Calm',
    bold: 'Bold',
    warm: 'Warm',
    technical: 'Technical',
    editorial: 'Editorial',
    playful: 'Playful',
    luxurious: 'Luxurious',
    natural: 'Natural',
}

export const SECTOR_LABELS: Record<SectorId, string> = {
    software: 'Software and tech',
    hospitality: 'Food and hospitality',
    creative: 'Creative studios',
    nonprofit: 'Charities and non-profits',
    services: 'Professional services',
    retail: 'Shops and products',
}

export interface Tagged {
    tags?: readonly DirectionTag[]
}

export interface Ranked<T> {
    item: T
    /** Shares at least one tag with the brief's direction. */
    suits: boolean
}

const labelOf = (id: string) =>
    VIBE_LABELS[id as VibeId] ?? SECTOR_LABELS[id as SectorId] ?? id

export const directionTags = (brief: Brief): string[] =>
    [...brief.direction.vibes, brief.direction.sector].filter(Boolean)

/** "Calm, technical · Software and tech", or '' with nothing chosen. */
export const describeDirection = (brief: Brief) => {
    const vibes = brief.direction.vibes.map(labelOf).join(', ')
    const sector = brief.direction.sector ? labelOf(brief.direction.sector) : ''
    return [vibes, sector].filter(Boolean).join(' · ')
}

/**
 * The same items, those sharing the most tags with the direction first.
 * Stable, so items that score the same keep their written order.
 */
export const rankForDirection = <T extends Tagged>(
    items: readonly T[],
    brief: Brief
): Ranked<T>[] => {
    const wanted = new Set(directionTags(brief))
    return items
        .map((item, index) => ({
            item,
            index,
            score: (item.tags ?? []).filter((tag) => wanted.has(tag)).length,
        }))
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .map(({ item, score }) => ({ item, suits: score > 0 }))
}

export const toggleVibe = (vibes: string[], vibe: string): string[] => {
    if (vibes.includes(vibe)) return vibes.filter((item) => item !== vibe)
    return vibes.length >= MAX_VIBES ? vibes : [...vibes, vibe]
}

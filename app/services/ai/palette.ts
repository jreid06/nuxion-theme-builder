import type { Brief } from '../brief/model'
import {
    isCompletePalette,
    paletteContrast,
    type Palette,
    type PaletteContrast,
} from '../inspire/palettes'
import { ClaudeFailure, describeFailure, type ClaudeCaller } from './caller'
import { paletteRequest } from './prompts'

/**
 * Asks Claude for a palette, checks it, and asks once more naming any pairs
 * that fail. Whatever comes back second is shown, failures and all.
 */

export interface GeneratedPalette {
    palette: Palette
    contrast: PaletteContrast
    retried: boolean
}

const askOnce = async (
    caller: ClaudeCaller,
    brief: Brief,
    failures: string[]
): Promise<Palette> => {
    const answer = await caller.run(paletteRequest(brief, failures))
    if (!isCompletePalette(answer.colours)) {
        throw new ClaudeFailure(describeFailure({ kind: 'unreadable' }))
    }
    return { name: answer.name, note: answer.note, colours: answer.colours }
}

export const generatePalette = async (
    caller: ClaudeCaller,
    brief: Brief
): Promise<GeneratedPalette> => {
    const first = await askOnce(caller, brief, [])
    const firstContrast = paletteContrast(first.colours, brief.dark)
    if (!firstContrast.failures.length) {
        return { palette: first, contrast: firstContrast, retried: false }
    }
    const second = await askOnce(caller, brief, firstContrast.failures)
    return {
        palette: second,
        contrast: paletteContrast(second.colours, brief.dark),
        retried: true,
    }
}

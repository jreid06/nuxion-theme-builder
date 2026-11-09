import type { Brief } from '../model'
import type { StepId } from '../steps'
import { checkArt } from './art'
import { checkBlocks } from './blocks'
import { checkButtons } from './buttons'
import { checkConcept } from './concept'
import { checkIdentity } from './identity'
import { checkProduct } from './product'
import { checkShape } from './shape'
import { checkSwatches } from './swatches'
import { checkThemes } from './themes'
import { checkTypography, type TextMeasure } from './typography'

export interface Issue {
    step: StepId
    severity: 'error' | 'warn'
    /** The `path` of the field to take the author to. */
    field: string
    message: string
}

export type { TextMeasure }

export const runChecks = (brief: Brief, measure: TextMeasure): Issue[] => [
    ...checkConcept(brief),
    ...checkProduct(brief),
    ...checkIdentity(brief),
    ...checkSwatches(brief),
    ...checkThemes(brief),
    ...checkButtons(brief),
    ...checkTypography(brief, measure),
    ...checkShape(brief),
    ...checkArt(brief),
    ...checkBlocks(brief),
]

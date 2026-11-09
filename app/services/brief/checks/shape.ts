import { CORNERS, MEASURES, measureToken } from '../layout'
import type { Brief } from '../model'
import type { Issue } from '.'

const isCssLength = (value: string) =>
    /^(0|\d*\.?\d+(rem|px|em))$/.test(value.trim())

export const checkShape = (brief: Brief): Issue[] => {
    const { width, radius, measure } = brief.layout
    const entries: [string, string, string | undefined][] = [
        ['layout.width', 'Page width', width],
        ...CORNERS.map(({ key, title }): [string, string, string] => [
            `layout.radius.${key}`,
            `${title} corner`,
            radius[key],
        ]),
        ...MEASURES.map(({ key }): [string, string, string | undefined] => [
            `layout.measure.${key}`,
            measureToken(key),
            measure[key],
        ]),
    ]

    return entries
        .filter(([, , value]) => value && !isCssLength(value))
        .map(([field, label]) => ({
            step: 'shape',
            severity: 'warn',
            field,
            message: `${label} isn’t a valid size. Use rem or px, such as 0.5rem.`,
        }))
}

import { toRaw } from 'vue'

/** The few helpers that touch the browser or Vue internals. */

export const fieldId = (path: string) =>
    `f-${path.replace(/[^a-z0-9]+/gi, '-')}`

let lastRowKey = 0
const rowKeys = new WeakMap<object, number>()

/** A stable `v-for` key for a row, without storing one in the saved brief. */
export const rowKey = (row: object) => {
    const raw = toRaw(row)
    let key = rowKeys.get(raw)
    if (!key) {
        key = ++lastRowKey
        rowKeys.set(raw, key)
    }
    return key
}

export const downloadText = (filename: string, text: string) => {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}

let measureContext: CanvasRenderingContext2D | null | undefined

export const canvasTextMeasure = (text: string, font: string) => {
    measureContext ??= document.createElement('canvas').getContext('2d')
    if (!measureContext) return 0
    measureContext.font = font
    return measureContext.measureText(text).width
}

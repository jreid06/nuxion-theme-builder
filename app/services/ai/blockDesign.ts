import { checkFields } from '../brief/blockFields'
import {
    blockField,
    type BlockField,
    type Brief,
    type ThemeBlock,
} from '../brief/model'
import type { ClaudeCaller } from './caller'
import { blockFieldsRequest } from './prompts'
import type { BlockFieldsAnswer } from './schemas'

/**
 * Asks Claude to design a block's fields, then keeps only what the scaffolder
 * would accept. Anything dropped is reported, so nothing vanishes silently.
 */

export interface DesignedFields {
    fields: BlockField[]
    /** What an editor puts in each of the block's own fields, by name. */
    notes: Record<string, string>
    /** Why each dropped field was dropped. */
    dropped: string[]
}

const toField = (answer: BlockFieldsAnswer['fields'][number]): BlockField =>
    answer.type === 'list'
        ? blockField(
              answer.name,
              'list',
              answer.required,
              answer.of.map((child) =>
                  blockField(child.name, child.type, child.required)
              )
          )
        : blockField(answer.name, answer.type, answer.required)

/** Removes every field `checkFields` objects to, item fields first. */
export const keepValidFields = (fields: BlockField[]) => {
    const dropped: string[] = []
    const describe = (field: BlockField, message: string) =>
        dropped.push(`${field.name || 'A field'}: ${message}`)

    const withItems = fields.map((field, index) => {
        if (!field.of) return field
        const bad = new Map(
            checkFields(fields)
                .filter((issue) => issue.at.startsWith(`${index}.`))
                .map((issue) => [Number(issue.at.split('.')[1]), issue.message])
        )
        return {
            ...field,
            of: field.of.filter((child, position) => {
                const message = bad.get(position)
                if (message) describe(child, message)
                return !message
            }),
        }
    })
    const bad = new Map(
        checkFields(withItems)
            .filter((issue) => !issue.at.includes('.'))
            .map((issue) => [Number(issue.at), issue.message])
    )
    const kept = withItems.filter((field, index) => {
        const message = bad.get(index)
        if (message) describe(field, message)
        return !message
    })
    return { fields: kept, dropped }
}

export const designFields = async (
    caller: ClaudeCaller,
    brief: Brief,
    block: ThemeBlock
): Promise<DesignedFields> => {
    const answer = await caller.run(blockFieldsRequest(brief, block))
    const notes: Record<string, string> = {}
    for (const field of answer.fields) {
        notes[field.name] = field.note
    }
    return { ...keepValidFields(answer.fields.map(toField)), notes }
}

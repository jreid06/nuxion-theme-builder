import facts from '~~/data/nuxion.generated.json'
import { blockField, type BlockField } from './model'
import { markdownRole } from './nuxion'

/**
 * A theme block's fields as the scaffolder's `--fields` spec, and the checks
 * that spec has to pass. The rules' data (types, reserved and intro names) is
 * read from Nuxion by `npm run sync:nuxion`; the integration test runs every
 * spec this app can produce through Nuxion's own parser.
 */

export const SCAFFOLD = facts.scaffoldFields

/** What each type is called on screen. A type missing here shows its own name. */
const TYPE_LABELS: Record<string, string> = {
    string: 'Short text',
    text: 'Plain text',
    number: 'Number',
    boolean: 'On or off',
    'portable-text': 'Rich text',
    image: 'Image',
    link: 'Link',
    'link.group': 'Buttons',
    list: 'List of items',
}

export const typeLabel = (type: string) => TYPE_LABELS[type] ?? type

export const FIELD_TYPE_OPTIONS = SCAFFOLD.types.map((type) => ({
    value: type,
    label: typeLabel(type),
}))

const NAME = /^[a-z][a-zA-Z0-9]*$/

/** `tiers:list[name:string!,price:string],note:text` */
export const fieldSpec = (fields: BlockField[]): string =>
    fields
        .map(
            (field) =>
                `${field.name}:${field.type}${
                    field.type === 'list'
                        ? `[${fieldSpec(field.of ?? [])}]`
                        : ''
                }${field.required ? '!' : ''}`
        )
        .join(',')

export interface FieldIssue {
    /** Where the field is: `2`, or `2.0` for a list's first item field. */
    at: string
    message: string
}

/** Everything the scaffolder would refuse, as messages an author can act on. */
export const checkFields = (
    fields: BlockField[],
    parent = ''
): FieldIssue[] => {
    const issues: FieldIssue[] = []
    const seen = new Set<string>()
    const nested = Boolean(parent)

    fields.forEach((field, index) => {
        const at = parent ? `${parent}.${index}` : String(index)
        const add = (message: string) => issues.push({ at, message })
        const name = field.name.trim()

        if (!NAME.test(name)) {
            add(
                name
                    ? `“${name}” isn’t a field name. Use letters and digits, starting lowercase, like title or ctaLabel.`
                    : 'Name this field.'
            )
        } else if (seen.has(name)) {
            add(`There are two fields named ${name}.`)
        }
        seen.add(name)

        if (!SCAFFOLD.types.includes(field.type)) {
            add(`${field.type || 'No type'} isn’t a type the scaffolder knows.`)
        }
        if (!nested && SCAFFOLD.intro.includes(name)) {
            add(
                `Every theme block already has ${name}. Use another name or remove this field.`
            )
        } else if (!nested && SCAFFOLD.reserved.includes(name)) {
            add(`${name} holds the block’s section options. Use another name.`)
        } else if (
            !nested &&
            SCAFFOLD.linkGroupNames.includes(name) &&
            field.type !== 'link.group'
        ) {
            add(`${name} can only be Buttons. Rename it or change its type.`)
        }

        if (field.type === 'list') {
            if (nested) add('A list can’t sit inside another list.')
            else if (!field.of?.length) {
                add('Add at least one field to each item in this list.')
            } else issues.push(...checkFields(field.of, at))
        }
    })
    return issues
}

/** Every field, list items included, with the names they'd be read by. */
export const flattenFields = (fields: BlockField[]): BlockField[] =>
    fields.flatMap((field) => [field, ...flattenFields(field.of ?? [])])

const typeFromName = (name: string) => {
    const role = markdownRole(name)
    if (role === 'Rich') return 'portable-text'
    if (role === 'Plain') return 'text'
    return 'string'
}

/**
 * Typed fields from the old comma-separated names. A list name takes the
 * names after it as its item fields, which is how those briefs wrote them:
 * "tiers, name, price" meant tiers of name and price.
 */
export const fieldsFromNames = (text: string): BlockField[] => {
    const fields: BlockField[] = []
    let list: BlockField | null = null
    for (const name of text
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)) {
        if (markdownRole(name) === 'Items') {
            list = blockField(name, 'list', false, [])
            fields.push(list)
        } else if (list) {
            list.of!.push(blockField(name, typeFromName(name)))
        } else {
            fields.push(blockField(name, typeFromName(name)))
        }
    }
    return fields
}

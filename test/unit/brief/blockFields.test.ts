import { describe, expect, it } from 'vitest'
import {
    checkFields,
    fieldSpec,
    fieldsFromNames,
    SCAFFOLD,
} from '~/services/brief/blockFields'
import { exampleBrief } from '~/services/brief/example'
import { blockField as field, type BlockField } from '~/services/brief/model'
import { withDefaults } from '~/services/brief/persistence'

const list = (name: string, of: BlockField[], required = false) =>
    field(name, 'list', required, of)

describe('fieldSpec', () => {
    it('writes the scaffolder’s --fields format', () => {
        expect(
            fieldSpec([
                list(
                    'tiers',
                    [field('name', 'string', true), field('price')],
                    true
                ),
                field('note', 'text'),
            ])
        ).toBe('tiers:list[name:string!,price:string]!,note:text')
    })
})

describe('checkFields', () => {
    const messagesFor = (fields: BlockField[]) =>
        checkFields(fields).map((issue) => `${issue.at} ${issue.message}`)

    it('passes every field in the worked example', () => {
        for (const block of exampleBrief().blocks) {
            expect(checkFields(block.fields)).toEqual([])
        }
    })

    it.each([
        [[field('')], /^0 Name this field/],
        [[field('Title')], /^0 “Title” isn’t a field name/],
        [[field('a'), field('a', 'text')], /^1 There are two fields named a/],
        [[field('heading')], /already has heading/],
        [[field('options')], /section options/],
        [[field('buttons')], /can only be Buttons/],
        [[field('a', 'widget')], /widget isn’t a type/],
        [[list('items', [])], /at least one field/],
        [
            [list('items', [list('inner', [field('a')])])],
            /^0\.0 A list can’t sit/,
        ],
        [[list('items', [field('b'), field('b')])], /^0\.1 There are two/],
    ])('flags %j', (fields, message) => {
        expect(messagesFor(fields as BlockField[]).join('\n')).toMatch(message)
    })

    it('lets an item use names a block keeps for itself', () => {
        expect(
            checkFields([
                list('items', [
                    field('heading'),
                    field('options'),
                    field('buttons', 'link'),
                ]),
            ])
        ).toEqual([])
    })

    it('reads its rules from the synced scaffolder facts', () => {
        expect(SCAFFOLD.types).toContain('list')
        expect(SCAFFOLD.intro).toContain('heading')
        expect(checkFields([field(SCAFFOLD.reserved[0]!)])).toHaveLength(1)
    })
})

describe('fieldsFromNames', () => {
    it('reads a list name followed by its item names', () => {
        expect(fieldsFromNames('tiers, name, blurb, content')).toEqual([
            list('tiers', [
                field('name'),
                field('blurb', 'text'),
                field('content', 'portable-text'),
            ]),
        ])
    })

    it('keeps names before any list as the block’s own', () => {
        expect(fieldsFromNames('announcement, ,consoleFlags')).toEqual([
            field('announcement'),
            field('consoleFlags'),
        ])
    })
})

describe('older saved briefs', () => {
    it('turn a string of field names into typed fields', () => {
        const brief = exampleBrief()
        const saved = JSON.parse(JSON.stringify(brief))
        saved.blocks = [
            {
                slug: 'metrics',
                purpose: 'figures',
                fields: 'stats, value, label',
                projection: false,
                fullWidth: true,
            },
        ]
        const [block] = withDefaults(saved).blocks
        expect(block).toEqual({
            slug: 'metrics',
            purpose: 'figures',
            answers: {
                job: '',
                shape: '',
                itemParts: [],
                sectionParts: [],
                actions: [],
                special: '',
            },
            fields: [list('stats', [field('value'), field('label')])],
            fullWidth: true,
        })
    })
})

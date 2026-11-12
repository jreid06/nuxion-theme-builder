import { blankAnswers, type Brief, type ThemeBlock } from '../brief/model'
import { slugify } from '../brief/names'
import { SHIPPED_BLOCKS } from '../brief/nuxion'
import { fieldsFromAnswers } from '../inspire/blockInterview'
import {
    featureFromIdea,
    fillPlaceholders,
    ruleFromIdea,
} from '../inspire/ideas'
import type { DraftStep } from './prompts'
import type {
    ArtDraft,
    BlockPlan,
    ConceptDraft,
    DraftAnswer,
    FeatureAnswer,
    IdentityDraft,
    ProductDraft,
    RuleAnswer,
} from './schemas'

/**
 * A draft from Claude as separate proposals the author ticks one by one.
 * Nothing here touches the brief until `applyProposals` runs.
 */

export interface Proposal {
    id: string
    label: string
    text: string
    /** True when accepting it overwrites something the author wrote. */
    replaces: boolean
    apply: (brief: Brief) => void
}

const replacing = (current: string) => Boolean(current.trim())

export const featureFromAnswer = (brief: Brief, answer: FeatureAnswer) =>
    featureFromIdea(brief, {
        ...answer,
        ref: fillPlaceholders(answer.ref, brief),
    })

export const ruleFromAnswer = (brief: Brief, answer: RuleAnswer) =>
    ruleFromIdea(brief, answer)

const textProposal = (
    id: string,
    label: string,
    text: string,
    current: string,
    set: (brief: Brief, text: string) => void
): Proposal => ({
    id,
    label,
    text,
    replaces: replacing(current),
    apply: (target) => set(target, text),
})

const featureProposals = (brief: Brief, features: FeatureAnswer[]) =>
    features.map((feature, index): Proposal => ({
        id: `feature-${index}`,
        label: 'New signature feature',
        text: `${feature.text} (${fillPlaceholders(feature.ref, brief)})`,
        replaces: false,
        apply: (target) =>
            target.features.push(featureFromAnswer(target, feature)),
    }))

const ruleProposals = (brief: Brief, rules: RuleAnswer[]) =>
    rules.map((rule, index): Proposal => ({
        id: `rule-${index}`,
        label: 'New rule',
        text: `${rule.rule}: ${fillPlaceholders(rule.how, brief)}`,
        replaces: false,
        apply: (target) => target.rules.push(ruleFromAnswer(target, rule)),
    }))

/** A planned block's slug, without the codename Claude sometimes adds. */
const planSlug = (brief: Brief, slug: string) =>
    slugify(slug.replace(new RegExp(`^${brief.name || 'theme'}\\.`), ''))

export const blockFromPlan = (
    brief: Brief,
    planned: BlockPlan['build'][number]
): ThemeBlock => {
    const answers = { ...blankAnswers(), ...planned.answers }
    return {
        slug: planSlug(brief, planned.slug),
        purpose: planned.purpose,
        answers,
        fields: fieldsFromAnswers(answers),
        fullWidth: planned.fullWidth,
    }
}

/** A shipped block to restyle or a theme block to build, one proposal each. */
const blockPlanProposals = (brief: Brief, plan: BlockPlan): Proposal[] => {
    const restyled = new Set(brief.restyled.map((block) => block.type))
    const planned = new Set(brief.blocks.map((block) => block.slug))
    const name = brief.name || 'theme'
    return [
        ...plan.restyle
            .filter((item) => {
                if (!SHIPPED_BLOCKS.includes(item.type)) return false
                if (restyled.has(item.type)) return false
                restyled.add(item.type)
                return true
            })
            .map((item, index): Proposal => ({
                id: `restyle-${index}`,
                label: `Restyle ${item.type}`,
                text: `${item.treatment} (${item.why})`,
                replaces: false,
                apply: (target) => {
                    target.restyled.push({
                        type: item.type,
                        treatment: item.treatment,
                    })
                },
            })),
        ...plan.build
            .filter((item) => {
                const slug = planSlug(brief, item.slug)
                if (!slug || planned.has(slug)) return false
                planned.add(slug)
                return true
            })
            .map((item, index): Proposal => ({
                id: `build-${index}`,
                label: `Build ${name}.${planSlug(brief, item.slug)}`,
                text: `${item.purpose} (${item.why})`,
                replaces: false,
                apply: (target) => {
                    target.blocks.push(blockFromPlan(target, item))
                },
            })),
    ]
}

export const draftProposals = (
    step: DraftStep,
    brief: Brief,
    answer: DraftAnswer
): Proposal[] => {
    switch (step) {
        case 'concept': {
            const draft = answer as ConceptDraft
            const vibes = draft.vibes.slice(0, 3)
            const hasDirection = Boolean(
                brief.direction.vibes.length || brief.direction.sector
            )
            return [
                textProposal(
                    'mood',
                    'One line of mood',
                    draft.mood,
                    brief.mood,
                    (target, text) => {
                        target.mood = text
                    }
                ),
                {
                    id: 'direction',
                    label: 'Direction',
                    text: [vibes.join(', '), draft.sector]
                        .filter(Boolean)
                        .join(' · '),
                    replaces: hasDirection,
                    apply: (target) => {
                        target.direction = { vibes, sector: draft.sector }
                    },
                },
            ]
        }
        case 'product': {
            const draft = answer as ProductDraft
            return [
                textProposal(
                    'positioning',
                    'Positioning',
                    draft.positioning,
                    brief.positioning,
                    (target, text) => {
                        target.positioning = text
                    }
                ),
                textProposal(
                    'audience',
                    'Audience',
                    draft.audience,
                    brief.audience,
                    (target, text) => {
                        target.audience = text
                    }
                ),
                textProposal(
                    'refs',
                    'Reference brands',
                    draft.refs,
                    brief.refs,
                    (target, text) => {
                        target.refs = text
                    }
                ),
                ...featureProposals(brief, draft.features),
            ]
        }
        case 'identity': {
            const draft = answer as IdentityDraft
            return [
                textProposal(
                    'identity',
                    'The idea',
                    draft.identity,
                    brief.identity,
                    (target, text) => {
                        target.identity = text
                    }
                ),
                ...ruleProposals(brief, draft.rules),
            ]
        }
        case 'art': {
            const draft = answer as ArtDraft
            return [
                {
                    id: 'policy',
                    label: 'Imagery policy',
                    text: draft.policy,
                    replaces:
                        Boolean(brief.art.policy) &&
                        brief.art.policy !== draft.policy,
                    apply: (target) => {
                        target.art.policy = draft.policy
                    },
                },
                textProposal(
                    'note',
                    'Imagery note',
                    draft.note,
                    brief.art.note,
                    (target, text) => {
                        target.art.note = text
                    }
                ),
                ...draft.primitives.map((primitive, index): Proposal => ({
                    id: `primitive-${index}`,
                    label: 'New CSS primitive',
                    text: `.${brief.px || 'xx'}-${primitive.cls}: ${primitive.draws}`,
                    replaces: false,
                    apply: (target) => {
                        target.art.primitives.push({ ...primitive })
                    },
                })),
            ]
        }
        case 'blocks':
            return blockPlanProposals(brief, answer as BlockPlan)
    }
}

/** The ids ticked by default: everything that won't overwrite the author's work. */
export const defaultSelection = (proposals: Proposal[]) =>
    new Set(
        proposals
            .filter((proposal) => !proposal.replaces)
            .map((proposal) => proposal.id)
    )

export const applyProposals = (
    brief: Brief,
    proposals: Proposal[],
    selected: ReadonlySet<string>
) => {
    for (const proposal of proposals) {
        if (selected.has(proposal.id)) proposal.apply(brief)
    }
}

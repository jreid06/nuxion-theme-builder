import type { Brief } from '../brief/model'
import { rankForDirection } from './direction'
import type { Choice } from './fieldGuides'

/** "Surprise me": mood lines built from a place, its materials and what happens there. */

const PLACES: Choice[] = [
    { text: 'A lighthouse keeper’s study', tags: ['calm', 'natural'] },
    { text: 'A botanist’s field station', tags: ['natural', 'nonprofit'] },
    { text: 'A letterpress print shop', tags: ['editorial', 'creative'] },
    { text: 'A night train’s dining car', tags: ['luxurious', 'hospitality'] },
    {
        text: 'A harbour market at dawn',
        tags: ['warm', 'retail', 'hospitality'],
    },
    { text: 'A mountain weather hut', tags: ['technical', 'natural'] },
    {
        text: 'A record shop’s back room',
        tags: ['playful', 'creative', 'retail'],
    },
    { text: 'A ceramics studio after firing', tags: ['warm', 'creative'] },
    { text: 'An observatory control room', tags: ['technical', 'software'] },
    { text: 'A greenhouse in winter', tags: ['calm', 'natural'] },
    { text: 'A members’ club library', tags: ['luxurious', 'services'] },
    { text: 'A funfair at closing time', tags: ['bold', 'playful'] },
]

const MATERIALS: Choice[] = [
    {
        text: 'brass, salt-stained glass and pencil marks',
        tags: ['calm', 'technical'],
    },
    {
        text: 'pressed leaves, linen and iron-gall ink',
        tags: ['natural', 'editorial'],
    },
    { text: 'warm paper, wet ink and lead type', tags: ['editorial', 'warm'] },
    { text: 'lacquer, frosted lamps and pressed cotton', tags: ['luxurious'] },
    { text: 'wet slate, rope and painted crates', tags: ['natural', 'retail'] },
    { text: 'weathered pine, wool and enamel', tags: ['warm', 'hospitality'] },
    {
        text: 'vinyl sleeves, cork and valve-amp glow',
        tags: ['playful', 'creative'],
    },
    { text: 'raw clay, ash glaze and chalk dust', tags: ['warm', 'creative'] },
    {
        text: 'matte steel, red lamps and graph paper',
        tags: ['technical', 'software'],
    },
    {
        text: 'neon tubes, chrome and striped canvas',
        tags: ['bold', 'playful'],
    },
    {
        text: 'oak panelling, leather and fine paper',
        tags: ['luxurious', 'services'],
    },
]

const HAPPENINGS: Choice[] = [
    {
        text: 'where every update is logged by hand',
        tags: ['technical', 'software'],
    },
    { text: 'where nothing moves until it has to', tags: ['calm'] },
    { text: 'where each page is set with care', tags: ['editorial'] },
    {
        text: 'where the view keeps changing outside',
        tags: ['luxurious', 'hospitality'],
    },
    {
        text: 'where the day starts before anyone asks',
        tags: ['warm', 'services'],
    },
    { text: 'where every reading matters', tags: ['technical'] },
    {
        text: 'where the good stuff is kept out back',
        tags: ['playful', 'retail'],
    },
    { text: 'where things are finished slowly', tags: ['warm', 'creative'] },
    {
        text: 'where something is always quietly growing',
        tags: ['natural', 'nonprofit'],
    },
    { text: 'where everything is turned up loud', tags: ['bold', 'playful'] },
]

/** One of the items that suit the direction, or any item if none do. */
const pickFrom = (choices: Choice[], brief: Brief, random: () => number) => {
    const ranked = rankForDirection(choices, brief)
    const suited = ranked.filter((entry) => entry.suits)
    const pool = suited.length ? suited : ranked
    return pool[Math.floor(random() * pool.length)]?.item.text ?? ''
}

/** `random` returns a number in [0, 1), like Math.random; tests pass their own. */
export const surpriseMoods = (
    brief: Brief,
    random: () => number,
    count = 3
): string[] =>
    Array.from(
        { length: count },
        () =>
            `${pickFrom(PLACES, brief, random)}: ${pickFrom(MATERIALS, brief, random)}, ${pickFrom(HAPPENINGS, brief, random)}.`
    )

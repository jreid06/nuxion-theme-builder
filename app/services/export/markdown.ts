const escapeCell = (value: string) =>
    value.replace(/\|/g, '\\|').replace(/\n/g, ' ')

/** A pipe table with padded columns, exactly as Prettier lays one out. */
export const markdownTable = (head: string[], rows: string[][]) => {
    const all = [head, ...rows].map((row) => row.map(escapeCell))
    const widths = head.map((_, column) =>
        Math.max(3, ...all.map((row) => row[column]?.length ?? 0))
    )
    const line = (row: string[]) =>
        `| ${row.map((value, column) => value.padEnd(widths[column] ?? 0)).join(' | ')} |`
    const [header, ...body] = all
    return [
        line(header ?? []),
        `| ${widths.map((width) => '-'.repeat(width)).join(' | ')} |`,
        ...body.map(line),
    ].join('\n')
}

export const inlineCode = (value: string) => (value ? `\`${value}\`` : '')

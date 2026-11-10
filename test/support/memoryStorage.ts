/** An in-memory stand-in for localStorage and sessionStorage. */
export const memoryStorage = () => {
    const data = new Map<string, string>()
    return {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => void data.set(key, value),
        removeItem: (key: string) => void data.delete(key),
        key: (index: number) => [...data.keys()][index] ?? null,
        get length() {
            return data.size
        },
        clear: () => data.clear(),
        data,
        dump: () => [...data.values()].join('\n'),
    }
}

export type MemoryStorage = ReturnType<typeof memoryStorage>

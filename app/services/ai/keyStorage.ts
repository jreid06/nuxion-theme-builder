/**
 * Where the user's API key lives: the tab's session storage by default, or
 * local storage when they tick "Remember on this device". Never in the brief.
 */

export const KEY_STORAGE = 'nuxion-theme-builder-claude-key'

type KeyStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export interface KeyStores {
    session: KeyStore
    local: KeyStore
}

export const readKey = (stores: KeyStores) => {
    const remembered = stores.local.getItem(KEY_STORAGE)
    if (remembered) return { key: remembered, remember: true }
    return { key: stores.session.getItem(KEY_STORAGE) ?? '', remember: false }
}

/** Writes to one store and clears the other, so a key is never in both. */
export const saveKey = (stores: KeyStores, key: string, remember: boolean) => {
    const [keep, clear] = remember
        ? [stores.local, stores.session]
        : [stores.session, stores.local]
    keep.setItem(KEY_STORAGE, key)
    clear.removeItem(KEY_STORAGE)
}

export const clearKey = (stores: KeyStores) => {
    stores.local.removeItem(KEY_STORAGE)
    stores.session.removeItem(KEY_STORAGE)
}

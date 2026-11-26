const URL_HASH_PAIR_SEPARATOR = "_"
const URL_HASH_KEY_VALUE_SEPARATOR = "-"

function readUrlHashPairs(): Map<string, string> {
    const pairs = new Map<string, string>()
    const hash = location.hash.substring(1)
    if (hash === "") {
        return pairs
    }
    for (const pair of hash.split(URL_HASH_PAIR_SEPARATOR)) {
        const index = pair.indexOf(URL_HASH_KEY_VALUE_SEPARATOR)
        if (index > 0) {
            pairs.set(pair.substring(0, index), pair.substring(index + 1))
        }
    }
    return pairs
}

/**
 * @returns the decoded value stored for key in the url fragment, or undefined
 */
export function getUrlHashValue(key: string): string | undefined {
    const raw = readUrlHashPairs().get(key)
    if (raw === undefined) {
        return undefined
    }
    try {
        return decodeURIComponent(raw)
    } catch (e) {
        return undefined
    }
}

/**
 * stores value for key in the url fragment, keeping all other key-value pairs
 *
 * @param push add a history entry instead of replacing the current one
 */
export function setUrlHashValue(key: string, value: string, push: boolean) {
    const pairs = readUrlHashPairs()
    pairs.set(key, encodeURIComponent(value).replace(/[-_]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`))
    const hash = [...pairs].map(([k, v]) => `${k}${URL_HASH_KEY_VALUE_SEPARATOR}${v}`).join(URL_HASH_PAIR_SEPARATOR)
    if (location.hash === `#${hash}`) {
        return
    }
    const url = `${location.pathname}${location.search}#${hash}`
    if (push) {
        history.pushState(null, "", url)
    } else {
        history.replaceState(history.state, "", url)
    }
}

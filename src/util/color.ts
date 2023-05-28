export interface RGBA {
    r: number,
    g: number,
    b: number,
    a: number
}

export function parseColor(color: string): RGBA | undefined {
    let m, r, g, b, a
    color = color.trim()
    m = color.match(/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/)
    if (m !== null) {
        r = parseInt(m[1], 16)
        g = parseInt(m[2], 16)
        b = parseInt(m[3], 16)
        r = r * 16 + r
        g = g * 16 + g
        b = b * 16 + b
        a = 1
        return { r, g, b, a }
    }
    m = color.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/)
    if (m !== null) {
        r = parseInt(m[1], 16)
        g = parseInt(m[2], 16)
        b = parseInt(m[3], 16)
        a = 1
        return { r, g, b, a }
    }
    m = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/)
    if (m !== null) {
        r = parseInt(m[1])
        g = parseInt(m[2])
        b = parseInt(m[3])
        a = 1
        return { r, g, b, a }
    }
    m = color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/)
    if (m !== null) {
        r = parseInt(m[1])
        g = parseInt(m[2])
        b = parseInt(m[3])
        a = parseInt(m[4])
        return { r, g, b, a }
    }
    return undefined
}

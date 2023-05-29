export interface RGB {
    r: number,
    g: number,
    b: number
}

export interface RGBA extends RGB {
    a: number
}

export interface HSV {
    h: number,
    s: number,
    v: number
}

// https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately

/**
 * Convert HSV to RGB
 * 
 * @param h hue in [0,360]
 * @param s saturation in [0,1]
 * @param v value in [0,1]
 * @returns r,g,b in [0,1]
 */
export function hsv2rgb(h: number, s: number, v: number): RGB {
    const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)
    return { r: f(5), g: f(3), b: f(1) }
}

/**
 * Convert RGB to HSV
 * 
 * @param r red in [0,1]
 * @param g green in [0,1]
 * @param b blue in [0,1]
 * @returns h in [0,360] and s,v in [0,1]
 */
export function rgb2hsv(r: number, g: number, b: number): HSV {
    let v = Math.max(r, g, b), c = v - Math.min(r, g, b)
    let h = c && ((v == r) ? (g - b) / c : ((v == g) ? 2 + (b - r) / c : 4 + (r - g) / c))
    return { h: 60 * (h < 0 ? h + 6 : h), s: v && c / v, v }
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

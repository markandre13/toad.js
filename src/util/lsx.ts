/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * LSX (LiSp like XHTML), a light weight JSX alternative
 */
// export interface HTMLElementProps {

// }

// while the 'css' tagged template string function returns the string as is,
// it's use enables CSS syntax highlightning in Visual Studio Code
export function css(strings: TemplateStringsArray, ...values: any) {
    let str = strings[0]
    values.forEach( (s: string, i: number) => {
        str = str.concat(s).concat(strings[i+1])
    })
    return str
}

export function html(strings: TemplateStringsArray, ...values: any) {
    let str = strings[0]
    values.forEach( (s: string, i: number) => {
        str = str.concat(s).concat(strings[i+1])
    })
    return str
}

export function element<T>(type: string, children: Node[]): T {
    const element = document.createElement(type)
    for (let i = 0; i < children.length; ++i) {
        let child = children[i]
        if (child instanceof Array) {
            children.splice(i, 1, ...child)
            child = children[i]
        }
        if (typeof child === "string") {
            element.appendChild(document.createTextNode(child))
            continue
        }
        element.appendChild(child)
    }
    return element as unknown as T
}
export function array(times: number, create:(idx:number) => Element): Element[] {
    let a = []
    for (let i = 0; i < times; ++i) {
        const c = create(i)
        if (c instanceof Array) {
            a.push(...c)
        } else {
            a.push(c)
        }
    }
    return a
}
export function text(text: string): Text { return document.createTextNode(text) }
export const div = (...children: Node[]) => element<HTMLDivElement>("div", children)
export const span = (...children: Node[]) => element<HTMLSpanElement>("span", children)
export const slot = (...children: Node[]) => element<HTMLSlotElement>("slot", children)
export const form = (...children: Node[]) => element<HTMLFormElement>("form", children)
export const input = (...children: Node[]) => element<HTMLInputElement>("input", children)
export const button = (...children: Node[]) => element<HTMLButtonElement>("button", children)
export const ul = (...children: Node[]) => element<HTMLUListElement>("ul", children)
export const ol = (...children: Node[]) => element<HTMLOListElement>("ol", children)
export const li = (...children: (Node)[]) => element<HTMLLIElement>("li", children)
export const table = (...children: Node[]) => element<HTMLTableElement>("table", children)
export const thead = (...children: Node[]) => element<HTMLHeadElement>("thead", children)
export const th = (...children: Node[]) => element<HTMLTableCellElement>("th", children)
export const tbody = (...children: Node[]) => element<HTMLBodyElement>("tbody", children)
export const td = (...children: Node[]) => element<HTMLTableCellElement>("td", children)
export const tr = (...children: Node[]) => element<HTMLTableRowElement>("tr", children)

const ns = "http://www.w3.org/2000/svg"
export function svg(child?: Element) {
    const s = document.createElementNS(ns, "svg")
    if (child !== undefined) {
        s.appendChild(child)
    }
    return s
}
export function path(d?: string) {
    const p = document.createElementNS(ns, "path")
    if (d !== undefined) {
        p.setAttributeNS(null, "d", d)
    }
    return p
}
export function rect(x: number, y: number, width: number, height: number, stroke?: string, fill?: string) {
    const r = document.createElementNS(ns, "rect")
    r.setAttributeNS(null, "x", `${x}`)
    r.setAttributeNS(null, "y", `${y}`)
    r.setAttributeNS(null, "width", `${width}`)
    r.setAttributeNS(null, "height", `${height}`)
    if (stroke !== undefined) {
        r.setAttributeNS(null, "stroke", stroke)
    }
    if (fill !== undefined) {
        r.setAttributeNS(null, "fill", fill)
    }
    return r
}
export function line(x1: number, y1: number, x2: number, y2: number, stroke?: string, fill?: string) {
    const l = document.createElementNS(ns, "line")
    l.setAttributeNS(null, "x1", `${x1}`)
    l.setAttributeNS(null, "y1", `${y1}`)
    l.setAttributeNS(null, "x2", `${x2}`)
    l.setAttributeNS(null, "y2", `${y2}`)
    if (stroke !== undefined) {
        l.setAttributeNS(null, "stroke", stroke)
    }
    if (fill !== undefined) {
        l.setAttributeNS(null, "fill", fill)
    }
    return l
}


export function svgAndUse(ref: string) {
    const ns = "http://www.w3.org/2000/svg"
    const s = document.createElementNS(ns, "svg")
    const u = document.createElementNS(ns, "use")
    u.setAttributeNS(ns, "href", ref)
    u.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', ref)
    s.appendChild(u)
    return s
}
// export function use(ref: string) {
//     const ns = "http://www.w3.org/1999/xlink"
//     const u = document.createElementNS(ns, "use")
//     u.setAttributeNS(ns, 'xlink:href', ref)
//     return u
// }
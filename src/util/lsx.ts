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

export function element<T>(type: string, children: Element[]): T {
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
export const div = (...children: Element[]) => element<HTMLDivElement>("div", children)
export const span = (...children: Element[]) => element<HTMLSpanElement>("span", children)
export const slot = (...children: Element[]) => element<HTMLSlotElement>("slot", children)
export const form = (...children: Element[]) => element<HTMLFormElement>("form", children)
export const input = (...children: Element[]) => element<HTMLInputElement>("input", children)
export const button = (...children: Element[]) => element<HTMLButtonElement>("button", children)
export const ul = (...children: Element[]) => element<HTMLUListElement>("ul", children)
export const ol = (...children: Element[]) => element<HTMLOListElement>("ol", children)
export const li = (...children: (Element|Text)[]) => element<HTMLLIElement>("li", children as Element[])
export const table = (...children: Element[]) => element<HTMLTableElement>("table", children)
export const thead = (...children: Element[]) => element<HTMLHeadElement>("thead", children)
export const th = (...children: Element[]) => element<HTMLTableCellElement>("th", children)
export const tbody = (...children: Element[]) => element<HTMLBodyElement>("tbody", children)
export const td = (...children: Element[]) => element<HTMLTableCellElement>("td", children)
export const tr = (...children: Element[]) => element<HTMLTableRowElement>("tr", children)

const ns = "http://www.w3.org/2000/svg"
export function svg(child: Element) {
    const s = document.createElementNS(ns, "svg")
    s.appendChild(child)
    return s
}
export function path(d?: string) {
    const p = document.createElementNS(ns, "path")
    if (d !== undefined) {
        p.setAttributeNS(null, "d", d)
    }
    return p
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
/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2021 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export namespace JSX {
    interface JsxStyle {
        width?: string | number
        height?: string | number
        border?: string
        cursor?: string
        display?: string
    }
    export interface DefaultProps {
        class?: string
        style?: JsxStyle
        width?: string | number
        height?: string | number
        title?: string
        set?: Reference
    }
    export interface SVGProps extends DefaultProps {
        viewBox?: string
    }
    export interface IntrinsicElements {
        div: DefaultProps
        b: DefaultProps
        i: DefaultProps
        u: DefaultProps
        strike: DefaultProps
        button: DefaultProps
        table: DefaultProps
        thead: DefaultProps
        tbody: DefaultProps
        tr: DefaultProps
        th: DefaultProps
        td: DefaultProps
        svg: SVGProps
        line: {
            x1: string | number
            y1: string | number
            x2: string | number
            y2: string | number
            stroke?: string
            cursor?: string
            class?: string
        }
        rect: {
            x: string | number
            y: string | number
            width: string | number
            height: string | number
            rx?: string | number
            ry?: string | number
            stroke?: string
            fill?: string
            cursor?: string
            class?: string
        }
        circle: {
            cx: string | number
            cy: string | number
            r: string | number
            stroke?: string
            fill?: string
            cursor?: string
            class?: string
        }
        text: {
            x: string | number
            y: string | number
            stroke?: string
            fill?: string
            cursor?: string
            class?: string
        }
    }
    export interface Reference {
        object: Object
        attribute: string
    }
}

export function createElement(name: string, props: JSX.DefaultProps, ...children: any): Element {
    let namespace
    switch (name) {
        case 'svg':
        case 'line':
        case 'rect':
        case 'text':
            namespace = "http://www.w3.org/2000/svg"
            break
        default:
            namespace = "http://www.w3.org/1999/xhtml"
    }
    const tag = document.createElementNS(namespace, name) as HTMLElement | SVGSVGElement
    if (props !== null) {
        for (const [key, value] of Object.entries(props)) {
            switch(key) {
                case 'class':
                    tag.classList.add(value) // FIXME: value is whitespace separated list
                    break
                case 'style':
                    for (const [skey, svalue] of Object.entries(value)) {
                        tag.style.setProperty(skey, svalue as string)
                    }
                    break
                case 'set':
                    Object.defineProperty(props.set!.object, props.set!.attribute, { value: tag })
                    break
                default:
                    tag.setAttributeNS(null, key, value)
            }
        }
    }
    for (let child of children) {
        if (typeof child === "string") {
            tag.appendChild(document.createTextNode(child))
        } else {
            tag.appendChild(child)
        }
    }
    return tag
}

export function ref<T>(object: T, attribute: keyof T): JSX.Reference {
    return { object: object, attribute: attribute.toString() }
}

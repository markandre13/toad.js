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

// https://html.spec.whatwg.org/multipage/

import { Action } from "@toad/model/Action"
import { NumberModel } from "@toad/model/NumberModel"
import { TextModel } from "@toad/model/TextModel"
import { TableModel } from "@toad/table/TableModel"

export namespace JSX {
    interface JsxStyle {
        width?: string | number
        height?: string | number
        top?: string | number
        bottom?: string | number
        left?: string | number
        right?: string | number
        border?: string
        cursor?: string
        display?: "block" | "inline" | "run-in" | "flow" | "flow-root" | "table" | "flex" | "grid" | "ruby"
        | "list-item" | "contents" | "none" | "inline-block" | "inline-list-item" | "inline-table" | "inline-flex" | "inline-grid"
        | "table-row-group" | "table-header-group" | "table-footer-group" | "table-row" | "table-cell" 
        | "table-column-group" | "table-column" | "table-caption"
        | "ruby-base" | "ruby-text" | "ruby-base-container" | "ruby-text-container"
        overflow?: "visible" | "hidden" | "scroll" | "auto" | "initial" | "inherit"
        position?: string
    }

    export interface ToadButtonProps extends HTMLElementProps {
        model?: string | TextModel
        action?: string | Action
    }
    export interface ToadSliderProps extends HTMLElementProps {
        model?: string | NumberModel
    }
    export interface ToadTextProps extends HTMLElementProps {
        model?: string | TextModel | NumberModel
    }
    export interface ToadTableProps extends HTMLElementProps {
        model?: string | TableModel
    }
    export interface SVGProps extends HTMLElementProps {
        viewBox?: string
        width?: string | number
        height?: string | number
    }

    interface ToadProps {
        set?: Reference
    }

    // 4.9 Element
    interface ElementProps extends ToadProps {
        id?: string
        class?: string
        // classList
        // slot
    }

    // 3.2.2 Elements in the DOM
    export interface HTMLElementProps extends ElementProps {
        // metadata attributes
        title?: string
        lang?: string
        translate?: boolean
        dir?: string

        // user interaction
        hidden?: boolean
        accessKey?: string
        accessKeyLabel?: string
        draggable?: boolean
        spellcheck?: boolean
        autocapitalize?: string

        // FIXME: 3.2.6 Global Attributes missing
        autofocus?: boolean
        contenteditable?: boolean
        enterkeyhint?: string
        // inputmode
        // is
        // itemid
        // itemref
        // itemscope
        // itemtype
        // nonce
        style?: JsxStyle
        // tabindex

        // skipped:
        // innerText?: string
        // outerText?: string
    }

    interface HTMLBaseElementProps extends HTMLElementProps {
        href?: string
        target?: string
    }

    interface HTMLLinkElementProps extends HTMLElementProps {
        href?: string
        crossOrigin?: string
        rel?: string
        as?: string
        // relList
        media?: string
        integrity?: string
        hreflang?: string
        type?: string
        // sizes
        imageSrcset?: string
        imageSizes?: string
        referrerPolicy?: string
        disabled?: boolean
    }

    interface HTMLMetaElementProps extends HTMLElementProps {
        name?: string
        // http-equiv
        httpEquiv?: "content-languagle"|"content-type"|"default-style"|"refresh"|"set-cookie"|"x-ua-compatible"|"content-security-policy"
        content?: string
        charset?: string // not part of the DOM?
    }

    interface HTMLStyleElementProps extends HTMLElementProps {
        media?: string
        // sheet from the LinkStyle interface?
    }

    interface HTMLOListElementProps extends HTMLElementProps {
        reversed?: boolean
        start?: number
        type?: "1"|"a"|"A"|"i"|"I"
    }

    interface HTMLLIElementProps extends HTMLElementProps {
        value?: number
    }

    interface HTMLAnchorElementProps extends HTMLElementProps {
        target?: string
        download?: string
        ping?: string
        rel?: string
        // relList
        hreflang?: string
        type?: string
        text?: string
        referrerPolicy?: string

        // HTMLHyperlinkElementUtils ???
    }

    interface HTMLQuoteElementProps extends HTMLElementProps {
        quote?: string
    }

    interface HTMLDataElementProps extends HTMLElementProps {
        value?: string
    }

    interface HTMLTimeElementProps extends HTMLElementProps {
        dateTime?: string
    }

    interface HTMLModElementProps extends HTMLElementProps {
        cite?: string
        dateTime?: string
    }

    interface HTMLSourceElementProps extends HTMLElementProps {
        src?: string
        type?: string
        srcset?: string
        sizes?: string
        media?: string
        width?: number
        height?: number
    }

    interface HTMLImageElementProps extends HTMLElementProps {
        alt?: string
        src?: string
        secset?: string
        sizes?: string
        crossOrigin?: string
        useMap?: string
        isMap?: boolean
        width?: number
        height?: number
        // naturalWidth?: number
        // naturalHeight?: number
        // complete?: boolean
        // currentSrc?: string
        referrerPolicy?: string
        decoding?: string
        loading?: "lazy"|"eager"
    }

    interface HTMLIFrameElementProps extends HTMLElementProps {
        src?: string
        srcdoc?: string
        name?: string
        // sandbox
        allow?: string
        allowFullscreen?: boolean
        width?: string
        height?: string
        referrerPolicy?: string
        loading?: string
    }

    interface HTMLEmbedElementProps extends HTMLElementProps {
        src?: string
        type?: string
        width?: string
        height?: string
    }

    interface HTMLObjectElementProps extends HTMLElementProps {
        data?: string
        type?: string
        name?: string
        // form
        width?: string
        height?: string
    }

    interface HTMLParamElementProps extends HTMLElementProps {
        name?: string
        value?: string
    }

    interface HTMLMediaElementProps extends HTMLElementProps {
        src?: string
        // srcObject
        crossOrigin?: string
        preload?: string
        currentTime?: number
        autoplay?: boolean
        loop?: boolean
        volume?: number
        muted?: boolean
    }

    interface HTMLVideoElementProps extends HTMLMediaElementProps {
        width?: number
        height?: number
        poster?: string
        playsInline?: boolean
    }

    interface HTMLTrackElementProps extends HTMLElementProps {
        kind?: string
        src?: string
        srclang?: string
        label?: string
        default?: boolean
    }

    interface HTMLMapElementProps extends HTMLElementProps {
        name?: string
    }

    interface HTMLAreaElementProps extends HTMLElementProps {
        alt?: string
        coords?: string
        shape?: string
        target?: string
        download?: string
        ping?: string
        rel?: string
        referrerPolicy?: string
    }

    interface HTMLTableColElementProps extends HTMLElementProps {
        span?: number
    }

    interface HTMLTableCellElementProps extends HTMLElementProps {
        colSpan?: number
        rowSpan?: number
        headers?: string
        scope?: string
        abbr?: string
    }

    interface HTMLFormElementProps extends HTMLElementProps {
        acceptCharset?: string
        action?: string
        autocomplete?: string
        enctype?: string
        encoding?: string
        method?: string
        name?: string
        noValidate?: boolean
        target?: string
        rel?: string
    }

    interface HTMLLabelElementProps extends HTMLElementProps {
        htmlFor?: string
    }

    interface HTMLInputElementProps extends HTMLElementProps {
        accept?: string
        alt?: string
        autocomplete?: string
        defaultChecked?: boolean
        checked?: boolean
        dirName?: string
        disabled?: boolean// files
        formAction?: string
        formEnctype?: string
        formMethod?: string
        formTarget?: string
        height?: number
        indeterminate?: boolean
        max?: string
        maxLength?: string
        min?: string
        minLength?: string
        multiple?: boolean
        name?: string
        pattern?: string
        placeholder?: string
        readOnly?: boolean
        required?: boolean
        size?: number
        src?: string
        step?: string
        type?: "button" | "checkbox" | "image" | "radio" | "color" | "date" | "datetime" | "datetime-local" | "email" | "file"
            | "hidden" | "month" | "number" | "password" | "range" | "research" | "search" | "submit" | "tel" | "text" | "url" | "week"
        defaultValue?: string
        value?: string
        // valueAsDate
        // valueAsNumber
        width?: number
        // stepUp
        // stepDown
        // selectionStart
        // selectionEnd
        // selectionDirection
    }

    interface HTMLOptGroupElementProps extends HTMLElementProps {
        disabled?: boolean
        label?: string
    }

    interface HTMLOptionElementProps extends HTMLElementProps {
        disabled?: boolean
        label?: string
        defaultSelected?: boolean
        selected?: boolean
        value?: string
        text?: string
    }

    interface HTMLTextAreaElementProps extends HTMLElementProps {
        autocomplete?: string
        cols?: number
        dirName?: string
        disabled?: boolean
        maxLength?: number
        minLength?: number
        name?: string
        placeholder?: string
        readonly?: boolean
        required?: boolean
        rows?: number
        wrap?: string
        defaultValue?: string
        value?: string
        selectionStart?: number
        selectionEnd?: number
        selectionDirection?: string
    }

    interface HTMLOutputElementProps extends HTMLElementProps {
        name?: string
        defaultValue?: string
        value?: string
        willValidate?: boolean
        // validity
        validationMessage?: string
    }

    interface HTMLProgressElementProps extends HTMLElementProps {
        value?: number
        max?: number
    }

    interface HTMLMeterElementProps extends HTMLElementProps {
        value?: number
        min?: number
        max?: number
        low?: number
        high?: number
        optimum?: number
    }

    interface HTMLFieldSetElementProps extends HTMLElementProps {
        disabled?: number
        name?: string
    }

    interface HTMLButtonElementProps extends HTMLElementProps {
        disabled?: boolean
        formAction?: string
        formEnctype?: string
        formMethod?: string
        formNoValidate?: boolean
        formTarget?: string
        name?: string
        type?: string
        value?: string
    }

    interface HTMLSelectElementProps extends HTMLElementProps {
        autocomplete?: boolean
        disabled?: boolean
        multiple?: boolean
        name?: string
        required?: boolean
        size?: number
        length?: number
        selectedIndex?: number
        value?: string
    }

    interface HTMLDetailsElementProps extends HTMLElementProps {
        open?: boolean
    }

    interface HTMLDialogElementProps extends HTMLElementProps {
        open?: boolean
        returnValue?: string
    }

    interface HTMLScriptElementProps extends HTMLElementProps {
        src?: string
        type?: string
        noModule?: boolean
        async?: boolean
        defer?: boolean
        crossOrigin?: string
        text?: string
        integrity?: string
        referrerPolicy?: string
    }

    interface HTMLSlotElementProps extends HTMLElementProps {
        name?: string
    }

    interface HTMLCanvasElementProps extends HTMLElementProps {
        width?: string | number
        height?: string | number
    }

    export interface IntrinsicElements {
        // 4.1 The document element
        html: HTMLElementProps
        
        // 4.2 Document metadata
        head: HTMLElementProps
        title: HTMLElementProps
        base: HTMLBaseElementProps
        link: HTMLLinkElementProps
        meta: HTMLMetaElementProps
        style: HTMLStyleElementProps

        // 4.3 Sections
        body: HTMLElementProps
        article: HTMLElementProps
        section: HTMLElementProps
        nav: HTMLElementProps
        aside: HTMLElementProps
        h1: HTMLElementProps
        h2: HTMLElementProps
        h3: HTMLElementProps
        h4: HTMLElementProps
        h5: HTMLElementProps
        h6: HTMLElementProps
        hgroup: HTMLElementProps
        header: HTMLElementProps
        address: HTMLElementProps
        
        // 4.4 Grouping content
        p: HTMLElementProps
        hr: HTMLElementProps
        pre: HTMLElementProps
        blockquote: HTMLQuoteElementProps
        ol: HTMLOListElementProps
        ul: HTMLElementProps
        menu: HTMLElementProps
        li: HTMLLIElementProps
        dl: HTMLElementProps
        dt: HTMLElementProps
        figure: HTMLElementProps
        figurecaption: HTMLElementProps
        main: HTMLElementProps
        div: HTMLElementProps

        // 4.5 Text-level semantics
        a: HTMLAnchorElementProps
        em: HTMLElementProps
        strong: HTMLElementProps
        small: HTMLElementProps
        s: HTMLElementProps
        cite: HTMLElementProps
        q: HTMLQuoteElementProps
        dfn: HTMLElementProps
        abbr: HTMLElementProps
        ruby: HTMLElementProps
        rt: HTMLElementProps
        rp: HTMLElementProps
        data: HTMLDataElementProps
        time: HTMLTimeElementProps
        code: HTMLElementProps
        var: HTMLElementProps
        samp: HTMLElementProps
        kbd: HTMLElementProps
        sub: HTMLElementProps
        sup: HTMLElementProps
        i: HTMLElementProps
        b: HTMLElementProps
        u: HTMLElementProps
        mark: HTMLElementProps
        bdi: HTMLElementProps
        bdo: HTMLElementProps
        span: HTMLElementProps
        br: HTMLElementProps
        wbr: HTMLElementProps

        // 4.6 Links
        // doesn't specify own tags

        // 4.7 Edits
        ins: HTMLModElementProps
        del: HTMLModElementProps

        // 4.8 Embedded content
        picture: HTMLElementProps
        source: HTMLSourceElementProps
        img: HTMLImageElementProps
        iframe: HTMLIFrameElementProps
        embed: HTMLEmbedElementProps
        object: HTMLObjectElementProps
        param: HTMLParamElementProps
        video: HTMLVideoElementProps
        audio: HTMLMediaElementProps
        track: HTMLTrackElementProps
        map: HTMLMapElementProps
        area: HTMLAreaElementProps

        // 4.9 Tabular data
        table: HTMLElementProps
        caption: HTMLElementProps
        colgroup: HTMLTableColElementProps
        col: HTMLTableColElementProps
        tbody: HTMLElementProps
        thead: HTMLElementProps
        tfoot: HTMLElementProps
        tr: HTMLElementProps
        td: HTMLTableCellElementProps
        th: HTMLTableCellElementProps

        // 4.10 Forms
        form: HTMLFormElementProps
        label: HTMLLabelElementProps
        input: HTMLInputElementProps
        button: HTMLButtonElementProps
        select: HTMLSelectElementProps
        datalist: HTMLInputElementProps
        optgroup: HTMLOptGroupElementProps
        option: HTMLOptionElementProps
        textarea: HTMLTextAreaElementProps
        output: HTMLOutputElementProps
        progress: HTMLProgressElementProps
        meter: HTMLMeterElementProps
        fieldset: HTMLFieldSetElementProps
        legend: HTMLElementProps

        // 4.11 Interactive elements
        details: HTMLDetailsElementProps
        summary: HTMLElementProps
        dialog: HTMLDialogElementProps

        // 4.12 Scripting
        script: HTMLScriptElementProps
        noscript: HTMLElementProps
        template: HTMLElementProps
        slot: HTMLSlotElementProps
        canvas: HTMLCanvasElementProps

        strike: HTMLElementProps
        
        // SVG

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

        // split these off

        "toad-button": ToadButtonProps
        "toad-text": ToadTextProps
        "toad-slider": ToadSliderProps
        "toad-table": ToadTableProps
    }
    export interface Reference {
        object: Object
        attribute: string
    }
}

export class Fragment {
    children: Array<HTMLElement>
    constructor(children: Array<HTMLElement>) {
        this.children = children
    }
    appendTo(element: HTMLElement) {
        for(let child of this.children) {
            element.appendChild(child)
        }
    }
}

// the FunctionConstructor is a hack for <></>
// actually it would be nice if we could support value objects too, eg. <TableView> instead of <toad-table>
export function createElement(name: string, props: JSX.HTMLElementProps, ...children: any): Element
export function createElement(name: FunctionConstructor, props: JSX.HTMLElementProps, ...children: any): Fragment
export function createElement(name: string | FunctionConstructor, props: JSX.HTMLElementProps, ...children: any): Element | Fragment {
    let namespace

    if (typeof name !== 'string') {
        return new Fragment(children)
    }

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
                case 'model':
                case 'action':
                    (tag as any).setModel(value)
                    break
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

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

import * as CSS from "csstype"

import { Action } from "./model/Action"
import { NumberModel } from "./model/NumberModel"
import { TextModel } from "./model/TextModel"
import { TableModel } from "./table/TableModel"

export namespace JSX {

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

    type SVGPreserveAspectRatioAlign = "none" | "xMinYMin" | "xMidYMin" | "xMaxYMin" | "xMinYMid" | "xMidYMid" | "xMaxYMid" | "xMinYMax" | "xMidYMax" | "xMaxYMax"
    type SVGPreserveAspectRatioMeetOrSlice = " meet" | " slice" | ""
    type SVGPreserveAspectRatio = `${SVGPreserveAspectRatioAlign}${SVGPreserveAspectRatioMeetOrSlice}`

    export interface SVGProps extends HTMLElementProps {
        viewBox?: string
        width?: string | number
        height?: string | number
        preserveAspectRatio?: SVGPreserveAspectRatio
        transform?: string
    }

    interface ToadProps {
        set?: Reference<any> // FIXME: we might be able to specify the exact type here
    }

    // use csstype's nice CSS definitons and comments for VSCode's Intellisense
    export interface CSSProperties extends CSS.Properties<string | number> { }

    // copy'n pasted Aria definitions from DefinitelyTyped/types/react/index.d.ts

    // All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
    interface AriaAttributes {
        /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
        'aria-activedescendant'?: string
        /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
        'aria-atomic'?: boolean | 'false' | 'true'
        /**
         * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
         * presented if they are made.
         */
        'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both'
        /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
        'aria-busy'?: boolean | 'false' | 'true'
        /**
         * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
         * @see aria-pressed @see aria-selected.
         */
        'aria-checked'?: boolean | 'false' | 'mixed' | 'true'
        /**
         * Defines the total number of columns in a table, grid, or treegrid.
         * @see aria-colindex.
         */
        'aria-colcount'?: number
        /**
         * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
         * @see aria-colcount @see aria-colspan.
         */
        'aria-colindex'?: number
        /**
         * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
         * @see aria-colindex @see aria-rowspan.
         */
        'aria-colspan'?: number
        /**
         * Identifies the element (or elements) whose contents or presence are controlled by the current element.
         * @see aria-owns.
         */
        'aria-controls'?: string
        /** Indicates the element that represents the current item within a container or set of related elements. */
        'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time'
        /**
         * Identifies the element (or elements) that describes the object.
         * @see aria-labelledby
         */
        'aria-describedby'?: string
        /**
         * Identifies the element that provides a detailed, extended description for the object.
         * @see aria-describedby.
         */
        'aria-details'?: string
        /**
         * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
         * @see aria-hidden @see aria-readonly.
         */
        'aria-disabled'?: boolean | 'false' | 'true'
        /**
         * Indicates what functions can be performed when a dragged object is released on the drop target.
         * @deprecated in ARIA 1.1
         */
        'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup'
        /**
         * Identifies the element that provides an error message for the object.
         * @see aria-invalid @see aria-describedby.
         */
        'aria-errormessage'?: string
        /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
        'aria-expanded'?: boolean | 'false' | 'true'
        /**
         * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
         * allows assistive technology to override the general default of reading in document source order.
         */
        'aria-flowto'?: string
        /**
         * Indicates an element's "grabbed" state in a drag-and-drop operation.
         * @deprecated in ARIA 1.1
         */
        'aria-grabbed'?: boolean | 'false' | 'true'
        /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
        'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
        /**
         * Indicates whether the element is exposed to an accessibility API.
         * @see aria-disabled.
         */
        'aria-hidden'?: boolean | 'false' | 'true'
        /**
         * Indicates the entered value does not conform to the format expected by the application.
         * @see aria-errormessage.
         */
        'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling'
        /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
        'aria-keyshortcuts'?: string
        /**
         * Defines a string value that labels the current element.
         * @see aria-labelledby.
         */
        'aria-label'?: string
        /**
         * Identifies the element (or elements) that labels the current element.
         * @see aria-describedby.
         */
        'aria-labelledby'?: string
        /** Defines the hierarchical level of an element within a structure. */
        'aria-level'?: number
        /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
        'aria-live'?: 'off' | 'assertive' | 'polite'
        /** Indicates whether an element is modal when displayed. */
        'aria-modal'?: boolean | 'false' | 'true'
        /** Indicates whether a text box accepts multiple lines of input or only a single line. */
        'aria-multiline'?: boolean | 'false' | 'true'
        /** Indicates that the user may select more than one item from the current selectable descendants. */
        'aria-multiselectable'?: boolean | 'false' | 'true'
        /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
        'aria-orientation'?: 'horizontal' | 'vertical'
        /**
         * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
         * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
         * @see aria-controls.
         */
        'aria-owns'?: string
        /**
         * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
         * A hint could be a sample value or a brief description of the expected format.
         */
        'aria-placeholder'?: string
        /**
         * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
         * @see aria-setsize.
         */
        'aria-posinset'?: number
        /**
         * Indicates the current "pressed" state of toggle buttons.
         * @see aria-checked @see aria-selected.
         */
        'aria-pressed'?: boolean | 'false' | 'mixed' | 'true'
        /**
         * Indicates that the element is not editable, but is otherwise operable.
         * @see aria-disabled.
         */
        'aria-readonly'?: boolean | 'false' | 'true'
        /**
         * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
         * @see aria-atomic.
         */
        'aria-relevant'?: 'additions' | 'additions removals' | 'additions text' | 'all' | 'removals' | 'removals additions' | 'removals text' | 'text' | 'text additions' | 'text removals'
        /** Indicates that user input is required on the element before a form may be submitted. */
        'aria-required'?: boolean | 'false' | 'true'
        /** Defines a human-readable, author-localized description for the role of an element. */
        'aria-roledescription'?: string
        /**
         * Defines the total number of rows in a table, grid, or treegrid.
         * @see aria-rowindex.
         */
        'aria-rowcount'?: number
        /**
         * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
         * @see aria-rowcount @see aria-rowspan.
         */
        'aria-rowindex'?: number
        /**
         * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
         * @see aria-rowindex @see aria-colspan.
         */
        'aria-rowspan'?: number
        /**
         * Indicates the current "selected" state of various widgets.
         * @see aria-checked @see aria-pressed.
         */
        'aria-selected'?: boolean | 'false' | 'true'
        /**
         * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
         * @see aria-posinset.
         */
        'aria-setsize'?: number
        /** Indicates if items in a table or grid are sorted in ascending or descending order. */
        'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other'
        /** Defines the maximum allowed value for a range widget. */
        'aria-valuemax'?: number
        /** Defines the minimum allowed value for a range widget. */
        'aria-valuemin'?: number
        /**
         * Defines the current value for a range widget.
         * @see aria-valuetext.
         */
        'aria-valuenow'?: number
        /** Defines the human readable text alternative of aria-valuenow for a range widget. */
        'aria-valuetext'?: string
    }

    // All the WAI-ARIA 1.1 role attribute values from https://www.w3.org/TR/wai-aria-1.1/#role_definitions
    type AriaRole =
        | 'alert'
        | 'alertdialog'
        | 'application'
        | 'article'
        | 'banner'
        | 'button'
        | 'cell'
        | 'checkbox'
        | 'columnheader'
        | 'combobox'
        | 'complementary'
        | 'contentinfo'
        | 'definition'
        | 'dialog'
        | 'directory'
        | 'document'
        | 'feed'
        | 'figure'
        | 'form'
        | 'grid'
        | 'gridcell'
        | 'group'
        | 'heading'
        | 'img'
        | 'link'
        | 'list'
        | 'listbox'
        | 'listitem'
        | 'log'
        | 'main'
        | 'marquee'
        | 'math'
        | 'menu'
        | 'menubar'
        | 'menuitem'
        | 'menuitemcheckbox'
        | 'menuitemradio'
        | 'navigation'
        | 'none'
        | 'note'
        | 'option'
        | 'presentation'
        | 'progressbar'
        | 'radio'
        | 'radiogroup'
        | 'region'
        | 'row'
        | 'rowgroup'
        | 'rowheader'
        | 'scrollbar'
        | 'search'
        | 'searchbox'
        | 'separator'
        | 'slider'
        | 'spinbutton'
        | 'status'
        | 'switch'
        | 'tab'
        | 'table'
        | 'tablist'
        | 'tabpanel'
        | 'term'
        | 'textbox'
        | 'timer'
        | 'toolbar'
        | 'tooltip'
        | 'tree'
        | 'treegrid'
        | 'treeitem'
        | (string & {})

    type HTMLAttributeReferrerPolicy =
        | ""
        | "no-referrer"
        | "no-referrer-when-downgrade"
        | "origin"
        | "origin-when-cross-origin"
        | "same-origin"
        | "strict-origin"
        | "strict-origin-when-cross-origin"
        | "unsafe-url"

    // 4.9 Element
    interface ElementProps extends ToadProps {
        id?: string
        class?: string
        // classList
        slot?: string

        // dataset
    }

    // 3.2.2 Elements in the DOM
    export interface HTMLElementProps extends ElementProps, AriaAttributes {
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
        contentEditable?: boolean | "inherit"
        enterkeyhint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send"
        /**
        * Hints at the type of data that might be entered by the user while editing the element or its contents
        * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
        */
        inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search"
        is?: string
        itemID?: string
        itemRef?: string
        itemScope?: string
        itemtype?: string
        // nonce
        style?: CSSProperties
        tabIndex?: number

        // WAI-ARIA
        role?: AriaRole

        // RDFa Attributes
        about?: string
        datatype?: string
        inlist?: any
        prefix?: string
        property?: string
        resource?: string
        typeof?: string
        vocab?: string
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
        referrerPolicy?: HTMLAttributeReferrerPolicy
        disabled?: boolean
    }

    interface HTMLMetaElementProps extends HTMLElementProps {
        name?: string
        // http-equiv
        httpEquiv?: "content-languagle" | "content-type" | "default-style" | "refresh" | "set-cookie" | "x-ua-compatible" | "content-security-policy"
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
        type?: "1" | "a" | "A" | "i" | "I"
    }

    interface HTMLLIElementProps extends HTMLElementProps {
        value?: number
    }

    interface HTMLAnchorElementProps extends HTMLElementProps {
        target?: string
        download?: string // any?
        ping?: string
        rel?: string
        hrefLang?: string
        type?: string
        text?: string
        referrerPolicy?: HTMLAttributeReferrerPolicy
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
        crossOrigin?: "anonymous" | "use-credentials" | ""
        useMap?: string
        isMap?: boolean
        width?: number | string
        height?: number | string
        // naturalWidth?: number
        // naturalHeight?: number
        // complete?: boolean
        // currentSrc?: string
        referrerPolicy?: HTMLAttributeReferrerPolicy
        decoding?: "async" | "auto" | "sync"
        loading?: "lazy" | "eager"
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
        referrerPolicy?: HTMLAttributeReferrerPolicy
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
        referrerPolicy?: HTMLAttributeReferrerPolicy
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
        type?: "submit" | "reset" | "button"
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
        referrerPolicy?: HTMLAttributeReferrerPolicy
    }

    interface HTMLSlotElementProps extends HTMLElementProps {
        name?: string
    }

    interface HTMLCanvasElementProps extends HTMLElementProps {
        width?: string | number
        height?: string | number
    }

    // export type Element = Element | Fragment

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
        /**
         * The `div` element has no special meaning at all. It represents its children.
         * 
         * It can be used with the `class`, `lang`, and `title` attributes to mark up semantics
         * common to a group of consecutive elements.
         * 
         * It can also be used in a `dl` element, wrapping groups of `dt` and `dd` elements.
         * 
         * **NOTE**: Authors are strongly encouraged to view the `div` element as an element of last
         * resort, for when no other element is suitable. Use of more appropriate elements
         * instead of the `div` element leads to better accessibility for readers and easier
         * maintainability for authors.
         */
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
            // SVG 5.12.2
            id?: string

            // stroke properties
            stroke?: string | number
            strokeWidth?: string // length percentage
            strokeLinecap?: "butt" | "round" | "square"
            strokeLinejoin?: "miter" | "miter-clip" | "round" | "bevel" | "arcs"
            strokeMiterlimit?: string | number
            // strokeDasharray?:
            strokeDashoffset?: string // length percentage

            cursor?: string
            class?: string

            // line
            x1: string | number
            y1: string | number
            x2: string | number
            y2: string | number
            // pathLength
            set?: Reference<any>
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
            set?: Reference<any>
            onmousedown?: (event: MouseEvent) => void
            onmousemove?: (event: MouseEvent) => void
            onmouseup?: (event: MouseEvent) => void
            onmouseenter?: (event: MouseEvent) => void
            onmouseleave?: (event: MouseEvent) => void
            onmouseout?: (event: MouseEvent) => void
            onmouseover?: (event: MouseEvent) => void
        }
        circle: {
            cx: string | number
            cy: string | number
            r: string | number
            stroke?: string
            fill?: string
            cursor?: string
            class?: string
            set?: Reference<any>
        }
        text: {
            x: string | number
            y: string | number
            stroke?: string
            fill?: string
            cursor?: string
            class?: string
            set?: Reference<any>
        }
        path: {
            d: string
            stroke?: string
            fill?: string
            cursor?: string
            class?: string
            set?: Reference<any>
        }


        // split these off

        "toad-button": ToadButtonProps
        "toad-text": ToadTextProps
        "toad-slider": ToadSliderProps
        "toad-table": ToadTableProps
        "toad-treenodecell": HTMLElementProps
    }
}

export class Reference<T> {
    object: Object
    attribute: string
    constructor(object: Object, attribute: keyof T) {
        this.object = object
        this.attribute = attribute.toString()
    }

    get(): any {
        return (this.object as any)[this.attribute]
    }
    set(value: any) {
        Object.defineProperty(this.object, this.attribute, { value: value })
    }

    toString(): string {
        return `${(this.object as any)[this.attribute]}`
    }
    fromString(value: string) {
        const type = typeof (this.object as any)[this.attribute]
        let outValue
        switch (type) {
            case "string":
                outValue = value
                break
            case "number":
                outValue = Number.parseFloat(value)
                break
            default:
                throw Error(`Reference.fromString() isn't yet supported for type ${type}`)
        }
        Object.defineProperty(this.object, this.attribute, { value: outValue })
    }
}

export function ref<T>(object: T, attribute: keyof T): Reference<T> {
    return new Reference<T>(object, attribute)
}

export function refs<T>(object: T, ...attributes: (keyof T)[]): Reference<T>[] {
    return attributes.map(a => new Reference<T>(object, a))
}

export class Fragment extends Array<Element | Text> {
    constructor(props: any) {
        super(...props?.children)
        for (let i = 0; i < this.length; ++i) {
            const e = this[i]
            if (typeof e === "string") {
                this[i] = document.createTextNode(e)
            }
        }
    }
    replaceIn(element: Element | ShadowRoot) {
        while (element.childNodes.length > 0) {
            element.removeChild(element.childNodes[element.childNodes.length - 1])
        }
        this.appendTo(element)
    }
    appendTo(element: Element | ShadowRoot) {
        for (let child of this) {
            element.appendChild(child)
        }
    }
}

// https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html
export function jsx(nameOrConstructor: string | { new(...args: any[]): any }, props: any, key?: string) {
    if (props !== undefined && props.children !== undefined) {
        props.children = [props.children]
    }
    return jsxs(nameOrConstructor, props)
}

export function jsxs(nameOrConstructor: string | { new(...args: any[]): any }, props: any, key?: string) {
    let namespace

    if (typeof nameOrConstructor !== 'string') {
        return new nameOrConstructor(props)
    }

    const name = nameOrConstructor as string

    switch (name) {
        case "svg":
        case "line":
        case "rect":
        case "circle":
        case "path":
        case "text":
            namespace = "http://www.w3.org/2000/svg"
            break
        default:
            namespace = "http://www.w3.org/1999/xhtml"
    }
    const tag = document.createElementNS(namespace, name) as HTMLElement | SVGSVGElement
    setInitialProperties(tag, props, namespace)
    return tag
}

export function setInitialProperties(element: HTMLElement | SVGElement, props: any, namespace?: string) {
    if (props === null || props === undefined)
        return

    for (let [key, value] of Object.entries(props)) {
        switch (key) {
            case 'children':
                break
            case 'model':
            case 'action':
                (element as any).setModel(value)
                break
            case 'class':
                element.classList.add(value as string) // FIXME: value is whitespace separated list
                break
            case 'style':
                for (let [skey, svalue] of Object.entries(value as string)) {
                    const regex = /[A-Z]/g
                    skey = skey.replace(regex, (upperCase) => "-" + upperCase.toLowerCase())
                    element.style.setProperty(skey, svalue as string)
                }
                break
            case 'set':
                Object.defineProperty(props.set!.object, props.set!.attribute, { value: element })
                break
            default:
                if (key.substring(0, 2) === "on") {
                    element.addEventListener(key.substr(2), value as () => void)
                } else {
                    if (typeof value !== "object") {
                        if (namespace === "http://www.w3.org/2000/svg") {
                            const regex = /[A-Z]/g
                            key = key.replace(regex, (upperCase) => "-" + upperCase.toLowerCase())
                        }
                        element.setAttributeNS(null, key, `${value}`)
                    }
                }
        }
    }
    if (props.children !== undefined) {
        for (let child of props.children) {
            if (typeof child === "string") {
                element.appendChild(document.createTextNode(child))
            } else {
                element.appendChild(child)
            }
        }
    }
}

// the FunctionConstructor is a hack for <></>
// actually it would be nice if we could support value objects too, eg. <TableView> instead of <toad-table>
// export function createElement(name: string, props: JSX.HTMLElementProps, ...children: any): Element
// export function createElement(name: FunctionConstructor, props: JSX.HTMLElementProps, ...children: any): Fragment
// export function createElement(name: string | FunctionConstructor, props: JSX.HTMLElementProps, ...children: any): Element | Fragment {
// }
// backward compability
export function createElement(nameOrConstructor: string | { new(...args: any[]): any }, props: any, ...children: any) {
    // console.log(`createElement(${nameOrConstructor}, ${JSON.stringify(props)}, ${children}`)

    // props: remove 'key', add 'children'
    let key
    if (props !== null) {
        if ('key' in props) {
            key = props.key
            delete props.key
        }
        if (children !== undefined) {
            props.children = children
        }
    } else {
        if (children !== undefined)
            props = { children }
    }
    return jsxs(nameOrConstructor, props, key)
}

export type HTMLElementProps = JSX.HTMLElementProps

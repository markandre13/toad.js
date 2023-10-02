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

import { span, text } from "@toad/util/lsx"
import { ValueModel } from "./ValueModel"
import { ModelOptions } from "./Model"

/**
 * @category Application Model
 */
export abstract class OptionModelBase<V, R = void, O extends ModelOptions = ModelOptions> extends ValueModel<V, R, O> {
    abstract forEach(callback: (value: V, label: string | number | HTMLElement, index: number) => void): void
    map<R>(callback: (value: V, label: string | number | HTMLElement, index: number) => R): R[] {
        const out: R[] = []
        this.forEach((value, label, index) => {
            out.push(callback(value, label, index))
        })
        return out
    }
    get html(): any | undefined {
        let foundLabel: any
        this.forEach((value, label, index) => {
            if (this.value === value) {
                foundLabel = label
            }
        })
        return this.asHtml(foundLabel)
    }
    // FIXME: move into SelectBase
    // * we wrap plain text into a span because for the layout for work we need
    //   to have a HTMLElement there which can display a margin
    asHtml(l: string | number | HTMLElement) {
        if (typeof l === "string") {
            return span(text(l))
        }
        if (typeof l === "number") {
            return span(text(`${l}`))
        }
        if (typeof l === "object") {
            if (l instanceof Node) {
                let h = l.cloneNode(true) as HTMLElement
                const NODE_TYPE_TEXT = 3
                if (l.nodeType === NODE_TYPE_TEXT) {
                    l = span(l)
                }
                h.style.height = "100%"
                h.style.width = "100%"
                return h
            }
        }
        // fallback
        return span(text(`${l}`))
    }
    indexOf(value: V) {
        let idx: number | undefined
        this.forEach((aValue, label, index) => {
            if (value === aValue) {
                idx = index
            }
        })
        return idx
    }
    labelOf(value: V) {
        let lab: any
        this.forEach((aValue, label, index) => {
            if (value === aValue) {
                lab = label
            }
        })
        return this.asHtml(lab)
    }
    isEnabledOf(value: V) {
        let enabled = false
        this.forEach((aValue, label, index) => {
            if (value === aValue) {
                enabled = true
            }
        })
        return enabled
    }
    set index(idx: number | undefined) {
        this.forEach((value, label, index) => {
            if (index === idx) {
                this.value = value
            }
        })
    }
    get index(): number | undefined {
        let idx: number | undefined
        this.forEach((value, label, index) => {
            if (this.value === value) {
                idx = index
            }
        })
        return idx
    }
    next() {
        const idx = this.index
        if (idx === undefined) {
            this.index = 0
        } else {
            this.index = idx + 1
        }
    }
    prev() {
        const idx = this.index
        if (idx === undefined) {
            this.index = 0
        } else {
            this.index = idx - 1
        }
    }
}

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
import { GenericModel } from "./GenericModel"
import { ModelOptions } from "./Model"

/**
 * @category Application Model
 */
export abstract class OptionModelBase<V, O extends ModelOptions = ModelOptions> extends GenericModel<V, O> {
    abstract forEach(callback: (value: V, key: string, label: any, index: number) => void): void
    map<R>(callback: (value: V, key: string, label: any, idx: number) => R): R[] {
        const out: R[] = []
        let idx = 0
        this.forEach((value, key, label, index) => {
            out.push(callback(value, key, label, idx++))
        })
        return out
    }
    get html(): any | undefined {
        let l: any
        this.forEach( (value, key, label, index) => {
            if (this.value === value) {
                l = label
            }
        })
        return this.asHtml(l)
    }
    // FIXME: move into SelectBase
    // * we wrap plain text into a span because for the layout for work we need
    //   to have a HTMLElement there which can display a margin
    asHtml(l: any) {
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
    set index(idx: number | undefined) {
        this.forEach( (value, key, label, index) => {
            if (index === idx) {
                this.value = value
            }
        })
    }
    get index(): number | undefined {
        let idx: number | undefined
        this.forEach( (value, key, label, index) => {
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
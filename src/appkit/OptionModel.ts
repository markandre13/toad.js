/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2021, 2026 Mark-André Hopf <mhopf@mark13.org>
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

import { type JSX } from "toad.jsx"
import { deepEqual } from "../util/deepEqual"
import { ALL, type ModelEvent } from "./Model"
import { type OptionMapping, OptionModelBase, type OptionModelOptions } from "./OptionModelBase"
import { type SpecialValue } from "./ValueModel"

/**
 * @category Application Model
 */
export class OptionModel<V, E = void, O extends OptionModelOptions<V> = OptionModelOptions<V>> extends OptionModelBase<
    V,
    E | ModelEvent,
    O
> {
    protected _mapping!: ReadonlyArray<[V, string]>
    protected _mapper?: (value: V) => OptionMapping
    /**
     * Examples:
     *
     * Value is a string and options an array of strings:
     *
     *     const model = new OptionModel("Down", ["Up", "Down", "Left", "Right"])
     *
     * Value is an enum and options a list of enum to label mappings:
     *
     *     enum A { UP, DOWN, LEFT, RIGHT }
     *     const model = new OptionModel(A.DOWN, [
     *       [A.UP, "Up"],
     *       [A.DOWN, "Down"],
     *       [A.LEFT, "Left"],
     *       [A.RIGHT, "Right"],
     *     ])
     *
     * @param value current value
     * @param mapping
     * @param options
     */
    constructor(
        value: V | SpecialValue,
        list: ReadonlyArray<V>,
        mapper: (value: V) => OptionMapping,
        modelOptions?: O
    )
    constructor(
        value: V | SpecialValue,
        mapping: ReadonlyArray<[V, string | number | JSX.Element ] | string>,
        modelOptions?: O
    )
    constructor(
        value: V | SpecialValue,
        listOrMapping: ReadonlyArray<V> | ReadonlyArray<[V, string | number | JSX.Element] | string>,
        mapperOrOptions: (value: V) => OptionMapping | O,
        options?: O
    ) {
        if (typeof mapperOrOptions === "function") {
            super(value, options)
            this._mapper = mapperOrOptions as (value: V) => OptionMapping
            this.setList(
                listOrMapping as ReadonlyArray<V>
            )
        } else {
            super(value, mapperOrOptions)
            this.setMapping(listOrMapping as ReadonlyArray<[V, string | number | HTMLElement] | string>)
        }
    }
    get length(): number {
        return this._mapping.length
    }
    get id(): string {
        if (this._mapper === undefined) {
            throw Error('to use id(), a mapper function is needed')
        }
        return this._mapper(this._value as V).id
    }
    set id(id: string) {
        if (this._mapper === undefined) {
            throw Error('to use id(), a mapper function is needed')
        }
        for (const [value] of this._mapping) {
            if (id === this._mapper(value).id) {
                this.value = value
            }
        }
    }
    protected setList(
        list: ReadonlyArray<V>,
    ) {
        if (this._mapper === undefined) {
            throw Error('to use setList(), a mapper function is needed')
        }
        this.setMapping(
            list.map(value => {
                const a = this._mapper!(value)
                return [value, a.view]
            })
        )
    }
    setMapping(mapping: ReadonlyArray<[V, string | number | HTMLElement] | string>) {
        if (mapping === this._mapping) {
            return
        }

        let newMapping
        if (mapping[0] instanceof Array) {
            newMapping = mapping as ReadonlyArray<[V, string]>
        } else {
            const array: [V, string | number | HTMLElement][] = []
            mapping.forEach((v) => {
                array.push([v as V, `${v}`])
            })
            newMapping = array as ReadonlyArray<[V, string]>
        }
        if (this._mapping !== undefined) {
            if (deepEqual(this._mapping, newMapping)) {
                this._mapping = newMapping
                return
            }
        }

        this._mapping = newMapping

        // we might have previously failed to restore the value from local storage because of a wrong mapping
        // let's try again
        this.setFromLocalStorage()
        this.setFromUrlHash()

        this.signal.emit({ type: ALL })
    }
    forEach(callback: (value: V, label: string | number | HTMLElement, index: number) => void): void {
        this._mapping.forEach(([value, label], index) => {
            callback(value, label, index)
        })
    }

    // the stored value can only be decoded once the mapping is known, setMapping() restores it
    protected override restoreFromStorage() {
        if (this._mapping === undefined) {
            return
        }
        super.restoreFromStorage()
    }

    // with a mapper, the id of the mapped option is stored instead of the value
    protected override encodeLocal(): string {
        if (this._mapper === undefined) {
            return super.encodeLocal()
        }
        return this.id
    }
    protected override decodeLocal(raw: string) {
        if (this._mapper === undefined) {
            super.decodeLocal(raw)
            return
        }
        this.id = raw
    }
    protected override encodeUrl(): string {
        if (this._mapper === undefined) {
            return super.encodeUrl()
        }
        return this.id
    }
    protected override decodeUrl(raw: string) {
        if (this._mapper === undefined) {
            super.decodeUrl(raw)
            return
        }
        this.id = raw
    }
}

/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2026 Mark-André Hopf <mhopf@mark13.org>
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

import { produceValue } from "../reactive/Computed"
import { Model, type ModelOptions, type ModelEvent } from "./Model"

export const VALUE_UNKNOWN = Symbol("VALUE_UNKNOWN")
export const VALUE_LOADING = Symbol("VALUE_LOADING")
export type SpecialValue = typeof VALUE_UNKNOWN | typeof VALUE_LOADING

export function isSpecialValue(value: unknown): value is SpecialValue {
    return value === VALUE_UNKNOWN || value === VALUE_LOADING
}

export const VALUE = Symbol("VALUE")
export const DEFAULT_VALUE = Symbol("DEFAULT_VALUE")
export type ValueEvent = { type: typeof VALUE }
export type DefaultValueEvent = { type: typeof DEFAULT_VALUE }
export type ValueModelEvent = ModelEvent | ValueEvent | DefaultValueEvent

export interface ValueModelOptions<V> extends ModelOptions {
    /**
     * a default value
     *
     * might be used give an indication when number equals the default value,
     * or to reset the value to the default value, e.g. with a double click
     */
    default?: V

    /**
     * persist value in local storage
     * 
     * when set, the model is persisted in local storage during browser sessions
     */
    local?: string

    /**
     * persist value in the url fragment identifier
     *
     * when set, the model is stored as key-value pair in the fragment, e.g. `#tab-demo`.
     * multiple pairs are separated by `_`, key and value by `-`.
     * keys must not contain `-` or `_`.
     */
    fragment?: string
}

const URL_HASH_PAIR_SEPARATOR = "_"
const URL_HASH_KEY_VALUE_SEPARATOR = "-"

function readUrlHashPairs(): Map<string, string> {
    const pairs = new Map<string, string>()
    const hash = location.hash.substring(1)
    if (hash === "") {
        return pairs
    }
    for (const pair of hash.split(URL_HASH_PAIR_SEPARATOR)) {
        const index = pair.indexOf(URL_HASH_KEY_VALUE_SEPARATOR)
        if (index > 0) {
            pairs.set(pair.substring(0, index), pair.substring(index + 1))
        }
    }
    return pairs
}

/**
 * @returns the decoded value stored for key in the url fragment, or undefined
 */
export function getUrlHashValue(key: string): string | undefined {
    const raw = readUrlHashPairs().get(key)
    if (raw === undefined) {
        return undefined
    }
    try {
        return decodeURIComponent(raw)
    } catch (e) {
        return undefined
    }
}

/**
 * stores value for key in the url fragment, keeping all other key-value pairs
 *
 * @param push add a history entry instead of replacing the current one
 */
export function setUrlHashValue(key: string, value: string, push: boolean) {
    const pairs = readUrlHashPairs()
    pairs.set(key, encodeURIComponent(value).replace(/[-_]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`))
    const hash = [...pairs].map(([k, v]) => `${k}${URL_HASH_KEY_VALUE_SEPARATOR}${v}`).join(URL_HASH_PAIR_SEPARATOR)
    if (location.hash === `#${hash}`) {
        return
    }
    const url = `${location.pathname}${location.search}#${hash}`
    if (push) {
        history.pushState(null, "", url)
    } else {
        history.replaceState(history.state, "", url)
    }
}

/**
 * @category Application Model
 *
 */
export abstract class AbstractValueModel<V, E = void, O extends ValueModelOptions<V> = ValueModelOptions<V>>
    extends Model<ValueModelEvent | E, O> {
    /**
     * holds the value, or VALUE_UNKNOWN / VALUE_LOADING while the value is special.
     * sub-classes declare the concrete type.
     */
    protected _value!: unknown

    /**
     * the getter returns undefined (typed as V) while the value is VALUE_UNKNOWN or VALUE_LOADING.
     * use isUnknown() and isLoading() to check for them.
     */
    abstract set value(value: V | SpecialValue)
    abstract get value(): V

    isUnknown(): boolean {
        produceValue(this.signal)
        return this._value === VALUE_UNKNOWN
    }

    isLoading(): boolean {
        produceValue(this.signal)
        return this._value === VALUE_LOADING
    }

    override set enabled(enabled: boolean) {
        super.enabled = enabled
    }
    /**
     * a model which is loading behaves like a disabled model
     */
    override get enabled(): boolean {
        return super.enabled && !this.isLoading()
    }

    protected hasSpecialValue(): boolean {
        return isSpecialValue(this._value)
    }

    protected setSpecialValue(value: SpecialValue) {
        if (this._value === value) return
        this._value = value
        this.signal.emit({ type: VALUE })
    }

    override applyStyle(element: HTMLElement) {
        super.applyStyle(element)
        this.applySpecialStyle(element)
    }

    /**
     * marks element as showing a special value (tx-unknown or tx-loading) or removes the marks
     */
    applySpecialStyle(element: HTMLElement) {
        element.classList.toggle("tx-unknown", this._value === VALUE_UNKNOWN)
        element.classList.toggle("tx-loading", this._value === VALUE_LOADING)
    }

    set default(aDefault: V | undefined) {
        if (this.options?.default === aDefault) return
        if (this.options === undefined) {
            this.options = {}
        }
        this.options.default = aDefault
        this.signal.emit({ type: DEFAULT_VALUE })
    }
    get default(): V | undefined {
        return this.options?.default
    }

    resetToDefault() {
        const d = this.default
        if (d !== undefined) {
            this.value = d
        }
    }
}

/**
 * @category Application Model
 *
 */
export class ValueModel<V, E = void, O extends ValueModelOptions<V> = ValueModelOptions<V>>
    extends AbstractValueModel<V, E, O> {
    protected override _value!: V | SpecialValue
    private urlHashSuppressed = false

    constructor(value: V | SpecialValue, options?: O) {
        super(options)
        this._value = value
        this.setFromLocalStorage()
        this.setFromUrlHash()
        if (this.options?.fragment !== undefined) {
            window.addEventListener("popstate", () => this.onUrlHashChange())
            window.addEventListener("hashchange", () => this.onUrlHashChange())
        }
    }

    protected setFromUrlHash() {
        if (this.options?.fragment === undefined) {
            return
        }
        if (!this.restoreUrlHash()) {
            this.persistToUrlHash(false)
        }
    }
    protected persistToUrlHash(push: boolean) {
        if (this.options?.fragment === undefined || this.hasSpecialValue()) {
            return
        }
        setUrlHashValue(this.options.fragment, this.urlHashString(), push)
    }

    /**
     * restores the value from the url fragment without writing it back
     *
     * @returns false if the fragment does not contain a valid value for this model
     */
    private restoreUrlHash(): boolean {
        const key = this.options!.fragment!
        const raw = getUrlHashValue(key)
        if (raw === undefined) {
            return false
        }
        this.urlHashSuppressed = true
        try {
            this.restoreFromUrlHash(raw)
            return true
        } catch (error) {
            console.log(`ValueModel: failed to restore "${key}" = "${raw}" from url hash`)
            return false
        } finally {
            this.urlHashSuppressed = false
        }
    }
    private onUrlHashChange() {
        if (!this.restoreUrlHash()) {
            this.urlHashSuppressed = true
            try {
                this.resetToDefault()
            } finally {
                this.urlHashSuppressed = false
            }
        }
    }
    protected urlHashString(): string {
        if (typeof this._value === "string") {
            return this._value
        }
        return this.toJsonString()
    }
    protected restoreFromUrlHash(raw: string) {
        if (typeof this._value === "string") {
            this._value = raw as any
        } else {
            this.fromJsonString(raw)
        }
        this.signal.emit({ type: VALUE })
    }

    protected setFromLocalStorage() {
        if (this.options?.local === undefined) {
            return
        }
        const name = this.options.local
        const value = localStorage.getItem(this.options.local)
        if (value !== null) {
            try {
                this.fromJsonString(value)
                return
            } catch (error) {
                console.log(`ValueModel.constructor(): failed to restore "${name}" = "${value}" from local`)
            }
        } else {
            this.persistToLocalStorage()
        }
    }
    protected persistToLocalStorage() {
        if (this.options?.local === undefined || this.hasSpecialValue()) {
            return
        }
        try {
            const name = this.options.local
            localStorage.setItem(name, this.toJsonString())
        } catch (e) { }
    }

    protected toJsonString() {
        let value: string
        if (this._value instanceof Int8Array ||
            this._value instanceof Uint8Array ||
            this._value instanceof Uint8ClampedArray ||
            this._value instanceof Int16Array ||
            this._value instanceof Uint16Array ||
            this._value instanceof Int32Array ||
            this._value instanceof Uint32Array ||
            this._value instanceof Float32Array ||
            this._value instanceof Float64Array
        ) {
            return `[${this._value.join(",")}]`
        } else {
            return JSON.stringify(this._value)
        }
    }

    protected fromJsonString(value: string) {
        if (this._value instanceof Int8Array ||
            this._value instanceof Uint8Array ||
            this._value instanceof Uint8ClampedArray ||
            this._value instanceof Int16Array ||
            this._value instanceof Uint16Array ||
            this._value instanceof Int32Array ||
            this._value instanceof Uint32Array ||
            this._value instanceof Float32Array ||
            this._value instanceof Float64Array
        ) {
            this._value = new (this._value.constructor as any)(JSON.parse(value))
        } else {
            this._value = JSON.parse(value)
        }
    }

    override set value(value: V | SpecialValue) {
        if (isSpecialValue(value)) {
            this.setSpecialValue(value)
            return
        }
        if (this._value === value) return
        this._value = value
        this.persistToLocalStorage()
        if (!this.urlHashSuppressed) {
            this.persistToUrlHash(true)
        }
        this.signal.emit({ type: VALUE })
    }
    override get value(): V {
        produceValue(this.signal)
        return isSpecialValue(this._value) ? undefined as V : this._value
    }
}

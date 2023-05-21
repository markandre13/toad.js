/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2023 Mark-André Hopf <mhopf@mark13.org>
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

import { Signal } from "../Signal"

export type InferModelParameter<M> = M extends Model<infer T> ? T : never

export interface ModelOptions {
    enabled?: boolean
    color?: string
    label?: string
    description?: string
    error?: string 
}

/**
 * @category Application Model
 */
export abstract class Model<T = void, O extends ModelOptions = ModelOptions> {
    modified = new Signal<T>()
    options?: O

    constructor(options?: O) {
        this.options = options
    }

    set enabled(enabled: boolean) {
        if (this.options?.enabled === enabled)
            return
        if (this.options === undefined) {
            this.options = {} as O
        }
        this.options.enabled = enabled
        this.modified.trigger(undefined as any)
    }
    get enabled(): boolean { return this.options?.enabled !== false }

    set color(color: string | undefined) {
        if (this.options?.color === color)
            return
        if (this.options === undefined) {
            this.options = {} as O
        }
        this.options.color = color
        this.modified.trigger(undefined as any)
    }
    get color(): string | undefined { return this.options?.color }

    set label(label: string | undefined) {
        if (this.options?.label === label)
            return
        if (this.options === undefined) {
            this.options = {} as O
        }
        this.options.label = label
        this.modified.trigger(undefined as any)
    }
    get label(): string | undefined { return this.options?.label }

    set description(description: string | undefined) {
        if (this.options?.description === description)
            return
        if (this.options === undefined) {
            this.options = {} as O
        }
        this.options.description = description
        this.modified.trigger(undefined as any)
    }
    get description(): string | undefined { return this.options?.description }

    set error(error: string | undefined) {
        if (this.options?.error === error)
            return
        if (this.options === undefined) {
            this.options = {} as O
        }
        this.options.error = error
        this.modified.trigger(undefined as any)
    }
    get error(): string | undefined { return this.options?.error }
}

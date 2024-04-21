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

export enum ModelReason {
    /** 
     * Either everything in the model has changed or the model itself had been replaced with another model.
     */
    ALL,

    /**
     * The value represented by the model has changed.
     * 
     * While Model itself does not have a value, it's subclasses always represent a value, hence
     * this reason is part of ModelReason.
     */
    VALUE,

    ENABLED,
    COLOR,
    LABEL,
    DESCRIPTION,
    ERROR,
    MAX_REASON
}

export interface ModelOptions {
    enabled?: boolean
    color?: string
    label?: string
    description?: string
    error?: string 
}

/**
 * @category Application Model
 * 
 * R: The model's signal takes the reason for it being triggered as an argument.
 * The reasoning for this is that when we add a closure to the signal, we will
 * have a reference to the model available to access the model's state/value.
 * The R will then indicate why the signal has been triggered.
 * 
 * O: A list of optional values.
 */
export class Model<R = void, O extends ModelOptions = ModelOptions> {
    modified = new Signal<ModelReason | R>()
    options?: Partial<O>

    constructor(options?: O) {
        this.options = options
    }

    set enabled(enabled: boolean) {
        if (this.options?.enabled === enabled)
            return
        if (this.options === undefined) {
            this.options = {}
        }
        this.options.enabled = enabled
        this.modified.trigger(ModelReason.ENABLED)
    }
    get enabled(): boolean { return this.options?.enabled !== false }

    set color(color: string | undefined) {
        if (this.options?.color === color)
            return
        if (this.options === undefined) {
            this.options = {}
        }
        this.options.color = color
        this.modified.trigger(ModelReason.COLOR)
    }
    get color(): string | undefined { return this.options?.color }

    set label(label: string | undefined) {
        if (this.options?.label === label)
            return
        if (this.options === undefined) {
            this.options = {}
        }
        this.options.label = label
        this.modified.trigger(ModelReason.LABEL)
    }
    get label(): string | undefined { return this.options?.label }

    set description(description: string | undefined) {
        if (this.options?.description === description)
            return
        if (this.options === undefined) {
            this.options = {}
        }
        this.options.description = description
        this.modified.trigger(ModelReason.DESCRIPTION)
    }
    get description(): string | undefined { return this.options?.description }

    set error(error: string | undefined) {
        if (this.options?.error === error) {
            return
        }
        if (this.options === undefined) {
            this.options = {}
        }
        this.options.error = error
        this.modified.trigger(ModelReason.ERROR)
    }
    get error(): string | undefined { return this.options?.error }

    applyStyle(element: HTMLElement) {
        if (this.enabled) {
            element.removeAttribute("disabled")
        } else {
            element.setAttribute("disabled", "disabled")
        }
        if (this.color !== undefined) {
            element.style.fontStyle = ""
            element.style.fontWeight = ""
            element.style.color = ""
            switch(this.color) {
                case "italic":
                    element.style.fontStyle = "italic"
                    break
                case "bold":
                    element.style.fontWeight = "bold"
                    break
                default:
                    element.style.color = this.color
            }
        } else {
            element.style.color = ""
            element.style.fontStyle = ""
            element.style.fontWeight = ""
        }
        if (this.error !== undefined) {
            element.classList.add("tx-error")
        } else {
            element.classList.remove("tx-error")
        }
    }
}

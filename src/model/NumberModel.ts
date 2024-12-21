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

import { ValueModel, ValueModelOptions, ValueModelEvent } from "./ValueModel"
import { BigDecimal } from "@toad/util/BigDecimal"
import { expression } from "@toad/util/expressions/expression"

export const MIN_VALUE = Symbol("MIN_VALUE")
export const MAX_VALUE = Symbol("MAX_VALUE")
export const STEP_VALUE = Symbol("STEP_VALUE")
export const AUTOCORRECT_VALUE = Symbol("AUTOCORRECT")
export type MinValueEvent = { type: typeof MIN_VALUE }
export type MaxValueEvent = { type: typeof MAX_VALUE }
export type StepValueEvent = { type: typeof STEP_VALUE }
export type AutoCorrectValueEvent = { type: typeof AUTOCORRECT_VALUE }
export type NumberModelEvent = ValueModelEvent | MinValueEvent | MaxValueEvent | StepValueEvent | AutoCorrectValueEvent

export interface NumberModelOptions extends ValueModelOptions<number> {
    /**
     * when set, value will not go below min
     */
    min?: number
    /**
     * when set, value will not go above max
     */
    max?: number
    /**
     * when set, some views can increase/decrease the value, e.g. using the scrollwheel
     */
    step?: number
    /**
     * when 'true', value will always be clipped to min/max. 'undefined' per default
     * as it makes editing the value in a text field quite annoying.
     */
    autocorrect?: boolean
}

/**
 * @category Application Model
 */
export class NumberModel extends ValueModel<number, NumberModelEvent, NumberModelOptions> {
    constructor(value: number, options?: NumberModelOptions) {
        super(value, options)
    }
    increment() {
        if (this.step !== undefined) {
            const value = new BigDecimal(this.value)
            const step = new BigDecimal(this.step)
            this.value = this.clip(parseFloat(value.add(step).toString()))
        }
    }
    decrement() {
        if (this.step !== undefined) {
            const value = new BigDecimal(this.value)
            const step = new BigDecimal(this.step)
            this.value = this.clip(parseFloat(value.sub(step).toString()))
        }
    }

    override set value(value: number | string) {
        let number: number
        if (typeof value === "string") {
            // const lexer = new Lexer(value)
            const ex = expression(value)
            number = ex!.eval()
        } else {
            number = value
        }
        // let number = typeof value === "string" ? parseFloat(value) : value
        this.modified.withLock(() => {
            if (this.autocorrect) {
                super.value = this.clip(number)
            } else {
                super.value = number
                this.error = this.check(number)
            }
        })
    }
    override get value(): number {
        return super.value
    }

    set min(min: number | undefined) {
        if (this.options?.min === min) return
        if (this.options === undefined) {
            this.options = {}
        }
        this.options.min = min
        this.modified.trigger({ type: MIN_VALUE })
    }
    get min(): number | undefined {
        return this.options?.min
    }

    set max(max: number | undefined) {
        if (this.options?.max === max) return
        if (this.options === undefined) {
            this.options = {}
        }
        this.options.max = max
        this.modified.trigger({ type: MAX_VALUE })
    }
    get max(): number | undefined {
        return this.options?.max
    }

    set step(step: number | undefined) {
        if (this.options?.step === step) return
        if (this.options === undefined) {
            this.options = {}
        }
        this.options.step = step
        this.modified.trigger({ type: STEP_VALUE })
    }
    get step(): number | undefined {
        return this.options?.step
    }

    set autocorrect(autocorrect: boolean | undefined) {
        if (this.autocorrect === autocorrect) return
        if (this.options === undefined) {
            this.options = {}
        }
        this.options.autocorrect = autocorrect
        this.modified.trigger({ type: AUTOCORRECT_VALUE })
    }
    get autocorrect(): boolean {
        return this.options?.autocorrect === true
    }

    private clip(value: number) {
        if (this.min !== undefined && value < this.min) {
            value = this.min
        }
        if (this.max !== undefined && value > this.max) {
            value = this.max
        }
        return value
    }

    private check(value: number) {
        if (this.min !== undefined && value < this.min) {
            return `The value must not be below ${this.min}.`
        }
        if (this.max !== undefined && value > this.max) {
            if (this.autocorrect) {
                value = this.max
            } else {
                return `The value must not be above ${this.max}.`
            }
        }
        return undefined
    }
}

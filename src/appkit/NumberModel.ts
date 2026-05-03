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

import { BigDecimal } from "../util/BigDecimal"
import { expression } from "../util/expressions/expression"
import { AUTOCORRECT_VALUE, MAX_VALUE, MIN_VALUE, NumericModel, type NumericModelEvent, type NumericModelOptions, STEP_VALUE } from "./NumericModel"
export { AUTOCORRECT_VALUE, MAX_VALUE, MIN_VALUE, STEP_VALUE }

export type NumberModelEvent = NumericModelEvent
export type NumberModelOptions = NumericModelOptions<number>

/**
 * @category Application Model
 */
export class NumberModel extends NumericModel<number> {
    // constructor(value: number, options?: NumberModelOptions) {
    //     super(value, options)
    // }
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
        this.signal.withLock(() => {
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

    override toNumber(): number {
        return super.value
    }

    clip(value: number) {
        if (this.min !== undefined && value < this.min) {
            value = this.min
        }
        if (this.max !== undefined && value > this.max) {
            value = this.max
        }
        return value
    }

    protected check(value: number) {
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

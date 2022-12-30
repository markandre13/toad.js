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

import { GenericModel } from "./GenericModel"

export interface NumberModelOptions {
  min?: number
  max?: number
  step?: number
}

export class NumberModel extends GenericModel<number> {
  min?: number
  max?: number
  step?: number

  constructor(value: number, options?: NumberModelOptions) {
    super(value)
    if (options) {
      this.min = options.min
      this.max = options.max
      this.step = options.step
    }
  }
  increment() {
    if (this.step !== undefined) {
        this.value += this.step
    }
  }
  decrement() {
    if (this.step !== undefined) {
        this.value -= this.step
    }
  }
}

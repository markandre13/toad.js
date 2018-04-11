/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Signal } from "./signal"

export abstract class Model {
  modified: Signal
  
  constructor() {
    this.modified = new Signal()
  }
  
//  abstract set value(value: any)
//  abstract get value(): any
}

export class GenericModel<T> extends Model {
  _value: T

  constructor(value: T) {
    super()
    this._value = value
  }
  
  set value(value: T) {
    if (this._value == value)
      return
    this._value = value
    this.modified.trigger()
  }
  
  get value(): T {
    return this._value
  }
}

export class TextModel extends GenericModel<string> {
  constructor(value: string) {
    super(value)
  }
}

export class HtmlModel extends TextModel {
  constructor(value: string) {
    super(value)
  }
}

export class NumberModel extends GenericModel<number> {
  min?: number
  max?: number
  step?: number
  
  constructor(value: number, options: any) {
    super(value)
    if (options) {
      this.min = options.min
      this.max = options.max
      this.step = options.step
    }
  }
}

export class BooleanModel extends GenericModel<boolean> {
  constructor(value: boolean) {
    super(value)
  }
}

export class RadioStateModel<T> extends Model {
  private _value?: T

  constructor() {
    super()
  }

  set value(value: T) {
    this.setValue(value)
  }

  get value(): T {
    return this.getValue()
  }

  hasValue(): boolean {
    return this._value != undefined
  }
  
  setValue(value: T): void { // FIXME: set value(value: T)
    if (this._value == value)
      return
    this._value = value
    this.modified.trigger()
  }
  
  getValue(): T { // FIXME: get value()
    if (this._value === undefined)
      throw Error("fuck")
    return this._value
  }
}

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

export abstract class Model<T = void> {
  modified: Signal<T>
  
  constructor() {
    this.modified = new Signal<T>()
  }
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

export class TextModel extends Model {
  _value: string|Function

  constructor(value: string) {
    super()
    this._value = value
  }
  
  set promise(promise: Function) {
    this._value = promise
    this.modified.trigger()
  }
  
  get promise(): Function {
    if (typeof this._value === "string") {
      return () => {
        return this._value
      }
    }
    return this._value
  }
  
  set value(value: string) {
    if (this._value == value)
      return
    this._value = value
    this.modified.trigger()
  }
  
  get value(): string {
    if (typeof this._value === "number") {
      this._value = String(this._value)
    } else
    if (typeof this._value !== "string") {
      this._value = this._value() as string
    }
    return this._value
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

export class OptionModelBase extends Model {
    private _stringValue: string
    
    constructor() {
        super()
        this._stringValue = ""
    }
    
    set stringValue(v: string) {
        if (this._stringValue === v)
            return
        this._stringValue = v
        this.modified.trigger()
    }
    
    get stringValue() {
        return this._stringValue
    }
    
    isValidStringValue(stringValue: string): boolean {
        return false
    }
}

export class OptionModel<T> extends OptionModelBase {
    private _map: Map<string, T>

    constructor() {
        super()
        this._map = new Map<string, T>()
    }

    add(id: string, value: T) {
        this._map.set(id, value)
    }

    isValidStringValue(stringValue: string): boolean {
        return this._map.has(stringValue)
    }

    get value(): T {
        return this._map.get(this.stringValue)!
    }

}

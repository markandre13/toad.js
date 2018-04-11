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

import { Model } from "./model"
import { Signal } from "./signal"

export class Action extends Model {
  signal: Signal
  title: string
  
  _enabled: boolean

  constructor(parent: HTMLElement | undefined, title: string) {
    super()
    this.signal = new Signal()
    this.title = title
    this._enabled = true
  }
  
  set value(placeHolder: any) {
    throw Error("Action.value can not be assigned a value")
  }

  get value(): any {
    throw Error("Action.value can not return a value")
  }

  set enabled(enabled: boolean) {
    if (this._enabled == enabled)
      return
    this._enabled = enabled
    this.modified.trigger()
  }
  
  get enabled(): boolean {
    return this._enabled
  }
  
  trigger(): void {
    if (!this._enabled)
      return
    this.signal.trigger()
  }
}

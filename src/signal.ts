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

export class SignalLink {
  callback: (data?: any) => void
  id?: any
  constructor(callback: (data?: any) => void, id?: any) {
    this.callback = callback
    this.id = id
  }
}

// TODO: specify the callback argument via generic
export class Signal<T = any> {
  locked?: boolean
  triggered?: any
  callbacks?: Array<SignalLink>

  add(callback: (data?: T) => void): void
  add(callback: (data?: T) => void, id: any): void
  add(callback: (data?: T) => void, id?: any) {
    if (!this.callbacks)
      this.callbacks = new Array<SignalLink>()
    this.callbacks.push(new SignalLink(callback, id))
  }

  remove(id: any) {
    if (!this.callbacks)
      return
    for(let i=this.callbacks.length-1; i>=0; --i) {
      if (this.callbacks[i].id === id)
        this.callbacks.splice(i, 1)
    }
  }
  
  count(): number {
    if (!this.callbacks)
      return 0
    return this.callbacks.length
  }
  
  lock(): void {
    this.locked = true
  }
  
  unlock(): void {
    this.locked = undefined
    if (this.triggered) {
      let data = this.triggered.data
      this.triggered = undefined
      this.trigger(data)
    }
  }

  trigger(data?: T): void {
    if (this.locked) {
      this.triggered = { data: data }
      return
    }
    if (!this.callbacks)
      return

    for(let i=0; i<this.callbacks.length; ++i)
      this.callbacks[i].callback(data)
  }
}

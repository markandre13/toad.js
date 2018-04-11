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
  callback: () => void
  id?: any
  constructor(callback: () => void, id?: any) {
    this.callback = callback
    this.id = id
  }
}

export class Signal {

  callbacks?: Array<SignalLink>

  add(callback: () => void): void
  add(callback: () => void, id: any): void
  add(callback: () => void, id?: any) {
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

  trigger(): void {
    if (!this.callbacks)
      return
    for(let i=0; i<this.callbacks.length; ++i)
      this.callbacks[i].callback()
  }
}

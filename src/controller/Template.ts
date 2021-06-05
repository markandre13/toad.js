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

import * as dom from "../util/dom"
import { View } from "../view/View"
import { Controller } from "./Controller"

export class Template extends Controller {
  root: DocumentFragment

  constructor(template: string) {
    super()
    this.root = dom.instantiateTemplate(template)
    this.registerViews()
  }

  registerViews() {
    let views = this.root.querySelectorAll("[model]")
    for (let element of views) {
      //if (element.nodeName.toUpperCase().substring(0,4)!=="TOAD-")
      //  continue
      let view = element as View
      if (!view)
        continue
      try {
        this.registerView(view.getModelId(), view)
      }
      catch (e) {
      }
    }

    views = this.root.querySelectorAll("[action]")
    for (let element of views) {
      //if (element.nodeName.toUpperCase().substring(0,4)!=="TOAD-")
      //  continue
      let view = element as View
      if (!view)
        continue
      //      view.controller = this
      try {
        this.registerView(view.getActionId(), view)
      }
      catch (e) {
      }
    }

  }

  openHref(href: string) {
  }
}

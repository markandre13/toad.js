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

import { MenuButton } from "./MenuButton"
import { MenuButtonContainer } from "./MenuHelper"

export class MenuNode {
  title: string
  label: string
  shortcut?: string
  type: string
  modelId?: string

  parent?: MenuNode
  down?: MenuNode
  next?: MenuNode

  view?: HTMLElement

  constructor(title: string, label: string, shortcut?: string, type?: string, modelId?: string) {
    this.title = title
    this.label = label
    this.shortcut = shortcut
    this.type = type ? type : "entry"
    this.modelId = modelId
  }

  isEnabled(): boolean {
    return true
  }

  isAvailable(): boolean {
    return true
  }

  createWindowAt(parent: MenuButtonContainer, parentView: HTMLElement): void {
    if (this.type == "spacer") {
      let span = document.createElement("span") as HTMLSpanElement
      span.style.flexGrow = "1"
      parentView.appendChild(span)
      return
    }
    this.view = new MenuButton(parent, this)
    parentView.appendChild(this.view)
  }

  deleteWindow(): void {
  }
}

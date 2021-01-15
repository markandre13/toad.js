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

import { MenuButton } from "./MenuButton"
import { MenuNode } from "./MenuNode"
import { MenuButtonContainer } from "./MenuButtonContainer"

export class PopupMenu extends MenuButtonContainer {
  root: MenuNode
  vertical: boolean
  parentButton: MenuButton
  popup: HTMLElement

  constructor(root: MenuNode, parent: MenuButton) {
    super()
    this.vertical = true
    this.root = root
    this.parentButton = parent

    this.popup = document.createElement("div")
    this.popup.classList.add("menu-popup")

    let node = root.down
    while (node) {
      if (node.isAvailable()) {
        node.createWindowAt(this, this.popup)
      } else {
        node.deleteWindow()
      }
      node = node.next
    }
    this.appendChild(this.popup)
    this.show()
  }


  show() {
    if (!this.parentButton.master!.vertical)
      placePopupVertical(this.parentButton, this.popup)

    else
      placePopupHorizontal(this.parentButton, this.popup)
    this.style.display = ""
  }

  hide() {
    this.style.display = "none"
  }
}

window.customElements.define("toad-popupmenu", PopupMenu)

export function placePopupVertical(parent: HTMLElement, popup: HTMLElement): void {
  let parentBoundary = parent.getBoundingClientRect()

  // FIXME: need to handle scrollLeft, scrollTop?

  popup.style.opacity = "0"
  popup.style.left = parentBoundary.left+"px"
  popup.style.top = (parentBoundary.top+parentBoundary.height)+"px"

  setTimeout(function() {
    // FIXME: there might still not be enough space, might want to scroll and/or overlap parent
    let popupBoundary = popup.getBoundingClientRect()
    let popupBottom = parentBoundary.top + parentBoundary.height + popupBoundary.height
    if (popupBottom > window.innerHeight) {
      popup.style.top = (parentBoundary.top - popupBoundary.height)+"px"
    }
    let popupRight = parentBoundary.left + popupBoundary.width
    if (popupRight > window.innerWidth) {
       popup.style.left = (parentBoundary.left + parentBoundary.width - popupBoundary.width)+"px"
    }
    popup.style.opacity = "1"
  }, 0)

//  window.addEventListener("mouseup", new PopupListener(popup), true)
}

export function placePopupHorizontal(parent: HTMLElement, popup: HTMLElement): void {
  let parentBoundary = parent.getBoundingClientRect()

  // FIXME: need to handle scrollLeft, scrollTop?

  popup.style.opacity = "0"
  popup.style.left = (parentBoundary.left+parentBoundary.width)+"px"
  popup.style.top = parentBoundary.top+"px"

  setTimeout(function() {
    // FIXME: there might still not be enough space, might want to scroll and/or overlap parent
    let popupBoundary = popup.getBoundingClientRect()
    let popupBottom = parentBoundary.top + popupBoundary.height
    if (popupBottom > window.innerHeight) {
      popup.style.top = (parentBoundary.top + parentBoundary.height - popupBoundary.height)+"px"
    }
    let popupRight = parentBoundary.left + parentBoundary.width + popupBoundary.width
    if (popupRight > window.innerWidth) {
       popup.style.left = (parentBoundary.left - popupBoundary.width)+"px"
    }
    popup.style.opacity = "1"
  }, 0)

//  window.addEventListener("mouseup", new PopupListener(popup), true)
}

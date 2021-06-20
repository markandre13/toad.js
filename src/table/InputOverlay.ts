/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2021 Mark-André Hopf <mhopf@mark13.org>
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
import { findScrollableParent } from "../scrollIntoView"

export class InputOverlay extends HTMLDivElement {

  focusInFromLeft?: () => void
  focusInFromRight?: () => void

  // workaround
  static init(div: InputOverlay): void {
    div.addEventListener("focusin", (event: FocusEvent) => {
      div.style.opacity = "1"
      if (event.target && event.relatedTarget) {
        try {
          if (dom.isNodeBeforeNode(event.relatedTarget as Node, div)) {
            if (div.focusInFromLeft)
              div.focusInFromLeft()
          } else {
            if (div.focusInFromRight)
              div.focusInFromRight()
          }
        }
        catch(e) {}
      }
    })

    div.addEventListener("focusout", (event: FocusEvent) => {
      div.style.opacity = "0.5" // this is for debugging to check if the overlay is really placed nicely...
      // div.unsetViewRect()
    })

    div.style.display = "none"

    div.setViewRect = InputOverlay.prototype.setViewRect
    div.unsetViewRect = InputOverlay.prototype.unsetViewRect
    div.setEditView = InputOverlay.prototype.setEditView
    div.adjustToCell = InputOverlay.prototype.adjustToCell
  }

  setEditView(fieldView: HTMLElement | undefined) {
    // avoid side effect of scrolling parent on safari
    const scrollableParent = findScrollableParent(this)
    let savedScrollLeft = 0, savedScrollTop = 0
    if (scrollableParent !== undefined)
      [savedScrollLeft, savedScrollTop] = [scrollableParent.scrollLeft, scrollableParent.scrollTop]

    if (!this.hasChildNodes()) {
      if (fieldView)
        this.appendChild(fieldView)
    } else {
      if (dom.hasFocus(this.children[0])) {
        this.children[0].dispatchEvent(new FocusEvent("blur"))
      }
      if (fieldView)
        this.replaceChild(fieldView, this.childNodes[0])
      else
        this.removeChild(this.childNodes[0])
    }

    this.style.display = fieldView ? "" : "none"

    // restore scrollable parent
    if (scrollableParent !== undefined) {
      scrollableParent.scrollLeft = savedScrollLeft
      scrollableParent.scrollTop = savedScrollTop
    }
  }

  adjustToCell(td: HTMLTableDataCellElement | undefined) {

    if (!this.hasChildNodes()) {
      this.unsetViewRect()
      return
    }

    if (td === undefined)
      return

    let boundary = td.getBoundingClientRect()
    let tr = td.parentElement
    let tbody = tr!.parentElement!

    let top, left
    if (navigator.userAgent.indexOf("Chrome") > -1) {
      // Chrome
      left = td.offsetLeft + 2
      top = td.offsetTop - tbody.clientHeight
    } else {
      // Safari & Opera
      left = td.offsetLeft + 0.5
      top = td.offsetTop - tbody.clientHeight 
    }

    const width = td.clientWidth - dom.horizontalPadding(td)
    const height = boundary.height

    this.setViewRect(top, left, width, height)
  }

  private setViewRect(top: number, left: number, width: number, height: number) {
    this.style.display = ""
    this.style.top = `${top}px`
    this.style.left = `${left}px`
    this.style.width = `${width}px`
    this.style.height = `${height}px`
  }

  private unsetViewRect() {
    this.style.display = "none"
    this.style.top = ""
    this.style.left = ""
    this.style.width = ""
    this.style.height = ""
  }
}
// window.customElements.define("toad-table-inputoverlay", InputOverlay, { extends: 'div' })

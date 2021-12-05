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

import * as dom from "src/util/dom"
import { findScrollableParent } from "src/util/scrollIntoView"

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
      div.style.opacity = "0" // this is for debugging to check if the overlay is really placed nicely...
    })

    div.style.display = "none"
    // div.style.background = "#f80"

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

  adjustToCell(cell: HTMLTableDataCellElement | undefined) {

    if (!this.hasChildNodes()) {
      this.unsetViewRect()
      return
    }

    if (cell === undefined)
      return

    let boundary = cell.getBoundingClientRect()
    let tr = cell.parentElement
    if (tr === null) {
      // console.trace(`InputOverlay.adjustToCell(): cell to adjust to has no parent`)
      // console.log(cell)
      return
    }
    let tbody = tr.parentElement
    if (tbody === null) {
      // console.trace(`InputOverlay.adjustToCell(): cell's parent row has no parent`)
      // console.log(tr)
      return
    }

    let top, left
    if (navigator.userAgent.indexOf("Chrome") > -1) {
      // Chrome
      left = cell.offsetLeft + 2
      top = cell.offsetTop - tbody.clientHeight
    } else {
      // Safari & Opera
      left = cell.offsetLeft + 0.5
      top = cell.offsetTop - tbody.clientHeight 
    }

    const width = cell.clientWidth - dom.horizontalPadding(cell)
    const height = boundary.height

    this.setViewRect(top, left, width, height)
  }

  private setViewRect(top: number, left: number, width: number, height: number) {
    this.style.display = ""
    this.style.opacity = "1"
    this.style.top = `${top}px`
    this.style.left = `${left}px`
    this.style.width = `${width}px`
    this.style.height = `${height}px`
  }

  private unsetViewRect() {
    this.style.opacity = "0"
    this.style.display = "none"
    this.style.top = ""
    this.style.left = ""
    this.style.width = ""
    this.style.height = ""
  }
}
// window.customElements.define("toad-table-inputoverlay", InputOverlay, { extends: 'div' })

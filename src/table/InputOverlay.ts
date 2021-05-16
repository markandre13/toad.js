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

import * as dom from "../dom"
import { findScrollableParent } from "../scrollIntoView" 

export class InputOverlay extends HTMLDivElement {

  focusInFromLeft?: () => void
  focusInFromRight?: () => void

  // workaround
  static init(div: InputOverlay): void {
    div.addEventListener("focusin", (event: FocusEvent) => {
      div.style.opacity = "1"
      if (event.target && event.relatedTarget) {
        if (dom.isNodeBeforNode(event.relatedTarget as Node, div)) {
          if (div.focusInFromLeft)
            div.focusInFromLeft()
        } else {
          if (div.focusInFromRight)
            div.focusInFromRight()
        }
      }
    })

    div.addEventListener("focusout", (event: FocusEvent) => {
      div.style.opacity = "0"
    })

    div.setViewRect = InputOverlay.prototype.setViewRect
    div.setChild = InputOverlay.prototype.setChild
    div.adjustToCell = InputOverlay.prototype.adjustToCell
  }

  setChild(fieldView: HTMLElement) {
    // avoid side effect of scrolling parent on safari
    const scrollableParent = findScrollableParent(this)
    let savedScrollLeft = 0, savedScrollTop = 0 
    if (scrollableParent !== undefined)
      [ savedScrollLeft, savedScrollTop ] = [ scrollableParent.scrollLeft, scrollableParent.scrollTop ]
 
    if (this.children.length === 0) {
      this.appendChild(fieldView)
    } else {
      if (dom.hasFocus(this.children[0])) {
        this.children[0].dispatchEvent(new FocusEvent("blur"))
      }
      this.replaceChild(fieldView, this.children[0])
    }

    // restore scrollable parent
    if (scrollableParent !== undefined) {
      scrollableParent.scrollLeft = savedScrollLeft
      scrollableParent.scrollTop = savedScrollTop
    }
  }

  adjustToCell(td: HTMLTableDataCellElement | undefined) {
    if (td === undefined)
      return
    // console.log(`adjustInputOverlayToCell(${element})`)
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
      left = td.offsetLeft + 1
      top = td.offsetTop - tbody.clientHeight - 1
    }

    const width = td.clientWidth - dom.horizontalPadding(td)
    const height = boundary.height

    this.setViewRect(top, left, width, height)
  }

  private setViewRect(top: number, left: number, width: number, height: number) {
    this.style.top = `${top}px`
    this.style.left = `${left}px`
    this.style.width = `${width}px`
    this.style.height = `${height}px`
  }
}
// window.customElements.define("toad-table-inputoverlay", InputOverlay, { extends: 'div' })

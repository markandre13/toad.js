import * as dom from "../dom"

export class InputOverlay extends HTMLDivElement {

  focusInFromLeft?: () => void
  focusInFromRight?: () => void

  // workaround
  static create(): InputOverlay {
    const div = document.createElement("div") as InputOverlay

    div.classList.add("inputDiv")

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

    div.addEventListener("focusout", () => {
      div.style.opacity = "0"
    })

    div.setViewRect = InputOverlay.prototype.setViewRect
    div.setChild = InputOverlay.prototype.setChild
    div.adjustToCell = InputOverlay.prototype.adjustToCell
    return div
  }

  setChild(td: HTMLTableDataCellElement, fieldView: HTMLElement) {
    let tr = td.parentElement
    let tbody = tr!.parentElement!

    const { x, y } = { x: tbody.scrollLeft, y: tbody.scrollTop }

    if (this.children.length === 0) {
      this.appendChild(fieldView)
    } else {
      if (document.hasFocus() && document.activeElement === this) {
        this.children[0].dispatchEvent(new FocusEvent("blur"))
      }
      this.replaceChild(fieldView, this.children[0])
    }

    tbody.scrollLeft = x
    tbody.scrollTop = y
  }

  adjustToCell(td: HTMLTableDataCellElement) {
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

  setViewRect(top: number, left: number, width: number, height: number) {
    this.style.top = `${top}px`
    this.style.left = `${left}px`
    this.style.width = `${width}px`
    this.style.height = `${height}px`
  }
}
// window.customElements.define("toad-table-inputoverlay", InputOverlay, { extends: 'div' })

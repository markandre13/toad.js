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
import { scrollIntoView, animate } from "../scrollIntoView"
import { Model } from "../model/Model"
import { View } from "../view/View"
import { TableModel } from "./TableModel"
import { SelectionModel } from "./SelectionModel"
import { TableEditMode, TablePos } from "./table"
import { TableAdapter } from "./TableAdapter"
import { TableEvent } from "./TableEvent"
import { TableEventType } from "./TableEventType"
import { trace } from "console"

function pixelToNumber(pixel: string): number {
    if (pixel === "")
        return 0
    if (pixel.substr(pixel.length - 2) !== "px")
      throw Error(`TableView.pixelToNumber('${pixel}') expected 'px' suffix`)
    return Number.parseFloat(pixel.substr(0, pixel.length - 2))
}

function getPropertyValue(element: HTMLElement, propertyName: string): number {
    let elementStyle = window.getComputedStyle(element, undefined)
    let property = elementStyle.getPropertyValue(propertyName)
    return pixelToNumber(property)
}

function horizontalPadding(element: HTMLElement): number {
    return getPropertyValue(element, "padding-left") + getPropertyValue(element, "padding-right")
}

function verticalPadding(element: HTMLElement): number {
  return getPropertyValue(element, "padding-top") + getPropertyValue(element, "padding-bottom")
}

let tableStyle = document.createElement("style")

// NOTE
// * when .root is using display: inline-grid, the browser doesn't render inputDiv
//   correctly in the intended position unless the window is resized.

tableStyle.textContent=`

.root {
  border: 1px #ccc solid;
  border-radius: 3px;
  outline-offset: -2px;
  font-family: var(--toad-font-family, sans-serif);
  font-size: var(--toad-font-size, 12px);
  background: #e0e0e0;
}
.rowhead {
  position: relative;
  overflow: hidden;
}
.colhead {
  position: relative;
  overflow: hidden;
}
.cells {
  position: relative;
  overflow: auto;
}

.root > div > table {
  border-collapse: collapse;
  border-spacing: 0;
  border: none 0px;
}
.colhead > table, .rowhead > table {
  background: #e0e0e0;
}

.colhead th, .rowhead th, .cells td {
  letter-spacing: 0;  
  overflow: hidden;   
  padding: 2px;
  margin: 0px;
  white-space: nowrap;
  border: solid 1px #ccc;
}

.colhead th, .rowhead th {
  z-index: 1;
}

.bodyrow td {
  padding-top: 0px;
  padding-bottom: 0px;
  border-top: none 0px;
  border-bottom: none 0px;
}

.cells tr:nth-child(even) {
  background: var(--toad-table-even-row, #f5f5f5);
}
.cells tr:nth-child(odd) {
  background: var(--toad-table-odd-row, #ffffff);
}

.cells td:nth-child(1) {
  border-left: none;
}
.cells tr:nth-child(2) td {
  border-top: none;
}

.cells tr.selected,
.cells tr td.selected {
  background: #808080;
  color: #fff;
}

.root:focus .cells tr.selected,
.root:focus .cells td.selected {
  background: #0069d4;
  color: #fff;
}

.root.compact .colhead th,
.root.compact .rowhead th {
  border-color: none;
  border-style: none;
  border-width: 0;
  padding: 0px;
}

.root.compact .cells * td {
  border-color: none;
  border-style: none;
  border-width: 0;
  padding: 0px;
}

.zeroSize {
  width: 0px;
  height: 0px;
  margin: 0;
  padding: 0;
  border: none;
}

.inputDiv { 
  position: relative;
  background: #fff;
  border: none;
  opacity: 0;
}

.hiddenSizeCheck {
  position: absolute;
  opacity: 0;
}
`

/*
 * rootDiv (div.root, onkeydown)
 *   rowHeadDiv (div.rowhead, hidden)
 *     rowHeadTable (table)
 *       rowHeadHead (thead)
 *         rowHeadRow (tr)
  *   colHeadDiv (div.colhead, hidden)
 *     colHeadTable (table)
 *       colHeadHead (thead)
 *         colHeadRow (tr)
 *   bodyDiv (div.cells, onscroll)
 *     bodyTable (table)
 *       bodyBody (tbody)
 *         bodyRow (tr, hidden, controls the width of all cells)
 *     zeroSize (div)
 *       inputDiv (div, focusin)
 *     hiddenSizeCheckTable (table, hidden)
 *       hiddenSizeCheckBody (tbody)
 */
export class TableView extends View {
  model?: TableModel

  adapter?: TableAdapter
  selectionModel?: SelectionModel

  rootDiv: HTMLElement

  rowHeadDiv: HTMLElement
  rowHeadTable: HTMLTableElement
  rowHeadHead: HTMLTableSectionElement

  colHeadDiv: HTMLElement
  colHeadTable: HTMLTableElement
  colHeadRow: HTMLTableRowElement

  bodyDiv: HTMLElement
  bodyTable: HTMLTableElement
  bodyBody: HTMLTableSectionElement
  bodyRow: HTMLTableRowElement

  inputOverlay: HTMLElement
  fieldView?: HTMLElement
  fieldModel?: Model
  cellBeingEdited?: HTMLElement
  insideGoTo: boolean

  hiddenSizeCheckBody: HTMLTableSectionElement

  rowAnimationHeight = 19

  static lastActiveTable?: TableView

  constructor() {
    super()

    this.insideGoTo = false

    this.rootDiv = document.createElement("div")
    this.rootDiv.classList.add("root")
    this.rootDiv.onkeydown = this.rootKeyDown

    // row head
    const rowHeadDiv = document.createElement("div")
    this.rowHeadDiv = rowHeadDiv
    rowHeadDiv.classList.add("rowhead")
    const rowHeadTable = document.createElement("table")
    this.rowHeadTable = rowHeadTable
    const rowHeadHead = document.createElement("thead")
    this.rowHeadHead = rowHeadHead
    rowHeadTable.appendChild(rowHeadHead)
    rowHeadDiv.appendChild(rowHeadTable)
    this.rootDiv.appendChild(rowHeadDiv)

    // column head
    const colHeadDiv = document.createElement("div")
    this.colHeadDiv = colHeadDiv
    colHeadDiv.classList.add("colhead")
    const colHeadTable = document.createElement("table")
    this.colHeadTable = colHeadTable
    const colHeadHead = document.createElement("thead")
    const colHeadRow = document.createElement("tr")
    this.colHeadRow = colHeadRow
    colHeadHead.appendChild(colHeadRow)
    colHeadTable.appendChild(colHeadHead)
    colHeadDiv.appendChild(colHeadTable)
    this.rootDiv.appendChild(colHeadDiv)

    // body
    const bodyDiv = document.createElement("div")
    bodyDiv.classList.add("cells")
    bodyDiv.onscroll = () => {
      rowHeadDiv.scrollTop = bodyDiv.scrollTop
      colHeadDiv.scrollLeft = bodyDiv.scrollLeft
    }
    this.bodyDiv = bodyDiv

    const bodyTable = document.createElement("table")
    this.bodyTable = bodyTable
    bodyTable.onmousedown = (event: MouseEvent) => {
      if (!event.target) {
        console.log("bodyTable.onmousedown() -> no target")
        return
      }
      if ((event.target as HTMLElement).tagName !== "TD") {
        console.log(`bodyTable.onmousedown() -> target is not TD but ${(event.target as HTMLElement).tagName}`)
        return
      }
      event.preventDefault() // otherwise field will loose focus again
      // console.log("bodyTable.onmousedown() -> goToCell()")
      this.goToCell(event.target as HTMLTableDataCellElement)
    }

    const bodyBody = document.createElement("tbody")
    this.bodyBody = bodyBody

    const bodyRow = document.createElement("tr")
    bodyRow.classList.add("bodyrow")
    this.bodyRow = bodyRow

    bodyBody.appendChild(bodyRow)
    bodyTable.appendChild(bodyBody)
    bodyDiv.appendChild(bodyTable)

    const zeroSize = document.createElement("div")
    zeroSize.classList.add("zeroSize")

    this.inputOverlay = document.createElement("div")
    this.inputOverlay.classList.add("inputDiv")

    this.inputOverlay.addEventListener("focusin", (genericEvent: Event) => {
      this.inputOverlay.style.opacity = "1"
      if (this.insideGoTo)
        return
      if (!this.model)
        return
      let event = genericEvent as FocusEvent
      if (event.target && event.relatedTarget) {
        if (dom.order(event.relatedTarget as Node, this)) {
          this.goTo(0, 0)
        } else {
          this.goTo(this.model.colCount - 1, this.model.rowCount - 1)
        }
      }
    })
    this.inputOverlay.addEventListener("focusout", () => {
      this.inputOverlay.style.opacity = "0"
    })
    zeroSize.appendChild(this.inputOverlay)
  
    const hiddenSizeCheckTable = document.createElement("table")
    hiddenSizeCheckTable.classList.add("hiddenSizeCheck")
    this.hiddenSizeCheckBody = document.createElement("tbody")
    hiddenSizeCheckTable.appendChild(this.hiddenSizeCheckBody)
    // zeroSize.appendChild(hiddenSizeCheckTable)

    bodyDiv.appendChild(zeroSize)
    this.rootDiv.appendChild(bodyDiv)
    this.rootDiv.appendChild(hiddenSizeCheckTable)


    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.appendChild(document.importNode(tableStyle, true))
    this.shadowRoot!.appendChild(this.rootDiv)
  }

  rootKeyDown(event: KeyboardEvent) {
    if (!this.selectionModel)
      return
    // FIXME: based on the selection model we could plug in a behaviour class
    switch (this.selectionModel.mode) {
      case TableEditMode.SELECT_ROW: {
        let row = this.selectionModel.value.row
        switch (event.key) {
          case "ArrowDown":
            if (row + 1 < this.model!.rowCount)
              ++row
            break
          case "ArrowUp":
            if (row > 0)
              --row
            break
        }
        if (row != this.selectionModel.value.row) {
          this.toggleRowSelection(this.selectionModel.value.row, false)
          this.selectionModel.row = row
          this.toggleRowSelection(this.selectionModel.value.row, true)
        }
      } break
      case TableEditMode.SELECT_CELL: {
        let pos = { col: this.selectionModel.col, row: this.selectionModel.row }
        switch (event.key) {
          case "ArrowRight":
            if (pos.col + 1 < this.model!.colCount) {
              ++pos.col
            }
            break
          case "ArrowLeft":
            if (pos.col > 0) {
              --pos.col
            }
            break
          case "ArrowDown":
            if (pos.row + 1 < this.model!.rowCount)
              ++pos.row
            break
          case "ArrowUp":
            if (pos.row > 0)
              --pos.row
            break
        }
        if (pos.col != this.selectionModel.col ||
          pos.row != this.selectionModel.row) {
          this.toggleCellSelection(this.selectionModel.value, false)
          this.selectionModel.value = pos
          this.toggleCellSelection(this.selectionModel.value, true)
        }
      } break
    }
  }

  private resizeEventListener?: EventListener

  connectedCallback() {
    super.connectedCallback()
    this.resizeEventListener = ()=> {
      try {
        this.adjustLayoutAfterRender()
      }
      catch(e) {
        console.log("resizeEventListener caught exception in adjustLayoutAfterRender()")
        throw e
      }
    }
    window.addEventListener("resize", this.resizeEventListener)

    if (this.selectionModel === undefined) {
      this.selectionModel = new SelectionModel();
      this.selectionModel.modified.add(() => {
        this.updateSelection()
      }, this)
    }
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.resizeEventListener!)
  }

  setModel(model?: Model): void {
    if (!model) {
      if (this.selectionModel)
        this.selectionModel.modified.remove(this)
      this.model = undefined
      this.selectionModel = new SelectionModel()
      this.selectionModel.modified.add(() => {
        this.updateSelection()
      }, this)
      this.updateView()
      return
    }

    if (model instanceof SelectionModel) {
      if (this.selectionModel) {
        this.selectionModel.modified.remove(this)
      }
      this.selectionModel = model
      this.updateSelection()
      this.selectionModel.modified.add(() => {
        this.updateSelection()
      }, this)
      return
    }
    if (model instanceof TableModel) {
      this.model = model
      this.model.modified.add( (event: TableEvent)=> { this.modelChanged(event) }, this)

      const adapter = TableAdapter.lookup(model)
      if (adapter) {
        this.adapter = new adapter()
        this.adapter.setModel(model)

        if (this.adapter.isViewCompact()) {
          this.rootDiv.classList.add("compact")
        } else {
          this.rootDiv.classList.remove("compact")
        }
        this.updateView()
      } else {
        throw Error("did not find an adapter for model of type " + model.constructor.name)
      }
      return
    }
    throw Error("TableView.setModel(): unexpected model of type " + model.constructor.name)
  }

  modelChanged(event: TableEvent) {
    switch(event.type) {

      case TableEventType.INSERT_ROW: {
        console.log(`TableView.modelChanged(): insert row ${event.index}`)
        const rowHeaderContent = this.adapter?.getRowHead(event.index)
        const th = document.createElement("th")
        if (rowHeaderContent)
          th.appendChild(rowHeaderContent)

        const trHead = document.createElement("tr")
        trHead.style.height = "0px" 
        
        let rowAnimationHeight = 0
        // TODO: also include the row header in the row height calculation
        const trBody = this.createDOMBodyRow(event.index)
        this.hiddenSizeCheckBody.appendChild(trBody)

        const trAnimationBody = document.createElement("tr")
        trAnimationBody.style.height = "0px"
        
        animate( (value: number): boolean => {
          if (value === 0) {
            rowAnimationHeight = trBody.clientHeight + 3 // TODO: this magic number is due to CSS and where hiddenSizeCheckBody is placed
            // console.log(`=========> start animation with height of ${rowAnimationHeight}`)
            this.bodyBody.insertBefore(trAnimationBody, this.bodyBody.children[event.index+1])
            this.rowHeadHead.insertBefore(trHead, this.rowHeadHead.children[event.index])
            this.rowAnimationHeight = rowAnimationHeight // TODO: this.testAPI.... ??
          }

          const rowHeight = `${value * rowAnimationHeight}px`
          // console.log(`value=${value}, rowHeight=${rowHeight}, rowAnimationHeight=${rowAnimationHeight}`)
          if (value < 1) {
            // intermediate step
            trAnimationBody.style.height = rowHeight
            trHead.style.height = rowHeight
            // console.log(trAnimationBody)
          } else {
            // console.log("=========> finished animation")
            // final step
            trBody.style.height = trBody.style.minHeight = trBody.style.maxHeight = rowHeight
            trHead.style.height = trBody.style.minHeight = trBody.style.maxHeight = rowHeight
            this.bodyBody.replaceChild(trBody, trAnimationBody)
            trHead.appendChild(th)
          }
          return true
        })
      } break

      case TableEventType.REMOVED_ROW: {
        console.log(`TableView.modelChanged(): removed row ${event.index}`)
        const trHead = this.rowHeadHead.children[event.index] as HTMLTableRowElement
        const trBody = this.bodyBody.children[event.index+1] as HTMLTableRowElement

        const rowAnimationHeight = 19

        trHead.style.minHeight = trHead.style.maxHeight = ""
        trBody.style.minHeight = trBody.style.maxHeight = ""
        trHead.style.height = `${rowAnimationHeight}px`
        trBody.style.height = `${rowAnimationHeight}px`
        while(trHead.children.length > 0)
          trHead.removeChild(trHead.children[0])
        while(trBody.children.length > 0)
          trBody.removeChild(trBody.children[0])

        animate( (value: number): boolean => {
          value = 1 - value
          const rowHeight = `${value * rowAnimationHeight}px`
          trBody.style.height = rowHeight
          trHead.style.height = rowHeight  
          if (value === 0) {
            this.rowHeadHead.deleteRow(event.index)
            this.bodyBody.deleteRow(event.index+1)   
          }
          return true
        })
      } break
    }
  }

  updateModel() {
    //console.log("TableView.updateModel()")
    //    if (this.model)
    //      this.model.value = this.input.value
  }

  updateView() {
    try {
      // console.log("TableView.updateView()")
      if (!this.model) {
        return
      }

      //console.log("updateHeader, updateBody")
      this.updateColumnHeader()
      this.updateRowHeader()
      this.updateBody()
      this.updateSelection()
      setTimeout(() => {
        if (this.model)
          this.adjustLayoutAfterRender()
      }, 0)
    }
    catch(e) {
      console.log("caught exception in updateView")
      console.log(e.stack)
      throw e
    }
  }

  updateColumnHeader() {
    this.updateHeader(true)
  }

  updateRowHeader() {
    this.updateHeader(false)
  }

  updateHeader(column: boolean) {
    if (!this.model)
      throw Error("TableView.updateHeader(): no model")
    if (!this.adapter)
      throw Error("TableView.updateHeader(): no adapter")

    let headTable, headRow, count
    if (column === true) {
      headTable = this.colHeadTable
      headRow = this.colHeadRow
      count = this.model.colCount
    } else {
      headTable = this.rowHeadTable
      headRow = this.rowHeadHead
      count = this.model.rowCount
    }

    let noHeader = false

    while (headRow.children.length > count + 1)
      headRow.removeChild(headRow.children[headRow.children.length - 1])

    for (let i = 0; i < count; ++i) {
      let cell
      if (i >= headRow.children.length) {
        cell = document.createElement("th")
        if (column) {
          headRow.appendChild(cell)
        } else {
          const row = document.createElement("tr")
          row.appendChild(cell)
          headRow.appendChild(row)
        }
      } else {
        if (column)
          cell = headRow.children[i] as HTMLTableHeaderCellElement
        else
          cell = headRow.children[i].children[0] as HTMLTableHeaderCellElement
        cell.style.minWidth = ""
        cell.style.border = ""
      }
      let content
      if (column)
        content = this.adapter.getColumnHead(i)
      else
        content = this.adapter.getRowHead(i)
      if (content === undefined) {
        noHeader = true
        continue
      }
      cell.appendChild(content)
    }

    let fillerForMissingScrollbar
    if (headRow.children.length < count + 1) {
      fillerForMissingScrollbar = document.createElement("th")
      if (column) {
        headRow.appendChild(fillerForMissingScrollbar)
      } else {
        const row = document.createElement("tr")
        row.appendChild(fillerForMissingScrollbar)
        headRow.appendChild(row)
      }
    } else {
      if (column)
        fillerForMissingScrollbar = headRow.children[headRow.children.length - 1] as HTMLTableHeaderCellElement
      else
      fillerForMissingScrollbar = headRow.children[headRow.children.length - 1].children[0] as HTMLTableHeaderCellElement
    }
    if (column) {
      fillerForMissingScrollbar.innerText = ""
      fillerForMissingScrollbar.style.minWidth = "777px"
    } else {
      fillerForMissingScrollbar.parentElement!.style.height = "777px"
      // fillerForMissingScrollbar.innerHTML = '<span style="height: 777px"></span>'
    }
    fillerForMissingScrollbar.style.border = "0px none"

    headTable.style.display = noHeader ? "none" : ""
  }

  updateBody() {
    if (!this.model)
      throw Error("TableView.updateBody(): no model")
    if (!this.adapter)
      throw Error("TableView.updateBody(): no adapter")

    // body row
    while (this.bodyRow.children.length > this.model.colCount)
      this.bodyRow.removeChild(this.bodyRow.children[this.bodyRow.children.length - 1])

    while (this.bodyRow.children.length < this.model.colCount) {
      let cell = dom.tag("td")
      this.bodyRow.appendChild(cell)
    }

    // cells

    //    (this.bodyRow.children[this.bodyRow.children.length] as HTMLElement).style.width="100%"
    while (this.bodyBody.children.length - 1 > this.model.rowCount)
      this.bodyBody.removeChild(this.bodyBody.children[this.bodyBody.children.length - 1])

    for (let row = 0; row < this.model.rowCount; ++row) {

      // FIXME: call createDOMBodyRow here

      let bodyRow: HTMLTableRowElement
      if (row + 1 >= this.bodyBody.children.length) {
        bodyRow = document.createElement("tr")
        this.bodyBody.appendChild(bodyRow)
      } else {
        bodyRow = this.bodyBody.children[row + 1] as HTMLTableRowElement
      }

      while (bodyRow.children.length > this.model.colCount)
        bodyRow.removeChild(bodyRow.children[bodyRow.children.length - 1])

      for (let col = 0; col < this.model.colCount; ++col) {
        let cell: HTMLTableDataCellElement
        if (col >= bodyRow.children.length) {
          cell = document.createElement("td")
          bodyRow.appendChild(cell)
        } else {
          cell = bodyRow.children[col] as HTMLTableDataCellElement
        }
        cell.style.width = ""
        const content = this.adapter.displayCell(col, row)
        if (content) {
          cell.appendChild(content)
        }
      }

      if (this.style.width === "100%") {
        let lastCell = bodyRow.children[bodyRow.children.length - 1] as HTMLTableDataCellElement
        lastCell.style.width = "100%"
      }

    }
    //    dump(this.bodyBody)
  }

  createDOMBodyRow(row: number) {
    if (!this.model || !this.adapter)
      throw Error()

    const bodyRow = document.createElement("tr")
    for (let col = 0; col < this.model.colCount; ++col) {
      let cell: HTMLTableDataCellElement
      if (col >= bodyRow.children.length) {
        cell = document.createElement("td")
        bodyRow.appendChild(cell)
      } else {
        cell = bodyRow.children[col] as HTMLTableDataCellElement
      }
      cell.style.width = ""
      const content = this.adapter.displayCell(col, row)
      if (content) {
        cell.appendChild(content)
      }
    }

    if (this.style.width === "100%") {
      let lastCell = bodyRow.children[bodyRow.children.length - 1] as HTMLTableDataCellElement
      lastCell.style.width = "100%"
    }

    return bodyRow
  }

  updateSelection() {
    if (this.selectionModel === undefined)
      return

    switch (this.selectionModel.mode) {
      case TableEditMode.EDIT_CELL:
        this.prepareInputOverlayForPosition(new TablePos(this.selectionModel.col, this.selectionModel.row))
        delete (this.rootDiv as any).tabIndex
        break
      case TableEditMode.SELECT_CELL: {
        let allSelected = this.bodyBody.querySelectorAll("tbody > tr > td.selected")
        for (let selected of allSelected)
          selected.classList.remove("selected")
        this.toggleCellSelection(this.selectionModel.value, true)
        this.rootDiv.tabIndex = 0
        break
      }
      case TableEditMode.SELECT_ROW: {
        let allSelected = this.bodyBody.querySelectorAll("tbody > tr.selected")
        for (let selected of allSelected)
          selected.classList.remove("selected")
        this.toggleRowSelection(this.selectionModel.value.row, true)
        this.rootDiv.tabIndex = 0
        break
      }
    }
  }

  adjustLayoutAfterRender() {
    if (!this.model)
      throw Error("TableView.adjustLayoutAfterRender(): no model")

    const colHeadRow = this.colHeadRow.children
    const rowHeadHead = this.rowHeadHead.children
    const bodyRow = this.bodyRow.children

    // set width
    for(let col = 0; col < this.model.colCount; ++col) {
      const head = colHeadRow[col] as HTMLElement
      const body = bodyRow[col] as HTMLElement

      if (head.style.width === "") {
        const headWidth = head.getBoundingClientRect().width - horizontalPadding(head)
        const bodyWidth = body.getBoundingClientRect().width - horizontalPadding(body)
        const width = Math.max(headWidth, bodyWidth)
        head.style.width = head.style.minWidth = head.style.maxWidth = `${width}px`
        body.style.width = body.style.minWidth = body.style.maxWidth = `${width}px`
      }
    }

    // set height
    for(let row = 0; row < this.model.rowCount; ++row) {
      const head = rowHeadHead[row] as HTMLElement
      const body = this.bodyBody.children[row+1] as HTMLElement

      const headHeight = head.clientHeight - verticalPadding(head)
      const bodyHeight = body.clientHeight - verticalPadding(body)

      head.style.height = head.style.minHeight = head.style.maxHeight =
      body.style.height = body.style.minHeight = body.style.maxHeight =
        ((headHeight > bodyHeight ? headHeight : bodyHeight)) + "px"
    }

    // layout
    // test cases
    // [ ] no headers at all
    // [ ] no row header case
    // [ ] no col header case
    // [X] col and row header
    // [ ] height & width should never exceed viewport dimensions
    // [ ] scroll stuff
    // pixel tweaking stuff...

    //  w0,h0 |   w1
    // -------+-------
    //    h1  |
    const w0 = this.rowHeadTable.clientWidth
    let w1 = this.bodyTable.clientWidth
    const h0 = this.colHeadTable.clientHeight
    let h1 = this.bodyTable.clientHeight

    const width = this.parentElement!.clientWidth
    const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    if (w0+w1 > width)
      w1 = width - w0
    if (h0+h1 > height)
      h1 = height - h0

    // console.log(`w0=${w0}, w1=${w1}, h0=${h0}, h1=${h1}`)

    this.rowHeadDiv.style.top = `${h0}px`
    this.rowHeadDiv.style.width = `${w0}px`
    this.rowHeadDiv.style.height = `${h1}px`

    this.colHeadDiv.style.left = `${w0-1}px`
    this.colHeadDiv.style.top = `${-h1}px`
    this.colHeadDiv.style.width = `${w1}px`

    this.bodyDiv.style.left = `${w0}px`
    this.bodyDiv.style.top = `-${h1}px` 
    this.bodyDiv.style.width = `${w1}px`
    this.bodyDiv.style.height = `${h1}px`

    this.rootDiv.style.width = `${w0 + w1}px`
    this.rootDiv.style.height = `${h0 + h1}px`
  }

  unadjustLayoutBeforeRender(pos: TablePos) {
    let head = this.colHeadRow.children[pos.col] as HTMLElement
    let body = this.bodyRow.children[pos.col] as HTMLElement
    head.style.width = head.style.minWidth = head.style.maxWidth =
    body.style.width = body.style.minWidth = body.style.maxWidth = ""

    // FIXME: row height
  }

  toggleCellSelection(pos: TablePos, flag: boolean): void {
    if (pos.col >= this.model!.colCount || pos.row >= this.model!.rowCount)
      return
    let element = this.bodyBody.children[pos.row + 1].children[pos.col]
    element.classList.toggle("selected", flag)
    if (flag) {
      // console.log(`toggleCellSelection() -> scrollIntoView()`)
      scrollIntoView(element)
    }
  }

  toggleRowSelection(row: number, flag: boolean): void {
    if (row >= this.model!.rowCount)
      return
    let rowElement = this.bodyBody.children[1 + this.selectionModel!.value.row]
    rowElement.classList.toggle("selected", flag)
    if (flag) {
      // console.log(`toggleRowSelection() -> scrollIntoView()`)
      scrollIntoView(rowElement)
    }
  }

  adjustInputOverlayToCell(element: HTMLTableDataCellElement) {
    // console.log(`adjustInputOverlayToCell(${element})`)

    let boundary = element.getBoundingClientRect()
    let td = element
    let tr = td.parentElement
    let tbody = tr!.parentElement!

    let top, left
    if (navigator.userAgent.indexOf("Chrome") > -1) {
      // Chrome
      left = `${td.offsetLeft + 2}px`
      top = `${td.offsetTop - tbody.clientHeight}px`
    } else {
      // Safari & Opera
      left = `${td.offsetLeft + 1}px`
      top = `${td.offsetTop - tbody.clientHeight - 1}px`
    }

    const width = `${element.clientWidth - horizontalPadding(element)}px`
    const height = `${boundary.height}px`

    // console.log(`adjustInputToCell() -> top=${top}, left=${left}, width=${width}, height=${height}`)
    // console.log(element)
    // console.log(boundary)

    this.inputOverlay.style.top = top
    this.inputOverlay.style.left = left
    this.inputOverlay.style.width = width
    this.inputOverlay.style.height = height

    // FIXME: add two new functions: lockElement(), unlockElement() and invoke the accordingly
    // element.style.width = element.style.minWidth = element.style.maxWidth = width
  }

  goTo(column: number, row: number) {
    this.insideGoTo = true
    this.prepareInputOverlayForPosition(new TablePos(column, row))
    this.focus()
    // console.log(`TableView.goTo(${column}, ${row}) -> scrollIntoView()`)
    scrollIntoView(this.getCellAt(column, row))
    this.insideGoTo = false
  }

  goToCell(element: HTMLTableDataCellElement | undefined) {
    if (!element)
      return
    this.insideGoTo = true
    this.prepareInputOverlayForCell(element)
    this.focus()
    // console.log(`goToCell(${element.nodeName}) -> scrollIntoView()`)
    scrollIntoView(element)
    this.insideGoTo = false
  }

  focus() {
    TableView.lastActiveTable = this
    const {x ,y } = { x: this.bodyDiv.scrollLeft, y: this.bodyDiv.scrollTop }
    if (this.fieldView) {
      this.fieldView.focus({preventScroll: true})
    } else {
      this.rootDiv.focus({preventScroll: true})
    }
    this.bodyDiv.scrollLeft = x
    this.bodyDiv.scrollTop = y
  }

  prepareInputOverlayForCell(cell: HTMLTableDataCellElement | undefined) {
    if (cell === undefined || cell.tagName !== "TD")
      return
    this.prepareInputOverlayForPosition(this.getCellPosition(cell))
  }

  prepareInputOverlayForPosition(pos: TablePos) {
    if (!this.adapter)
      return
    if (this.selectionModel) {
      switch (this.selectionModel.mode) {
        case TableEditMode.EDIT_CELL:
          this.selectionModel.value = pos
          break
        case TableEditMode.SELECT_CELL:
          this.toggleCellSelection(this.selectionModel.value, false)
          this.selectionModel.value = pos
          this.toggleCellSelection(this.selectionModel.value, true)
          return
        case TableEditMode.SELECT_ROW:
          this.toggleRowSelection(this.selectionModel!.value.row, false)
          this.selectionModel.value.row = pos.row
          this.toggleRowSelection(this.selectionModel!.value.row, true)
          return
      }
    }

    let fieldView = this.adapter.editCell(pos.col, pos.row) as View // as HTMLElement
    if (!fieldView)
      return
    this.fieldView = fieldView
    fieldView.classList.add("embedded")

    /*
        // adjust table size while editing (cursor handling is ugly)
        fieldModel.modified.add( () => {
          element.innerText = fieldModel.value
          setTimeout( () => {
            // apply element size to fieldView
            this.adjustInputToElement(element)
            this.adjustInternalTables()
          }, 0)
        })
    */

    fieldView.onblur = () => {
      // refresh cell after loosing focus
      const cell = this.getCellAt(pos.col, pos.row)

      const content = this.adapter!.displayCell(pos.col, pos.row)!

      const tmp = document.createElement("div")
      tmp.appendChild(content)
      if (tmp.innerHTML == cell.innerHTML)
        return

      cell.replaceChild(content, cell.childNodes[0])

      this.unadjustLayoutBeforeRender(pos)
      setTimeout(() => {
        this.adjustLayoutAfterRender()
      }, 0)
    }

    fieldView.onkeydown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          if (pos.row + 1 >= this.model!.rowCount)
            break
          event.preventDefault()
          this.goTo(pos.col, pos.row + 1)
          break
        case "ArrowUp":
          if (pos.row === 0)
            break
          event.preventDefault()
          this.goTo(pos.col, pos.row - 1)
          break
        case "Tab":
          if (event.shiftKey) {
            if (pos.col > 0) {
              event.preventDefault()
              this.goTo(pos.col - 1, pos.row)
            } else {
              if (pos.row > 0) {
                event.preventDefault()
                this.goTo(this.model!.colCount - 1, pos.row - 1)
              }
            }
          } else {
            if (pos.col + 1 < this.model!.colCount) {
              event.preventDefault()
              this.goTo(pos.col + 1, pos.row)
            } else {
              if (pos.row + 1 < this.model!.rowCount) {
                event.preventDefault()
                this.goTo(0, pos.row + 1)
              }
            }
          }
          break
      }
    }

    const {x ,y} = { x: this.bodyDiv.scrollLeft, y: this.bodyDiv.scrollTop }

    if (this.inputOverlay.children.length === 0) {
      this.inputOverlay.appendChild(fieldView)
    } else {
      if (document.hasFocus() && document.activeElement === this) {
        this.inputOverlay.children[0].dispatchEvent(new FocusEvent("blur"))
      }
      this.inputOverlay.replaceChild(fieldView, this.inputOverlay.children[0])
    }
    this.bodyDiv.scrollLeft = x
    this.bodyDiv.scrollTop = y

    const cell = this.getCellAt(pos.col, pos.row)
    setTimeout(() => {
      this.adjustInputOverlayToCell(cell)
    }, 0)
  }

  getCellAt(column: number, row: number): HTMLTableDataCellElement {
      let element = this.bodyBody.children[row + 1].children[column] as HTMLTableDataCellElement
      if (!element)
          throw Error(`TableView.getCellAt(${column}, ${row}): no such cell`)
      return element
  }

  getCellPosition(element: HTMLElement): TablePos {
    let col: number, row: number
    for (col = 0; col < this.model!.colCount; ++col) {
      if (element.parentElement!.children[col] === element)
        break
    }
    for (row = 1; row < this.model!.rowCount + 1; ++row) {
      if (element.parentElement!.parentElement!.children[row] === element.parentElement)
        break
    }
    --row
    return new TablePos(col, row)
  }
}

window.customElements.define("toad-table", TableView)

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

// 1st step: this class has gone completly out of control
//           create a list of all methods plus who calls who
//           try to move code outside by converting them into object of their own
//           begin with the inputOverlay

/** @jsx toadJSX.createElement */
import * as toadJSX from '../jsx'
import { ref } from '../jsx'

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
import { tableStyle } from "./tableStyle"
import { InputOverlay } from "./InputOverlay"
import { AnimationBase } from '@toad/util/animation'

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
 *     bodyTable (table, onmousedown)
 *       bodyBody (tbody)
 *         bodyRow (tr, hidden, controls the width of all cells)
 *     zeroSize (div)
 *       inputOverlay (div, focusin & focusout)
 *     hiddenSizeCheckTable (table, hidden)
 *       hiddenSizeCheckBody (tbody)
 */
export class TableView extends View {
  model?: TableModel

  adapter?: TableAdapter
  selectionModel?: SelectionModel

  rootDiv: HTMLElement

  rowHeadDiv!: HTMLElement
  rowHeadTable!: HTMLTableElement
  rowHeadHead!: HTMLTableSectionElement

  colHeadDiv!: HTMLElement
  colHeadTable!: HTMLTableElement
  colHeadRow!: HTMLTableRowElement

  bodyDiv!: HTMLElement
  bodyTable!: HTMLTableElement
  bodyBody!: HTMLTableSectionElement
  bodyRow!: HTMLTableRowElement

  inputOverlay!: InputOverlay
  editView?: HTMLElement
  fieldModel?: Model
  insideGoTo: boolean

  hiddenSizeCheckBody!: HTMLTableSectionElement

  rowAnimationHeight = 0 // TODO: put in testAPI object

  constructor() {
    super()

    this.insideGoTo = false

    this.rootDiv =
      <div class="root">
        <div set={ref(this, 'rowHeadDiv')} class="rowhead">
          <table set={ref(this, 'rowHeadTable')}>
            <thead set={ref(this, 'rowHeadHead')}></thead>
          </table>
        </div>
        <div set={ref(this, 'colHeadDiv')} class="colhead">
          <table set={ref(this, 'colHeadTable')}>
            <thead>
              <tr set={ref(this, 'colHeadRow')}></tr>
            </thead>
          </table>
        </div>
        <div set={ref(this, 'bodyDiv')} class="cells">
          <table set={ref(this, 'bodyTable')}>
            <tbody set={ref(this, 'bodyBody')}>
              <tr set={ref(this, 'bodyRow')} class="bodyrow"></tr>
            </tbody>
          </table>
          <div class="zeroSize">
            <div set={ref(this, 'inputOverlay')} class="inputDiv"></div>
          </div>
        </div>
        <table class="hiddenSizeCheck">
          <tbody set={ref(this, 'hiddenSizeCheckBody')}></tbody>
        </table>
      </div>

    this.rootDiv.onkeydown = this.onRootDivKeyDown

    this.bodyDiv.onscroll = () => {
      this.rowHeadDiv.scrollTop = this.bodyDiv.scrollTop
      this.colHeadDiv.scrollLeft = this.bodyDiv.scrollLeft
    }

    this.bodyTable.onmousedown = (event: MouseEvent) => {
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

    InputOverlay.init(this.inputOverlay)
    this.inputOverlay.focusInFromLeft = () => {
      if (!this.insideGoTo)
        this.goToFirstCell()
    }
    this.inputOverlay.focusInFromRight = () => {
      if (!this.insideGoTo)
        this.goToLastCell()
    }

    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.appendChild(document.importNode(tableStyle, true))
    this.shadowRoot!.appendChild(this.rootDiv)
  }

  updateModel() {
  }

  setModel(model?: Model): void {
    if (!model) {
      if (this.selectionModel)
        this.selectionModel.modified.remove(this)
      this.model = undefined
      this.selectionModel = new SelectionModel()
      this.selectionModel.modified.add(() => {
        this.createSelection()
      }, this)
      this.updateView()
      return
    }

    if (model instanceof SelectionModel) {
      if (this.selectionModel) {
        this.selectionModel.modified.remove(this)
      }
      this.selectionModel = model
      this.createSelection()
      this.selectionModel.modified.add(() => {
        this.createSelection()
      }, this)
      return
    }
    if (model instanceof TableModel) {
      this.model = model
      this.model.modified.add((event: TableEvent) => { this.modelChanged(event) }, this)

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
    switch (event.type) {
      case TableEventType.INSERT_ROW:
        this.updateViewAfterInsertRow(event)
        break
      case TableEventType.REMOVE_ROW:
        this.updateViewAfterRemoveRow(event)        
        break
      case TableEventType.CELL_CHANGED:
        this.onFieldViewBlur(new TablePos(event.col, event.row))
        break;
    }
  }

  updateViewAfterInsertRow(event: TableEvent) {
    // console.log(`TableView.updateViewAfterInsertRow(): insert row ${event.index}`)

    // create new rows and add them to the hiddenSizeCheckTable for measuring
    const trHead: Array<HTMLTableRowElement> = []
    const trBody: Array<HTMLTableRowElement> = []
    for (let i = 0; i < event.size; ++i) {
      // FIXME: height not yet measured for row header
      const trH = <tr style={{height: '0px'}}/> 
      trHead.push(trH)

      const trB = this.createDOMBodyRow(event.index + i)
      this.hiddenSizeCheckBody.appendChild(trB)
      trBody.push(trB)
    }

    // insert temporary rows used for animation
    const trAnimationHead = <tr style={{height: '0px'}}/>
    this.rowHeadHead.insertBefore(trAnimationHead, this.rowHeadHead.children[event.index])
    const trAnimationBody = <tr style={{height: '0px'}}/>
    this.bodyBody.insertBefore(trAnimationBody, this.bodyBody.children[event.index + 1])
   
    const a = new (class extends AnimationBase {
      table: TableView
      rowAnimationHeight = 0
      constructor(table: TableView) {
        super()
        this.table = table
      }
      override firstFrame() {
        for (let i = 0; i < event.size; ++i) {
          this.rowAnimationHeight += trBody[i].clientHeight + 3
        }
        this.table.rowAnimationHeight = this.rowAnimationHeight
      }
      override animationFrame(animationTime: number) {
        const rowHeight = `${Math.round(animationTime * this.rowAnimationHeight)}px`
        trAnimationHead.style.height = rowHeight
        trAnimationBody.style.height = rowHeight
      }
      override lastFrame() {
        for (let i = 0; i < event.size; ++i) {
          const rowHeight = `${trBody[i].clientHeight + 3}px`
          const bodyStyle = trHead[i].style
          bodyStyle.height = bodyStyle.minHeight = bodyStyle.maxHeight = rowHeight
          const headStyle = trHead[i].style
          headStyle.height = headStyle.minHeight = headStyle.maxHeight = rowHeight
        }
        this.table.rowHeadHead.replaceChild(trHead[0], trAnimationHead)
        this.table.bodyBody.replaceChild(trBody[0], trAnimationBody)
        for (let i = 1; i < event.size; ++i) {
          this.table.rowHeadHead.insertBefore(trHead[i], trHead[i - 1].nextSibling)
          this.table.bodyBody.insertBefore(trBody[i], trBody[i - 1].nextSibling)
        }

        if (this.table.selectionModel !== undefined && this.table.selectionModel.row >= event.index) {
          this.table.selectionModel.row += event.size
        }

        if (this.table.selectionModel !== undefined && this.table.selectionModel.row < event.index) {
          const cell = this.table.getCellAt(this.table.selectionModel.value.col, this.table.selectionModel.value.row)
          // console.log(`updateViewAfterInsertRow: => this.inputOverlay.adjustToCell()`)
          this.table.inputOverlay.adjustToCell(cell)
        }
      }
    })(this)
    a.start()
  }

  updateViewAfterRemoveRow(event: TableEvent) {
    const hadFocus = this.hasFocus()
    // const hadFocus = true
    this.inputOverlay.style.display = "none"

    const trHead = this.rowHeadHead.children[event.index] as HTMLTableRowElement
    const trBody = this.bodyBody.children[event.index + 1] as HTMLTableRowElement

    let rowAnimationHeight = 0
    for(let i=0; i<event.size; ++i) {
      const tr = this.bodyBody.children[event.index + i + 1] as HTMLTableRowElement
      rowAnimationHeight += tr.clientHeight
    }
    // const rowAnimationHeight = trBody.clientHeight
    this.rowAnimationHeight = rowAnimationHeight


    for (let i = 1; i < event.size; ++i) {
      this.rowHeadHead.deleteRow(event.index + 1)
      this.bodyBody.deleteRow(event.index + 2)
    }

    trHead.style.minHeight = trHead.style.maxHeight = ""
    trBody.style.minHeight = trBody.style.maxHeight = ""
    trHead.style.height = `${rowAnimationHeight}px`
    trBody.style.height = `${rowAnimationHeight}px`
    while (trHead.children.length > 0)
      trHead.removeChild(trHead.children[0])
    while (trBody.children.length > 0)
      trBody.removeChild(trBody.children[0])

    if (event.index + event.size >= this.model!.rowCount + event.size) {
      // skip animation when deleting last rows
      if (this.selectionModel && event.index > 0)
        this.selectionModel.row = event.index - 1
      
      // for (let i = 0; i < event.size; ++i) {
        this.rowHeadHead.deleteRow(event.index)
        this.bodyBody.deleteRow(event.index + 1)
      // }

      this.inputOverlay.style.display = ""
      if (hadFocus)
        this.focus()

    } else {
      animate((value: number): boolean => {
        value = 1 - value
        trBody.style.height = trHead.style.height = `${value * rowAnimationHeight}px`
        if (value === 0) {

          // for (let i = 0; i < event.size; ++i) {
            this.rowHeadHead.deleteRow(event.index)
            this.bodyBody.deleteRow(event.index + 1)
          // }

          if (this.selectionModel !== undefined) {
            this.selectionModel.row = event.index
            this.prepareInputOverlayForPosition(this.selectionModel?.value)
          }

          setTimeout( () => {
            this.inputOverlay.style.display = ""
            if (hadFocus)
              this.focus()
          }, 0)
        }
        return true
      })
    }
  }

  /*
   * Update View For New Model
   */

  updateView() {
    try {
      // console.log("TableView.updateView()")
      if (!this.model) {
        return
      }

      //console.log("updateHeader, updateBody")
      this.createColumnHeader()
      this.createRowHeader()
      this.createBody()
      this.createSelection()
      setTimeout(() => {
        if (this.model)
          this.adjustLayoutAfterRender()
      }, 0)
    }
    catch (e) {
      console.log("caught exception in updateView")
      console.log(e.stack)
      throw e
    }
  }

  protected createColumnHeader() {
    this.updateHeader(true)
  }

  protected createRowHeader() {
    this.updateHeader(false)
  }

  protected updateHeader(column: boolean) {
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
        cell = <th/>
        if (column) {
          headRow.appendChild(cell)
        } else {
          const row = <tr/>
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
      const content = column ? this.adapter.getColumnHead(i) : this.adapter.getRowHead(i)
      if (content === undefined) {
        noHeader = true
        continue
      }
      cell.appendChild(content)
    }

    let fillerForMissingScrollbar
    if (headRow.children.length < count + 1) {
      fillerForMissingScrollbar = <th/>
      if (column) {
        headRow.appendChild(fillerForMissingScrollbar)
      } else {
        const row = <tr/>
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

  protected createBody() {
    if (!this.model)
      throw Error("TableView.updateBody(): no model")
    if (!this.adapter)
      throw Error("TableView.updateBody(): no adapter")

    // body row
    while (this.bodyRow.children.length > this.model.colCount)
      this.bodyRow.removeChild(this.bodyRow.children[this.bodyRow.children.length - 1])

    while (this.bodyRow.children.length < this.model.colCount) {
      this.bodyRow.appendChild(<td/>)
    }

    // cells

    //    (this.bodyRow.children[this.bodyRow.children.length] as HTMLElement).style.width="100%"
    while (this.bodyBody.children.length - 1 > this.model.rowCount)
      this.bodyBody.removeChild(this.bodyBody.children[this.bodyBody.children.length - 1])

    for (let row = 0; row < this.model.rowCount; ++row) {

      // FIXME: call createDOMBodyRow here

      let bodyRow: HTMLTableRowElement
      if (row + 1 >= this.bodyBody.children.length) {
        bodyRow = <tr/>
        this.bodyBody.appendChild(bodyRow)
      } else {
        bodyRow = this.bodyBody.children[row + 1] as HTMLTableRowElement
      }

      while (bodyRow.children.length > this.model.colCount)
        bodyRow.removeChild(bodyRow.children[bodyRow.children.length - 1])

      for (let col = 0; col < this.model.colCount; ++col) {
        let cell: HTMLTableDataCellElement
        if (col >= bodyRow.children.length) {
          cell = <td/>
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

    const bodyRow = <tr/>
    for (let col = 0; col < this.model.colCount; ++col) {
      let cell: HTMLTableDataCellElement
      if (col >= bodyRow.children.length) {
        cell = <td/>
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

  protected createSelection() {
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

  protected adjustLayoutAfterRender() {
    if (!this.model)
      throw Error("TableView.adjustLayoutAfterRender(): no model")

    const colHeadRow = this.colHeadRow.children
    const rowHeadHead = this.rowHeadHead.children
    const bodyRow = this.bodyRow.children

    // set width
    for (let col = 0; col < this.model.colCount; ++col) {
      const head = colHeadRow[col] as HTMLElement
      const body = bodyRow[col] as HTMLElement

      if (head.style.width === "") {
        const headWidth = head.getBoundingClientRect().width - dom.horizontalPadding(head)
        const bodyWidth = body.getBoundingClientRect().width - dom.horizontalPadding(body)
        const width = Math.max(headWidth, bodyWidth)
        head.style.width = head.style.minWidth = head.style.maxWidth = `${width}px`
        body.style.width = body.style.minWidth = body.style.maxWidth = `${width}px`
      }
    }

    // set height
    for (let row = 0; row < this.model.rowCount; ++row) {
      const head = rowHeadHead[row] as HTMLElement
      const body = this.bodyBody.children[row + 1] as HTMLElement

      const headHeight = head.clientHeight - dom.verticalPadding(head)
      const bodyHeight = body.clientHeight - dom.verticalPadding(body)

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
    if (w0 + w1 > width)
      w1 = width - w0
    if (h0 + h1 > height)
      h1 = height - h0

    // console.log(`w0=${w0}, w1=${w1}, h0=${h0}, h1=${h1}`)

    this.rowHeadDiv.style.top = `${h0}px`
    this.rowHeadDiv.style.width = `${w0}px`
    this.rowHeadDiv.style.height = `${h1}px`

    this.colHeadDiv.style.left = `${w0 - 1}px`
    this.colHeadDiv.style.top = `${-h1}px`
    this.colHeadDiv.style.width = `${w1}px`

    this.bodyDiv.style.left = `${w0}px`
    this.bodyDiv.style.top = `-${h1}px`
    this.bodyDiv.style.width = `${w1}px`
    this.bodyDiv.style.height = `${h1}px`

    this.rootDiv.style.width = `${w0 + w1}px`
    this.rootDiv.style.height = `${h0 + h1}px`
  }

  protected unadjustLayoutBeforeRender(pos: TablePos) {
    let head = this.colHeadRow.children[pos.col] as HTMLElement
    let body = this.bodyRow.children[pos.col] as HTMLElement
    head.style.width = head.style.minWidth = head.style.maxWidth =
      body.style.width = body.style.minWidth = body.style.maxWidth = ""

    // FIXME: row height
  }

  protected prepareInputOverlayForCell(cell: HTMLTableDataCellElement | undefined) {
    if (cell === undefined || cell.tagName !== "TD")
      return
    this.prepareInputOverlayForPosition(this.getCellPosition(cell))
  }

  protected prepareInputOverlayForPosition(pos: TablePos) {
    if (!this.adapter)
      return

    let hadFocus = this.hasFocus()

    this.setSelectionTo(pos)

    let editView = this.adapter.createEditor(pos.col, pos.row) as View // as HTMLElement
    // FIXME: call this.inputOverlay.setChild(editView) to hide inputOverlay?
    if (!editView) {
      this.inputOverlay.setChild(undefined)
      return
    }
    this.editView = editView
    editView.classList.add("embedded")
    editView.onkeydown = (event: KeyboardEvent) => {
      this.onFieldViewKeyDown(event, pos)
    }

    this.inputOverlay.setChild(editView)

    const cell = this.getCellAt(pos.col, pos.row)
    setTimeout(() => {
      // console.log(`prepareInputOverlayForPosition: => this.inputOverlay.adjustToCell()`)
      this.inputOverlay.adjustToCell(cell)
      if (hadFocus)
        this.focus()
    }, 0)
  }

  setSelectionTo(pos: TablePos) {
    if (!this.selectionModel)
      return
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

  /*
   * set focus
   */
  override focus() {
    const { x, y } = { x: this.bodyDiv.scrollLeft, y: this.bodyDiv.scrollTop }
    if (this.editView) {
      this.editView.focus({ preventScroll: true })
    } else {
      this.rootDiv.focus({ preventScroll: true })
    }
    this.bodyDiv.scrollLeft = x
    this.bodyDiv.scrollTop = y
  }

  hasFocus(): boolean {
    return document.activeElement !== null && document.activeElement === this
  }

  /*
   * Selection
   */
  protected toggleCellSelection(pos: TablePos, flag: boolean): void {
    if (pos.col >= this.model!.colCount || pos.row >= this.model!.rowCount)
      return
    let element = this.bodyBody.children[pos.row + 1].children[pos.col]
    element.classList.toggle("selected", flag)
    if (flag) {
      // console.log(`toggleCellSelection() -> scrollIntoView()`)
      scrollIntoView(element)
    }
  }

  protected toggleRowSelection(row: number, flag: boolean): void {
    if (row >= this.model!.rowCount)
      return
    let rowElement = this.bodyBody.children[1 + this.selectionModel!.value.row]
    rowElement.classList.toggle("selected", flag)
    if (flag) {
      // console.log(`toggleRowSelection() -> scrollIntoView()`)
      scrollIntoView(rowElement)
    }
  }

  /*
   * Navigate Cells
   */
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
    scrollIntoView(element)
    this.insideGoTo = false
  }

  goToFirstCell() {
    this.goTo(0, 0)
  }

  goToLastCell() {
    if (this.model)
      this.goTo(this.model.colCount - 1, this.model.rowCount - 1)
  }

  getCellAt(column: number, row: number): HTMLTableDataCellElement | undefined {
    return this.bodyBody.children[row + 1].children[column] as HTMLTableDataCellElement
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

  /*
   * Event Handler For Children
   */

  protected onRootDivKeyDown(event: KeyboardEvent) {
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

  protected onFieldViewKeyDown(event: KeyboardEvent, pos: TablePos) {
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

  protected onFieldViewBlur(pos: TablePos) {
    // refresh cell after loosing focus
    const cell = this.getCellAt(pos.col, pos.row)
    if (cell === undefined)
      return

    const content = this.adapter!.displayCell(pos.col, pos.row)!

    const tmp = <div/>
    tmp.appendChild(content)
    if (tmp.innerHTML == cell.innerHTML)
      return

    cell.replaceChild(content, cell.childNodes[0])

    this.unadjustLayoutBeforeRender(pos)
    setTimeout(() => {
      this.adjustLayoutAfterRender()
    }, 0)
  }

  /*
   * Window Resize Event Handler
   */

  private resizeEventListener?: EventListener

  override connectedCallback() {
    super.connectedCallback()
    this.resizeEventListener = () => {
      try {
        this.adjustLayoutAfterRender()
      }
      catch (e) {
        console.log("resizeEventListener caught exception in adjustLayoutAfterRender()")
        throw e
      }
    }
    window.addEventListener("resize", this.resizeEventListener)

    if (this.selectionModel === undefined) {
      this.selectionModel = new SelectionModel()
      this.selectionModel.modified.add(() => {
        this.createSelection()
      }, this)
    }
  }

  override disconnectedCallback() {
    window.removeEventListener("resize", this.resizeEventListener!)
  }
}

window.customElements.define("toad-table", TableView)

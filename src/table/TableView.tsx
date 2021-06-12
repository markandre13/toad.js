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

import * as toadJSX from '../util/jsx'
import { ref } from '../util/jsx'

import * as dom from "../util/dom"
import { scrollIntoView } from "../scrollIntoView"
import { Model } from "../model/Model"
import { View } from "../view/View"
import { TableModel } from "./TableModel"
import { SelectionModel } from "./SelectionModel"
import { TableEditMode } from "./TableEditMode"
import { TablePos } from "./TablePos"
import { TableAdapter } from "./TableAdapter"
import { TableEvent } from "./TableEvent"
import { TableEventType } from "./TableEventType"
import { tableStyle } from "./private/tableStyle"
import { InputOverlay } from "./InputOverlay"
import { Animator } from '@toad/util/animation'
import { RemoveRowAnimation } from './private/RemoveRowAnimation'
import { InsertRowAnimation } from './private/InsertRowAnimation'
import { throws } from 'assert'

enum Log {
  LAYOUT
}


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

  rootDiv: toadJSX.Fragment

  rowHeadDiv!: HTMLElement
  rowHeadTable!: HTMLTableElement
  rowHeadHead!: HTMLTableSectionElement

  colHeadDiv!: HTMLElement
  colHeadTable!: HTMLTableElement
  colHeadRow!: HTMLTableRowElement

  scrollDiv!: HTMLElement
  bodyTable!: HTMLTableElement
  bodyBody!: HTMLTableSectionElement
  bodyRow!: HTMLTableRowElement

  inputOverlay!: InputOverlay
  editView?: HTMLElement
  fieldModel?: Model
  insideGoTo: boolean

  hiddenSizeCheckRowHead!: HTMLTableSectionElement
  hiddenSizeCheckBody!: HTMLTableSectionElement

  private log(what: Log, msg: string) {
    // console.log(msg)
  }

  private animator = new Animator()

  rowAnimationHeight = 0 // TODO: put in testAPI object

  constructor() {
    super()

    this.insideGoTo = false

    this.rootDiv =
      <>
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
        <div set={ref(this, 'scrollDiv')} class="cells">
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
          <thead set={ref(this, 'hiddenSizeCheckRowHead')} />
          <tbody set={ref(this, 'hiddenSizeCheckBody')} />
        </table>
      </>

    this.onkeydown = this.onRootDivKeyDown

    this.scrollDiv.onscroll = () => {
      this.rowHeadDiv.scrollTop = this.scrollDiv.scrollTop
      this.colHeadDiv.scrollLeft = this.scrollDiv.scrollLeft
    }

    this.bodyTable.onmousedown = (event: MouseEvent) => {
      if (!event.target) {
        console.log("bodyTable.onmousedown() -> no target")
        return
      }
      if ((event.target as HTMLElement).tagName !== "TD") {
        // FIXME: if the element is inside a TD, go up
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
    this.rootDiv.children.forEach(child => this.shadowRoot!.appendChild(child))

    // const resizeObserver = new ResizeObserver( entries => {
    //   for (let e of entries) {
    //     if (e.target === this.bodyDiv) {
    //       const columnHeadBounds = this.colHeadDiv.getBoundingClientRect()
    //       const rowHeadBounds = this.rowHeadDiv.getBoundingClientRect()
    //       const bodyBounds = this.bodyDiv.getBoundingClientRect()

    //       // :host { height & width: fit-content } did not work
    //       if (this.style.left === "" && this.style.right === "")
    //         this.style.width = (bodyBounds.width + rowHeadBounds.width)+"px"
    //       if (this.style.top === "" && this.style.bottom === "")
    //         this.style.height = (bodyBounds.height + columnHeadBounds.height)+"px"

    //       this.bodyDiv.style.top = columnHeadBounds.height + "px"
    //       this.bodyDiv.style.left = rowHeadBounds.width + "px"
    //       this.colHeadDiv.style.left = rowHeadBounds.width + "px"
    //       this.colHeadDiv.style.right = (bodyBounds.width - e.contentRect.width)+"px"
    //       this.rowHeadDiv.style.top = columnHeadBounds.height + "px"
    //       this.rowHeadDiv.style.bottom = (bodyBounds.height - e.contentRect.height)+"px"
    //     }
    //   }
    // })
    // resizeObserver.observe(this.bodyDiv)
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
        try {
          this.adapter = new adapter()
        }
        catch (e) {
          console.log(`TableView.setModel(): failed to instantiate table adapter: ${e}`)
          console.log(`setting TypeScript's target to 'es6' might help`)
          throw e
        }
        this.adapter.setModel(model)
        this.updateCompact()
        this.updateView()
      } else {
        throw Error("did not find an adapter for model of type " + model.constructor.name)
      }
      return
    }
    throw Error("TableView.setModel(): unexpected model of type " + model.constructor.name)
  }

  updateCompact() {
    if (this.adapter?.isViewCompact()) {
      this.rootDiv.children.forEach(child => child.classList.add("compact"))
    } else {
      this.rootDiv.children.forEach(child => child.classList.remove("compact"))
    }
  }

  modelChanged(event: TableEvent) {
    switch (event.type) {
      case TableEventType.INSERT_ROW:
        this.animator.run(new InsertRowAnimation(this, event))
        break
      case TableEventType.REMOVE_ROW:
        this.animator.run(new RemoveRowAnimation(this, event))
        break
      case TableEventType.CELL_CHANGED:
        this.onFieldViewBlur(new TablePos(event.col, event.row))
        break
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
        cell = <th />
        if (column) {
          headRow.appendChild(cell)
        } else {
          const row = <tr />
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
      fillerForMissingScrollbar = <th />
      if (column) {
        headRow.appendChild(fillerForMissingScrollbar)
      } else {
        const row = <tr />
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
      this.bodyRow.appendChild(<td />)
    }

    // cells

    //    (this.bodyRow.children[this.bodyRow.children.length] as HTMLElement).style.width="100%"
    while (this.bodyBody.children.length - 1 > this.model.rowCount)
      this.bodyBody.removeChild(this.bodyBody.children[this.bodyBody.children.length - 1])

    for (let row = 0; row < this.model.rowCount; ++row) {

      // FIXME: call createDOMBodyRow here

      let bodyRow: HTMLTableRowElement
      if (row + 1 >= this.bodyBody.children.length) {
        bodyRow = <tr />
        this.bodyBody.appendChild(bodyRow)
      } else {
        bodyRow = this.bodyBody.children[row + 1] as HTMLTableRowElement
      }

      while (bodyRow.children.length > this.model.colCount)
        bodyRow.removeChild(bodyRow.children[bodyRow.children.length - 1])

      for (let col = 0; col < this.model.colCount; ++col) {
        let cell: HTMLTableDataCellElement
        if (col >= bodyRow.children.length) {
          cell = <td />
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

  createDOMRowHeaderRow(row: number) {
    if (!this.model || !this.adapter)
      throw Error()
    const cell = this.adapter.getRowHead(row)
    // TODO: we really should return undefined to avoid creating unused tags
    if (cell === undefined)
      return <tr />
    return <tr><th>{cell}</th></tr>
  }

  createDOMBodyRow(row: number) {
    if (!this.model || !this.adapter)
      throw Error()

    const result = <tr />
    for (let col = 0; col < this.model.colCount; ++col) {
      let cell: HTMLTableDataCellElement
      if (col >= result.children.length) {
        cell = <td />
        result.appendChild(cell)
      } else {
        cell = result.children[col] as HTMLTableDataCellElement
      }
      cell.style.width = ""
      const content = this.adapter.displayCell(col, row)
      if (content) {
        cell.appendChild(content)
      }
    }

    if (this.style.width === "100%") {
      let lastCell = result.children[result.children.length - 1] as HTMLTableDataCellElement
      lastCell.style.width = "100%"
    }

    return result
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
        this.tabIndex = 0
        break
      }
      case TableEditMode.SELECT_ROW: {
        let allSelected = this.bodyBody.querySelectorAll("tbody > tr.selected")
        for (let selected of allSelected)
          selected.classList.remove("selected")
        this.toggleRowSelection(this.selectionModel.value.row, true)
        this.tabIndex = 0
        break
      }
    }
  }

  adjustLayout(pos: TablePos | undefined) {
    this.unadjustLayoutBeforeRender(pos)
    setTimeout(() => {
      this.adjustLayoutAfterRender()
    }, 0)
  }

// unadjust causes the screen to flicker, the easiest approach would be to double buffer
//   function getScreenshotOfElement(element, posX, posY, width, height, callback) {
//     html2canvas(element, {
//         onrendered: function (canvas) {
//             var context = canvas.getContext('2d');
//             var imageData = context.getImageData(posX, posY, width, height).data;
//             var outputCanvas = document.createElement('canvas');
//             var outputContext = outputCanvas.getContext('2d');
//             outputCanvas.width = width;
//             outputCanvas.height = height;

//             var idata = outputContext.createImageData(width, height);
//             idata.data.set(imageData);
//             outputContext.putImageData(idata, 0, 0);
//             callback(outputCanvas.toDataURL().replace("data:image/png;base64,", ""));
//         },
//         width: width,
//         height: height,
//         useCORS: true,
//         taintTest: false,
//         allowTaint: false
//     });
// }

  protected unadjustLayoutBeforeRender(pos: TablePos | undefined) {
    if (pos === undefined) {
      for(let column = 0; column<this.model!.colCount; ++column) {
        this.unadjustLayoutColumnBeforeRender(column)
      }
    } else {
      this.unadjustLayoutColumnBeforeRender(pos.col)
    }
    // FIXME: row height
  }

  protected unadjustLayoutColumnBeforeRender(column: number) {
    const head = this.colHeadRow.children[column] as HTMLElement
    const body = this.bodyRow.children[column] as HTMLElement
    head.style.width = head.style.minWidth = head.style.maxWidth =
      body.style.width = body.style.minWidth = body.style.maxWidth = ""

    // FIXME: row height
  }


  protected adjustLayoutAfterRender() {
    if (!this.model)
      throw Error("TableView.adjustLayoutAfterRender(): no model")

    this.log(Log.LAYOUT, `TableView.adjustLayoutAfterRender()`)

    const colHeadRow = this.colHeadRow.children
    const rowHeadHead = this.rowHeadHead.children
    const bodyRow = this.bodyRow.children

    // set column widths
    for (let col = 0; col < this.model.colCount; ++col) {
      const columnHeader = colHeadRow[col] as HTMLElement
      const columnBody = bodyRow[col] as HTMLElement

      if (columnHeader.style.width === "") {
        const headWidth = columnHeader.getBoundingClientRect().width - dom.horizontalPadding(columnHeader)
        const bodyWidth = columnBody.getBoundingClientRect().width - dom.horizontalPadding(columnBody)
        const width = Math.max(headWidth, bodyWidth)
        columnHeader.style.width = columnHeader.style.minWidth = columnHeader.style.maxWidth = `${width}px`
        columnBody.style.width = columnBody.style.minWidth = columnBody.style.maxWidth = `${width}px`
      }
    }

    if (this.model.rowCount != this.bodyBody.children.length - 1) {
      this.log(Log.LAYOUT, `adjustLayoutAfterRender(): bodyBody has ${this.bodyBody.children.length - 1} rows while model has ${this.model.rowCount} rows`)
    }

    // set row heights
    for (let row = 0; row < this.bodyBody.children.length - 1; ++row) {
      const rowHeader = rowHeadHead[row] as HTMLElement
      const rowBody = this.bodyBody.children[row + 1] as HTMLElement

      const headHeight = rowHeader.clientHeight - dom.verticalPadding(rowHeader)
      const bodyHeight = rowBody.clientHeight - dom.verticalPadding(rowBody)

      rowHeader.style.height = rowHeader.style.minHeight = rowHeader.style.maxHeight =
        rowBody.style.height = rowBody.style.minHeight = rowBody.style.maxHeight =
        ((headHeight > bodyHeight ? headHeight : bodyHeight)) + "px"
    }

    function b2s(r: DOMRect): string {
      return `${r.x}, ${r.y}, ${r.width}, ${r.height}`
    }

    // basic layout

    const columnHeadBounds = this.colHeadDiv.getBoundingClientRect()
    const rowHeadBounds = this.rowHeadDiv.getBoundingClientRect()
    let scrollBounds = this.scrollDiv.getBoundingClientRect()
    let cellsBounds = this.bodyTable.getBoundingClientRect()

    const computedStyle = window.getComputedStyle(this)
    const computedWidth = computedStyle.width
    const computedHeight = computedStyle.height

    // console.log(`column = ${b2s(columnHeadBounds)}`)
    // console.log(`row    = ${b2s(rowHeadBounds)}`)
    // console.log(`scroll  = ${b2s(scrollBounds)}`)
    // console.log(`hosts computed size = ${computedWidth}, ${computedHeight}`)

    //
    // set TableView width and height
    //
    this.style.overflowX = ""
    this.style.overflowY = ""

    let enoughHorizontalSpace = false
    let enoughVerticalSpace = false

    // note: we can check if a style is set for TableView either directly or via a class by comparing
    // computed(Height|Width) to "0px" as a result of having the shadowDom
    if (computedWidth === "0px") {
      this.log(Log.LAYOUT, `  TableView has no width specified`)
      const parent = this.parentElement
      if (parent) {
        const requiredWidth = rowHeadBounds.width + cellsBounds.width
        if (requiredWidth < parent.clientWidth) {
          this.log(Log.LAYOUT, `    parent is wide enough for content, set TableView width to ${requiredWidth}px`)
          this.style.width = requiredWidth + "px"
          this.scrollDiv.style.overflowX = "hidden"
          enoughHorizontalSpace = true
        } else {
          this.log(Log.LAYOUT, `    parent isn't wide enough for content, set TableView width to parent's width of ${parent.clientWidth - 2}px`)
          // elements like <div> default to have the maximum width, use it
          this.style.width = (parent.clientWidth - 2) + "px"
        }
      }
    }
    if (computedHeight === "0px") {
      this.log(Log.LAYOUT, `  TableView has no height specified`)
      const parent = this.parentElement
      if (parent) {
        let requiredHeight = columnHeadBounds.height + cellsBounds.height
        // include the horizontal scrollbar in the calculation FIXME: also include the vertical one for the width
        if (!enoughHorizontalSpace)
          requiredHeight += 15 // FIXME: this is the scrollbar height on Safari as of time of writing

        const maxHeight = window.innerHeight // FIXME: use maxSize: 100vh and then let it begin overridden?

        if (requiredHeight < maxHeight) {
          this.log(Log.LAYOUT, `    parent IS high enough for content, set TableView height to ${requiredHeight}px`)
          this.style.height = requiredHeight + "px"
          this.scrollDiv.style.overflowY = "hidden"
          enoughVerticalSpace = true
        } else {
          // elements like <div> adjust to their children
          // set height to required height but no higher than body as table has it's own scroll feature
          this.log(Log.LAYOUT, `    parent is NOT high enough for content, default TableView height to ${maxHeight}px`)
          this.style.height = maxHeight + "px"
        }
      }
    }

    let outerBounds = this.getBoundingClientRect()
    const hostBounds = {
      x: this.clientLeft + outerBounds.x,
      y: this.clientTop + outerBounds.y,
      width: this.clientWidth,
      height: this.clientHeight
    } as DOMRect

    //
    // adjust the bodyDiv to setup the scrollbars
    //
    this.log(Log.LAYOUT, `  adjust the bodyDiv to setup the scrollbars`)
    if (enoughHorizontalSpace) {
      this.log(Log.LAYOUT, `    table IS wide enough for content, do not set scrollDiv's width`)
      this.scrollDiv.style.width = ""
    } else {
      this.log(Log.LAYOUT, `    table is NOT wide enough for content, set scroll width to ${hostBounds.width - rowHeadBounds.width}px`)
      this.scrollDiv.style.width = (hostBounds.width - rowHeadBounds.width) + "px"
    }
    if (enoughVerticalSpace) {
      this.log(Log.LAYOUT, `    table IS heigh enough for content, do not set scrollDiv's height`)
      this.scrollDiv.style.height = ""
    } else {
      this.log(Log.LAYOUT, `    table is NOT high enough for content, set scroll height to ${hostBounds.height - columnHeadBounds.height}px`)
      this.scrollDiv.style.height = (hostBounds.height - columnHeadBounds.height) + "px"
    }

    //
    // figure out how much space the scrollbars take
    //
    this.log(Log.LAYOUT, `  figure out how much space the scrollbars take`)
    scrollBounds = this.scrollDiv.getBoundingClientRect()
    let verticalScrollbarWidth = enoughVerticalSpace ? 0 : scrollBounds.width - this.scrollDiv.clientWidth
    let horizontalScrollbarHeight = enoughHorizontalSpace ? 0 : scrollBounds.height - this.scrollDiv.clientHeight
    this.log(Log.LAYOUT, `    width ${verticalScrollbarWidth}, height ${horizontalScrollbarHeight}`)

    // console.log(`host   = ${b2s(hostBounds)}`)
    // console.log(`column = ${b2s(columnHeadBounds)}`)
    // console.log(`row    = ${b2s(rowHeadBounds)}`)
    // console.log(`scroll = ${b2s(scrollBounds)}`)
    // console.log(`verticalScrollbarWidth=${verticalScrollbarWidth}, ${horizontalScrollbarHeight}`)
    // console.log(`style          left=${this.style.left} right=${this.style.right} width=${this.style.width}`)
    // console.log(`               top=${this.style.top} bottom=${this.style.bottom} height=${this.style.height}`)
    // console.log(`computed style left=${computedStyle.left} right=${computedStyle.right} width=${computedStyle.width}`)
    // console.log(`               top=${computedStyle.top} bottom=${computedStyle.bottom} height=${computedStyle.height}`)

    this.scrollDiv.style.top = columnHeadBounds.height + "px"
    this.scrollDiv.style.left = rowHeadBounds.width + "px"

    this.colHeadDiv.style.top = "0"
    this.colHeadDiv.style.left = (rowHeadBounds.width - 1) + "px"
    this.log(Log.LAYOUT, `  set colHeadDiv = ${hostBounds.width} (host width) - ${rowHeadBounds.width} (rowHeadDiv width) - ${verticalScrollbarWidth} (vertical scrollbar width) = ${hostBounds.width - rowHeadBounds.width - verticalScrollbarWidth + 1}`)
    this.colHeadDiv.style.width = (hostBounds.width - rowHeadBounds.width - verticalScrollbarWidth + 1) + "px"
    // console.log(`set colHead width = ${hostBounds.width} - ${rowHeadBounds.width} - ${verticalScrollbarWidth} = ${hostBounds.width - rowHeadBounds.width - verticalScrollbarWidth} `)

    this.rowHeadDiv.style.top = columnHeadBounds.height + "px"
    this.rowHeadDiv.style.left = "0"
    this.rowHeadDiv.style.height = (hostBounds.height - columnHeadBounds.height - horizontalScrollbarHeight) + "px"
  }

  protected prepareInputOverlayForCell(cell: HTMLTableDataCellElement | undefined) {
    if (cell === undefined || cell.tagName !== "TD")
      return
    this.prepareInputOverlayForPosition(this.getCellPosition(cell))
  }

  prepareInputOverlayForPosition(pos: TablePos) {
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
    const { x, y } = { x: this.scrollDiv.scrollLeft, y: this.scrollDiv.scrollTop }
    if (this.editView) {
      this.editView.focus({ preventScroll: true })
    } else {
      super.focus({ preventScroll: true })
    }
    this.scrollDiv.scrollLeft = x
    this.scrollDiv.scrollTop = y
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

    const tmp = <div />
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



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

import * as dom from "../dom"
import { Model, TextModel, HtmlModel } from "../model"
import { View, GenericView } from "../view"
import { TextView } from "./text"

function dump(element: HTMLElement, depth?: number): void {
  if (depth===undefined)
    depth = 0
  let out=""
  for(let i=0; i<depth; ++i)
    out += "  "
  out += element.tagName
  if (element.tagName==="TD" || element.tagName==="TH")
    out+="  '" + element.innerText + "'"
  console.log(out)
  for(let child of element.children)
    dump(child as HTMLElement, depth+1)
}

declare global {
  interface Element {
    scrollIntoViewIfNeeded(center?: boolean): void
  }
}

let tableStyle = document.createElement("style")
tableStyle.textContent=`
.t2 {
  /* border: 1px inset; */
  border: 1px #ccc solid;
  border-radius: 3px;
  outline-offset: -2px;
  font-family: var(--toad-font-family, sans-serif);
  font-size: var(--toad-font-size, 12px);
}

.t2h, .t2d {
  border-color: #ccc #fff #fff #ccc;
  border-width: 2px 0px 0px 2px;
  border-style: solid none none solid;
  border-collapse: collapse;
  border-spacing: 0;
}

/* FIXME: there is no re-evaluation after the table view was resized */
/*
th:last-child, td:last-child {
  width: 100%;
}
*/

.t2h tr {
  background: #e0e0e0;
}

.t2h * th {
  border-color: #fff #ccc #ccc #fff;
  border-style: none solid none none;
  border-width: 0 1px 0 0;
  z-index: 1;
  letter-spacing: 0;  
  overflow: hidden;   
  padding: 2px;
  margin: 0px; 
  white-space: nowrap;
}
 
.t2d * td {
  border-color: #fff #ccc #ccc #fff;
  border-style: none solid solid none;
  border-width: 0 1px 1px 0;
  letter-spacing: 0;
  overflow: hidden; 
  padding: 2px;
  margin: 0px; 
  white-space: nowrap;
  /* background: #fff; */
}

.t2d tr:nth-child(even) {
  background: var(--toad-table-even-row, #f5f5f5);
}
.t2d tr:nth-child(odd) {
  background: var(--toad-table-odd-row, #ffffff);
}

div .t2d tr.selected,
div .t2d tr td.selected {
/*
  background: #dcdcdc;
  color: #000;
*/
  background: #808080;
  color: #fff;
}

.t2:focus .t2d tr.selected,
.t2:focus .t2d tr td.selected {
  background: #0069d4;
  color: #fff;
}

`

function pixelToNumber(pixel: string): number {
  if (pixel.substr(pixel.length-2) !== "px")
    throw Error("expected 'px' suffix")
  return Number.parseFloat(pixel.substr(0, pixel.length-2))
}
  
function getPropertyValue(element: HTMLElement, propertyName: string): number {
  let elementStyle = window.getComputedStyle(element, undefined)
  let property = elementStyle.getPropertyValue(propertyName)
  return pixelToNumber(property)
}
  
function horizontalPadding(element: HTMLElement): number {
  return getPropertyValue(element, "padding-left") + getPropertyValue(element, "padding-right")
}

export enum TableEditMode {
  EDIT_CELL, // FIXME: replace with SELECT_CELL and TableModel.getFieldView will return undefined when not editable
  SELECT_CELL,
//  SELECT_COLUMN,
  SELECT_ROW
}

export class TablePos {
  col: number
  row: number
  constructor(col: number, row: number) {
    this.col = col
    this.row = row
  }
}

// FIXME: also needed is a model for range and 'random' selections
export class SelectionModel extends Model {
  mode: TableEditMode // FIXME: there might be a way to do without, just by the behaviour of a common API towards TableView
  _value: TablePos
  
  constructor() {
    super()
    this.mode = TableEditMode.SELECT_ROW
    this._value = new TablePos(0,0)
  }
  
  set col(col: number) {
    if (this._value.col === col)
      return
    this._value.col = col
    this.modified.trigger()
  }

  get col(): number {
    return this._value.col
  }

  set row(row: number) {
    if (this._value.row === row)
      return
    this._value.row = row
    this.modified.trigger()
  }

  get row(): number {
    return this._value.row
  }

  set value(value: TablePos) {
    if (this._value.col === value.col && this._value.row === value.row)
      return
    this._value = value
    this.modified.trigger()
  }
  
  get value(): TablePos {
    return this._value
  }
}

// FIXME: API for insert, delete and move row(s)
export abstract class TableModel extends Model {
  cols: number
  rows: number
  
  constructor() {
    super()
    this.cols = 0
    this.rows = 0
  }

//  set value(data: any) {}
//  get value(): any { return undefined }

  getColumnHead(column: number): TextModel | undefined { return undefined }
  abstract getFieldModel(col: number, row: number): TextModel
  getFieldView(col: number, row: number): View | undefined { return undefined }
}

let tableModelLocators = new Array<(data: any) => TableModel|undefined>()

export function registerTableModelLocator( locator: (data: any) => TableModel|undefined ): void {
  tableModelLocators.push(locator)
}

export function createTableModel(data: any): TableModel {
  for(let locator of tableModelLocators) {
    let model = locator(data)
    if (model)
      return model
  }
  throw new Error("findTableModel() failed to locate a table model")
}

class ArrayTableModel extends TableModel {

  data: any

  constructor(data: any) {
    super()
    this.data = data
    this.rows = this.data.length
    this.cols = this.data[0].length
  }

  getColumnHead(column: number): TextModel {
    switch(column) {
      case 0: return new TextModel("Title")
      case 1: return new TextModel("Author")
      case 2: return new TextModel("Year")
    }
    throw Error("fuck")
  }
  
  getFieldModel(col: number, row: number): TextModel {
    let model = new TextModel(this.data[row][col])
    model.modified.add( () => {
      this.data[row][col] = model.value
    })
    return model
  }

  getFieldView(col: number, row: number): View {
    return new TextView()
  }
}

registerTableModelLocator( function(data: any): TableModel | undefined {
  if (!(data instanceof Array)) {
    return undefined
  }
  if (data.length===0) {
    return undefined
  }
  if (!(data[0] instanceof Array)) {
    return undefined
  }
  for(let field of data[0]) {
    if ( typeof field !== "string" &&
         typeof field !== "number" )
    {
      return undefined
    }
  }
  return new ArrayTableModel(data)
})

export class TableView extends GenericView<TableModel> {

  selectionModel?: SelectionModel

  rootElement: HTMLElement
  headTable: HTMLTableElement
  headRow: HTMLTableRowElement
  bodyRow: HTMLTableRowElement
  bodyDiv: HTMLDivElement
  bodyBody: HTMLTableSectionElement

  input: HTMLElement
  fieldView?: HTMLElement
  fieldModel?: Model
  cellBeingEdited?: HTMLElement
  insideGoTo: boolean

  constructor() {
    super()
    
    this.insideGoTo = false
    
    let rootElement = dom.tag("div")
    rootElement.className = "t2"
    
    rootElement.onkeydown = (event: KeyboardEvent) => {
      if (!this.selectionModel)
        return
      // FIXME: based on the selection model we could plug in a behaviour class
      switch(this.selectionModel.mode) {
        case TableEditMode.SELECT_ROW: {
          let row = this.selectionModel.value.row
          switch(event.key) {
            case "ArrowDown":
              if (row+1<this.model!.rows)
                ++row
              break
            case "ArrowUp":
              if (row>0)
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
          switch(event.key) {
            case "ArrowRight":
              if (pos.col+1<this.model!.cols) {
                ++pos.col
              }
              break
            case "ArrowLeft":
              if (pos.col>0) {
                --pos.col
              }
              break
            case "ArrowDown":
              if (pos.row+1<this.model!.rows)
                ++pos.row
              break
            case "ArrowUp":
              if (pos.row>0)
                --pos.row
              break
          }
          if (pos.col != this.selectionModel.col ||
              pos.row != this.selectionModel.row)
          {
            this.toggleCellSelection(this.selectionModel.value, false)
            this.selectionModel.value = pos
            this.toggleCellSelection(this.selectionModel.value, true)
          }
        } break
      }
    }
    this.rootElement = rootElement

    // head
    let headDiv = dom.tag("div")
    // headDiv.style.width = "1px"
    headDiv.style.overflow = "hidden"
    
    let headTable = dom.tag("table") as HTMLTableElement
    this.headTable = headTable
    headTable.className = "t2h"
    
    let headHead = dom.tag("thead")
    
    let headRow = dom.tag("tr") as HTMLTableRowElement
    this.headRow = headRow
    
    headHead.appendChild(headRow)
    headTable.appendChild(headHead)
    headDiv.appendChild(headTable)
    rootElement.appendChild(headDiv)

    // body
    let bodyDiv = dom.tag("div") as HTMLDivElement
    // headDiv.style.width = "1px"
    bodyDiv.style.overflow = "auto"
    bodyDiv.onscroll = function() {
      headDiv.scrollLeft = bodyDiv.scrollLeft
    }
    this.bodyDiv = bodyDiv
    
    let bodyTable = dom.tag("table")
    bodyTable.className = "t2d"
    bodyTable.onmousedown = (event: MouseEvent) => {
      if (!event.srcElement)
        return
      if ((event.srcElement as HTMLElement).tagName !== "TD")
        return
      event.preventDefault() // otherwise field will loose focus again
      this.goToField(event.srcElement as HTMLTableDataCellElement)
    }
    
    let bodyBody = dom.tag("tbody") as HTMLTableSectionElement
    this.bodyBody = bodyBody
    
    let bodyRow = dom.tag("tr") as HTMLTableRowElement
    bodyBody.appendChild(bodyRow)
    this.bodyRow = bodyRow
    
    bodyTable.appendChild(bodyBody)
    bodyDiv.appendChild(bodyTable)

    let zeroSize = dom.tag("div")
    zeroSize.style.width = "0px"
    zeroSize.style.height = "0px"
    zeroSize.style.margin = "0"
    zeroSize.style.padding = "0"
    zeroSize.style.border = "none"
    
    this.input = dom.tag("div") as HTMLElement
    this.input.style.position = "relative"
    this.input.style.background = "#fff"
    this.input.style.border="none"
    this.input.style.opacity = "0"
    
    this.input.addEventListener("focusin", (genericEvent: Event) => {
      this.input.style.opacity = "1"
      if (this.insideGoTo)
        return
      if (!this.model)
        return
      let event = genericEvent as FocusEvent
      if (event.target && event.relatedTarget) {
        if (dom.order(event.relatedTarget as Node, this)) {
          this.goTo(0, 0)
        } else {
          this.goTo(this.model.cols-1, this.model.rows-1)
        }
      }
    })
    this.input.addEventListener("focusout", () => {
      this.input.style.opacity = "0"
    })
    
    zeroSize.appendChild(this.input)
    bodyDiv.appendChild(zeroSize)

    rootElement.appendChild(bodyDiv)

    this.attachShadow({mode: 'open'})
    this.shadowRoot!.appendChild(document.importNode(tableStyle, true))
    this.shadowRoot!.appendChild(rootElement)
  }
  
  connectedCallback() {
    super.connectedCallback()
    this.bodyDiv.style.height = this.style.height // FIXME: include heading
  }
  
  setModel(model?: Model): void {
    if (!model) {
      if (this.selectionModel)
        this.selectionModel.modified.remove(this)
      this.model = undefined
      this.selectionModel = new SelectionModel()
      this.updateView()
      return
    }

    if (model instanceof SelectionModel) {
      this.selectionModel = model
      this.updateSelection()
      this.selectionModel.modified.add(() => {
        this.updateSelection()
      }, this)
    } else
    if (model instanceof TableModel) {
      this.model = model
      this.updateView()
    } else {
      throw Error("unexpected model of type "+model.constructor.name)
    }
  }
  
  updateModel() {
//console.log("TableView.updateModel()")
//    if (this.model)
//      this.model.value = this.input.value
  }

  updateView() {
//console.log("TableView.updateView()")
    if (!this.model) {
      return
    }

//console.log("updateHeader, updateBody")
    this.updateHeader()
    this.updateBody()
    this.updateSelection()
    setTimeout( () => {
      this.adjustInternalTables()
    })
  }

  updateHeader() {
    if (!this.model)
      throw Error("fuck")

    let noHeader = false

    while(this.headRow.children.length>this.model.cols+1)
      this.headRow.removeChild(this.headRow.children[this.headRow.children.length-1])

    for(let i=0; i<this.model.cols; ++i) {
      let cell
      if (i>=this.headRow.children.length) {
        cell = dom.tag("th")
        this.headRow.appendChild(cell)
      } else {
        cell = this.headRow.children[i] as HTMLTableDataCellElement
        cell.style.minWidth = ""
        cell.style.border = ""
      }
      let text = this.model.getColumnHead(i)
      if (text === undefined) {
        noHeader = true
        continue
      }
      if (text instanceof HtmlModel)
        cell.innerHTML = text.value
      else
        cell.innerText = text.value
    }
    
    let fillerForMissingScrollbar
    if (this.headRow.children.length<this.model.cols+1) {
      fillerForMissingScrollbar = dom.tag("th") as HTMLTableDataCellElement
      this.headRow.appendChild(fillerForMissingScrollbar)
    } else {
      fillerForMissingScrollbar = this.headRow.children[this.headRow.children.length-1] as HTMLTableDataCellElement
    }
    fillerForMissingScrollbar.innerText = ""
    fillerForMissingScrollbar.style.minWidth = "777px"
    fillerForMissingScrollbar.style.border = "0px none"
    
    this.headTable.style.display = noHeader ? "none" : ""
  }
  
  updateBody() {
    if (!this.model)
      throw Error("fuck")
      
    while(this.bodyRow.children.length > this.model.cols)
      this.bodyRow.removeChild(this.bodyRow.children[this.bodyRow.children.length-1])

    while(this.bodyRow.children.length < this.model.cols) {
      let cell = dom.tag("td")
      cell.style.paddingTop = "0"
      cell.style.paddingBottom = "0"
      this.bodyRow.appendChild(cell)
    }
//    (this.bodyRow.children[this.bodyRow.children.length] as HTMLElement).style.width="100%"

    while(this.bodyBody.children.length-1 > this.model.rows)
      this.bodyBody.removeChild(this.bodyBody.children[this.bodyBody.children.length-1])

    for(let row=0; row<this.model.rows; ++row) {
      let bodyRow: HTMLTableRowElement
      if (row+1 >= this.bodyBody.children.length) {
        bodyRow = dom.tag("tr") as HTMLTableRowElement
        this.bodyBody.appendChild(bodyRow)
      } else {
        bodyRow = this.bodyBody.children[row+1] as HTMLTableRowElement
      }

      while(bodyRow.children.length>this.model.cols)
        bodyRow.removeChild(bodyRow.children[bodyRow.children.length-1])

      for(let col=0; col<this.model.cols; ++col) {
        let cell: HTMLTableDataCellElement
        if (col >= bodyRow.children.length) {
          cell = dom.tag("td") as HTMLTableDataCellElement
          bodyRow.appendChild(cell)
        } else {
          cell = bodyRow.children[col] as HTMLTableDataCellElement
        }
        cell.style.width = ""
        let fieldModel = this.model.getFieldModel(col, row)
//console.log("  updateBody. cell "+col+", "+row+" = '"+fieldModel.value+"'")
        if (cell.innerText!=fieldModel.value) {
//          if (cell.innerText != "")
//            throw Error("TableView.updateBody(): cell "+col+", "+row+" differs during update, old='" + cell.innerText + "', new='" + fieldModel.value + "'")
          if (fieldModel instanceof HtmlModel)
            cell.innerHTML = fieldModel.value
          else
            cell.innerText = fieldModel.value
        }
      }
      
      if (this.style.width==="100%") {
        let lastCell = bodyRow.children[ bodyRow.children.length-1] as HTMLTableDataCellElement
        lastCell.style.width = "100%"
      }
      
    }
//    dump(this.bodyBody)
  }
  
  updateSelection() {
    if (this.selectionModel === undefined)
      return

    switch(this.selectionModel.mode) {
      case TableEditMode.EDIT_CELL:
        this.prepareFieldAtPosition(this.selectionModel.col, this.selectionModel.row)
        delete this.rootElement.tabIndex
        break
      case TableEditMode.SELECT_CELL: {
        let allSelected = this.bodyBody.querySelectorAll("tbody > tr > td.selected")
        for(let selected of allSelected)
          selected.classList.remove("selected")
        this.toggleCellSelection(this.selectionModel.value, true)
        this.rootElement.tabIndex = 0
        break
      }
      case TableEditMode.SELECT_ROW: {
        let allSelected = this.bodyBody.querySelectorAll("tbody > tr.selected")
        for(let selected of allSelected)
          selected.classList.remove("selected")
        this.toggleRowSelection(this.selectionModel.value.row, true)
        this.rootElement.tabIndex = 0
        break
      }
    }
  }
  
  adjustInternalTables() {
    let headRow = this.headRow.children
    let bodyRow = this.bodyRow.children
    for(let col=0; col<this.model!.cols; ++col) {
      let head = headRow[col] as HTMLElement
      let body = bodyRow[col] as HTMLElement
      
      let headWidth = head.clientWidth - horizontalPadding(head)
      let bodyWidth = body.clientWidth - horizontalPadding(body)

      head.style.width = head.style.minWidth = head.style.maxWidth =
      body.style.width = body.style.minWidth = body.style.maxWidth =
        ((headWidth > bodyWidth ? headWidth : bodyWidth)) + "px"
    }
    
    if (this.style.width!=="100%")
      this.rootElement.style.width  = (this.bodyRow.clientWidth + this.bodyDiv.offsetWidth - this.bodyDiv.clientWidth + 2) + "px"
//    this.rootElement.style.height = (this.bodyRow.clientHeight + this.bodyDiv.offsetHeight - this.bodyDiv.clientHeight + 2) + "px"

  }
  
  unadjustInternalTables(pos: any) {
    let headRow = this.headRow.children
    let bodyRow = this.bodyRow.children
    let head = headRow[pos.col] as HTMLElement
    let body = bodyRow[pos.col] as HTMLElement
    head.style.width = head.style.minWidth = head.style.maxWidth =
    body.style.width = body.style.minWidth = body.style.maxWidth = ""
  }

  toggleCellSelection(pos: TablePos, flag: boolean): void {
    if (pos.col >= this.model!.cols || pos.row >= this.model!.rows)
      return
    let element = this.bodyBody.children[pos.row+1].children[pos.col]
    element.classList.toggle("selected", flag)
    if (flag) {
      // FIXME: only when we also have the focus
      if (element.scrollIntoViewIfNeeded)
        element.scrollIntoViewIfNeeded()
      else
        element.scrollIntoView()
    }
  }

  toggleRowSelection(row: number, flag: boolean): void {
    if (row >= this.model!.rows)
      return
    let rowElement = this.bodyBody.children[1+this.selectionModel!.value.row]
    rowElement.classList.toggle("selected", flag)
    if (flag) {
      // FIXME: only when we also have the focus
      if (rowElement.scrollIntoViewIfNeeded)
        rowElement.scrollIntoViewIfNeeded()
      else
        rowElement.scrollIntoView()
    }
  }

  adjustInputToElement(element: HTMLTableDataCellElement) {
    let boundary = element.getBoundingClientRect()
    let td = element
    let tr = td.parentElement
    let tbody = tr!.parentElement
    
    if(navigator.userAgent.indexOf("Chrome") > -1) {
      // Chrome
      this.input.style.left = (td.offsetLeft+2)+"px"
      this.input.style.top  = (td.offsetTop-tbody!.clientHeight)+"px"
    } else {
      // Safari & Opera
      this.input.style.left = (td.offsetLeft+1)+"px"
      this.input.style.top  = (td.offsetTop-tbody!.clientHeight-1)+"px"
    }

    let width = (element.clientWidth - horizontalPadding(element)) + "px"
    
    this.input.style.width = width
    this.input.style.height = (boundary.height)+"px"

    // FIXME: add two new functions: lockElement(), unlockElement() and invoke the accordingly
    // element.style.width = element.style.minWidth = element.style.maxWidth = width
  }

  goTo(column: number, row: number) {
    this.insideGoTo = true
    this.prepareFieldAtPosition(column, row)
    this.focus()
    this.insideGoTo = false
  }
  
  goToField(element: HTMLTableDataCellElement | undefined) { // FIXME: names are inconsistent
    this.insideGoTo = true
    if (!element)
      return
    this.prepareFieldAtElement(element)
    this.focus()
    this.insideGoTo = false
  }
  
  focus() {
    if (this.fieldView) {
      this.fieldView.focus()
    } else {
      this.rootElement.focus()
    }
  }
  
  prepareFieldAtPosition(column: number, row: number) {
    this.prepareFieldAtElement(this.getElementAt(column, row))
  }
  
  getElementAt(column: number, row: number): HTMLTableDataCellElement {
    let element = this.bodyBody.children[row+1].children[column] as HTMLTableDataCellElement
    if (!element)
      throw Error("fuck")
    return element
  }
  
  prepareFieldAtElement(element: HTMLTableDataCellElement | undefined) {
    if (element===undefined || element.tagName!=="TD")
      return
    
    let pos = this.positionOfField(element)
    
    if (this.selectionModel) {
      switch(this.selectionModel.mode) {
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

    let fieldView  = this.model!.getFieldView(pos.col, pos.row)
    if (!fieldView)
      return
    this.fieldView = fieldView
    fieldView.classList.add("embedded")

    let fieldModel = this.model!.getFieldModel(pos.col, pos.row)
    fieldView.setModel(fieldModel)

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
      if (element.innerText == fieldModel.value)
        return
      element.innerText = fieldModel.value
      this.unadjustInternalTables(pos)
      setTimeout( () => {
        this.adjustInternalTables()
      }, 0)
    }

    fieldView.onkeydown = (event: KeyboardEvent) => {
      switch(event.key) {
        case "ArrowDown":
          if (pos.row+1 >= this.model!.rows)
            break
          event.preventDefault()
          this.goTo(pos.col, pos.row+1)
          break
        case "ArrowUp":
          if (pos.row === 0)
            break
          event.preventDefault()
          this.goTo(pos.col, pos.row-1)
          break
        case "Tab":
          if (event.shiftKey) {
            if (pos.col>0) {
              event.preventDefault()
              this.goTo(pos.col-1, pos.row)
            } else {
              if (pos.row>0) {
                event.preventDefault()
                this.goTo(this.model!.cols-1, pos.row-1)
              }
            }
          } else {
            if (pos.col+1<this.model!.cols) {
              event.preventDefault()
              this.goTo(pos.col+1, pos.row)
            } else {
              if (pos.row+1<this.model!.rows) {
                event.preventDefault()
                this.goTo(0, pos.row+1)
              }
            }
          }
          break
      }
      
    }
    
    if (this.input.children.length===0) {
      this.input.appendChild(fieldView)
    } else {
      if (document.hasFocus() && document.activeElement === this) {
        this.input.children[0].dispatchEvent(new FocusEvent("blur"))
      }
      this.input.replaceChild(fieldView, this.input.children[0])
    }

    this.adjustInputToElement(element)
  }
  
  positionOfField(element: HTMLElement): TablePos {
    let col:number, row:number
    for(col=0; col<this.model!.cols; ++col) {
      if (element.parentElement!.children[col]===element)
        break
    }
    for(row=1; row<this.model!.rows+1; ++row) {
      if (element.parentElement!.parentElement!.children[row]===element.parentElement)
        break
    }
    --row
    return new TablePos(col, row)
  }
}
window.customElements.define("toad-table", TableView)

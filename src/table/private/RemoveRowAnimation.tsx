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

import * as toadJSX from "../../util/jsx"
import { TableEvent } from "../TableEvent"
import { AnimationBase } from '@toad/util/animation'
import { TableView } from '../TableView'

enum SelectionIs {
  BEFORE_REMOVED_AREA,
  INSIDE_REMOVED_AREA,
  INSIDE_REMOVED_AREA_AND_NO_FURTHER_ROWS,
  BEHIND_REMOVED_AREA
}

export class RemoveRowAnimation extends AnimationBase {
  table: TableView
  event: TableEvent
  rowAnimationHeight = 0;
  hadFocus: boolean = false;
  trAnimationHead!: HTMLTableRowElement
  trAnimationBody!: HTMLTableRowElement

  overlayTop?: number
  selectionIs!: SelectionIs

  constructor(table: TableView, event: TableEvent) {
    super()
    this.table = table
    this.event = event
  }

  override prepare() {
    this.hadFocus = this.table.hasFocus()
    
    let overlayTopDrift = 0

    // adjust selection to rows being removed
    if (this.table.editView && this.table.selectionModel !== undefined) {
      if (this.table.selectionModel.row < this.event.index) {
        // selection is before removed area
        // console.log(`selection (${this.table.selectionModel.col}, ${this.table.selectionModel.row}) is before removed area ${this.event.index} to ${this.event.index + this.event.size - 1}`)
        this.selectionIs = SelectionIs.BEFORE_REMOVED_AREA
      } else
      if (this.table.selectionModel.row <= this.event.index + this.event.size) {
        // selection is inside removed area (what if there's nothing left?)
        // console.log(`selection (${this.table.selectionModel.col}, ${this.table.selectionModel.row}) is inside removed area ${this.event.index} to ${this.event.index + this.event.size - 1}`)
        const rowCount = this.table.bodyBody.children.length - 1
        // console.log(`index=${this.event.index}, size=${this.event.size}, rowCount=${rowCount}`)
        if (this.event.index + this.event.size >= rowCount) { // is the rowCount alreay decreased from the removed rows?
          this.selectionIs = SelectionIs.INSIDE_REMOVED_AREA_AND_NO_FURTHER_ROWS
          for (let i = this.event.index; i <= this.table.selectionModel.row; ++i) {
            const tr = this.table.bodyBody.children[i + 1] as HTMLTableRowElement
            overlayTopDrift -= tr.clientHeight
          }
          // if there are no rows after the removed area, go to the models last row
          if (this.event.index === 0) {
            // there are no rows left
            // console.log(`  there are no rows left, go to 0 for now`)
            this.table.selectionModel.row = 0
          } else {
            // there are no rows left after the removed area, go to the end of the table
            // console.log(`  there are no rows left after the removed area, go to the end of the table`)
            this.table.selectionModel.row = this.event.index - 1
          }
        } else {
          // there are rows after the removed area, go to the 1st of them
          // console.log(`  there are rows after the removed area, go to the 1st of them`)
          // console.log(`    ${this.table.selectionModel.row}, ${this.event.index}`)

          this.selectionIs = SelectionIs.INSIDE_REMOVED_AREA
          for (let i = this.event.index+1; i <= this.table.selectionModel.row; ++i) {
            const tr = this.table.bodyBody.children[i + 1] as HTMLTableRowElement
            overlayTopDrift -= tr.clientHeight
          }

          this.table.selectionModel.row = this.event.index
          this.table.prepareInputOverlayForPosition({col: this.table.selectionModel.value.col, row: this.table.selectionModel.value.row})
        }
        // console.log(`set selection.row to ${this.table.selectionModel.row}`)
      } else {
        // selection is behind removed area
        // console.log(`selection (${this.table.selectionModel.col}, ${this.table.selectionModel.row}) is behind removed area ${this.event.index} to ${this.event.index + this.event.size - 1}`)
        this.table.selectionModel.row -= this.event.size
        // console.log(`set selection.row to ${this.table.selectionModel.row}`)
        this.selectionIs = SelectionIs.BEHIND_REMOVED_AREA
      }
    }

    // if (this.selectionIs === undefined) {
    //   console.log(`!!! NO STRATEGY TO MOVE INPUTOVERLAY !!!`)
    // } else {
    //   console.log(`STRATEGY TO MOVE INPUTOVERLAY IS ${SelectionIs[this.selectionIs]}`)
    // }

    this.rowAnimationHeight = 0
    for (let i = 0; i < this.event.size; ++i) {
      const tr = this.table.bodyBody.children[this.event.index + i + 1] as HTMLTableRowElement
      this.rowAnimationHeight += tr.clientHeight
    }
    // const rowAnimationHeight = trBody.clientHeight
    this.table.rowAnimationHeight = this.rowAnimationHeight

    // delete all but the 1st row
    for (let i = 1; i < this.event.size; ++i) {
      this.table.rowHeadHead.deleteRow(this.event.index + 1)
      this.table.bodyBody.deleteRow(this.event.index + 2)
    }

    // rebuild the 1st row to be used during the animation
    this.trAnimationHead = this.table.rowHeadHead.children[this.event.index] as HTMLTableRowElement
    this.trAnimationBody = this.table.bodyBody.children[this.event.index + 1] as HTMLTableRowElement

    this.trAnimationHead.style.minHeight = this.trAnimationHead.style.maxHeight = ""
    this.trAnimationBody.style.minHeight = this.trAnimationBody.style.maxHeight = ""
    this.trAnimationHead.style.height = `${this.rowAnimationHeight}px`
    this.trAnimationBody.style.height = `${this.rowAnimationHeight}px`
    
    const img=`url(\"data:image/svg+xml;utf8,<svg width='3' height='3' xmlns='http://www.w3.org/2000/svg'><line shape-rendering='crispEdges' x1='-1' y1='-1' x2='5' y2='5' stroke='%23888' /></svg>\")`

    // empty
    while (this.trAnimationHead.childNodes.length > 0)
      this.trAnimationHead.removeChild(this.trAnimationHead.childNodes[0])
    while (this.trAnimationBody.childNodes.length > 0)
      this.trAnimationBody.removeChild(this.trAnimationBody.childNodes[0])

    // insert some dummy <td> & <th> to make the row visible during animation
    this.trAnimationHead.appendChild(<th style={{padding: "0"}}/>)
    this.trAnimationHead.style.background = img
    for(let i=0; i<this.table.adapter!.colCount; ++i) {
      this.trAnimationBody.appendChild(<td style={{padding: "0"}}/>)
      this.trAnimationBody.style.background = img
    }
    const top = this.table.inputOverlay.style.top
    if (top.length > 2)
      this.overlayTop = Number.parseFloat(top.substr(0, top.length-2)) + overlayTopDrift
  }

  override animationFrame(value: number) {
    const inverseValue = 1 - value
    this.trAnimationBody.style.height = this.trAnimationHead.style.height = `${inverseValue * this.rowAnimationHeight}px`
    if (this.overlayTop) {
      switch(this.selectionIs) {
        case SelectionIs.BEFORE_REMOVED_AREA:
          this.table.inputOverlay.style.top = `${this.overlayTop + value * this.rowAnimationHeight}px`
          break
        case SelectionIs.INSIDE_REMOVED_AREA:
          this.table.inputOverlay.style.top = `${this.overlayTop + this.rowAnimationHeight}px`
          break
        case SelectionIs.INSIDE_REMOVED_AREA_AND_NO_FURTHER_ROWS:
          this.table.inputOverlay.style.top = `${this.overlayTop + value * this.rowAnimationHeight}px`
          break;
        case SelectionIs.BEHIND_REMOVED_AREA:
          this.table.inputOverlay.style.top = `${this.overlayTop}px`
          break
      }
    }
  }

  override lastFrame() {
    this.table.rowHeadHead.deleteRow(this.event.index)
    this.table.bodyBody.deleteRow(this.event.index + 1)

    // this.table.selectionModel?.modified.trigger()

    // setTimeout(() => {
    //   if (this.hadFocus)
    //     this.table.focus()

    // }, 0)
  }
}

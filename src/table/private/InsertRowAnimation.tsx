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

import { TableEvent } from "../TableEvent"
import { AnimationBase } from '../../util/animation'
import { TableView } from '../TableView'

// TODO: fix animation at last row (i might've seen a disabled test for this)
export class InsertRowAnimation extends AnimationBase {
  table: TableView
  event: TableEvent
  rowAnimationHeight = 0;
  trHead: Array<HTMLTableRowElement> = [];
  trBody: Array<HTMLTableRowElement> = [];
  trAnimationHead!: HTMLTableRowElement
  trAnimationBody!: HTMLTableRowElement

  constructor(table: TableView, event: TableEvent) {
    super()
    this.table = table
    this.event = event
  }

  override prepare() {
    // create new rows and add them to the hiddenSizeCheckTable for measuring
    for (let i = 0; i < this.event.size; ++i) {
      const trH = this.table.createDOMRowHeaderRow(this.event.index)
      this.table.hiddenSizeCheckRowHead.appendChild(trH)
      this.trHead.push(trH)

      const trB = this.table.createDOMBodyRow(this.event.index + i)
      this.table.hiddenSizeCheckBody.appendChild(trB)
      this.trBody.push(trB)
    }

    // insert temporary rows used for animation
    const img = `url(\"data:image/svg+xml;utf8,<svg width='3' height='3' xmlns='http://www.w3.org/2000/svg'><line shape-rendering='crispEdges' x1='-1' y1='-1' x2='5' y2='5' stroke='%23888' /></svg>\")`

    this.trAnimationHead = <tr style={{ height: '0px', background: img }}><th style={{padding: "0"}}/></tr>
    this.table.rowHeadHead.insertBefore(this.trAnimationHead, this.table.rowHeadHead.children[this.event.index])
    this.trAnimationBody = <tr style={{ height: '0px', background: img }}></tr>
    for(let i=0; i<this.table.adapter!.colCount; ++i) {
      this.trAnimationBody.appendChild(<td style={{padding: "0"}}/>)
      this.trAnimationBody.style.background = img
    }
    this.table.bodyBody.insertBefore(this.trAnimationBody, this.table.bodyBody.children[this.event.index + 1])
  }

  override firstFrame() {
    this.table.rowAnimationHeight = this.rowAnimationHeight = Math.max(
      this.table.hiddenSizeCheckBody.clientHeight,
      this.table.hiddenSizeCheckRowHead.clientHeight
    )
  }

  override animationFrame(animationTime: number) {
    const rowHeight = `${Math.round(animationTime * this.rowAnimationHeight)}px`
    this.trAnimationHead.style.height = this.trAnimationBody.style.height = rowHeight
    // FIXME: the following code needs a test
    if (this.table.selectionModel !== undefined && this.table.selectionModel.row < this.event.index) {
      const cell = this.table.getCellAt(this.table.selectionModel.value.col, this.table.selectionModel.value.row)
      this.table.inputOverlay.adjustToCell(cell)
    }
  }

  override lastFrame() {
    for (let i = 0; i < this.event.size; ++i) {
      const rowHeight = `${Math.max(this.trHead[i].clientHeight, this.trBody[i].clientHeight)}px`
      const bodyStyle = this.trHead[i].style
      bodyStyle.height = bodyStyle.minHeight = bodyStyle.maxHeight = rowHeight
      const headStyle = this.trHead[i].style
      headStyle.height = headStyle.minHeight = headStyle.maxHeight = rowHeight
    }
    this.table.rowHeadHead.replaceChild(this.trHead[0], this.trAnimationHead)
    this.table.bodyBody.replaceChild(this.trBody[0], this.trAnimationBody)
    for (let i = 1; i < this.event.size; ++i) {
      this.table.rowHeadHead.insertBefore(this.trHead[i], this.trHead[i - 1].nextSibling)
      this.table.bodyBody.insertBefore(this.trBody[i], this.trBody[i - 1].nextSibling)
    }

    if (this.table.selectionModel !== undefined && this.table.selectionModel.row >= this.event.index) {
      this.table.selectionModel.row += this.event.size
    }

    if (this.table.editView && this.table.selectionModel !== undefined && this.table.selectionModel.row < this.event.index) {
      const cell = this.table.getCellAt(this.table.selectionModel.value.col, this.table.selectionModel.value.row)
      // console.log(`updateViewAfterInsertRow: => this.inputOverlay.adjustToCell()`)
      this.table.inputOverlay.adjustToCell(cell)
    }
    // FIXME: only one row
    // this.table.adjustLayout({col: 0, row: this.event.index})
    this.table.adjustLayout(undefined) // all columns
    // setTimeout( () => {
    //   let actualHeight = 0
    //   for(let i=0; i<this.event.size; ++i) {
    //     actualHeight += this.table.bodyBody.children[i+1].clientHeight
    //   }
    //   if (actualHeight != this.rowAnimationHeight) {
    //     console.log(`InsertRowAnimation.lastFrame(): calculated height was ${this.rowAnimationHeight} but actually it's ${actualHeight}`)
    //   }
    // }, 0)
  }
}

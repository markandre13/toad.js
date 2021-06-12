import * as toadJSX from '../../util/jsx'
import { TableEvent } from "../TableEvent"
import { AnimationBase } from '@toad/util/animation'
import { TableView } from '../TableView'

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
      // FIXME: height not yet measured for row header
      // const trH = <tr style={{ height: '0px' }} />
      let trH = this.table.createDOMRowHeaderRow(this.event.index)
      this.table.hiddenSizeCheckRowHead.appendChild(trH)
      this.trHead.push(trH)

      const trB = this.table.createDOMBodyRow(this.event.index + i)
      this.table.hiddenSizeCheckBody.appendChild(trB)
      this.trBody.push(trB)
    }

    // insert temporary rows used for animation
    this.trAnimationHead = <tr style={{ height: '0px' }} />
    this.table.rowHeadHead.insertBefore(this.trAnimationHead, this.table.rowHeadHead.children[this.event.index])
    this.trAnimationBody = <tr style={{ height: '0px' }} />
    this.table.bodyBody.insertBefore(this.trAnimationBody, this.table.bodyBody.children[this.event.index + 1])
  }

  override firstFrame() {
    // for (let i = 0; i < this.event.size; ++i) {
    //   this.rowAnimationHeight += this.trBody[i].clientHeight + 3
    // }
    // this works for 'compact'
    this.table.rowAnimationHeight = this.rowAnimationHeight = Math.max(
      this.table.hiddenSizeCheckBody.clientHeight,
      this.table.hiddenSizeCheckRowHead.clientHeight
    )
    // this.stop()
  }

  override animationFrame(animationTime: number) {
    const rowHeight = `${Math.round(animationTime * this.rowAnimationHeight)}px`
    this.trAnimationHead.style.height = rowHeight
    this.trAnimationBody.style.height = rowHeight
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
    setTimeout( () => {
      let actualHeight = 0
      for(let i=0; i<this.event.size; ++i) {
        actualHeight += this.table.bodyBody.children[i+1].clientHeight
      }
      if (actualHeight != this.rowAnimationHeight) {
        console.log(`InsertRotAnimation.lastFrame(): calculated height was ${this.rowAnimationHeight} but actually it's ${actualHeight}`)
      }
    }, 0)
  }
}

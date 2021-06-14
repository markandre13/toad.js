import { TableEvent } from "../TableEvent"
import { AnimationBase } from '@toad/util/animation'
import { TableView } from '../TableView'

export class RemoveRowAnimation extends AnimationBase {
  table: TableView
  event: TableEvent
  rowAnimationHeight = 0;
  hadFocus: boolean = false;
  trHead!: HTMLTableRowElement
  trBody!: HTMLTableRowElement

  constructor(table: TableView, event: TableEvent) {
    super()
    this.table = table
    this.event = event
  }

  override prepare() {
    this.hadFocus = this.table.hasFocus()
    this.table.inputOverlay.style.display = "none"

    this.trHead = this.table.rowHeadHead.children[this.event.index] as HTMLTableRowElement
    this.trBody = this.table.bodyBody.children[this.event.index + 1] as HTMLTableRowElement

    this.rowAnimationHeight = 0
    for (let i = 0; i < this.event.size; ++i) {
      const tr = this.table.bodyBody.children[this.event.index + i + 1] as HTMLTableRowElement
      this.rowAnimationHeight += tr.clientHeight
    }
    // const rowAnimationHeight = trBody.clientHeight
    this.table.rowAnimationHeight = this.rowAnimationHeight

    for (let i = 1; i < this.event.size; ++i) {
      this.table.rowHeadHead.deleteRow(this.event.index + 1)
      this.table.bodyBody.deleteRow(this.event.index + 2)
    }

    this.trHead.style.minHeight = this.trHead.style.maxHeight = ""
    this.trBody.style.minHeight = this.trBody.style.maxHeight = ""
    this.trHead.style.height = `${this.rowAnimationHeight}px`
    this.trBody.style.height = `${this.rowAnimationHeight}px`
    while (this.trHead.children.length > 0)
      this.trHead.removeChild(this.trHead.children[0])
    while (this.trBody.children.length > 0)
      this.trBody.removeChild(this.trBody.children[0])

    if (this.event.index + this.event.size >= this.table.adapter!.rowCount + this.event.size) {
      // skip animation when deleting last rows
      this.stop()

      if (this.table.selectionModel && this.event.index > 0)
        this.table.selectionModel.row = this.event.index - 1

      this.table.rowHeadHead.deleteRow(this.event.index)
      this.table.bodyBody.deleteRow(this.event.index + 1)

      this.table.inputOverlay.style.display = ""
      if (this.hadFocus)
        this.table.focus()
    }
  }

  override animationFrame(value: number) {
    value = 1 - value
    this.trBody.style.height = this.trHead.style.height = `${value * this.rowAnimationHeight}px`
  }

  override lastFrame() {
    this.table.rowHeadHead.deleteRow(this.event.index)
    this.table.bodyBody.deleteRow(this.event.index + 1)

    if (this.table.editView && this.table.selectionModel !== undefined && this.table.selectionModel.row <= this.event.index) {
      if (this.table.selectionModel.row >= this.event.index + this.event.size) {
        // FIXME: there's no test for this branch
        const cell = this.table.getCellAt(this.table.selectionModel.value.col, this.table.selectionModel.value.row)
        this.table.inputOverlay.adjustToCell(cell)
      } else {
        this.table.prepareInputOverlayForPosition(this.table.selectionModel.value)
      }
    }

    setTimeout(() => {
      this.table.inputOverlay.style.display = ""
      if (this.hadFocus)
        this.table.focus()
    }, 0)
  }
}

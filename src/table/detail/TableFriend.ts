import { Animator } from '../../util/animation'
import { TableAdapter } from '../adapter/TableAdapter'
import { Logger, Table } from '../Table'
import { TableAnimation } from './TableAnimation'

// workaround for missing 'friend' declarator in typescript

export class TableFriend {
    table: Table
    constructor(table: Table) {
        this.table = table
    }
    get logger(): Logger {
        return this.table.logger
    }
    get adapter() {
        return (this.table as any).adapter as TableAdapter<any>
    }
    get root(): HTMLDivElement {
        return (this.table as any).root as HTMLDivElement
    }
    get measure() {
        return (this.table as any).measure as HTMLDivElement
    }
    focus() {
        this.table.focus()
    }
    getStaging() {
        const animator = (this.table as any).animator as Animator
        if (animator.current === undefined)
            return undefined
        const animation = animator.current as TableAnimation
        return animation.bodyStaging
    }
    getHeadStaging() {
        const animator = (this.table as any).animator as Animator
        if (animator.current === undefined)
            return undefined
        const animation = animator.current as TableAnimation
        return animation.headStaging
    }
    get body() {
        return (this.table as any).body as HTMLDivElement
    }
    get splitBody() {
        return (this.table as any).splitBody as HTMLDivElement
    }
    get colHeads() {
        return (this.table as any).colHeads as HTMLDivElement
    }
    set colHeads(div: HTMLDivElement) {
        (this.table as any).colHeads = div
    }
    get rowHeads() {
        return (this.table as any).rowHeads as HTMLDivElement
    }
    set rowHeads(div: HTMLDivElement) {
        (this.table as any).rowHeads = div
    }
    get colResizeHandles() {
        return (this.table as any).colResizeHandles as HTMLDivElement
    }
    set colResizeHandles(div: HTMLDivElement) {
        (this.table as any).colResizeHandles = div
    }
    get rowResizeHandles() {
        return (this.table as any).rowResizeHandles as HTMLDivElement
    }
    set rowResizeHandles(div: HTMLDivElement) {
        (this.table as any).rowResizeHandles = div
    }
    set animationDone(animationDone: () => void) {
        (this.table as any).animationDone = animationDone
    }
    get selection() {
        return this.table.selection
    }
    get style() {
        return this.table.style
    }
    setCellSize(span: HTMLSpanElement, x: number, y: number, w: number, h: number) {
        this.table.setCellSize(span, x, y, w, h)
    }
    clearAnimation() {
        (this.table as any).animation = undefined
    }
}

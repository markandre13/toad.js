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

import { TypedTableModel } from "./TypedTableModel"
import { TableEvent } from "./TableEvent"
import { TableEventType } from "./TableEventType"

class TreeModelRow<T> {
    node: T
    open: boolean
    depth: number
    constructor(node: T, depth: number) {
        this.node = node
        this.depth = depth
        this.open = true
    }
}

export abstract class TreeModel<T> extends TypedTableModel<T> {

    rows: Array<TreeModelRow<T>>

    constructor(nodeClass: new () => T) {
        super(nodeClass)
        this.rows = new Array<TreeModelRow<T>>()
    }

    get colCount(): number { return 1 }
    get rowCount(): number { return this.rows.length }

    addSiblingBefore(row: number): number {
        const nn = this.createNode()
        if (this.rows.length === 0) { // TODO: can we remove this?
            row = 0
            this.setRoot(nn)
            this.rows.push(new TreeModelRow(nn, 0))
        } else {
            if (row === 0) {
                this.setNext(nn, this.getRoot())
                this.setRoot(nn)
                this.rows.unshift(new TreeModelRow(nn, 0))
            } else {
                this.setNext(nn, this.rows[row].node)
                if (this.getNext(this.rows[row - 1].node) === this.rows[row].node)
                    this.setNext(this.rows[row - 1].node, nn)

                else
                    this.setDown(this.rows[row - 1].node, nn)
                this.rows.splice(row, 0, new TreeModelRow(nn, this.rows[row].depth))
            }
        }
        this.modified.trigger(new TableEvent(TableEventType.INSERT_ROW, row, 1))
        return row
    }

    addSiblingAfter(row: number): number {
        const nn = this.createNode()
        if (this.rows.length === 0) {
            row = 0
            this.setRoot(nn)
            this.rows.push(new TreeModelRow(nn, 0))
        } else {
            this.setNext(nn, this.getNext(this.rows[row].node))
            this.setNext(this.rows[row].node, nn)

            const count = this.nodeCount(this.getDown(this.rows[row].node))
            // console.log(`addSiblingAfter: subtree has ${count} nodes`)
            const depth = this.rows[row].depth
            row += count + 1
            this.rows.splice(row, 0, new TreeModelRow(nn, depth))
        }
        this.modified.trigger(new TableEvent(TableEventType.INSERT_ROW, row, 1))
        return row
    }

    addChildAfter(row: number): number {
        const nn = this.createNode()
        if (this.rows.length === 0) {
            this.setRoot(nn)
            this.rows.push(new TreeModelRow(nn, 0))
            this.modified.trigger(new TableEvent(TableEventType.INSERT_ROW, 0, 1))
        } else {
            const down = this.getDown(this.rows[row].node)

            const subtreeSize = this.nodeCount(down)
            // console.log(`subtreeSize = ${subtreeSize}`)
            for (let i = 0; i < subtreeSize; ++i)
                ++this.rows[row + 1 + i].depth

            this.setDown(nn, down)
            this.setDown(this.rows[row].node, nn)

            this.rows.splice(row + 1, 0, new TreeModelRow(nn, this.rows[row].depth + 1))
            this.modified.trigger(new TableEvent(TableEventType.INSERT_ROW, row + 1, 1))
        }
        return row
    }

    addParentBefore(row: number): number {
        const nn = this.createNode()
        if (row === 0) {
            for (let i = 0; i < this.rows.length; ++i)
                ++this.rows[row + i].depth
            this.setDown(nn, this.getRoot())
            this.setRoot(nn)
            this.rows.unshift(new TreeModelRow(nn, 0))
        } else {
            const depth = this.rows[row].depth
            const subtreeSize = this.nodeCount(this.getDown(this.rows[row].node)) + 1
            // console.log(`row = ${row}, this.rows.length=${this.rows.length}, subtreeSize = ${subtreeSize}`)
            for (let i = 0; i < subtreeSize; ++i)
                ++this.rows[row + i].depth

            this.setDown(nn, this.rows[row].node)
            this.setNext(nn, this.getNext(this.rows[row].node))

            this.setNext(this.rows[row].node, undefined)
            if (this.getNext(this.rows[row - 1].node) === this.rows[row].node)
                this.setNext(this.rows[row - 1].node, nn)

            else
                this.setDown(this.rows[row - 1].node, nn)
            this.rows.splice(row, 0, new TreeModelRow(nn, depth))
        }
        this.modified.trigger(new TableEvent(TableEventType.INSERT_ROW, row, 1))
        return row
    }

    deleteAt(row: number): number {
        let down = this.getDown(this.rows[row].node)
        if (down !== undefined) {
            // move child to current position
            const subtreeSize = this.nodeCount(down) + 1
            // console.log(`row = ${row}, this.rows.length=${this.rows.length}, subtreeSize = ${subtreeSize}`)
            for (let i = 0; i < subtreeSize; ++i)
                --this.rows[row + i].depth

            this.append(down, this.getNext(this.rows[row].node))
            this.setNext(this.rows[row].node, undefined)
            if (row === 0) {
                this.setRoot(down)
            } else {
                this.setNext(this.rows[row - 1].node, down)
            }
        } else {
            // move sibling to current position
            if (row === 0) {
                const next = this.getNext(this.rows[row].node)
                this.setNext(this.rows[row].node, undefined)
                this.setRoot(next)
            } else {
                const next = this.getNext(this.rows[row].node)
                this.setNext(this.rows[row].node, undefined)

                // this.setDown(this.rows[row-1].node, next)
                if (this.getNext(this.rows[row - 1].node) === this.rows[row].node)
                    this.setNext(this.rows[row - 1].node, next)

                else
                    this.setDown(this.rows[row - 1].node, next)
            }
        }
        this.rows.splice(row, 1)
        this.modified.trigger(new TableEvent(TableEventType.REMOVED_ROW, row, 1))
        return row
    }

    private append(chain: T, node?: T) {
        if (node === undefined)
            return
        let p = chain
        let next
        while (true) {
            next = this.getNext(p)
            if (next === undefined)
                break
            p = next
        }
        this.setNext(p, node)
    }

    private nodeCount(node?: T): number {
        if (node === undefined)
            return 0
        return 1 + this.nodeCount(this.getDown(node)) + this.nodeCount(this.getNext(node))
    }

    abstract createNode(): T
    abstract deleteNode(node: T): void
    abstract getRoot(): T | undefined
    abstract setRoot(node?: T): void
    abstract getDown(node: T): T | undefined
    abstract setDown(node: T, down?: T): void
    abstract getNext(node: T): T | undefined
    abstract setNext(node: T, next?: T): void
}

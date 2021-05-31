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

import { TreeModel } from './TreeModel'
import { TreeNode } from './TreeNode'

export class TreeNodeModel<T extends TreeNode> extends TreeModel<T> {
    root?: T
    constructor(nodeClass: new() => T, root?: T) {
        super(nodeClass, root)
        this.root = root
    }

    createNode(): T { return new this.nodeClass() }
    deleteNode(node: T): void { }
    getRoot(): T | undefined { return this.root }
    setRoot(node?: T): void { this.root = node }
    getDown(node: T): T | undefined { return node.down as T }
    setDown(node: T, down?: T): void { node.down = down }
    getNext(node: T): T | undefined { return node.next as T }
    setNext(node: T, next?: T): void { node.next = next }
}

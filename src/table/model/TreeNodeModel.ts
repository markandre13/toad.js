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

import { TreeModel } from './TreeModel'
import { TreeNode } from './TreeNode'

export class TreeNodeModel<T extends TreeNode> extends TreeModel<T> {
    root?: T
    constructor(nodeClass: new() => T, root?: T) {
        super(nodeClass, root)
        this.root = root
    }

    override createNode(): T { return new this.nodeClass() }
    override deleteNode(node: T): void { }
    override getRoot(): T | undefined { return this.root }
    override setRoot(node?: T): void { this.root = node }
    override getDown(node: T): T | undefined { return node.down as T }
    override setDown(node: T, down?: T): void { node.down = down }
    override getNext(node: T): T | undefined { return node.next as T }
    override setNext(node: T, next?: T): void { node.next = next }
}

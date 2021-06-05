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

import * as dom from "../util/dom"
import { MenuNode } from "./MenuNode"
import { MenuButtonContainer } from "./MenuHelper"
import { menuStyle } from "./menuStyle"

export class Menu extends MenuButtonContainer {
  root: MenuNode
  view?: HTMLElement
  _observer?: MutationObserver
  _timer?: number

  constructor() {
    super()
    this.vertical = false
    this.root = new MenuNode("", "", undefined, undefined)

  }

  connectedCallback() {
    this.tabIndex = 0

    if (this.children.length === 0) {
      // Chrome, Opera invoke connectedCallback() before the children are conected
      this._observer = new MutationObserver((record: MutationRecord[], observer: MutationObserver) => {
        if (this._timer !== undefined)
          clearTimeout(this._timer)
        this._timer = window.setTimeout(() => {
          this._timer = undefined
          this.layout2nodes(this.children, this.root)
          this.referenceActions()
          this.createShadowDOM()
        }, 100)
      })
      this._observer.observe(this, {
        childList: true,
        subtree: true
      })
    } else {
      // Safari invokes connectedCallback() after the children are connected
      this.layout2nodes(this.children, this.root)
      this.referenceActions()
      this.createShadowDOM()
    }
    /*
        globalController.sigChanged.add(() => {
          if (globalController.reasonType==="action-add") {
            if (!globalController.reasonAction)
              return
            let node = this.findNode(globalController.reasonAction.title)
            if (node) {
              node.addAction(globalController.reasonAction)
            }
          }
        }, this)
    */
  }

  disconnectedCallback() {
    //    globalController.sigChanged.remove(this)
  }

  layout2nodes(children: HTMLCollection, parent: MenuNode): void {
    let node = parent.down
    for (let child of children) {
      let newnode: MenuNode | undefined = undefined
      switch (child.nodeName) {
        case "TOAD-MENUSPACER":
          newnode = new MenuNode("", "", "", "spacer")
          break
        case "TOAD-MENUENTRY":
          newnode = new MenuNode(
            dom.attribute(child, "name"),
            dom.attribute(child, "label"),
            dom.attributeOrUndefined(child, "shortcut"),
            dom.attributeOrUndefined(child, "type"),
            dom.attributeOrUndefined(child, "model")
          )
          break
      }
      if (newnode) {
        newnode.parent = parent
        if (!node)
          parent.down = newnode

        else
          node.next = newnode
        node = newnode
      }
      if (!node)
        throw Error("fuck")
      this.layout2nodes(child.children, node)
    }
  }

  referenceActions(): void {
    /*
        for(let titleAndAction of globalController.actionStorage) {
          let title = titleAndAction[0]
          let action = titleAndAction[1]
          let node = this.findNode(title)
          if (node) {
            node.addAction(action)
          }
        }
    */
  }

  findNode(str: string, parent?: MenuNode): MenuNode | undefined {
    let strpos = str.indexOf("|")
    let left = strpos == -1 ? str : str.substr(0, strpos)
    let right = strpos == -1 ? "" : str.substr(strpos + 1)

    if (!parent)
      parent = this.root

    for (let n = parent.down; n; n = n.next) {
      if (n.title == left) {
        if (!n.down) {
          return n
        }
        return this.findNode(right, n)
      }
    }

    return undefined
  }

  createShadowDOM() {
    this.view = document.createElement("div")
    this.view.classList.add("menu-bar")

    let node = this.root.down
    while (node) {
      if (node.isAvailable()) {
        node.createWindowAt(this, this.view)
      } else {
        node.deleteWindow()
      }
      node = node.next
    }

    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.appendChild(document.importNode(menuStyle, true))
    this.shadowRoot!.appendChild(this.view)
  }
}
window.customElements.define("toad-menu", Menu)

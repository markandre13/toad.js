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
import { Signal } from "../signal"
import { Action } from "../action"
import { Model, TextModel, HtmlModel } from "../model"
import { GenericView } from "../view"
import { Controller, globalController } from "../controller"

let menuStyle = document.createElement("style")
menuStyle.textContent=`
  :host(.menu-button) {
    font-family: var(--toad-font-family, sans-serif);
    font-size: 14px;
    font-weight: bold;
    padding: 7px;
    vertical-align: center;
  
    background: #fff;
    color: #000;
    cursor: default;
  }
  :host(.menu-button.active) {
    background: #000;
    color: #fff;
  }
  :host(.menu-button.disabled) {
    color: #888;
  }
  :host(.menu-button.active.disabled) {
    color: #888;
  }
  :host(.menu-button.menu-down) {
    padding-right: 20px;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='14'><path d='M 0 4 l 10 0 l -5 5 Z' fill='#000' stroke='none'/></svg>");
    background-repeat: no-repeat;
    background-position: right center;
  }
  :host(.menu-button.active.menu-down) {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='14'><path d='M 0 4 l 10 0 l -5 5 Z' fill='#fff' stroke='none'/></svg>");
    background-repeat: no-repeat;
    background-position: right center;
  }
  :host(.menu-button.menu-side) {
    padding-right: 20px;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='14'><path d='M 0 2 l 0 10 l 5 -5 Z' fill='#000' stroke='none'/></svg>");
    background-repeat: no-repeat;
    background-position: right center;
  }
  :host(.menu-button.active.menu-side) {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='14'><path d='M 0 2 l 0 10 l 5 -5 Z' fill='#fff' stroke='none'/></svg>");
    background-repeat: no-repeat;
    background-position: right center;
  }
  .menu-bar {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .menu-popup {
    position: fixed;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 2px 5px #888;
  }
`

export enum MenuState {
  WAIT,
  DOWN,
  UP_N_HOLD,
  DOWN_N_HOLD,
  DOWN_N_OUTSIDE,
  DOWN_N_INSIDE_AGAIN
}

export enum Type {
  BUTTON,
  RADIOBUTTON,
  CHECKBUTTON,
  SEPARATOR
}

// menu node
export class Node {
  title: string
  label: string
  shortcut?: string
  type: string
  modelId?: string

  parent?: Node
  down?: Node
  next?: Node

  view?: HTMLElement
  
  constructor(title: string, label: string, shortcut?: string, type?: string, modelId?: string) {
    this.title = title
    this.label = label
    this.shortcut = shortcut
    this.type = type ? type : "entry"
    this.modelId = modelId
  }
  
  isEnabled(): boolean {   // get/set
    return true
  }
  
  isAvailable(): boolean { // get/set
    return true
  }
  
  createWindowAt(parent: MenuHelper, parentView: HTMLElement): void {
    if (this.type=="spacer") {
      let span = document.createElement("span") as HTMLSpanElement
      span.style.flexGrow = "1"
      parentView.appendChild(span)
      return
    }
    this.view = new MenuButton(parent, this)
    parentView.appendChild(this.view)
  }
  
  deleteWindow(): void {
  }
}

// FIXME: rename into MenuButtonContainer
export class MenuHelper extends HTMLElement {
  vertical: boolean
  closeOnClose: boolean
  active?: MenuButton
  state: MenuState
  btnmaster?: MenuButton
  parentButton?: MenuButton
  
  constructor() {
    super()
    this.vertical = true
    this.closeOnClose = false
    this.state = MenuState.WAIT
  }
}

export class Menu extends MenuHelper
{
  root: Node
  view?: HTMLElement
  _observer?: MutationObserver
  _timer?: number
  
  constructor() {
    super()
    this.vertical = false
    this.root = new Node("", "", undefined, undefined)
  }

  connectedCallback() {
    if (this.children.length===0) {
      // Chrome, Opera invoke connectedCallback() before the children are conected
      this._observer = new MutationObserver((record: MutationRecord[], observer: MutationObserver) => {
        if (this._timer !== undefined)
          clearTimeout(this._timer)
        this._timer = setTimeout( () => {
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
  
  layout2nodes(children: HTMLCollection, parent: Node): void {
    let node = parent.down
    for(let child of children) {
      let newnode: Node|undefined = undefined
      switch(child.nodeName) {
        case "TOAD-MENUSPACER":
          newnode = new Node("", "", "", "spacer")
          break
        case "TOAD-MENUENTRY":
          newnode = new Node(
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
  
  findNode(str: string, parent?: Node): Node | undefined {
    let strpos = str.indexOf("|")
    let left = strpos == -1 ? str : str.substr(0, strpos)
    let right = strpos == -1 ? "" : str.substr(strpos+1)
    
    if (!parent)
      parent = this.root
    
    for(let n=parent.down; n; n=n.next) {
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
    while(node) {
      if (node.isAvailable()) {
        node.createWindowAt(this, this.view)
      } else {
        node.deleteWindow()
      }
      node = node.next
    }

    this.attachShadow({mode: 'open'})
    this.shadowRoot!.appendChild(document.importNode(menuStyle, true))
    this.shadowRoot!.appendChild(this.view)
  }
}
window.customElements.define("toad-menu", Menu)

class MenuEntry extends HTMLElement {
}
window.customElements.define("toad-menuentry", MenuEntry)
class MenuSpacer extends HTMLElement {
}
window.customElements.define("toad-menuspacer", MenuSpacer)

export class PopupMenu extends MenuHelper
{
  root: Node
  vertical: boolean
  parentButton: MenuButton
  popup: HTMLElement

  constructor(root: Node, parent: MenuButton) {
    super()
    this.vertical = true
    this.root = root
    this.parentButton = parent

    this.popup = document.createElement("div")
    this.popup.classList.add("menu-popup")

    let node = root.down
    while(node) {
      if (node.isAvailable()) {
        node.createWindowAt(this, this.popup)
      } else {
        node.deleteWindow()
      }
      node = node.next
    }
    this.appendChild(this.popup)
    this.show()
  }
    
  
  show() {
    if (!this.parentButton.master!.vertical)
      placePopupVertical(this.parentButton, this.popup)
    else
      placePopupHorizontal(this.parentButton, this.popup)
    this.style.display = ""
  }
  
  hide() {
    this.style.display = "none"
  }
}
window.customElements.define("toad-popupmenu", PopupMenu)

export class MenuButton extends GenericView<TextModel> {
  static inside?: MenuButton
  static buttonDown: boolean
  static documentMouseDown?: (event: MouseEvent) => void

  node: Node
  master?: MenuHelper // FIXME: rename into container
  popup?: PopupMenu
  
  action?: Action

  constructor(master: MenuHelper, node: Node) {
    super()
    this.master = master
    this.node = node
    let menuButton = this
    this.classList.add("menu-button")
    if (node.down) {
      if (master.vertical)
        this.classList.add("menu-side")
      else
        this.classList.add("menu-down")
    }
    this.updateView()
    
    this.onmousedown = (event: MouseEvent) => {
      event.stopPropagation()

//if (this.node) console.log("mousedown ", this.node.title)

      let documentMouseUp = function(event: MouseEvent) {
        document.removeEventListener("mouseup", documentMouseUp, {capture: true})
        event.preventDefault()
        setTimeout(()=>{
          if (MenuButton.buttonDown)
            menuButton.dispatchEvent(new MouseEvent("mouseup", event))
        }, 0)
      }
      document.addEventListener("mouseup", documentMouseUp, {capture: true})
      MenuButton.buttonDown = true

      if (!this.master)
        throw Error("fuck")
      switch(this.master.state) {
        case MenuState.WAIT:
          this.master.state = MenuState.DOWN
          this.activate()
          break
        case MenuState.UP_N_HOLD:
          if (this.master.active!==this) {
            this.master.state = MenuState.DOWN
            this.activate()
          } else {
            this.master.state = MenuState.DOWN_N_HOLD
          }
          break
        default:
          throw Error("unexpected state "+this.master.state)
      }
      return false
    }
    
    this.onmouseup = (event: MouseEvent) => {
      event.stopPropagation()
      if (!MenuButton.buttonDown)
        return
      MenuButton.buttonDown = false

//if (this.node) console.log("mouseup ", this.node.title)

      if (!this.master)
        throw Error("fuck")
      if (!this.node)
        throw Error("fuck")
      switch(this.master.state) {
        case MenuState.DOWN:
          if (this.node.isEnabled() && !this.node.down) {
            this.trigger()
            this.master.state = MenuState.WAIT
          } else {
            this.master.state = MenuState.UP_N_HOLD
            
            if (MenuButton.documentMouseDown) {
              document.removeEventListener("mousedown", MenuButton.documentMouseDown, {capture: false})
            }
            MenuButton.documentMouseDown = function(event: MouseEvent) {
              if (MenuButton.documentMouseDown)
                document.removeEventListener("mousedown", MenuButton.documentMouseDown, {capture: false})
              MenuButton.documentMouseDown = undefined
              let tagName = (event.target as HTMLElement).tagName
              if (tagName!=="TOAD-MENUBUTTON") {
                menuButton.collapse()
              }
            }
            document.addEventListener("mousedown", MenuButton.documentMouseDown, {capture: false})
          }
          break
        case MenuState.DOWN_N_HOLD:
        case MenuState.DOWN_N_OUTSIDE:
          this.master.state = MenuState.WAIT
          this.deactivate()
          this.collapse()
          // this.dropKeyboard()
          if (this.master.closeOnClose) {
            // this.master.destroyWindow()
          }
          break
        case MenuState.DOWN_N_INSIDE_AGAIN:
          // this.dropKeyboard()
          this.trigger()
          break
        default:
          throw Error("unexpected state "+this.master.state)
      }
      return false
    }
    
    // leave
    this.onmouseout = (event: MouseEvent) => {
      event.stopPropagation()
//console.log("mouseout ", this.node.title)
      if (!this.master)
        throw Error("fuck")
      MenuButton.inside = undefined
      switch(this.master.state) {
        case MenuState.WAIT:
        case MenuState.DOWN_N_OUTSIDE:
        case MenuState.UP_N_HOLD:
        case MenuState.DOWN_N_HOLD:
          break
        case MenuState.DOWN:
        case MenuState.DOWN_N_INSIDE_AGAIN:
          this.master.state = MenuState.DOWN_N_OUTSIDE
          this.updateView()
          break;
        default:
          throw Error("unexpected state")
      }
      return false
    }
    
    this.onmouseover = (event: MouseEvent) => {
      event.stopPropagation()
//console.log("mouseover ", this.node.title)
      if (!menuButton.master)
        throw Error("fuck")
      MenuButton.inside = menuButton
      switch(menuButton.master.state) {
        case MenuState.WAIT:
        case MenuState.UP_N_HOLD:
        case MenuState.DOWN_N_OUTSIDE:
        case MenuState.DOWN_N_HOLD:
        case MenuState.DOWN:
        case MenuState.DOWN_N_INSIDE_AGAIN:
          if (!MenuButton.buttonDown)
            break
          if (!this.master)
            throw Error("fuck")
          if (this.master.active)
            this.master.active.deactivate()
          this.master.state = MenuState.DOWN_N_INSIDE_AGAIN
          this.activate()
          break
        default:
          throw Error("unexpected state "+menuButton.master.state)
      }
      return false
    }
    
    this.attachShadow({mode: 'open'})
    if (!this.shadowRoot)
      throw Error("fuck")
    this.shadowRoot.appendChild(document.importNode(menuStyle, true))
    if (!this.node.modelId)
      this.shadowRoot.appendChild(document.createTextNode(node.label))
  }

  connectedCallback() {
    if (this.controller)
      return
      
    if (this.node.down===undefined) {
      let actionId=this.node.title
      for(let node=this.node.parent; node; node=node.parent) {
        if (!node.title.length)
          break
        actionId=node.title+"|"+actionId
      }
      actionId = "A:"+actionId
//console.log("*** register view action "+actionId, this.node)
      globalController.registerView(actionId, this)
    }

    if (this.node.modelId!==undefined) {
      let modelId = "M:"+this.node.modelId
      globalController.registerView(modelId, this)
    }
    
  }

  disconnectedCallback() {
    if (this.controller)
      this.controller.unregisterView(this)
  }
  
  setModel(model?: Model): void {
    if (!model) {
      if (this.action)
        this.action.modified.remove(this)
      this.model = undefined
      this.action = undefined
      this.updateView()
      return
    }

    if (model instanceof Action) {
      this.action = model
      this.action.modified.add(() => {
        this.updateView()
      }, this)
    } else
    if (model instanceof TextModel) {
      this.model = model
    } else {
      throw Error("unexpected model of type "+model.constructor.name)
    }
    this.updateView()
  }
  
  updateModel() {
//console.log("MenuButton.updateModel "+this.node.title)
  }

  updateView(): void {
    if (this.model && this.model.value) { // FIXME: use updateView only for Model stuff
      if (!this.shadowRoot)
        throw Error("fuck")
//      console.log("update view with model")
      let span = document.createElement("span")
      if (this.model instanceof HtmlModel)
        span.innerHTML = this.model.value
      else
        span.innerText = this.model.value

      // FIXME: dom.replaceChild(this.shadowRoot, 1, span)
      if (this.shadowRoot.children.length>1)
        this.shadowRoot.removeChild(this.shadowRoot.children[1])
      if (this.shadowRoot.children.length>1)
        this.shadowRoot.insertBefore(span, this.shadowRoot.children[1])
      else
        this.shadowRoot.appendChild(span)
    }
  
    if (!this.master)
      throw Error("fuck")

    let active = false
    if (this.master.active==this) {
      switch(this.master.state) {
        case MenuState.DOWN:
        case MenuState.UP_N_HOLD:
        case MenuState.DOWN_N_HOLD:
        case MenuState.DOWN_N_INSIDE_AGAIN:
          active = true
          break
        case MenuState.DOWN_N_OUTSIDE:
          if (!this.node)
            throw Error("fuck")
          active = this.node.down!==undefined && this.node.isEnabled()
          break
      }
    }

    this.classList.toggle("active", active)

    this.classList.toggle("disabled", !this.isEnabled())
  }
  
  isEnabled(): boolean {
    if (this.node.down!==undefined)
      return true
    return this.action!==undefined && this.action.enabled
  }
  
  trigger(): void {
    this.collapse()
    if (!this.action)
      return
    this.action.trigger()
  }
  
  collapse(): void {
    if (!this.master)
      throw Error("fuck")
    if (this.master.parentButton)
      this.master.parentButton.collapse()
    else
      this.deactivate()
  }
  
  openPopup(): void {
    if (!this.node)
      return
    if (!this.node.down)
      return

    if (!this.shadowRoot)
      throw Error("fuck")

    if (!this.popup) {
      this.popup = new PopupMenu(this.node, this)
      this.shadowRoot.appendChild(this.popup)
    } else {
      this.popup.show()
    }
  }
  
  closePopup(): void {
    if (!this.popup)
      return
    if (this.popup.active)
      this.popup.active.deactivate()
    this.popup.hide()
  }
  
  activate(): void {
    if (!this.master)
      throw Error("fuck")
    if (!this.node)
      throw Error("fuck")
    
    // if active return
    
    let oldActive = this.master.active
    this.master.active = this
    if (oldActive && oldActive!==this) {
      oldActive.closePopup()
      oldActive.updateView()
    }
    this.updateView()
    this.openPopup()
  }
  
  deactivate(): void {
    if (!this.master)
      throw Error("fuck")
    if (this.master.active !== this)
      return
    
    this.master.active.closePopup()
    this.master.active = undefined
    this.master.state = MenuState.WAIT
    this.updateView()
  }
  
}
window.customElements.define("toad-menubutton", MenuButton)

function placePopupVertical(parent: HTMLElement, popup: HTMLElement): void {
  let parentBoundary = parent.getBoundingClientRect()

  // FIXME: need to handle scrollLeft, scrollTop?

  popup.style.opacity = "0"
  popup.style.left = parentBoundary.left+"px"
  popup.style.top = (parentBoundary.top+parentBoundary.height)+"px"

  setTimeout(function() {
    // FIXME: there might still not be enough space, might want to scroll and/or overlap parent
    let popupBoundary = popup.getBoundingClientRect()
    let popupBottom = parentBoundary.top + parentBoundary.height + popupBoundary.height
    if (popupBottom > window.innerHeight) {
      popup.style.top = (parentBoundary.top - popupBoundary.height)+"px"
    }
    let popupRight = parentBoundary.left + popupBoundary.width
    if (popupRight > window.innerWidth) {
       popup.style.left = (parentBoundary.left + parentBoundary.width - popupBoundary.width)+"px"
    }
    popup.style.opacity = "1"
  }, 0)

//  window.addEventListener("mouseup", new PopupListener(popup), true)
}

function placePopupHorizontal(parent: HTMLElement, popup: HTMLElement): void {
  let parentBoundary = parent.getBoundingClientRect()

  // FIXME: need to handle scrollLeft, scrollTop?

  popup.style.opacity = "0"
  popup.style.left = (parentBoundary.left+parentBoundary.width)+"px"
  popup.style.top = parentBoundary.top+"px"

  setTimeout(function() {
    // FIXME: there might still not be enough space, might want to scroll and/or overlap parent
    let popupBoundary = popup.getBoundingClientRect()
    let popupBottom = parentBoundary.top + popupBoundary.height
    if (popupBottom > window.innerHeight) {
      popup.style.top = (parentBoundary.top + parentBoundary.height - popupBoundary.height)+"px"
    }
    let popupRight = parentBoundary.left + parentBoundary.width + popupBoundary.width
    if (popupRight > window.innerWidth) {
       popup.style.left = (parentBoundary.left - popupBoundary.width)+"px"
    }
    popup.style.opacity = "1"
  }, 0)

//  window.addEventListener("mouseup", new PopupListener(popup), true)
}

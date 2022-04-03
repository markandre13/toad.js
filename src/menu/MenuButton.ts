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

import { Action } from "../model/Action"
import { HtmlModel } from "../model/HtmlModel"
import { TextModel } from "../model/TextModel"
import { Model } from "../model/Model"
import { ModelView } from "../view/ModelView"
import { globalController } from "../controller/globalController"
import { menuStyle } from "./menuStyle"
import { MenuState } from "./MenuState"
import { MenuNode } from "./MenuNode"
import { MenuButtonContainer } from "./MenuButtonContainer"
import { PopupMenu } from "./PopupMenu"

export class MenuButton extends ModelView<TextModel> {
  static inside?: MenuButton
  static buttonDown: boolean
  static documentMouseDown?: (event: MouseEvent) => void

  node: MenuNode
  master?: MenuButtonContainer // FIXME: rename into container
  popup?: PopupMenu

  action?: Action

  constructor(master: MenuButtonContainer, node: MenuNode) {
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
      let documentMouseUp = function (event: MouseEvent) {
        document.removeEventListener("mouseup", documentMouseUp, { capture: true })
        event.preventDefault()
        setTimeout(() => {
          if (MenuButton.buttonDown)
            menuButton.dispatchEvent(new MouseEvent("mouseup", event))
        }, 0)
      }
      document.addEventListener("mouseup", documentMouseUp, { capture: true })
      MenuButton.buttonDown = true

      if (!this.master)
        throw Error("yikes")
      switch (this.master.state) {
        case MenuState.WAIT:
          this.master.state = MenuState.DOWN
          this.activate()
          break
        case MenuState.UP_N_HOLD:
          if (this.master.active !== this) {
            this.master.state = MenuState.DOWN
            this.activate()
          } else {
            this.master.state = MenuState.DOWN_N_HOLD
          }
          break
        default:
          throw Error("unexpected state " + this.master.state)
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
        throw Error("yikes")
      if (!this.node)
        throw Error("yikes")
      switch (this.master.state) {
        case MenuState.DOWN:
          if (this.node.isEnabled() && !this.node.down) {
            this.trigger()
            this.master.state = MenuState.WAIT
          } else {
            this.master.state = MenuState.UP_N_HOLD

            if (MenuButton.documentMouseDown) {
              document.removeEventListener("mousedown", MenuButton.documentMouseDown, { capture: false })
            }
            MenuButton.documentMouseDown = function (event: MouseEvent) {
              if (MenuButton.documentMouseDown)
                document.removeEventListener("mousedown", MenuButton.documentMouseDown, { capture: false })
              MenuButton.documentMouseDown = undefined
              let tagName = (event.target as HTMLElement).tagName
              if (tagName !== "TOAD-MENUBUTTON") {
                menuButton.collapse()
              }
            }
            document.addEventListener("mousedown", MenuButton.documentMouseDown, { capture: false })
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
          throw Error("unexpected state " + this.master.state)
      }
      return false
    }

    // leave
    this.onmouseout = (event: MouseEvent) => {
      event.stopPropagation()
      //console.log("mouseout ", this.node.title)
      if (!this.master)
        throw Error("yikes")
      MenuButton.inside = undefined
      switch (this.master.state) {
        case MenuState.WAIT:
        case MenuState.DOWN_N_OUTSIDE:
        case MenuState.UP_N_HOLD:
        case MenuState.DOWN_N_HOLD:
          break
        case MenuState.DOWN:
        case MenuState.DOWN_N_INSIDE_AGAIN:
          this.master.state = MenuState.DOWN_N_OUTSIDE
          this.updateView()
          break
        default:
          throw Error("unexpected state")
      }
      return false
    }

    this.onmouseover = (event: MouseEvent) => {
      event.stopPropagation()
      //console.log("mouseover ", this.node.title)
      if (!menuButton.master)
        throw Error("yikes")
      MenuButton.inside = menuButton
      switch (menuButton.master.state) {
        case MenuState.WAIT:
        case MenuState.UP_N_HOLD:
        case MenuState.DOWN_N_OUTSIDE:
        case MenuState.DOWN_N_HOLD:
        case MenuState.DOWN:
        case MenuState.DOWN_N_INSIDE_AGAIN:
          if (!MenuButton.buttonDown)
            break
          if (!this.master)
            throw Error("yikes")
          if (this.master.active)
            this.master.active.deactivate()
          this.master.state = MenuState.DOWN_N_INSIDE_AGAIN
          this.activate()
          break
        default:
          throw Error("unexpected state " + menuButton.master.state)
      }
      return false
    }

    this.attachShadow({ mode: 'open' })
    if (!this.shadowRoot)
      throw Error("yikes")
    this.shadowRoot.appendChild(document.importNode(menuStyle, true))
    if (!this.node.modelId)
      this.shadowRoot.appendChild(document.createTextNode(node.label))
  }

  override connectedCallback() {
    if (this.controller)
      return

    if (this.node.down === undefined) {
      let actionId = this.node.title
      for (let node = this.node.parent; node; node = node.parent) {
        if (!node.title.length)
          break
        actionId = node.title + "|" + actionId
      }
      actionId = "A:" + actionId
      //console.log("*** register view action "+actionId, this.node)
      globalController.registerView(actionId, this)
    }

    if (this.node.modelId !== undefined) {
      if (typeof this.node.modelId === "string") {
        let modelId = "M:" + this.node.modelId
        globalController.registerView(modelId, this)
      } else {
        this.setModel(this.node.modelId)
      }

    }

  }

  override disconnectedCallback() {
    if (this.controller)
      this.controller.unregisterView(this)
  }

  override setModel(model?: Model): void {
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
    }
    else if (model instanceof TextModel) {
      this.model = model
    } else {
      throw Error("unexpected model of type " + model.constructor.name)
    }
    this.updateView()
  }

  override updateView(): void {
    if (this.model && this.model.value) { // FIXME: use updateView only for Model stuff
      if (!this.shadowRoot)
        throw Error("yikes")
      //      console.log("update view with model")
      let span = document.createElement("span")
      if (this.model instanceof HtmlModel)
        span.innerHTML = this.model.value

      else
        span.innerText = this.model.value

      // FIXME: dom.replaceChild(this.shadowRoot, 1, span)
      if (this.shadowRoot.children.length > 1)
        this.shadowRoot.removeChild(this.shadowRoot.children[1])
      if (this.shadowRoot.children.length > 1)
        this.shadowRoot.insertBefore(span, this.shadowRoot.children[1])

      else
        this.shadowRoot.appendChild(span)
    }

    if (!this.master)
      throw Error("yikes")

    let active = false
    if (this.master.active == this) {
      switch (this.master.state) {
        case MenuState.DOWN:
        case MenuState.UP_N_HOLD:
        case MenuState.DOWN_N_HOLD:
        case MenuState.DOWN_N_INSIDE_AGAIN:
          active = true
          break
        case MenuState.DOWN_N_OUTSIDE:
          if (!this.node)
            throw Error("yikes")
          active = this.node.down !== undefined && this.node.isEnabled()
          break
      }
    }

    this.classList.toggle("active", active)

    this.classList.toggle("disabled", !this.isEnabled())
  }

  isEnabled(): boolean {
    if (this.node.down !== undefined)
      return true
    return this.action !== undefined && this.action.enabled
  }

  trigger(): void {
    this.collapse()
    if (!this.action)
      return
    this.action.trigger()
  }

  collapse(): void {
    if (!this.master)
      throw Error("yikes")
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
      throw Error("yikes")

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
      throw Error("yikes")
    if (!this.node)
      throw Error("yikes")

    // if active return
    let oldActive = this.master.active
    this.master.active = this
    if (oldActive && oldActive !== this) {
      oldActive.closePopup()
      oldActive.updateView()
    }
    this.updateView()
    this.openPopup()
  }

  deactivate(): void {
    if (!this.master)
      throw Error("yikes")
    if (this.master.active !== this)
      return

    this.master.active.closePopup()
    this.master.active = undefined
    this.master.state = MenuState.WAIT
    this.updateView()
  }
}

MenuButton.define("tx-menubutton", MenuButton)
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

import { View } from "../view/View"
import { Controller } from "./Controller"
import { Fragment } from "toad.jsx"

// HTML Imports Working Draft
declare global {
  interface HTMLLinkElement {
    import?: Document
  }
}

export class Dialog extends Controller {
  root?: DocumentFragment
  shadow?: HTMLElement
  frame?: HTMLElement

  constructor() {
    super()
    this.close = this.close.bind(this)
  }

  open(content: HTMLElement | Fragment): void
  open(href: string): void
  open(contentOrHref: string | HTMLElement | Fragment) {
    this.shadow = <div style={{ position: "absolute", left: "0", top: "0", right: "0", bottom: "0", backgroundColor: "#aaa", opacity: "0.5" }} />
    this.frame = <div style={{
      position: "absolute", left: "5%", top: "5%", right: "5%", bottom: "5%",
      padding: "10px",
      overflow: "auto",
      backgroundColor: "#fff", border: "solid 2px #000" }} />

    if (typeof contentOrHref === "object") {
      if (contentOrHref instanceof Fragment) {
        contentOrHref.appendTo(this.frame!)
      } else {
        this.frame!.appendChild(contentOrHref)
      }
      document.body.appendChild(this.shadow!)
      document.body.appendChild(this.frame!)
      return
    }

    document.body.appendChild(this.shadow!)

    let linkList = document.head.querySelectorAll("link[rel=import]")
    let link
    for (let availableLink of linkList) {
      if ((availableLink as HTMLLinkElement).href === contentOrHref) {
        link = availableLink
        break
      }
    }

    if (!link) {
      let link = document.createElement("link")
      link.rel = "import"
      link.href = contentOrHref as string
      link.onload = (event) => {
        let template = link.import!.querySelector("template")
        if (!template)
          throw Error("toad.openDialog: failed to find template in '" + contentOrHref + "'")

        let content = document.importNode(template.content, true)
        this.registerViews(content)
        this.frame!.appendChild(content)
        document.body.appendChild(this.frame!)
      }
      document.head.appendChild(link)
    } else {
      link.dispatchEvent(new Event("load"))
    }
  }

  close(): void {
    if (this.frame)
      document.body.removeChild(this.frame)
    if (this.shadow)
      document.body.removeChild(this.shadow)
    this.frame = undefined
    this.shadow = undefined
  }

  registerViews(root: DocumentFragment) {
    let views = root.querySelectorAll("[model]")
    for (let element of views) {
      //if (element.nodeName.toUpperCase().substring(0,4)!=="TOAD-")
      //  continue
      let view = element as View
      if (!view)
        continue
      try {
        this.registerView(view.getModelId(), view)
      }
      catch (e) {
      }
    }

    views = root.querySelectorAll("[action]")
    for (let element of views) {
      //if (element.nodeName.toUpperCase().substring(0,4)!=="TOAD-")
      //  continue
      let view = element as View
      if (!view)
        continue
      //      view.controller = this
      try {
        this.registerView(view.getActionId(), view)
      }
      catch (e) {
      }
    }

  }
}

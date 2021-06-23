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

import { Model } from "../model/Model"
import { GenericView } from "./GenericView"
import { textAreaStyle } from "./textAreaStyle"

// TODO: we should be able to reduce the amount of code by adding some helper functions

export class TextTool extends GenericView<Model> {
    // FIXME: make this a list where all texttools register/unregister via connectedCallback()/disconnectedCallback()
    // FIXME: disable texttool when it is not above an active textarea in the view hierachy
    static texttool?: TextTool

    buttonH1: HTMLElement
    buttonH2: HTMLElement
    buttonH3: HTMLElement
    buttonH4: HTMLElement
    buttonUnorderedList: HTMLElement
    buttonOrderedList: HTMLElement

    buttonBold: HTMLElement
    buttonItalic: HTMLElement
    buttonUnderline: HTMLElement
    buttonStrikeThrough: HTMLElement
    buttonSubscript: HTMLElement
    buttonSuperscript: HTMLElement

    buttonJustifyLeft: HTMLElement
    buttonJustifyCenter: HTMLElement
    buttonJustifyRight: HTMLElement
    //    buttonJustifyFull: HTMLElement
    constructor() {
        super()

        TextTool.texttool = this

        let toolbar = <div class="toolbar"/>

        this.buttonH1 = <button class="left">H1</button>
        this.buttonH1.onclick = () => {
            document.execCommand("formatBlock", false, "<h1>")
            this.update()
        }
        toolbar.appendChild(this.buttonH1)

        this.buttonH2 = <button>H2</button>
        this.buttonH2.onclick = () => {
            document.execCommand("formatBlock", false, "<h2>")
            this.update()
        }
        toolbar.appendChild(this.buttonH2)

        this.buttonH3 = <button>H3</button>
        this.buttonH3.onclick = () => {
            document.execCommand("formatBlock", false, "<h3>")
            this.update()
        }
        toolbar.appendChild(this.buttonH3)

        this.buttonH4 = <button class="right">H4</button>
        this.buttonH4.onclick = () => {
            document.execCommand("formatBlock", false, "<h4>")
            this.update()
        }
        toolbar.appendChild(this.buttonH4)

        toolbar.appendChild(document.createTextNode(" "))

        this.buttonBold = <button class="left"><b>B</b></button>
        this.buttonBold.onclick = () => {
            document.execCommand("bold", false)
            this.update()
        }
        toolbar.appendChild(this.buttonBold)

        this.buttonItalic = <button><i>I</i></button>
        this.buttonItalic.onclick = () => {
            document.execCommand("italic", false)
            this.update()
        }
        toolbar.appendChild(this.buttonItalic)

        this.buttonUnderline = <button><u>U</u></button>
        this.buttonUnderline.onclick = () => {
            document.execCommand("underline", false)
            this.update()
        }
        toolbar.appendChild(this.buttonUnderline)

        this.buttonStrikeThrough = <button><strike>S</strike></button>
        this.buttonStrikeThrough.onclick = () => {
            document.execCommand("strikeThrough", false)
            this.update()
        }
        toolbar.appendChild(this.buttonStrikeThrough)

        this.buttonSubscript = <button>x₂</button>
        this.buttonSubscript.onclick = () => {
            document.execCommand("subscript", false)
            this.update()
        }
        toolbar.appendChild(this.buttonSubscript)

        this.buttonSuperscript = <button class="right">x²</button>
        this.buttonSuperscript.onclick = () => {
            document.execCommand("superscript", false)
            this.update()
        }
        toolbar.appendChild(this.buttonSuperscript)


        toolbar.appendChild(document.createTextNode(" "))

        this.buttonJustifyLeft = <button class="left">
            <svg viewBox="0 0 10 9" width="10" height="9">
                <line x1="0" y1="0.5" x2="10" y2="0.5" stroke="#000" />
                <line x1="0" y1="2.5" x2="6" y2="2.5" stroke="#000" />
                <line x1="0" y1="4.5" x2="10" y2="4.5" stroke="#000" />
                <line x1="0" y1="6.5" x2="6" y2="6.5" stroke="#000" />
                <line x1="0" y1="8.5" x2="10" y2="8.5" stroke="#000" />
            </svg>
        </button>
        this.buttonJustifyLeft.onclick = () => {
            document.execCommand("justifyLeft", false)
            this.update()
        }
        toolbar.appendChild(this.buttonJustifyLeft)

        this.buttonJustifyCenter = <button>
            <svg viewBox="0 0 10 9" width="10" height="9">
                <line x1="0" y1="0.5" x2="10" y2="0.5" stroke="#000" />
                <line x1="2" y1="2.5" x2="8" y2="2.5" stroke="#000" />
                <line x1="0" y1="4.5" x2="10" y2="4.5" stroke="#000" />
                <line x1="2" y1="6.5" x2="8" y2="6.5" stroke="#000" />
                <line x1="0" y1="8.5" x2="10" y2="8.5" stroke="#000" />
            </svg>
        </button>
        this.buttonJustifyCenter.onclick = () => {
            document.execCommand("justifyCenter", false)
            this.update()
        }
        toolbar.appendChild(this.buttonJustifyCenter)

        this.buttonJustifyRight = <button class="right">
            <svg viewBox="0 0 10 9" width="10" height="9">
                <line x1="0" y1="0.5" x2="10" y2="0.5" stroke="#000" />
                <line x1="4" y1="2.5" x2="10" y2="2.5" stroke="#000" />
                <line x1="0" y1="4.5" x2="10" y2="4.5" stroke="#000" />
                <line x1="4" y1="6.5" x2="10" y2="6.5" stroke="#000" />
                <line x1="0" y1="8.5" x2="10" y2="8.5" stroke="#000" />
            </svg>
        </button>
        this.buttonJustifyRight.onclick = () => {
            document.execCommand("justifyRight", false)
            this.update()
        }
        toolbar.appendChild(this.buttonJustifyRight)

        // this.buttonJustifyFull = <button class="right">
        //     <svg viewBox="0 0 10 9" width="10" height="9">
        //         <line x1="0" y1="0.5" x2="10" y2="0.5" stroke="#000" />
        //         <line x1="0" y1="2.5" x2="10" y2="2.5" stroke="#000" />
        //         <line x1="0" y1="4.5" x2="10" y2="4.5" stroke="#000" />
        //         <line x1="0" y1="6.5" x2="10" y2="6.5" stroke="#000" />
        //         <line x1="0" y1="8.5" x2="10" y2="8.5" stroke="#000" />
        //     </svg>
        // </button>
        // this.buttonJustifyFull.onclick = () => {
        //     document.execCommand("justifyFull", false)
        //     this.update()
        // }
        // toolbar.appendChild(this.buttonJustifyFull)
        // toolbar.appendChild(document.createTextNode(" "))

        this.buttonUnorderedList = <button class="left">
            <svg style={{display: "block"}} viewBox="0 0 17 11.5" width="17" height="11.5">
                <circle cx="4.5" cy="1.5" r="0.8" stroke="#000" fill="#000" />
                <line x1="7" y1="1.5" x2="17" y2="1.5" stroke="#000" />
                <circle cx="4.5" cy="5.5" r="0.8" stroke="#000" fill="#000" />
                <line x1="7" y1="5.5" x2="17" y2="5.5" stroke="#000" />
                <circle cx="4.5" cy="9.5" r="0.8" stroke="#000" fill="#000" />
                <line x1="7" y1="9.5" x2="17" y2="9.5" stroke="#000" />
            </svg>
        </button>
        this.buttonUnorderedList.onclick = (event) => {
            document.execCommand("insertUnorderedList", false)
            this.update()
        }
        toolbar.appendChild(this.buttonUnorderedList)

        this.buttonOrderedList = <button class="right">
            <svg style={{ display: "block" }} viewBox="0 0 17 11.5" width="17" height="11.5">
                <line x1="4.5" y1="0" x2="4.5" y2="3" stroke="#000" />
                <line x1="7" y1="1.5" x2="17" y2="1.5" stroke="#000" />
                <line x1="2.5" y1="4" x2="2.5" y2="7" stroke="#000" />
                <line x1="4.5" y1="4" x2="4.5" y2="7" stroke="#000" />
                <line x1="7" y1="5.5" x2="17" y2="5.5" stroke="#000" />
                <line x1="0.5" y1="8" x2="0.5" y2="11" stroke="#000" />
                <line x1="2.5" y1="8" x2="2.5" y2="11" stroke="#000" />
                <line x1="4.5" y1="8" x2="4.5" y2="11" stroke="#000" />
                <line x1="7" y1="9.5" x2="17" y2="9.5" stroke="#000" />
            </svg>
        </button>
        this.buttonOrderedList.onclick = () => {
            document.execCommand("insertOrderedList", false)
            this.update()
        }
        toolbar.appendChild(this.buttonOrderedList)

        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.appendChild(document.importNode(textAreaStyle, true))
        this.shadowRoot!.appendChild(toolbar)
    }

    update() {
        this.buttonH1.classList.toggle("active", document.queryCommandValue("formatBlock") === "h1")
        this.buttonH2.classList.toggle("active", document.queryCommandValue("formatBlock") === "h2")
        this.buttonH3.classList.toggle("active", document.queryCommandValue("formatBlock") === "h3")
        this.buttonH4.classList.toggle("active", document.queryCommandValue("formatBlock") === "h4")

        this.buttonBold.classList.toggle("active", document.queryCommandState("bold"))
        this.buttonItalic.classList.toggle("active", document.queryCommandState("italic"))
        this.buttonUnderline.classList.toggle("active", document.queryCommandState("underline"))
        this.buttonStrikeThrough.classList.toggle("active", document.queryCommandState("strikeThrough"))
        this.buttonSubscript.classList.toggle("active", document.queryCommandState("subscript"))
        this.buttonSuperscript.classList.toggle("active", document.queryCommandState("superscript"))

        this.buttonJustifyLeft.classList.toggle("active", document.queryCommandState("justifyLeft"))
        this.buttonJustifyCenter.classList.toggle("active", document.queryCommandState("justifyCenter"))
        this.buttonJustifyRight.classList.toggle("active", document.queryCommandState("justifyRight"))
        // this.buttonJustifyFull.classList.toggle("active", document.queryCommandState("justifyFull"))
    }

    updateModel() {
        if (this.model) {
        }
    }

    updateView() {
        if (!this.model) {
            return
        }
    }
}
window.customElements.define("toad-texttool", TextTool)

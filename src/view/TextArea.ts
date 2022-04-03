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

import { HtmlModel } from "../model/HtmlModel"
import { TextModel } from "../model/TextModel"
import { ModelView } from "./ModelView"
import { TextTool } from "./TextTool"
import { textAreaStyle } from "./textAreaStyle"

export class TextArea extends ModelView<TextModel> {

    content: HTMLElement

    constructor() {
        super()

        // FIXME: when model is not HtmlModel but TextModel, use <textarea> instead of <div contenteditable>
        let content = document.createElement("div")
        this.content = content
        content.classList.add("tx-text")
        content.contentEditable = "true"
        
        content.oninput = (event: Event) => {
            if (this.model instanceof HtmlModel) {
                let firstChild = (event.target as Node).firstChild
                if (firstChild && firstChild.nodeType === 3) {
                    // if the document starts with text, wrap it into a paragraph
                    document.execCommand("formatBlock", false, `<div>`)
                }
                else if (content.innerHTML === "<br>") {
                    content.innerHTML = ""
                }
            }
            this.updateModel()
        }
        
        content.onkeydown = (event: KeyboardEvent) => {

            if (!(this.model instanceof HtmlModel)) {
                return
            }

            if (event.metaKey === true && event.key === "b") {
                event.preventDefault()
                document.execCommand("bold", false)
                this.updateTextTool()
            } else
            if (event.metaKey === true && event.key === "i") {
                event.preventDefault()
                document.execCommand("italic", false)
                this.updateTextTool()
            } else
            if (event.metaKey === true && event.key === "u") {
                event.preventDefault()
                document.execCommand("underline", false)
                this.updateTextTool()
            } else
            if (event.key === "Tab") {
                event.preventDefault()
            } else
            if (event.key === "Enter" &&
                event.shiftKey !== true &&
                document.queryCommandValue("formatBlock") === "blockquote" )
            {
                document.execCommand("formatBlock", false, "<p>")
            }
/*
            else if (event.key === "Enter" &&
                event.shiftKey === true )
            {
                event.preventDefault()
            
                // entering <br> with execCommand will also insert a paragraph, hence the following.
                // beware! it is not perfect when inserting <br> at the end of the document.
                // sometimes is works, sometimes it doesn't
                let docFragment = document.createDocumentFragment()

                let lineBreak = document.createElement("br")
                docFragment.appendChild(lineBreak)
                let lineCR = document.createTextNode("\n")
                docFragment.appendChild(lineCR)

                // replace selection with <br>\n
                let range = window.getSelection().getRangeAt(0)
                range.deleteContents()
                range.insertNode(docFragment)

                // create a new range
                range = document.createRange()
                range.setStartAfter(lineCR);
                range.collapse(true)

                // move cursor
                let selection = window.getSelection()
                selection.removeAllRanges()
                selection.addRange(range)

                this.updateTextTool()
            }
*/
        }
        
        content.onkeyup = () => {
            this.updateTextTool()
        }
        content.onmouseup = () => {
            this.updateTextTool()
        }

        this.attachShadow({mode: 'open'})
        this.attachStyle("text")
        this.shadowRoot!.appendChild(content)
    }
    
    updateTextTool() {
        if (TextTool.texttool !== undefined)
            TextTool.texttool.update()
    }
    
    override updateModel() {
        if (this.model) {
            // textarea with it's markup may be expensive, hence we let the model fetch it's data on demand
            this.model.promise = () => {
                if (this.model instanceof HtmlModel) {  
                    return this.content.innerHTML
                } else {
                    return this.content.innerText
                }
            }
        }
    }
    
    override updateView() {
        if (!this.model) {
            return
        }
        if (this.model instanceof HtmlModel) {
            // because of TextModel.promise we check here instead inside the model
            // if we don't check at all, the cursor ends up in the wrong location
            // after each change
            if (this.content.innerHTML !== this.model.value) {
                this.content.innerHTML = this.model.value
            }
        } else {
            // FIXME: no tested
            if (this.content.innerText !== this.model.value) {
                this.content.innerText = this.model.value
            }
        }
    }
}

TextArea.define("tx-textarea", TextArea)
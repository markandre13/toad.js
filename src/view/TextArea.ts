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

import { TextModel, HtmlModel } from "../model"
import { GenericView } from "../view"
import { TextTool } from "./TextTool"

export let textareaStyle = document.createElement("style")
textareaStyle.textContent=`
.toolbar button {
    background: #fff;
    color: #000;
    border: 1px #ccc;
    border-style: solid solid solid none;
    padding: 5;
    margin: 0;
}

.toolbar button.left {
    border-style: solid;
    border-radius: 3px 0 0 3px;
}

.toolbar button.right {
    border: 1px #ccc;
    border-style: solid solid solid none;
    border-radius: 0 3px 3px 0;
}

.toolbar button.active {
    background: linear-gradient(to bottom, #7abcff 0%,#0052cc 100%,#4096ee 100%);
    border: 1px #0052cc solid;
    color: #fff;
}

div.textarea {
  font-family: var(--toad-font-family, sans-serif);
  font-size: var(--toad-font-size, 12px);
  border: 1px #ccc solid;
  border-radius: 3px;
  margin: 2px;
  padding: 4px 5px;
  outline-offset: -2px;
}

div.textarea h1 {
  font-size: 22px;
  margin: 0;
  padding: 4px 0 4px 0;
}

div.textarea h2 {
  font-size: 18px;
  margin: 0;
  padding: 4px 0 4px 0;
}

div.textarea h3 {
  font-size: 16px;
  margin: 0;
  padding: 4px 0 4px 0;
}

div.textarea h4 {
  font-size: 14px;
  margin: 0;
  padding: 4px 0 4px 0;
}

div.textarea div {
  padding: 2px 0 2px 0;
}
`

export class TextArea extends GenericView<TextModel> {

    content: HTMLElement

    constructor() {
        super()

        // FIXME: when model is not HtmlModel but TextModel, use <textarea> instead of <div contenteditable>
        let content = document.createElement("div")
        this.content = content
        content.classList.add("textarea")
        content.contentEditable = "true"
        
        content.oninput = (event: Event) => {
            let firstChild = (event.target as Node).firstChild
            if (firstChild && firstChild.nodeType === 3) {
                // if the document starts with text, wrap it into a paragraph
                document.execCommand("formatBlock", false, `<div>`)
            }
            else if (content.innerHTML === "<br>") {
                content.innerHTML = ""
            }
            this.updateModel()
        }
        
        content.onkeydown = (event: KeyboardEvent) => {
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
        this.shadowRoot!.appendChild(document.importNode(textareaStyle, true))
        this.shadowRoot!.appendChild(content)
    }
    
    updateTextTool() {
        if (TextTool.texttool !== undefined)
            TextTool.texttool.update()
    }
    
    updateModel() {
        if (this.model) {
            // textarea with it's markup may be expensive, hence we let the model fetch it's data on demand
            this.model.promise = () => {
                return this.content.innerHTML
            }
        }
    }
    
    updateView() {
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
window.customElements.define("toad-textarea", TextArea)

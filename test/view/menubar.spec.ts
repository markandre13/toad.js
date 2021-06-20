import { expect } from "chai"
import * as dom from "@toad/util/dom"
import { MenuButton, action, globalController } from "@toad"

describe("toad.js", function() {

    describe("menubar", function() {
        let testData = `
  <toad-menu>
    <toad-menuentry name="file" label="File">
      <toad-menuentry name="new" label="New"></toad-menuentry>
      <toad-menuentry name="open" label="Open"></toad-menuentry>
      <toad-menuentry name="close" label="Close"></toad-menuentry>
      <toad-menuentry name="quit" label="Quit"></toad-menuentry>
    </toad-menuentry>
    <toad-menuentry name="edit" label="Edit">
      <toad-menuentry name="undo" label="Undo" shortcut="Ctrl+Z"></toad-menuentry>
      <toad-menuentry name="redo" label="Redo" shortcut="Ctrl+Y"></toad-menuentry>
      <toad-menuentry name="cut" label="Cut" shortcut="Ctrl+X"></toad-menuentry>
      <toad-menuentry name="copy" label="Copy" shortcut="Ctrl+C"></toad-menuentry>
      <toad-menuentry name="paste" label="Paste" shortcut="Ctrl+V"></toad-menuentry>
      <toad-menuentry name="delete" label="Delete" shortcut="Del"></toad-menuentry>
      <toad-menuentry name="search" label="Search">
        <toad-menuentry name="searchDialog" label="Search..."></toad-menuentry>
        <toad-menuentry name="forward" label="Forward"></toad-menuentry>
        <toad-menuentry name="backward" label="Backward"></toad-menuentry>
      </toad-menuentry>
    </toad-menuentry>
  </toad-menu>`

        describe("click interaction", function() {
    
            it("menu opens after 1st click, closes after 2nd click", function() {
                document.body.innerHTML = testData
                let button = findMenuButton("edit")
                expect(buttonIsActive(button)).to.equal(false)
                expect(buttonHasPopup(button)).to.equal(false)

                sendMenuButton(button, "mouseover")
                expect(buttonIsActive(button)).to.equal(false)
                expect(buttonHasPopup(button)).to.equal(false)

                sendMenuButton(button, "mousedown")
                expect(buttonIsActive(button)).to.equal(true)
                expect(buttonHasPopup(button)).to.equal(true)

                sendMenuButton(button, "mouseup")
                expect(buttonIsActive(button)).to.equal(true)
                expect(buttonHasPopup(button)).to.equal(true)

                sendMenuButton(button, "mousedown")
                expect(buttonIsActive(button)).to.equal(true)
                expect(buttonHasPopup(button)).to.equal(true)

                sendMenuButton(button, "mouseup")
                expect(buttonIsActive(button)).to.equal(false)
                expect(buttonHasPopup(button)).to.equal(false)
            })

            it("menu closes after clicking neighbouring button", function() {
                document.body.innerHTML = testData
                let file = findMenuButton("file")
                let edit = findMenuButton("edit")

                sendMenuButton(file, "mouseover")
                expect(buttonIsActive(file)).to.equal(false)
                expect(buttonHasPopup(file)).to.equal(false)

                sendMenuButton(file, "mousedown")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)

                sendMenuButton(file, "mouseup")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)

                sendMenuButton(file, "mouseout")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                sendMenuButton(edit, "mouseover")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                expect(buttonIsActive(edit)).to.equal(false)
                expect(buttonHasPopup(edit)).to.equal(false)

                sendMenuButton(edit, "mousedown")
                expect(buttonIsActive(file)).to.equal(false)
                expect(buttonHasPopup(file)).to.equal(false)
                expect(buttonIsActive(edit)).to.equal(true)
                expect(buttonHasPopup(edit)).to.equal(true)

                sendMenuButton(edit, "mouseup")
                expect(buttonIsActive(file)).to.equal(false)
                expect(buttonHasPopup(file)).to.equal(false)
                expect(buttonIsActive(edit)).to.equal(true)
                expect(buttonHasPopup(edit)).to.equal(true)
            })
            
            it("menu closes along with it's children after clicking neighbouring button", function() {
                document.body.innerHTML = testData
                let file = findMenuButton("file")
                let edit = findMenuButton("edit")

                sendMenuButton(edit, "mouseover")
                expect(buttonIsActive(edit)).to.equal(false)
                expect(buttonHasPopup(edit)).to.equal(false)

                sendMenuButton(edit, "mousedown")
                expect(buttonIsActive(edit)).to.equal(true)
                expect(buttonHasPopup(edit)).to.equal(true)

                sendMenuButton(edit, "mouseup")
                expect(buttonIsActive(edit)).to.equal(true)
                expect(buttonHasPopup(edit)).to.equal(true)

                sendMenuButton(edit, "mouseout")
                expect(buttonIsActive(edit)).to.equal(true)
                expect(buttonHasPopup(edit)).to.equal(true)
                
                let search = findMenuButton("search")
                sendMenuButton(search, "mouseover")
                expect(buttonIsActive(edit)).to.equal(true)
                expect(buttonHasPopup(edit)).to.equal(true)
                expect(buttonIsActive(search)).to.equal(false)
                expect(buttonHasPopup(search)).to.equal(false)

                sendMenuButton(search, "mousedown")
                expect(buttonIsActive(edit)).to.equal(true)
                expect(buttonHasPopup(edit)).to.equal(true)
                expect(buttonIsActive(search)).to.equal(true)
                expect(buttonHasPopup(search)).to.equal(true)

                sendMenuButton(search, "mouseup")
                expect(buttonIsActive(edit)).to.equal(true)
                expect(buttonHasPopup(edit)).to.equal(true)
                expect(buttonIsActive(search)).to.equal(true)
                expect(buttonHasPopup(search)).to.equal(true)
                
                sendMenuButton(search, "mouseout")
                expect(buttonIsActive(edit)).to.equal(true)
                expect(buttonHasPopup(edit)).to.equal(true)
                expect(buttonIsActive(search)).to.equal(true)
                expect(buttonHasPopup(search)).to.equal(true)

                sendMenuButton(file, "mouseover")
                expect(buttonIsActive(file)).to.equal(false)
                expect(buttonHasPopup(file)).to.equal(false)
                expect(buttonIsActive(edit)).to.equal(true)
                expect(buttonHasPopup(edit)).to.equal(true)
                expect(buttonIsActive(search)).to.equal(true)
                expect(buttonHasPopup(search)).to.equal(true)

                sendMenuButton(file, "mousedown")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                expect(buttonIsActive(edit)).to.equal(false)
                expect(buttonHasPopup(edit)).to.equal(false)
                expect(buttonIsActive(search)).to.equal(false)
                expect(buttonHasPopup(search)).to.equal(false)

                sendMenuButton(file, "mouseup")
            })

        })
        
        describe("drag interaction", function() {
            it("down, drag to entry and up", function() {
                document.body.innerHTML = testData
                let file = findMenuButton("file")
                expect(buttonIsActive(file)).to.equal(false)
                expect(buttonHasPopup(file)).to.equal(false)

                sendMenuButton(file, "mouseover")
                expect(buttonIsActive(file)).to.equal(false)
                expect(buttonHasPopup(file)).to.equal(false)

                sendMenuButton(file, "mousedown")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                
                sendMenuButton(file, "mouseout")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                
                let newFile = findMenuButton("new")
                expect(buttonIsActive(newFile)).to.equal(false)
                expect(buttonHasPopup(newFile)).to.equal(false)

                sendMenuButton(newFile, "mouseover")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                expect(buttonIsActive(newFile)).to.equal(true)
                expect(buttonHasPopup(newFile)).to.equal(false)
                
                sendMenuButton(newFile, "mouseout")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                expect(buttonIsActive(newFile)).to.equal(false)
                expect(buttonHasPopup(newFile)).to.equal(false)

                let open = findMenuButton("open")
                sendMenuButton(open, "mouseover")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                expect(buttonIsActive(newFile)).to.equal(false)
                expect(buttonHasPopup(newFile)).to.equal(false)
                expect(buttonIsActive(open)).to.equal(true)
                expect(buttonHasPopup(open)).to.equal(false)
                
                sendMenuButton(open, "mouseup")
            })

            it("down, drag to entry, drag away and back again", function() {
                document.body.innerHTML = testData
                let file = findMenuButton("file")
                expect(buttonIsActive(file)).to.equal(false)
                expect(buttonHasPopup(file)).to.equal(false)

                sendMenuButton(file, "mouseover")
                expect(buttonIsActive(file)).to.equal(false)
                expect(buttonHasPopup(file)).to.equal(false)

                sendMenuButton(file, "mousedown")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                
                sendMenuButton(file, "mouseout")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                
                let newFile = findMenuButton("new")
                expect(buttonIsActive(newFile)).to.equal(false)
                expect(buttonHasPopup(newFile)).to.equal(false)

                sendMenuButton(newFile, "mouseover")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                expect(buttonIsActive(newFile)).to.equal(true)
                expect(buttonHasPopup(newFile)).to.equal(false)
                
                sendMenuButton(newFile, "mouseout")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                expect(buttonIsActive(newFile)).to.equal(false)
                expect(buttonHasPopup(newFile)).to.equal(false)

                sendMenuButton(newFile, "mouseover")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                expect(buttonIsActive(newFile)).to.equal(true)
                expect(buttonHasPopup(newFile)).to.equal(false)

                sendMenuButton(newFile, "mouseup")
            })

            it("down, drag to entry, drag to parent button", function() {
                document.body.innerHTML = testData
                let file = findMenuButton("file")
                expect(buttonIsActive(file)).to.equal(false)
                expect(buttonHasPopup(file)).to.equal(false)

                sendMenuButton(file, "mouseover")
                expect(buttonIsActive(file)).to.equal(false)
                expect(buttonHasPopup(file)).to.equal(false)

                sendMenuButton(file, "mousedown")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                
                sendMenuButton(file, "mouseout")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                
                let newFile = findMenuButton("new")
                expect(buttonIsActive(newFile)).to.equal(false)
                expect(buttonHasPopup(newFile)).to.equal(false)

                sendMenuButton(newFile, "mouseover")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                expect(buttonIsActive(newFile)).to.equal(true)
                expect(buttonHasPopup(newFile)).to.equal(false)
                
                sendMenuButton(newFile, "mouseout")
                expect(buttonIsActive(file)).to.equal(true)
                expect(buttonHasPopup(file)).to.equal(true)
                expect(buttonIsActive(newFile)).to.equal(false)
                expect(buttonHasPopup(newFile)).to.equal(false)

                let edit = findMenuButton("edit")
                sendMenuButton(edit, "mouseover")
                expect(buttonIsActive(file)).to.equal(false)
                expect(buttonHasPopup(file)).to.equal(false)
                expect(buttonIsActive(newFile)).to.equal(false)
                expect(buttonHasPopup(newFile)).to.equal(false)
                expect(buttonIsActive(edit)).to.equal(true)
                expect(buttonHasPopup(edit)).to.equal(true)

                sendMenuButton(edit, "mouseup")
            })

        })
        
        describe("basics", function() {
            it("collapse", function() {
                document.body.innerHTML = testData
                let edit = findMenuButton("edit")
                sendMenuButton(edit, "mouseover")
                sendMenuButton(edit, "mousedown")
                sendMenuButton(edit, "mouseup")
                sendMenuButton(edit, "mouseout")
                
                let search = findMenuButton("search")
                sendMenuButton(search, "mouseover")
                sendMenuButton(search, "mousedown")
                sendMenuButton(search, "mouseup")
                sendMenuButton(search, "mouseout")

                let forward = findMenuButton("forward")
                sendMenuButton(forward, "mouseover")
                sendMenuButton(forward, "mousedown")
                sendMenuButton(forward, "mouseup")
                
                expect(buttonIsActive(edit)).to.equal(false)
                expect(buttonHasPopup(edit)).to.equal(false)
                expect(buttonIsActive(search)).to.equal(false)
                expect(buttonHasPopup(search)).to.equal(false)
                expect(buttonIsActive(forward)).to.equal(false)
                expect(buttonHasPopup(forward)).to.equal(false)
            })
            
            it("element order", function() {
                document.body.innerHTML = `
                  <div>
                    <div id="first">
                      <div>
                        <div>
                        </div>
                      </div>
                      <div>
                        <div id="alfa">
                        </div>
                      </div>
                      <div>
                        <div>
                        </div>
                      </div>
                    </div>
                    <div id="second">
                      <div>
                        <div>
                        </div>
                      </div>
                      <div>
                        <div id="bravo">
                        </div>
                      </div>
                      <div>
                        <div>
                        </div>
                      </div>
                    </div>
                  </div>
                `
                let alfa = document.getElementById("alfa")
                let bravo = document.getElementById("bravo")
                
                if (alfa && bravo) {
                  expect(dom.isNodeBeforeNode(alfa, bravo)).to.equal(true)
                  expect(dom.isNodeBeforeNode(bravo, alfa)).to.equal(false)
                }
            })
        })
        
        describe("actions", function() {
            it("create action before menubar", function() {
                globalController.clear()
                
                let actionTriggered = false
                action("file|new", () => {
                  actionTriggered = true
                })
            
                document.body.innerHTML = testData
                
                let file = findMenuButton("file")
                sendMenuButton(file, "mouseover")
                sendMenuButton(file, "mousedown")
                sendMenuButton(file, "mouseout")
                let newFile = findMenuButton("new")
                sendMenuButton(newFile, "mouseover")
                sendMenuButton(newFile, "mouseup")
                
                expect(actionTriggered).to.equal(true)
            })

            it("create action after menubar", function() {
                globalController.clear()

                document.body.innerHTML = testData
                
                let actionTriggered = false
                action("file|new", () => {
                  actionTriggered = true
                })
            
                let file = findMenuButton("file")
                sendMenuButton(file, "mouseover")
                sendMenuButton(file, "mousedown")
                sendMenuButton(file, "mouseout")
                let newFile = findMenuButton("new")
                sendMenuButton(newFile, "mouseover")
                sendMenuButton(newFile, "mouseup")
                
                expect(actionTriggered).to.equal(true)
            })
        })
        
        function buttonHasPopup(button: MenuButton): boolean {
            if (!button.popup)
                return false
            return button.popup.style.display != "none"
        }
        
        function buttonIsActive(button: MenuButton): boolean {
            return button.classList.contains("active")
        }

        function sendMenuButton(button: MenuButton, eventName: string): void {
            button.dispatchEvent(new Event(eventName))
        }
        
        function findMenuButton(title: string): MenuButton {
            let btn = findMenuButtonHelper(title, document.body)
            if (!btn)
              throw Error("findMenuButton('"+title+"'): failed to find button")
            return btn
        }
        
        function findMenuButtonHelper(title: string, node?: Element): MenuButton | undefined {
            if (!node)
                node = document.body
            
            if (node.nodeName === "TOAD-MENUBUTTON") {
                let btn = node as MenuButton
                if (btn.node && btn.node.title === title)
                    return btn
            }
            
            for(let child of node.shadowRoot ? node.shadowRoot.children : node.children) {
                let btn = findMenuButtonHelper(title, child as Element)
                if (btn)
                    return btn
            }
            return undefined
        }
        
    })
})

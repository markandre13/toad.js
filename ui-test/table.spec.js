describe("toad", function() {
    describe("<toad-table>, TableModel and SelectionModel", function() {
    
        let html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Workflow</title>
    <script type="application/javascript" src="http://127.0.0.1:8080/polyfill/webcomponents-lite.min.js"></script>
    <script type="application/javascript" src="http://127.0.0.1:8080/polyfill/path-data-polyfill.js"></script>
    <script type="application/javascript" src="http://127.0.0.1:8080/js/toad.min.js"></script>
  </head>
  <body>
    <toad-text id="first"></toad-text>
    <toad-table id="middle" model="books"></toad-table>
    <toad-text id="last"></toad-text>
    <script>
      try {
      class MyTableModel extends toad.TableModel {
        constructor() {
          super()
          this.data = [
            [ "The Moon Is A Harsh Mistress", "Robert A. Heinlein", 1966 ],
            [ "Stranger In A Strange Land", "Robert A. Heinlein", 1961 ],
            [ "The Fountains of Paradise", "Arthur C. Clarke", 1979],
            [ "Rendezvous with Rama", "Arthur C. Clarke", 1973 ],
            [ "2001: A Space Odyssey", "Arthur C. Clarke", 1968 ],
            [ "Do Androids Dream of Electric Sheep?", "Philip K. Dick", 1968],
            [ "A Scanner Darkly", "Philip K. Dick", 1977],
            [ "Second Variety", "Philip K. Dick", 1953]
          ]
          this.rows = this.data.length
          this.cols = this.data[0].length
        }
        getColumnHead(column) {
          switch(column) {
            case 0: return new toad.TextModel("Title")
            case 1: return new toad.TextModel("Author")
            case 2: return new toad.TextModel("Year")
          }
          throw Error("fuck")
        }
        getFieldModel(col, row) {
          let model = new toad.TextModel(this.data[row][col])
          model.modified.add( () => {
            this.data[row][col] = model.value
            this.modified.trigger()
          })
          return model
        }
        getFieldView(col, row) {
          return new toad.TextView()
        }
      }
      let dataModel = new MyTableModel()
      let storage = []
      for(let y=0; y<dataModel.rows; ++y) {
        let row = []
        storage.push(row)
        for(let x=0; x<dataModel.cols; ++x) {
          let element = document.createElement("input")
          element.id = "x"+x+"y"+y
          element.value = dataModel.data[x][y]
          document.body.appendChild(element)
          row.push(element)
        }
      }
      dataModel.modified.add( () => {
        for(let y=0; y<dataModel.rows; ++y) {
          for(let x=0; x<dataModel.cols; ++x) {
            storage[y][x].value = dataModel.data[y][x]
          }
        }
      })
      toad.bind("books", dataModel)
      
      let selection = document.createElement("input")
      selection.id = "selection"
      document.body.appendChild(selection)

      let selectionModel = new toad.SelectionModel()
      selectionModel.mode = toad.TableEditMode.EDIT_CELL
      selectionModel.modified.add( () => {
        selection.value = selectionModel.col + "," + selectionModel.row
      })
      toad.bind("books", selectionModel)
    } catch(e) {
      console.log("caught error", e.stack)
    }
    </script>
  </body>
</html>`
    
        describe("keyboard interaction", function() {
            it.only("tab forward/backwards selects first/last field", async function() {
                const page = await browser.newPage()

                page.on("console", msg => {
                    for (let i = 0; i < msg.args().length; ++i)
                        console.log(`${i}: ${msg.args()[i]}`)
                })
                page.setContent(html)
                await page.keyboard.type("Ok", {delay: 100})

                const first = await page.$("#first")
                const last = await page.$("#last")
                await first.click()

                await page.keyboard.press("Tab")
                for(let i=0; i<28; ++i)
                  await page.keyboard.press("Backspace")
                await page.keyboard.type("alfa")

                var value
                value = await page.evaluate(() => document.querySelector("#x0y0").value)
                expect(value).to.equal("alfa")
                
                await last.click()

                await page.keyboard.down("Shift")
                await page.keyboard.press("Tab")
                await page.keyboard.up("Shift")
                
                for(let i=0; i<4; ++i)
                  await page.keyboard.press("Backspace")
                await page.keyboard.type("bravo")
                
                value = await page.evaluate(() => document.querySelector("#x2y7").value)
                expect(value).to.equal("bravo")

                await first.click()
                
                await page.keyboard.press("Tab")
                
                for(let i=0; i<4; ++i)
                  await page.keyboard.press("Backspace")
                await page.keyboard.type("charly")

                value = await page.evaluate(() => document.querySelector("#x0y0").value)
                expect(value).to.equal("charly")

                await page.close()
            })
        })
        describe("mouse interaction", function() {
        })
        describe("data model", function() {
        })
        describe.only("selection model", function() {
            it("selection model updates in EDIT_CELL mode", async function() {
                const page = await browser.newPage()

                page.on("console", msg => {
                    for (let i = 0; i < msg.args().length; ++i)
                        console.log(`${i}: ${msg.args()[i]}`)
                })
                page.setContent(html)
                await page.keyboard.type("Ok", {delay: 100})

                const first = await page.$("#first")
                const last = await page.$("#last")
                await first.click()
                
                await page.keyboard.press("Tab")
                await page.keyboard.press("Tab")
                
                var value
                value = await page.evaluate(() => document.querySelector("#selection").value)
                expect(value).to.equal("1,0")
                
                await page.keyboard.press("Tab")
                value = await page.evaluate(() => document.querySelector("#selection").value)
                expect(value).to.equal("2,0")

                await page.keyboard.press("Tab")
                value = await page.evaluate(() => document.querySelector("#selection").value)
                expect(value).to.equal("0,1")
            })
        })
        describe("action model", function() {
        })
        
    })
    
})

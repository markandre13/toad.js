import { expect } from '@esm-bundle/chai'
import { unbind } from "@toad/controller/globalController"
import { Tabs, Tab } from "@toad/view/Tab"

import { style as txBase } from "@toad/style/tx"
import { style as txStatic } from "@toad/style/tx-static"
import { style as txDark } from "@toad/style/tx-dark"

import { getByText, click } from "../testlib"

describe("view", function () {

    beforeEach(async function () {
        unbind()
        document.body.replaceChildren()
        document.head.replaceChildren(txBase, txStatic, txDark)
    })

    describe("Tab", function () {

        describe("instantiation", function () {

            it("HTML", function () {
                document.body.innerHTML = `
                    <tx-tabs>
                        <tx-tab label="Uno">T1</tx-tab>
                        <tx-tab label="Duo">T2</tx-tab>
                        <tx-tab label="Tres">T3</tx-tab>
                    </tx-tabs>
                `
                const t1 = getByText("T1") as HTMLElement
                const t2 = getByText("T2") as HTMLElement
                const t3 = getByText("T3") as HTMLElement

                expect(t1.style.display).to.equal("")
                expect(t2.style.display).to.equal("none")
                expect(t3.style.display).to.equal("none")

                click(getByText("Duo")!)

                expect(t1.style.display).to.equal("none")
                expect(t2.style.display).to.equal("")
                expect(t3.style.display).to.equal("none")
            })

            it("JSX", function () {
                document.body.replaceChildren(
                    <Tabs>
                        <Tab label="Uno">T1</Tab>
                        <Tab label="Duo">T2</Tab>
                        <Tab label="Tres">T3</Tab>
                    </Tabs>
                )
                const t1 = getByText("T1") as HTMLElement
                const t2 = getByText("T2") as HTMLElement
                const t3 = getByText("T3") as HTMLElement

                expect(t1.style.display).to.equal("")
                expect(t2.style.display).to.equal("none")
                expect(t3.style.display).to.equal("none")

                click(getByText("Duo")!)

                expect(t1.style.display).to.equal("none")
                expect(t2.style.display).to.equal("")
                expect(t3.style.display).to.equal("none")
            })
        })

        describe("layout", function () {
            it.only("makehuman.js", function () {
                document.body.innerHTML = `
                    <tx-tabs style="position: absolute; inset: 0;">
                        <tx-tab label="Uno">
                            <div style="background: #f80; position: relative; inset: 0;">T1</div>
                        </tx-tab>
                        <tx-tab label="Duo">T2</tx-tab>
                        <tx-tab label="Tres">T3</tx-tab>
                    </tx-tabs>
                `
                const table = document.querySelector("tx-tabs") as Tabs
                const bounds = table.getBoundingClientRect()
                expect(bounds.width).to.equal(window.innerWidth)
                expect(bounds.height).to.equal(window.innerHeight)
            })
        })
    })
})

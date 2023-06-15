import { expect } from '@esm-bundle/chai'
import { unbind } from "@toad/controller/globalController"
import { Tabs, Tab } from "@toad/view/Tab"
import { EnumModel } from '@toad/model/EnumModel'
import { html } from '@toad/util/lsx'

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
        describe("HTML", () => {
            it("no model, click changes tab", function () {
                document.body.innerHTML = html`
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
        })
        describe("JSX", function () {
            it("no model, click changes tab", function () {
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
            it("model defines initial tab", function () {

                enum TAB { UNO, DUO, TRES }
                const model = new EnumModel(TAB.DUO, TAB)

                document.body.replaceChildren(
                    <Tabs model={model}>
                        <Tab value={TAB.UNO} label="Uno">T1</Tab>
                        <Tab value={TAB.DUO} label="Duo">T2</Tab>
                        <Tab value={TAB.TRES} label="Tres">T3</Tab>
                    </Tabs>
                )

                const t1 = getByText("T1") as HTMLElement
                const t2 = getByText("T2") as HTMLElement
                const t3 = getByText("T3") as HTMLElement

                expect(t1.style.display).to.equal("none")
                expect(t2.style.display).to.equal("")
                expect(t3.style.display).to.equal("none")
            })

            it("model changes with active tab", function () {

                enum TAB { UNO, DUO, TRES }
                const model = new EnumModel(TAB.UNO, TAB)

                document.body.replaceChildren(
                    <Tabs model={model}>
                        <Tab value={TAB.UNO} label="Uno">T1</Tab>
                        <Tab value={TAB.DUO} label="Duo">T2</Tab>
                        <Tab value={TAB.TRES} label="Tres">T3</Tab>
                    </Tabs>
                )
                click(getByText("Duo")!)
                expect(model.value).to.equal(TAB.DUO)
            })
        })
        it("layout", function () {
            document.body.innerHTML = `
                    <tx-tabs style="position: absolute; inset: 0;">
                        <tx-tab label="Uno">
                            <div style="background: #f80; position: relative; inset: 0;">T1</div>
                        </tx-tab>
                        <tx-tab label="Duo">T2</tx-tab>
                        <tx-tab label="Tres">T3</tx-tab>
                    </tx-tabs>
                `
            const table = document.querySelector("tx-tabs") as Tabs<unknown>
            const bounds = table.getBoundingClientRect()
            expect(bounds.width).to.equal(window.innerWidth)
            expect(bounds.height).to.equal(window.innerHeight)
        })
    })
})

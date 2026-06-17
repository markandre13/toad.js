import { EnumModel } from "@toad/appkit/EnumModel"
import { Tabs, Tab } from "@toad/viewkit/Tab"
import { initHistoryManager, TAB } from "./history"
import { loadFont } from "@toad/util/loadFont"
import { loadStyle } from "@toad/util/loadStyle"
import type { JSX } from "toad.jsx"
// import { replaceChildren } from "toad.jsx"

window.onload = () => {
    const tabModel = new EnumModel(TAB.INTRODUCTION, TAB)
    initHistoryManager(tabModel)
    loadFont()
    loadStyle()
    replaceChildren(document.body, <>
        <p style={{ textAlign: "center" }}>
            <img src="static/toad.gif" alt="TOAD" />
            <br />
            Web Edition
        </p>
        <Tabs orientation="vertical" model={tabModel}>
            <Tab value={TAB.INTRODUCTION} label="Introduction" content={() => import("./00_introduction")} />
            <Tab value={TAB.DEMO} label="Demo" content={() => import("./01_demo")} />
            <Tab value={TAB.FORM} label="Form" content={() => import("./02_form")} />
            <Tab value={TAB.ACTION} label="Action" content={() => import("./03_action")} />
            <Tab value={TAB.TEXT} label="Text" content={() => import("./04_text")} />
            <Tab value={TAB.NUMBER} label="Number" content={() => import("./05_number")} />
            <Tab value={TAB.BOOLEAN} label="Boolean" content={() => import("./06_boolean")} />
            <Tab value={TAB.CHOICE} label="Choice" content={() => import("./07_choice")} />
            <Tab value={TAB.TABLE} label="Table" content={() => import("./08_table")} />
            <Tab value={TAB.TABS} label="Tabs" content={() => import("./09_tabs")} />
        </Tabs>
    </>)
}

function replaceChildren(parent: Element, content: JSX.Element) {
    if (Array.isArray(content)) {
        if (content.length === 1 && Array.isArray(content[0])) {
            parent.replaceChildren(...content[0] as any[])
        } else {
            parent.replaceChildren(...content as any[])
        }
    } else {
        parent.replaceChildren(content as any)
    }
}
import { EnumModel } from "@toad/model/EnumModel"
import { Tabs, Tab } from "@toad/view/Tab"
import { initHistoryManager, TAB } from "./history"
import { loadFont } from "@toad/util/loadFont"
import { loadStyle } from "@toad/util/loadStyle"

window.onload = () => {
    const tabModel = new EnumModel(TAB.INTRODUCTION, TAB)
    initHistoryManager(tabModel)
    loadFont()
    loadStyle()

    document.body.replaceChildren(
        ...(
            <>
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
            </>
        )
    )
}

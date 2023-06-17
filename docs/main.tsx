import { EnumModel } from "@toad/model/EnumModel"
import { Tabs, Tab } from "@toad/view/Tab"
import { initHistoryManager, TAB } from "./history"

window.onload = () => {
    const tabModel = new EnumModel(TAB.INTRODUCTION, TAB)
    initHistoryManager(tabModel)

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
                    <Tab value={TAB.FORM} label="Form" content={() => import("./01_form")} />
                    <Tab value={TAB.ACTION} label="Action" content={() => import("./02_action")} />
                    <Tab value={TAB.TEXT} label="Text" content={() => import("./03_text")} />
                    <Tab value={TAB.NUMBER} label="Number" content={() => import("./04_number")} />
                    <Tab value={TAB.BOOLEAN} label="Boolean" content={() => import("./05_boolean")} />
                    <Tab value={TAB.CHOICE} label="Choice" content={() => import("./06_choice")} />
                    <Tab value={TAB.TABLE} label="Table" content={() => import("./07_table")} />
                </Tabs>
            </>
        )
    )
}

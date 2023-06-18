import { EnumModel } from "@toad"

export enum TAB {
    INTRODUCTION = "introduction",
    FORM = "form",
    ACTION = "action",
    TEXT = "text",
    NUMBER = "number",
    BOOLEAN = "boolean",
    CHOICE = "choice",
    TABLE = "table",
    TABS = "tabs",
}

function makeUrl(tabModel: EnumModel<TAB>) {
    return `${location.origin}${location.pathname}#${tabModel.value}`
}

export function initHistoryManager(tabModel: EnumModel<TAB>) {
    if (location.hash.length > 1) {
        const value = location.hash.substring(1) as any
        // tabModel.value = parseInt(value)
        if (tabModel.indexOf(value) === undefined) {
            history.replaceState(undefined, "", makeUrl(tabModel))
        } else {
            tabModel.value = value
        }
    } else {
        // set an initial hash so that we do not have to deal with an non-empty hash in the code
        history.replaceState(undefined, "", makeUrl(tabModel))
    }

    // adjust state when moving back and forward
    window.onpopstate = (ev: PopStateEvent) => {
        // console.log(`POPSTATE MODEL := ${location.hash}`)
        if (location.hash.length > 1) {
            // tabModel.value = parseInt(location.hash.substring(1))
            tabModel.value = location.hash.substring(1) as any
        } else {
            tabModel.value = TAB.INTRODUCTION
        }
    }

    // push state when the user switches tabs
    tabModel.modified.add((tab) => {
        // console.log(`MODEL CHANGE, PUSHSTATE = ${location.hash}`)
        if (location.hash !== `#${tab}`) {
            history.pushState(undefined, "", makeUrl(tabModel))
        }
    })
}

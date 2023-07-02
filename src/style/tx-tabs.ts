import { css } from "src/util/lsx"

export const style = new CSSStyleSheet()
style.replaceSync(css`
    /*
     * tabs, line, content
     */
    :host {
        /* position: relative; */
        display: grid;
        /* flex-wrap: nowrap; */
        /* box-sizing: border-box; */
        margin: 0;
        padding: 0;
    }
    :host(:not(.tx-vertical)) {
        /* flex-direction: column; */
        /* display: grid; */
        /* height: */
        grid-template-rows: 0 max-content auto;
        grid-template-columns: 1;
        /* https://stackoverflow.com/questions/43311943/prevent-content-from-expanding-grid-items */
        /* https://www.w3.org/TR/css3-grid-layout/#min-size-auto */
        min-width: 0;
    }
    :host(.tx-vertical) {
        grid-template-rows: 1;
        grid-template-columns: 0 max-content auto;
        min-height: 0;
    }

    /*
     * tabs
     */
    :host > ul {
        display: flex;
        flex-wrap: nowrap;
        list-style: none;
        box-sizing: border-box;
        padding: 0;
        margin: 0;
    }
    :host(:not(.tx-vertical)) > ul {
        flex-direction: row;
        border-bottom: 2px solid var(--tx-gray-200);
    }
    :host(.tx-vertical) > ul {
        flex-direction: column;
         border-left: 2px solid var(--tx-gray-200);
    }
    :host > ul > li {
        box-sizing: border-box;
        list-style: none;
    }

    /*
     * label
     */
    :host > ul > li > span {
        display: block;
        list-style: none;
        font-weight: 500;
        margin: 8px 12px 8px 12px;
        color: var(--tx-gray-700);
        cursor: pointer;
    }
    :host(.tx-vertical) > ul > li > span {
        margin: 0;
        padding: 12px 8px 12px 8px;
    }
    :host > ul > li > span.active {
        color: var(--tx-gray-900);
    }
    :host > ul > li > span:hover {
        color: var(--tx-gray-900);
    }

    /*
     * line
     */
    .line-container {
        position: relative;
        overflow: none;
    }
    :host > .line-container > .line {
        position: absolute;
        background-color: var(--tx-gray-900);
        pointer-events: none;
    }
    :host(:not(.tx-vertical)) > .line-container > .line {
        transition: left 0.5s ease-in-out, width 0.5s 0.1s;
        /* position: relative; below labels */
        top: 0px;
        height: 2px;
        left: 12px;
        width: 0px;
    }
    :host(.tx-vertical) > .line-container > .line {
        transition: top 0.5s ease-in-out, width 0.5s 0.1s;
        /* position: absolute; */
        left: 0; /* before labels */
        height: 0px;
        width: 2px;
    }

    /*
     * content
     */
    .content {
        overflow: auto;
    }
`)

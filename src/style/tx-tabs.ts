import { css } from 'src/util/lsx'

export const style = document.createElement("style")
style.textContent = css`
/* Layout */

:host(.tx-tabs) {
    position: relative;
    display: inline-grid;
    box-sizing: border-box;
}

:host(.tx-tabs.tx-vertical) {
    grid-template-columns: min-content auto;
}

:host(.tx-tabs.tx-vertical) > ul {
    grid-column: 1/1;
    grid-row: 1/1;
}

:host(.tx-tabs.tx-vertical) > .content {
    grid-column: 2/2;
    grid-row: 1/1;
    padding-left: 15px;
}

:host(.tx-tabs:not(.tx-vertical)) > ul {
    grid-column: 1/1;
    grid-row: 1/1;
}

:host(.tx-tabs:not(.tx-vertical)) > .content {
    grid-column: 1/1;
    grid-row: 2/2;
    padding-top: 15px;
}

/* Look */

:host(.tx-tabs) > ul {
    display: inline-flex;
    flex-wrap: wrap;
    list-style: none;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    background-color: var(--tx-gray-50);
}

:host(.tx-tabs.tx-vertical) > ul {
    border-left: 2px solid var(--tx-gray-200);
}

:host(.tx-tabs:not(.tx-vertical)) > ul {
    border-bottom: 2px solid var(--tx-gray-200);
}

:host(.tx-tabs.tx-vertical) > ul {
    flex-direction: column;
}

:host(.tx-tabs) > ul > li {
    box-sizing: border-box;
    list-style: none;
}

:host(.tx-tabs) > ul > li > span {
    display: block;
    list-style: none;
    font-weight: 500;
    margin: 8px 12px 8px 12px;
    color: var(--tx-gray-700);
    cursor: pointer;
}

:host(.tx-tabs.tx-vertical) > ul > li > span {
    margin: 0;
    padding: 12px 8px 12px 8px;
}

:host(.tx-tabs) > ul > li > span.active {
    color: var(--tx-gray-900);
}

:host(.tx-tabs) > ul > li > span:hover {
    color: var(--tx-gray-900);
}

/* the line to mark the active tab */

:host(.tx-tabs:not(.tx-vertical)) > div.line  {
    grid-row: 1/1;
    position: absolute;
    bottom: 0;
    transition: left 0.5s ease-in-out, width 0.5s 0.10s;
    height: 2px;
    background-color: var(--tx-gray-900);
    left: 12px;
    width: 0px;
    pointer-events: none;
}

:host(.tx-tabs.tx-vertical) > div.line  {
    grid-column: 1/1;
    position: absolute;
    left: 0;
    transition: top 0.5s ease-in-out, height 0.5s 0.10s;
    height: 0px;
    background-color: var(--tx-gray-900);
    top: 8px;
    width: 2px;
    pointer-events: none;
}
`

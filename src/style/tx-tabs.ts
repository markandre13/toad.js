import { css } from 'src/util/lsx'

export const style = document.createElement("style")
style.textContent = css`
/*
  tabs, line, content
*/
:host(.tx-tabs) {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    box-sizing: border-box;
}
:host(.tx-tabs:not(.tx-vertical)) {
    flex-direction: column;
}
:host(.tx-tabs.tx-vertical) {
    flex-direction: row;
}

/*
 * tabs
 */
:host(.tx-tabs) > ul {
    display: flex;
    flex-wrap: nowrap;
    list-style: none;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
}
:host(.tx-tabs:not(.tx-vertical)) > ul {
    flex-direction: row;
    border-bottom: 2px solid var(--tx-gray-200);
}
:host(.tx-tabs.tx-vertical) > ul {
    border-left: 2px solid var(--tx-gray-200);
    flex-direction: column;
}
:host(.tx-tabs) > ul > li {
    box-sizing: border-box;
    list-style: none;
}

/*
 * label
 */
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

/*
 * line
 */
:host(.tx-tabs) > div.line {
    background-color: var(--tx-gray-900);
    pointer-events: none;
}
:host(.tx-tabs:not(.tx-vertical)) > div.line  {
    transition: left 0.5s ease-in-out, width 0.5s 0.10s;
    position: relative; /* below labels */
    top: 0px;
    height: 2px;
    left: 12px;
    width: 0px;
}
:host(.tx-tabs.tx-vertical) > div.line  {
    transition: top 0.5s ease-in-out, width 0.5s 0.10s;
    position: absolute; left: 0; /* before labels */
    height: 0px;
    width: 2px;
}

.content {
    flex-grow: 1;
}

`

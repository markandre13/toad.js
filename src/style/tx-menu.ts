import { css } from 'src/util/lsx'

export const style = new CSSStyleSheet()
style.replaceSync(css`
.tx-popover {
    background-color: var(--tx-gray-50);
    border: 1px solid var(--tx-gray-400);
    border-radius: 4px;
    display: inline-flex;
    flex-direction: column;
    filter: drop-shadow(rgba(0, 0, 0, 0.5) 0px 1px 4px);
}
.tx-menu {
    display: inline-block;
    padding: 0;
    margin: 2px 0 2px 0;
}
.tx-menu > li {
    cursor: pointer;
    display: flex;
    border: none;
    border-left: 2px solid var(--tx-gray-50);
    margin-right: 2px;
    padding: 0;
    margin: 0;
    font-weight: 500;
    outline: none;
}
.tx-menu > li:first-child {
    border-top-right-radius: 4px;
    overflow: hidden;
}
.tx-menu > li:last-child {
    border-bottom-right-radius: 4px;
    overflow: hidden;
}
.tx-menu > li > :first-child {
    padding: 7px 11px 7px 10px;
}
.tx-menu > li:hover {
    background-color: var(--tx-gray-100);
    border-color: var(--tx-gray-100);
}
.tx-menu > li.tx-hover {
    filter: brightness(1.2);
    backdrop-filter: brightness(1.2);
    border-color: var(--tx-gray-100);
}
.tx-menu > li:focus {
    border-left-color: var(--tx-outline-color);
}
.tx-menu > li[role=separator] {
    display: block;
    box-sizing: content-box;
    overflow: visible;
    cursor: default;
    height: 2px;
    padding: 0px;
    margin: 1.5px 7px 1.5px 7px;
    background-color: var(--tx-gray-100);
    white-space: pre;
    list-style-type: none;
}
.tx-menu > li.tx-disabled {
    color: var(--tx-gray-500);
}
.tx-menu > li.tx-disabled:hover {
    background-color: var(--tx-gray-50);
}`)
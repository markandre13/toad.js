import { css } from 'src/util/lsx'

export const style = new CSSStyleSheet()
style.replaceSync(css`
:host {
    position: relative;
    display: inline-block;
    border: 1px solid var(--tx-gray-300);
    border-radius: 3px;
    /* outline-offset: -2px; */
    outline: none;
    font-family: var(--tx-font-family);
    font-size: var(--tx-font-size);
    background: #1e1e1e;

    /* not sure about these */
    /*
    width: 100%;
    width: -moz-available;
    width: -webkit-fill-available;
    width: fill-available;
    height: 100%;
    height: -moz-available;
    height: -webkit-fill-available;
    height: fill-available;
    */

    min-height: 50px;
    min-width: 50px;
}

.staging, .body, .splitBody, .cols, .rows {
    position: absolute;
}

.cols {
    right: 0;
    top: 0;
}

.rows {
    left: 0;
    bottom: 0;
}

.staging {
    overflow: hidden;
    inset: 0;
}

.body {
    overflow: auto;
    inset: 0;
}

.cols, .rows {
    overflow: hidden;
}

.body > span,
.splitBody > span,
.cols > span,
.rows > span,
.measure > span,
.staging > span {
    position: absolute;
    box-sizing: content-box;
    white-space: nowrap;
    outline: none;
    border: solid 1px var(--tx-gray-200);
    padding: 0 2px 0 2px;
    margin: 0;
    background-color: #080808;
    font-weight: 400;
    overflow: hidden;
    cursor: default;
    caret-color: transparent;
}

.seamless > .body > span,
.seamless > .body > .splitBody > span,
.seamless > .cols > span,
.seamless > .rows > span,
.seamless > .cols > .splitBody > span,
.seamless > .rows > .splitBody > span,
.seamless > .measure > span,
.seamless > .staging > span {
    border: none 0px;
}

.body > span:hover {
    background: #1a1a1a;
}

.body > span.error, .splitBody > span.error {
    border-color: var(--tx-global-red-600);
    z-index: 1;
}

.body > span:focus, .splitBody > span:focus {
    background: #0e2035;
    border-color: #2680eb;
    z-index: 2;
}

.body > span.focus-row-head, .splitBody > span.focus-row-head {
    background: #0e2035;
    border-color: #2680eb var(--tx-gray-200) #2680eb #2680eb;
    z-index: 2;
}

.body > span.focus-row-middle, .splitBody > span.focus-row-middle {
    background: #0e2035;
    border-color: #2680eb var(--tx-gray-200) #2680eb var(--tx-gray-200);
    z-index: 2;
}

.body > span.focus-row-tail, .splitBody > span.focus-row-tail {
    background: #0e2035;
    border-color: #2680eb #2680eb #2680eb var(--tx-gray-200);
    z-index: 2;
}

.body > span:focus:hover {
    background: #112d4d;
}

.body > span.error, .splitBody > span.error {
    background-color: #522426;
}

.body > span.error:hover {
    background: #401111;
}

.cols > span.handle,
.rows > span.handle {
    padding: 0;
    border: 0 none;
    opacity: 0;
    background-color: #08f;
}
.fill {
    opacity: 0;
}

.cols > span.handle {
    cursor: col-resize;
}
.rows > span.handle {
    cursor: row-resize;
}

.staging span.head,
.cols span.head,
.rows span.head,
.measure span.head {
    background: #1e1e1e;
    font-weight: 600;
}

.colHack > span,
.cols > span {
    text-align: center;
}

.measure {
    position: absolute;
    opacity: 0;
}

.body > span.edit, .splitBody > span.edit, .body > span.edit:hover, .splitBody > span.edit:hover {
    caret-color: currentcolor;
}
`)
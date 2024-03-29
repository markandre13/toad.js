import { css } from 'src/util/lsx'

export const style = new CSSStyleSheet()
style.replaceSync(css`
.tx-searchwithin {
    display: inline-flex;
    position: relative;
    width: 250px;
    margin-top: 0;
}

/* popup menu */
.tx-searchwithin > button:first-child {
    position: relative;
    box-sizing: border-box;
    overflow: visible;
    text-align: center;
    display: flex;
    flex-shrink: 0;
    height: 32px;
    width: fit-content;

    padding-right: 12px;
    padding-left: 12px;
    margin: 0;

    border: 1px solid var(--tx-gray-400);
    background-color: var(--tx-gray-75);
    outline: none;

    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
}
.tx-searchwithin > button:first-child > span {
    text-align: left;
    flex: 1 1 auto;
    overflow: hidden;

    color: var(--tx-gray-900);  
    font-weight: var(--tx-edit-font-weight);
    font-size: var(--tx-edit-font-size);
    /* line-height: 18px; */
    text-align: center;

    line-height: 26px;
    /* justify-content: center; */
}
.tx-searchwithin > button:first-child > svg {
    display: inline-block;
    position: relative;
    vertical-align: top;
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    margin-left: 8px;
    fill: var(--tx-gray-700);
    transform: rotate(90deg) translate(8px, 0px);
    pointer-events: none;

    vertical-align: top;
    text-align: center;
}

.tx-searchwithin > div {
    display: inline-flex;
    position: relative;
    flex-grow: 1;
}
.tx-searchwithin > div > svg {
    display: block;
    position: absolute;
    height: 18px;
    width: 18px;
    top: 7px;
    left: 10px;
    pointer-events: none;
    overflow: hidden;
    fill: var(--tx-gray-700);
}
.tx-searchwithin > div > input {
    box-sizing: border-box;
    padding: 3px 12px 5px 35px;
    margin: 0;
    border: 1px solid var(--tx-gray-400);
    border-radius: 4px;
    -webkit-appearance: none;
    outline-offset: -2px;
    outline: none;
    width: 100%;
    height: 32px;
    overflow: visible;
    background: var(--tx-gray-50);
    color: var(--tx-gray-900);  
    font-weight: var(--tx-edit-font-weight);
    font-size: var(--tx-edit-font-size);
    line-height: 18px;

    margin-left: -1px;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;

}
/* the button is transparent so that the border of the input field remains visible */
.tx-searchwithin > button:last-child {
    display: inline-flex;
    position: absolute;
    box-sizing: border-box;
    right: 0;
    top: 0;
    bottom: 0;
    width: 32px;
    padding: 0;
    margin: 1px;
    border: none;
    align-items: center;
    justify-content: center;
    overflow: visible;
    vertical-align: top;
    cursor: pointer;
    border-radius: 0 4px 4px 0;
    outline: none;
    text-align: center;

    background-color: var(--tx-gray-50);
    border-radius: 0 4px 4px 0;

}
.tx-searchwithin > button:last-child > svg {
    display: inline-block;
    pointer-events: none;
    height: 10px;
    width: 10px;
    padding: 0;
    margin: 0;
    border: none;
    fill: var(--tx-gray-700);
}
.tx-searchwithin > div > input:hover {
    border-color: var(--tx-gray-500);
}
.tx-searchwithin > div > input:focus {
    border-color: var(--tx-outline-color);
}

.tx-searchwithin > button:first-child:hover {
    border-color: var(--tx-gray-500);
    background-color: var(--tx-gray-50);
}
.tx-searchwithin > button:first-child:hover > svg {
    fill: var(--tx-gray-900);
}

.tx-searchwithin > button:first-child:focus {
    border-color: var(--tx-outline-color);
}
.tx-searchwithin > button:last-child:focus > svg {
    fill: var(--tx-outline-color);
}

.tx-searchwithin > div > input:disabled {
    color: var(--tx-gray-700);
    background-color: var(--tx-gray-200);
    border-color: var(--tx-gray-200);
}
.tx-searchwithin button:disabled {
    background-color: var(--tx-gray-200);
    border-color: var(--tx-gray-200);
}
.tx-searchwithin button:disabled > svg {
    fill: var(--tx-gray-400);
}`)

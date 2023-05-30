
import { css } from 'src/util/lsx'

export const style = new CSSStyleSheet()
style.replaceSync(css`
    :host {
        position: relative;
        box-sizing: content-box;
        display: inline-block;
    }

    :host(:not([orientation="vertical"])) {
        height: 4px;
        width: 100%;
        padding-top: 8px;
        padding-bottom: 8px;
    }

    :host([orientation="vertical"]) {
        width: 4px;
        height: 100%;
        padding-left: 8px;
        padding-right: 8px;
    }

    .tx-rail {
        background-color: var(--tx-gray-500);
        position: absolute;
        display: block;
        border-radius: 2px;
    }

    :host(:not([orientation="vertical"])) .tx-rail {
        top: 50%;
        width: 100%;
        height: 4px;
        transform: translateY(-50%);
    }

    :host([orientation="vertical"]) .tx-rail {
        left: 50%;
        height: 100%;
        width: 4px;
        transform: translateX(-50%);
    }

    .tx-track {
        background-color: var(--tx-gray-700);
        position: absolute;
        display: block;
        border-radius: 2px;
    }

    :host(:not([orientation="vertical"])) .tx-track {  
        top: 50%;
        height: 4px;
        transform: translateY(-50%);
    }

    :host([orientation="vertical"]) .tx-track {  
        left: 50%;
        width: 4px;
        transform: translateX(-50%);
    }

    .tx-thumb {
        border: 2px solid var(--tx-gray-700); /* knob border */
        border-radius: 50%;
        background: var(--tx-gray-75); /* inside knob */
        cursor: pointer;
        position: absolute;
        display: flex;
        width: 14px;
        height: 14px;
        box-sizing: border-box;
        outline-width: 0px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
    }

    :host(:not([orientation="vertical"])) .tx-thumb { 
        top: 50%;
    }
    :host([orientation="vertical"]) .tx-thumb { 
        left: 50%;
    }

    .tx-focus {
        outline: 2px solid;
        outline-color: var(--tx-outline-color);
        outline-offset: 1px;
    }

    .tx-thumb>input {
        border: 0;
        clip: rect(0, 0, 0, 0);
        width: 100%;
        height: 100%;
        margin: -1px;
        /* this hides most of the slider and centers the thumb */
        overflow: hidden;
        position: absolute;
        white-space: nowrap;
        direction: ltr;
    }
`)
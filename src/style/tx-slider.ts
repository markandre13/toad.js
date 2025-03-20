
import { css } from 'src/util/lsx'

// rail disabled: 3f3f3f
// thumb disabled: 6a6a6a

// rail enabled: 4b4b4b
// track/rail filled: a3a3a3
// thumb enabled: d0d0d0
// thumb hover: ebebeb

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

    .tx-space {
        position: absolute;
        box-sizing: content-box;
        padding: 0;
        margin: 0;
        border: 0;
    }

    :host(:not([orientation="vertical"])) .tx-space {
        left: 8px;
        right: 8px;
        top: 0;
        bottom: 0;
    }

    :host([orientation="vertical"]) .tx-space {
        left: 0;
        right: 0;
        top: 8px;
        bottom: 8px;
    }

    .tx-rail {
        background-color: var(--tx-gray-300);
        position: absolute;
        display: block;
        border-radius: 2px;
    }

    :host(:not([orientation="vertical"])) .tx-rail {
        top: 50%;
        width: 100%;
        height: 2px;
        transform: translateY(-50%);
    }

    :host([orientation="vertical"]) .tx-rail {
        left: 50%;
        height: 100%;
        width: 2px;
        transform: translateX(-50%);
    }

    :host([disabled]) .tx-rail {
        background-color: var(--tx-gray-100);
    }
    :host([disabled]) .tx-track {
        background-color: var(--tx-gray-100);
    }
    :host([disabled]) .tx-thumb {
        border-color: var(--tx-gray-500);
    }
    .tx-track {
        background-color: var(--tx-gray-700);
        position: absolute;
        display: block;
        border-radius: 2px;
    }

    :host(:not([orientation="vertical"])) .tx-track {  
        top: 50%;
        height: 2px;
        transform: translateY(-50%);
    }

    :host([orientation="vertical"]) .tx-track {  
        left: 50%;
        width: 2px;
        transform: translateX(-50%);
    }

    .tx-thumb {
        border: 2px solid var(--tx-gray-700); /* knob border */
        background: var(--tx-gray-75); /* inside knob */
        cursor: pointer;
        position: absolute;
        display: flex;
        border-radius: 50%;
        width: 14px;
        height: 14px;
        box-sizing: border-box;
        outline-width: 0px;
        transform: translate(-50%, -50%);
    }
    .tx-thumb:hover {
        border-color: var(--tx-gray-800)
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
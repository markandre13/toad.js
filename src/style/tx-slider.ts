/*
 * The slider in Spectrum is quite complex and requires JavaScript
 *
 * The implementation is fairly simple and follows the advise given and
 * linked to in
 *
 * https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-slider-thumb
 *
 */

import { css } from 'src/util/lsx'

export const style = document.createElement("style")
style.textContent = css`

:host(.tx-slider) {
    height: 14px;
    position: relative;
    width: 100%;
    display: inline-block;
}
:host(.tx-slider) > input {
    position: absolute;
    /* top: 4px; */
    left: 4px;
    -webkit-appearance: none;
    /* width: 100%;
    height: 2px; */
    -webkit-appearance: slider-vertical;
    writing-mode: bt-lr;
    width: 2px;
    height: 100%;
    border: none;
    background: var(--tx-gray-700); /* track */
    outline: none;
}

:host(.tx-slider) > input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border: 2px solid var(--tx-gray-700); /* knob border */
    border-radius: 50%;
    background: var(--tx-gray-75); /* inside knob */
    cursor: pointer;
    box-sizing: border-box;
}
:host(.tx-slider) > input::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border: 2px solid var(--tx-gray-700); /* knob border */
    border-radius: 50%;
    background: var(--tx-gray-75); /* inside knob */
    box-sizing: border-box;
}

/* focus ring */
:host(.tx-slider) > input:focus::-webkit-slider-thumb {
    outline: 2px solid;
    outline-color: var(--tx-outline-color);
    outline-offset: 2px;
}
:host(.tx-slider) > input:focus::-moz-range-thumb {
    outline: 2px solid;
    outline-color: var(--tx-outline-color);
    outline-offset: 2px;
}

:host(.tx-slider) > input::-moz-focus-outer {
    border: 0;
}

:host(.tx-slider) > input:hover {
    background: var(--tx-gray-800); /* track */
}
:host(.tx-slider) > input:hover::-webkit-slider-thumb {
    border: 2px solid var(--tx-gray-800); /* knob border */
}
:host(.tx-slider) > input:hover::-moz-range-thumb {
    border: 2px solid var(--tx-gray-800); /* knob border */
}

:host(.tx-slider) > input:disabled {
    background: var(--tx-gray-500); /* track */
}
:host(.tx-slider) > input:disabled::-webkit-slider-thumb {
    border: 2px solid var(--tx-gray-500); /* knob border */
}
:host(.tx-slider) > input:disabled::-moz-range-thumb {
    border: 2px solid var(--tx-gray-500); /* knob border */
}
`
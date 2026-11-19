/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2022 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { css } from 'src/util/lsx'

// function btoa(str: string): string {
//     return Buffer.from(str).toString("base64")
// }

/**
 * @internal 
 */

export const menuStyle = new CSSStyleSheet()
menuStyle.replaceSync(css`

  .menu-bar {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    background-color: var(--tx-gray-200);
    padding: 2px 2px 2px 2px;
    /* height: 24px; */
  }
  .menu-popup {
    background-color: var(--tx-gray-200);
    border: solid 1px var(--tx-gray-100);
    border-radius: 4px;
    position: fixed;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 2px 5px var(--tx-gray-50);
    padding: 2px 2px 2px 2px;
    z-index: 255;
  }

  :host(.menu-button) {
    font-family: var(--tx-font-family);
    font-size: var(--tx-edit-font-size);
    font-weight: var(--tx-edit-font-weight);
    padding: 2px 7px 2px 7px;
    border-radius: 4px;
    vertical-align: middle;
  
    background: var(--tx-gray-200);
    /* background-color: #0f0; */
    /* color: var(--tx-gray-900); */
    color: var(--tx-gray-700);
    cursor: default;
  }
  :host(.menu-button:hover) {
    color: var(--tx-gray-900);
    background: var(--tx-gray-300);
  }
  :host(.menu-button.active) {
    background: var(--tx-gray-400);
    color: var(--tx-gray-900);
  }
  :host(.menu-button.disabled) {
    color: var(--tx-gray-500);
  }
  :host(.menu-button.active.disabled) {
    color: var(--tx-gray-700);
  }
  /* :host(.menu-button.menu-down) {
    padding-right: 20px;
    background-image: url("data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="15" height="14"><path d="M 0 4 l 10 0 l -5 5 Z" fill="#fff" stroke="none"/></svg>')}");
    background-repeat: no-repeat;
    background-position: right center;
  }
  :host(.menu-button.active.menu-down) {
    background-image: url("data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="15" height="14"><path d="M 0 4 l 10 0 l -5 5 Z" fill="#fff" stroke="none"/></svg>')}");
    background-repeat: no-repeat;
    background-position: right center;
  } */
  :host(.menu-button.menu-side) {
    padding-right: 14px;
    background-image: url("data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="14"><path d="M 0 3 l 0 6 l 4 -3 Z" fill="#ccc" stroke="#ccc"/></svg>')}");
    background-repeat: no-repeat;
    background-position: right center;
  }
  /* :host(.menu-button.active.menu-side) { } */

`)

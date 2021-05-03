/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export const menuStyle = document.createElement("style")
menuStyle.textContent=`
  :host(.menu-button) {
    font-family: var(--toad-font-family, sans-serif);
    font-size: 14px;
    font-weight: bold;
    padding: 7px;
    vertical-align: center;
  
    background: #fff;
    color: #000;
    cursor: default;
  }
  :host(.menu-button.active) {
    background: #000;
    color: #fff;
  }
  :host(.menu-button.disabled) {
    color: #888;
  }
  :host(.menu-button.active.disabled) {
    color: #888;
  }
  :host(.menu-button.menu-down) {
    padding-right: 20px;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='14'><path d='M 0 4 l 10 0 l -5 5 Z' fill='#000' stroke='none'/></svg>");
    background-repeat: no-repeat;
    background-position: right center;
  }
  :host(.menu-button.active.menu-down) {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='14'><path d='M 0 4 l 10 0 l -5 5 Z' fill='#fff' stroke='none'/></svg>");
    background-repeat: no-repeat;
    background-position: right center;
  }
  :host(.menu-button.menu-side) {
    padding-right: 20px;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='14'><path d='M 0 2 l 0 10 l 5 -5 Z' fill='#000' stroke='none'/></svg>");
    background-repeat: no-repeat;
    background-position: right center;
  }
  :host(.menu-button.active.menu-side) {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='14'><path d='M 0 2 l 0 10 l 5 -5 Z' fill='#fff' stroke='none'/></svg>");
    background-repeat: no-repeat;
    background-position: right center;
  }
  .menu-bar {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .menu-popup {
    position: fixed;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 2px 5px #888;
  }
`


/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
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

export let textAreaStyle = document.createElement("style")
textAreaStyle.textContent=`

/* try to follow material ui: when active render button labels in black, otherwise in gray */
svg .fill {
  fill: var(--tx-gray-700);
  stroke: var(--tx-gray-700);
}
svg .stroke {
  fill: none;
  stroke: var(--tx-gray-700);
}
svg .strokeFill {
  fill: var(--tx-gray-200);
  stroke: var(--tx-gray-700);
}

/*
these don't seem to be in use anymore
.toolbar.active svg .fill {
  fill: #000;
  stroke: #000;
}
.toolbar.active svg .stroke {
  fill: none;
  stroke: #000;
}
.toolbar.active svg .strokeFill {
  fill: #fff;
  stroke: #000;
}
*/

.toolbar button {
    background: var(--tx-gray-75);
    color: var(--tx-gray-800);
    border: 1px var(--tx-gray-400);
    border-style: solid solid solid none;
    padding: 5;
    margin: 0;
    vertical-align: middle;
    height: 22px;
}

.toolbar button:active:hover {
    background: linear-gradient(to bottom, var(--tx-gray-600) 0%,var(--tx-gray-50) 100%,var(--tx-gray-500) 100%);
}

.toolbar button.left {
    border-style: solid;
    border-radius: 3px 0 0 3px;
}

.toolbar button.right {
    border: 1px var(--tx-gray-400);
    border-style: solid solid solid none;
    border-radius: 0 3px 3px 0;
}

.toolbar button.active {
    background: linear-gradient(to bottom, var(--tx-gray-600) 0%,var(--tx-gray-50) 100%,var(--tx-gray-500) 100%);
    border: 1px var(--tx-global-blue-500) solid;
    color: var(--tx-gray-900);
}

div.textarea {
  font-family: var(--tx-font-family);
  font-size: var(--tx-font-size);
  border: 1px var(--tx-gray-400) solid;
  border-radius: 3px;
  margin: 2px;
  padding: 4px 5px;
  outline-offset: -2px;
}

div.textarea h1 {
  font-size: 22px;
  margin: 0;
  padding: 4px 0 4px 0;
}

div.textarea h2 {
  font-size: 18px;
  margin: 0;
  padding: 4px 0 4px 0;
}

div.textarea h3 {
  font-size: 16px;
  margin: 0;
  padding: 4px 0 4px 0;
}

div.textarea h4 {
  font-size: 14px;
  margin: 0;
  padding: 4px 0 4px 0;
}

div.textarea div {
  padding: 2px 0 2px 0;
}
`

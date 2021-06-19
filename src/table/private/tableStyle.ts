/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2021 Mark-André Hopf <mhopf@mark13.org>
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

// NOTE
// * when .root is using display: inline-grid, the browser doesn't render inputDiv
//   correctly in the intended position unless the window is resized.

export let tableStyle = document.createElement("style")
tableStyle.textContent = `
:host {
  position: relative;
  display: inline-block;
  border: 1px #ccc solid;
  border-radius: 3px;
  outline-offset: -2px;
  font-family: var(--toad-font-family, sans-serif);
  font-size: var(--toad-font-size, 12px);
  background: #fff;
}
:host:focus .cells tr.selected,
:host:focus .cells td.selected {
  background: #0069d4;
  color: #fff;
}

.colhead {
  position: absolute;
  top: 0;
  overflow: hidden;
}
.rowhead {
  position: absolute;
  left: 0;
  overflow: hidden;
}
.cells {
  position: absolute;

  bottom: 0;
  right: 0;

  overflow: auto;
  /* resize: both; */
  cursor: default;
}

:host > div > table, :host > table {
  border-collapse: collapse;
  border-spacing: 0;
  border: none 0px;
}
.colhead > table, .rowhead > table {
  background: #e0e0e0;
}

.colhead th,
.rowhead th,
.cells td,
.hiddenSizeCheck td {
  letter-spacing: 0;  
  overflow: hidden;   
  padding: 2px;
  margin: 0px;

  /* this might not be always desirable; */
  white-space: nowrap; 

  /* this might not be always desirable; used to align text and treenodecell vertically */
  display: flex; align-items:center;

  border: solid 1px #ccc;
}

.colhead th, .rowhead th {
  z-index: 1;
}

.bodyrow td {
  padding-top: 0px;
  padding-bottom: 0px;
  border-top: none 0px;
  border-bottom: none 0px;
}

.cells tr:nth-child(even) {
  background: var(--toad-table-even-row, #f5f5f5);
}
.cells tr:nth-child(odd) {
  background: var(--toad-table-odd-row, #ffffff);
}

.cells td:nth-child(1) {
  border-left: none;
}
.cells tr:nth-child(2) td {
  border-top: none;
}

.cells tr.selected,
.cells tr td.selected {
  background: #808080;
  color: #fff;
}

.compact.colhead th,
.compact.rowhead th {
  border-color: none;
  border-style: none;
  border-width: 0;
  padding: 0px;
}
.compact.cells * td,
.compact.hiddenSizeCheck * td {
  border-color: none;
  border-style: none;
  border-width: 0;
  padding: 0px;
}

.zeroSize {
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
  border: none;
}

.inputDiv { 
  position: relative;
  background: #fff;
  border: none;
  opacity: 0;
}

.hiddenSizeCheck {
  position: absolute;
  opacity: 0;
}
`

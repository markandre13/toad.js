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

function dump(element: HTMLElement, depth?: number): void {
  if (depth === undefined)
    depth = 0
  let out = ""
  for (let i = 0; i < depth; ++i)
    out += "  "
  out += element.tagName
  if (element.tagName === "TD" || element.tagName === "TH")
    out += "  '" + element.innerText + "'"
  console.log(out)
  for (let child of element.children)
    dump(child as HTMLElement, depth + 1)
}

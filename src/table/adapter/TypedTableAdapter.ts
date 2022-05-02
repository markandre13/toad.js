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

import { TableAdapter } from './TableAdapter'
import { TypedTableModel } from '../model/TypedTableModel'

abstract class AbstractTypedTableAdapter<T, M extends TypedTableModel<T>> extends TableAdapter<M> {}
export type InferTypedTableModelParameter<M> = M extends TypedTableModel<infer T> ? T : never
export class TypedTableAdapter<M extends TypedTableModel<any>> extends AbstractTypedTableAdapter<InferTypedTableModelParameter<M>, M> {}

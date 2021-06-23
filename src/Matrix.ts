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

export interface Point {
    x: number
    y: number
}

export interface MatrixStruct {
    m11: number
    m12: number
    m21: number
    m22: number
    tX: number
    tY: number
}

export class Matrix implements MatrixStruct
{
    m11: number
    m12: number
    m21: number
    m22: number
    tX: number
    tY: number
    
    constructor(matrix?: MatrixStruct) {
        if (matrix === undefined) {
            this.m11 = 1.0
            this.m12 = 0.0
            this.m21 = 0.0
            this.m22 = 1.0
            this.tX  = 0.0
            this.tY  = 0.0
        } else {
            this.m11 = matrix.m11
            this.m12 = matrix.m12
            this.m21 = matrix.m21
            this.m22 = matrix.m22
            this.tX  = matrix.tX
            this.tY  = matrix.tY
        }
    }
    
    identity() {
        this.m11 = 1.0
        this.m12 = 0.0
        this.m21 = 0.0
        this.m22 = 1.0
        this.tX  = 0.0
        this.tY  = 0.0
    }
    
    append(matrix: Matrix) {
        let n11 = this.m11 * matrix.m11 + this.m12 * matrix.m21
        let n12 = this.m11 * matrix.m12 + this.m12 * matrix.m22
        let n21 = this.m21 * matrix.m11 + this.m22 * matrix.m21
        let n22 = this.m21 * matrix.m12 + this.m22 * matrix.m22
        let nX  = this.tX  * matrix.m11 + this.tY  * matrix.m21 + matrix.tX
        let nY  = this.tX  * matrix.m12 + this.tY  * matrix.m22 + matrix.tY
        
        this.m11 = n11
        this.m12 = n12
        this.m21 = n21
        this.m22 = n22
        this.tX  = nX
        this.tY  = nY
    }

    prepend(matrix: Matrix) {
        let n11 = matrix.m11 * this.m11 + matrix.m12 * this.m21
        let n12 = matrix.m11 * this.m12 + matrix.m12 * this.m22
        let n21 = matrix.m21 * this.m11 + matrix.m22 * this.m21
        let n22 = matrix.m21 * this.m12 + matrix.m22 * this.m22
        let nX  = matrix.tX  * this.m11 + matrix.tY  * this.m21 + this.tX
        let nY  = matrix.tX  * this.m12 + matrix.tY  * this.m22 + this.tY
        
        this.m11 = n11
        this.m12 = n12
        this.m21 = n21
        this.m22 = n22
        this.tX  = nX
        this.tY  = nY
    }
    
    invert() {
        let d = 1.0 / (this.m11 * this.m22 - this.m21 * this.m12)
        let n11 = d *  this.m22
        let n12 = d * -this.m12
        let n21 = d * -this.m21
        let n22 = d *  this.m11
        let nX  = d * (this.m21 * this.tY - this.m22 * this.tX)
        let nY  = d * (this.m12 * this.tX - this.m11 * this.tY)

        this.m11 = n11
        this.m12 = n12
        this.m21 = n21
        this.m22 = n22
        this.tX  = nX
        this.tY  = nY
    }
    
    translate(point: Point) {
        let m = new Matrix({
            m11: 1.0, m12: 0.0,
            m21: 0.0, m22: 1.0,
            tX: point.x, tY: point.y
        })
        this.append(m)
    }

    rotate(radiant: number) {
        let m = new Matrix({
            m11:  Math.cos(radiant), m12: Math.sin(radiant),
            m21: -Math.sin(radiant), m22: Math.cos(radiant),
            tX: 0, tY: 0
        })
        this.append(m)
    }
    
    scale(x: number, y:number) {
        let m = new Matrix({
            m11:  x, m12: 0,
            m21:  0, m22: y,
            tX: 0, tY: 0
        })
        this.append(m)
    }
    
    transformPoint(point: Point): Point {
        return {
            x: point.x * this.m11 + point.y * this.m21 + this.tX,
            y: point.x * this.m12 + point.y * this.m22 + this.tY
        }
    }

    transformArrayPoint(point: [number, number]): [number, number] {
        return [
            point[0] * this.m11 + point[1] * this.m21 + this.tX,
            point[0] * this.m12 + point[1] * this.m22 + this.tY
        ]
    }
}

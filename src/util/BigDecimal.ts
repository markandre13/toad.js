// https://stackoverflow.com/questions/16742578/bigdecimal-in-javascript
// BigDecimal by trincot.trincots@gmail.com
export class BigDecimal {
    _n: bigint = 0n;
    // Configuration: constants
    static DECIMALS = 18; // number of decimals on all instances
    static ROUNDED = true; // numbers are truncated (false) or rounded (true)
    static SHIFT = BigInt("1" + "0".repeat(BigDecimal.DECIMALS)); // derived constant
    constructor(value: string | number | BigDecimal) {
        if (value instanceof BigDecimal) return value
        let [ints, decis] = String(value).split(".").concat("")
        this._n = BigInt(ints + decis.padEnd(BigDecimal.DECIMALS, "0")
            .slice(0, BigDecimal.DECIMALS))
            + BigInt(BigDecimal.ROUNDED && decis[BigDecimal.DECIMALS] >= "5")
    }
    static fromBigInt(bigint: BigInt) {
        return Object.assign(Object.create(BigDecimal.prototype), { _n: bigint })
    }
    add(num: BigDecimal): BigDecimal {
        return BigDecimal.fromBigInt(this._n + new BigDecimal(num)._n)
    }
    sub(num: BigDecimal): BigDecimal {
        return BigDecimal.fromBigInt(this._n - new BigDecimal(num)._n)
    }
    static _divRound(dividend: bigint, divisor: bigint): BigDecimal {
        return BigDecimal.fromBigInt(dividend / divisor
            + (BigDecimal.ROUNDED ? dividend * 2n / divisor % 2n : 0n))
    }
    mul(num: BigDecimal): BigDecimal {
        return BigDecimal._divRound(this._n * new BigDecimal(num)._n, BigDecimal.SHIFT)
    }
    div(num: BigDecimal) {
        return BigDecimal._divRound(this._n * BigDecimal.SHIFT, new BigDecimal(num)._n)
    }
    toString() {
        const s = this._n.toString().padStart(BigDecimal.DECIMALS + 1, "0")
        return s.slice(0, -BigDecimal.DECIMALS) + "." + s.slice(-BigDecimal.DECIMALS)
            .replace(/\.?0+$/, "")
    }
}

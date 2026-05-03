import { ValueModel, type ValueModelEvent, type ValueModelOptions } from "./ValueModel"

export const MIN_VALUE = Symbol("MIN_VALUE")
export const MAX_VALUE = Symbol("MAX_VALUE")
export const STEP_VALUE = Symbol("STEP_VALUE")
export const AUTOCORRECT_VALUE = Symbol("AUTOCORRECT")
export type MinValueEvent = { type: typeof MIN_VALUE }
export type MaxValueEvent = { type: typeof MAX_VALUE }
export type StepValueEvent = { type: typeof STEP_VALUE }
export type AutoCorrectValueEvent = { type: typeof AUTOCORRECT_VALUE }
export type NumericModelEvent = ValueModelEvent | MinValueEvent | MaxValueEvent | StepValueEvent | AutoCorrectValueEvent

/**
 * @category Application Model
 */
export interface NumericModelOptions<T> extends ValueModelOptions<T> {
    /**
     * when set, value will not go below min
     */
    min?: number
    /**
     * when set, value will not go above max
     */
    max?: number
    /**
     * when set, some views can increase/decrease the value, e.g. using the scrollwheel
     */
    step?: number
    /**
     * when 'true', value will always be clipped to min/max. 'undefined' per default
     * as it makes editing the value in a text field quite annoying.
     */
    autocorrect?: boolean
}

export abstract class NumericModel<T> extends ValueModel<T, NumericModelEvent, NumericModelOptions<T>> {
    /**
     * increment value by step
     */
    abstract increment(): void
    /**
     * decrement value by step
     */
    abstract decrement(): void
    abstract toNumber(): number
    abstract clip(value: T): void
    protected abstract check(value: T): string | undefined

    set min(min: number | undefined) {
        if (this.options?.min === min) return
        if (this.options === undefined) {
            this.options = {}
        }
        this.options.min = min
        this.signal.emit({ type: MIN_VALUE })
    }
    get min(): number | undefined {
        return this.options?.min
    }

    set max(max: number | undefined) {
        if (this.options?.max === max) return
        if (this.options === undefined) {
            this.options = {}
        }
        this.options.max = max
        this.signal.emit({ type: MAX_VALUE })
    }
    get max(): number | undefined {
        return this.options?.max
    }

    set step(step: number | undefined) {
        if (this.options?.step === step) return
        if (this.options === undefined) {
            this.options = {}
        }
        this.options.step = step
        this.signal.emit({ type: STEP_VALUE })
    }
    get step(): number | undefined {
        return this.options?.step
    }

    set autocorrect(autocorrect: boolean | undefined) {
        if (this.autocorrect === autocorrect) return
        if (this.options === undefined) {
            this.options = {}
        }
        this.options.autocorrect = autocorrect
        this.signal.emit({ type: AUTOCORRECT_VALUE })
    }
    get autocorrect(): boolean {
        return this.options?.autocorrect === true
    }
}
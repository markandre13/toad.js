import { ValueModel, ValueModelEvent, ValueModelOptions } from "./ValueModel"

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

export class NumericModel<T> extends ValueModel<T, NumericModelEvent, NumericModelOptions<T>> {
}
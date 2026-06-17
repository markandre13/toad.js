import { describe, it } from "vitest"

// RSpec style functions
export const fit = it.only
export const xit = it.skip
export const fdescribe = describe.only
export const xdescribe = describe.skip
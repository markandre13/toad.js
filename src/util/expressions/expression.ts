import { ExpressionNode } from './ExpressionNode'
import { Lexer } from './Lexer'

export function expression(lexer: Lexer): ExpressionNode | undefined {
    const n0 = lexer.lex()
    if (n0 === undefined || n0.value !== '=') {
        return undefined
    }
    return additive_expression(lexer)
}
function additive_expression(lexer: Lexer): ExpressionNode | undefined {
    const n0 = multiplicative_expression(lexer)
    if (n0 === undefined) {
        return undefined
    }

    const n1 = lexer.lex()
    if (n1 === undefined) {
        return n0
    }
    if (n1.value === "+" || n1.value === "-") {
        const n2 = additive_expression(lexer)
        if (n2 === undefined) {
            lexer.unlex(n1)
            return n0
        }
        n1.append(n0)
        n1.append(n2)
        return n1
    }
    lexer.unlex(n1)
    return n0
}
function multiplicative_expression(lexer: Lexer): ExpressionNode | undefined {
    const n0 = unary_expression(lexer)
    if (n0 === undefined) {
        return undefined
    }
    const n1 = lexer.lex()
    if (n1 === undefined) {
        return n0
    }
    if (n1.value === "*" || n1.value === "/") {
        const n2 = multiplicative_expression(lexer)
        if (n2 === undefined) {
            throw Error(`expexted expression after ${n1.value}`)
        }
        n1.append(n0)
        n1.append(n2)
        return n1
    }
    lexer.unlex(n1)
    return n0
}
function unary_expression(lexer: Lexer): ExpressionNode | undefined {
    const n0 = lexer.lex()
    if (n0 === undefined) {
        return undefined
    }
    if (typeof n0.value === "number") {
        return n0
    }
    if (n0.value instanceof Array) {
        return n0
    }
    if (n0.value === "(") {
        const n1 = additive_expression(lexer)
        if (n1 === undefined) {
            throw Error("Unexpected end after '(")
        }
        const n2 = lexer.lex()
        if (n2?.value !== ')') {
            throw Error("Excepted ')")
        }
        return n1
    }
    if (n0.value === "-") {
        const n1 = unary_expression(lexer)
        if (n1 !== undefined) {
            n0.append(n1)
            return n0
        }
    }
    lexer.unlex(n0)
    return undefined
}

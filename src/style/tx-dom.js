// poor man's JSX
function _element(type, children) {
    const element = document.createElement(type)
    for (let i = 0; i < children.length; ++i) {
        let child = children[i]
        if (child instanceof Array) {
            children.splice(i, 1, ...child)
            child = children[i]
        }
        if (typeof child === "string") {
            element.appendChild(document.createTextNode(child))
            continue
        }
        element.appendChild(child)
    }
    return element
}
function array(times, create) {
    let a = []
    for (let i = 0; i < times; ++i) {
        const c = create(i)
        if (c instanceof Array) {
            a.push(...c)
        } else {
            a.push(c)
        }
    }
    return a
}
const div = (...children) => _element("div", children)
const span = (...children) => _element("span", children)
const button = (...children) => _element("button", children)
/**
 * Create a HTMLTable
 * @param  {...any} children 
 * @returns HTMLTableElement
 */
const table = (...children) => _element("table", children)
const thead = (...children) => _element("thead", children)
const th = (...children) => _element("th", children)
const tbody = (...children) => _element("tbody", children)
const td = (...children) => _element("td", children)
const tr = (...children) => _element("tr", children)
function svg(ref) {
    const ns = "http://www.w3.org/2000/svg"
    const s = document.createElementNS(ns, "svg")
    const u = document.createElementNS(ns, "use")
    u.setAttributeNS(ns, "href", ref)
    u.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', ref)
    s.appendChild(u)
    return s
}

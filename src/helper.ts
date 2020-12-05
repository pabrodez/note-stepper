export const createElement = (
    type: string,
    attributes?: {
        [key: string]: string
        | ((e: Event) => void)
        | { [key: string]: string }
        | CSSStyleDeclaration
        | DOMStringMap
    }): HTMLElement => {
    const element = document.createElement(type)

    if (attributes !== undefined) {
        Object.entries(attributes).forEach(([prop, value]) => {
            if (['dataset', 'style'].includes(prop)) {
                Object.entries(value).forEach(([dataName, dataVal]) => {
                    element[prop][dataName] = dataVal
                })
            } else if (prop in element) {
                element[prop] = value
            } else {
                console.warn(`Attribute ${prop} is not an attribute of ${type}`)
            }
        })
    }
    return element
}
let P_insert = Symbol();
let In_HTML = Symbol();
/**
 * @return {HTMLElement}
 * @param {string} tag_name
 * @param {Object<string,string>?} attributes
 * @param  {...(HTMLElement|Array<HTMLElement>)} childs
 */
function build_html(tag_name, attributes = {}, ...childs) {
    if (attributes == null) attributes = {};
    // console.trace({
    //     tag_name,
    //     attributes,
    //     childs
    // });
    childs = childs.flat().filter(i => i !== undefined);
    if (typeof tag_name !== "string") return tag_name;
    let current_element = document.createElement(tag_name);
    current_element[P_insert] =
        attributes[P_insert] ||
        async function insert() {
            current_element[In_HTML] = true;
            for (let child of [...current_element.childNodes]) {
                if (child[P_insert]) await child[P_insert]();
            }
        };
    for (let key in attributes) {
        if (!attributes.hasOwnProperty(key)) continue;
        if (key.slice(0, 2) == "on") {
            current_element.addEventListener(key.slice(2), attributes[key]);
            continue;
        }
        current_element.setAttribute(
            key,
            typeof attributes[key] === "object"
                ? attributes[key].join(" ")
                : attributes[key],
        );
    }
    for (let child of childs) {
        current_element.appendChild(
            typeof child == "string" ? document.createTextNode(child) : child,
        );
    }
    return current_element;
}
/**
 *
 * @param {HTMLElement} content
 * @param {HTMLElement?} element
 */
function embed(content, element) {
    if (!element) {
        element = document.documentElement;
        element[In_HTML] = true;
    }
    element.replaceWith(content);
    if (content[P_insert]) if (element[In_HTML]) content[P_insert]();
}
/**
 *
 * @param {HTMLElement} content
 * @param {HTMLElement} element
 */
function insert(content, element) {
    var elementChildrens = element.children;
    for (let i = 0, child; (child = elementChildrens[i]); i++) {
        child.remove();
    }
    element.appendChild(content);
    if (content[P_insert]) if (element[In_HTML]) content[P_insert]();
}
export { build_html, embed, insert, P_insert, In_HTML };

import SimpleBar from "simplebar";

/**
 * 本函数用于在指定元素上卸载SimpleBar自定义滚动条
 * @param {HTMLElement} element - 需要卸载SimpleBar的元素
 * */
export function unmountSimpleBar(element) {
    const inst = SimpleBar.instances?.get(element)
    if (inst) {
        inst.unMount()
    }
}

/**
 * 本函数用于在指定元素上挂载SimpleBar自定义滚动条
 * @param {HTMLElement} element - 需要挂载SimpleBar的元素
 * @returns {SimpleBar} 返回挂载后的SimpleBar实例
 * */
export function mountSimpleBar(element) {
    if (!element.hasAttribute('data-simplebar')) {
        element.setAttribute('data-simplebar', '');
    }

    let inst = SimpleBar.instances?.get(element)
    if (!inst) {
        inst = new SimpleBar(element)
    }

    inst.recalculate()
    return inst
}
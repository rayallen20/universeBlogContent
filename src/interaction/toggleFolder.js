import {collapsedIdSet} from "../structure/tree";

/**
 * 本函数用于切换文件夹的折叠/展开状态
 * @param {HTMLLIElement} liElement - 表示被点击节点的li元素
 * */
export function toggleFolder(liElement) {

    // 只处理文件夹节点
    if (!liElement.classList.contains('node_folder')) {
        return
    }

    const isCollapsed = liElement.classList.contains('isCollapsed')
    const childrenElement = liElement.querySelector(':scope > ul')
    liElement.classList.add('animating')

    if (isCollapsed) {
        unfoldChildren(liElement, childrenElement)
        return
    }

    foldChildren(liElement, childrenElement)
}

/**
 * 本函数用于展开文件夹节点的子节点
 * @param {HTMLLIElement} liElement - 需要展开的文件夹节点的li元素
 * @param {HTMLUListElement} childrenElement - 需要展开的子节点的ul元素
 * */
function unfoldChildren(liElement, childrenElement) {
    const folderId = Number(liElement.dataset.id)
    collapsedIdSet.delete(folderId)

    liElement.classList.remove('isCollapsed')

    // ul从0开始动画到内容高度
    childrenElement.style.height = '0px'
    childrenElement.offsetHeight
    childrenElement.style.height = childrenElement.scrollHeight + 'px'

    const onEnd = (event) => {
        if (event.propertyName !== 'height') {
            return
        }

        childrenElement.style.height = 'auto'
        liElement.classList.remove('animating')
        childrenElement.removeEventListener('transitionend', onEnd)
    }

    childrenElement.addEventListener('transitionend', onEnd)
}

/**
 * 本函数用于折叠文件夹节点的子节点
 * @param {HTMLLIElement} liElement - 需要折叠的文件夹节点的li元素
 * @param {HTMLUListElement} childrenElement - 需要折叠的子节点的ul元素
 * */
function foldChildren(liElement, childrenElement) {
    const folderId = Number(liElement.dataset.id)
    collapsedIdSet.delete(folderId)

    // ul从内容高度动画到0
    childrenElement.style.height = childrenElement.scrollHeight + 'px'
    childrenElement.offsetHeight
    childrenElement.style.height = '0px'

    liElement.classList.add('isCollapsed')

    const onEnd = (event) => {
        if (event.propertyName !== 'height') {
            return
        }

        liElement.classList.remove('animating')
        childrenElement.removeEventListener('transitionend', onEnd)
    }

    childrenElement.addEventListener('transitionend', onEnd)
}
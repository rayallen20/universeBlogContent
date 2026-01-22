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
    collapsedIdSet.add(folderId)

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

/**
 * 本函数用于在目录区域中将指定路径的节点设置为展开状态
 * @param {Array<Object>} pathNodes - 需要展开路径的节点数组
 * @param {HTMLDivElement} catalogueElement - 目录区域的根元素
 * */
export function expandPath(pathNodes, catalogueElement) {
    if (!Array.isArray(pathNodes) || pathNodes.length === 0) {
        return
    }

    for (const pathNode of pathNodes) {
        const liElement = catalogueElement.querySelector(`.tree li.node[data-id="${pathNode.id}"]`)
        if (liElement === null) {
            continue
        }

        if (!liElement.classList.contains('node_folder')) {
            continue
        }

        forceExpandFolderLiElement(liElement)
    }
}

/**
 * 本函数用于强制展开指定的非叶节点对应的li元素
 * 这里之所以说是强制展开,是因为通过本函数展开的li元素没有动画效果
 * @param {HTMLLIElement} liElement - 需要强制展开的非叶节点对应的li元素
 * */
function forceExpandFolderLiElement(liElement) {
    const folderId = Number(liElement.dataset.id)
    collapsedIdSet.delete(folderId)

    // 移除折叠状态和动画状态
    liElement.classList.remove('isCollapsed')
    liElement.classList.remove('animating')

    // 清除折叠动画时间的height样式
    const childUlElement = liElement.querySelector(':scope > ul')
    if (childUlElement !== null) {
        childUlElement.style.height = 'auto'
    }
}

/**
 * 本函数用于确保指定节点出现在目录区域的视口中
 * @param {HTMLDivElement} catalogueElement - 目录区域的根元素
 * @param {number} targetNodeId - 目标节点的ID
 * @param {{behavior: ScrollBehavior, block: 'center'|'nearest'}} options - 可选参数对象
 * */
export function ensureNodeVisible(catalogueElement, targetNodeId, options) {
    if (catalogueElement === null || targetNodeId === null) {
        return
    }

    const targetLiElement = catalogueElement.querySelector(`.tree li.node[data-id="${targetNodeId}"]`)
    if (targetLiElement === null) {
        return
    }

    const behavior = options.behavior
    const block = options.block

    // SimpleBar的真实滚动容器
    const scrollElement = catalogueElement.querySelector('.simplebar-content-wrapper')
    // 没有SimpleBar则让浏览器处理
    if (scrollElement === null) {
        targetLiElement.scrollIntoView({behavior, block, inline:'nearest'})
        return
    }

    // 若已在视口范围内则不处理
    const targetRect = targetLiElement.getBoundingClientRect()
    const wrapRect = scrollElement.getBoundingClientRect()
    if (targetRect.top >= wrapRect.top && targetRect.bottom <= wrapRect.bottom) {
        return
    }

    // 计算滚动位置
    const currentTop = scrollElement.scrollTop
    const offsetTop = targetRect.top - wrapRect.top

    let targetTop = currentTop + offsetTop
    if (block === 'center') {
        targetTop = targetTop - (wrapRect.height / 2) + (targetRect.height / 2)
    }

    if (block === 'nearest') {
        // nearest模式下则尽量少滚动 让目标元素刚好进入视口即可
        if (targetRect.top < wrapRect.top) {
            targetTop = currentTop + (targetRect.top - wrapRect.top)
        } else if (targetRect.bottom > wrapRect.bottom) {
            targetTop = currentTop + (targetRect.bottom - wrapRect.bottom)
        }
    }

    // 处理减少动画偏好
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    scrollElement.scrollTo({
        top: Math.max(0, targetTop),
        behavior: prefersReduced ? 'auto' : behavior,
    })
}
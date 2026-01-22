import {dfsFindFirstLeafNode, dfsFindNodeWithPath, initCollapsed, renderTree, tree} from "../structure/tree";
import {ensureNodeVisible, expandPath, toggleFolder} from "../interaction/toggleFolder";
import {mountSimpleBar, unmountSimpleBar} from "./simpleBarLib";

/**
 * @type {Object} state - 本对象用于保存页面当前的渲染状态
 * @property {string} phase - 当前渲染状态
 *      renderNonleaf: 渲染非叶节点(文件夹)
 *      renderLeaf: 渲染叶子节点(文件)
 * @property {Object} activeNode - 当前被渲染的节点对象
 * @property {Array<Object>} rootToActivePath - 从根节点到当前渲染节点的路径数组 若当前渲染节点为根节点则为null
 * */
const state = {
    // phase: 'renderLeaf',
    // activeNode: tree.children[0].children[0],
    // rootToActivePath: [tree, tree.children[0]],
    phase: 'renderNonleaf',
    activeNode: tree,
    rootToActivePath: [],
}

/**
 * @type {HTMLDivElement} catalogueElement - 目录区域的根元素
 * */
const catalogueElement = document.querySelector('.catalogue')

/**
 * @type {HTMLDivElement} articleElement - 文章区域的根元素
 * */
const articleElement = document.querySelector('.article')

/**
 * @type {HTMLHeadingElement} pageTitleElement - 页面头部的标题元素
 * */
const pageTitleElement = document.querySelector('.header h2');

/**
 * 本函数用于在页面第一次加载时 按状态机中记录的初始状态渲染页面
 * 初态: 渲染根节点(非叶节点)
 * */
export function initRender() {
    renderCatalogue()
    renderArticle()
    renderPageTitle()

    initCollapsed(tree, 0)
    const treeElement = renderTree(tree)
    catalogueElement.appendChild(treeElement)

    // 监听点击事件,实现折叠/展开功能
    catalogueElement.addEventListener('click', clickHandle)
}

function renderPageTitle() {
    if (state.rootToActivePath.length === 0) {
        pageTitleElement.textContent = state.activeNode.name
        return
    }

    let path = state.rootToActivePath.map(node => node.name).join('/')
    path += `/${state.activeNode.name}`
    pageTitleElement.textContent = path
}

/**
 * 本函数用于根据状态机中记录的当前状态渲染目录区域
 * */
function renderCatalogue() {
    if (state.phase === 'renderNonleaf') {
        renderActiveCatalogue()
    }

    if (state.phase === 'renderLeaf') {
        renderInactiveCatalogue()
    }
}

/**
 * 本函数用于渲染激活状态的目录区域
 * */
function renderActiveCatalogue() {
    catalogueElement.classList.remove('catalogueInactive')
    catalogueElement.classList.add('catalogueActive')
}

/**
 * 本函数用于渲染非激活状态的目录区域
 * */
function renderInactiveCatalogue() {
    catalogueElement.classList.remove('catalogueActive')
    catalogueElement.classList.add('catalogueInactive')
}

/**
 * 本函数用于根据状态机中记录的当前状态渲染文章区域
 * */
function renderArticle() {
    if (state.phase === 'renderNonleaf') {
        renderInactiveArticle()
    }

    if (state.phase === 'renderLeaf') {
        renderActiveArticle()
    }
}

/**
 * 本函数用于渲染激活状态的文章区域
 * 激活状态的文章区域结构为:
 * <div class="article">
 *     <div class="articleBody" data-simplebar>
 *         <h2 class="title">
 *             <div class="leftTrapezoid"></div>
 *             <div class="literal"></div>
 *         </h2>
 *
 *         <p class="content"></p>
 *
 *         <span class="createdAt">2026-01-22</span>
 *     </div>
 *
 *     <button class="bottomButton">
 *         <i class="iconfont icon-mulu"></i>
 *         <span>专注目录</span>
 *     </button>
 * </div>
 * */
function renderActiveArticle() {
    // 卸载SimpleBar自定义滚动条
    unmountSimpleBar(articleElement)
    // 移除simplebar属性以卸载自定义滚动条
    articleElement.removeAttribute('data-simplebar')

    // 清空文章区域结构
    articleElement.replaceChildren()

    // 设置文章区域为激活态
    articleElement.classList.remove('articleInactive')
    articleElement.classList.add('articleActive')

    // 创建滚动区域
    const articleBodyElement = document.createElement('div')
    articleBodyElement.classList.add('articleBody')
    // 为滚动区域添加simplebar属性以启用自定义滚动条
    articleBodyElement.setAttribute('data-simplebar', '');
    articleElement.appendChild(articleBodyElement)

    // 创建标题元素
    const titleElement = document.createElement('h2')
    titleElement.classList.add('title')
    // 左侧小梯形
    const leftTrapezoidElement = document.createElement('div')
    leftTrapezoidElement.classList.add('leftTrapezoid')
    titleElement.appendChild(leftTrapezoidElement)
    // 右侧文字
    const titleLiteralElement = document.createElement('div')
    titleLiteralElement.classList.add('literal')
    titleLiteralElement.textContent = state.activeNode.name
    titleElement.appendChild(titleLiteralElement)
    articleBodyElement.appendChild(titleElement)

    // 创建内容段落元素
    const paragraphElement = document.createElement('p')
    paragraphElement.classList.add('content')
    paragraphElement.textContent = getNonleafContent(state.activeNode)
    articleBodyElement.appendChild(paragraphElement)

    // 创建写作日期元素
    const createdAtElement = document.createElement('span')
    createdAtElement.classList.add('createdAt')
    createdAtElement.textContent = state.activeNode.createdAt
    articleBodyElement.appendChild(createdAtElement)

    // 创建底部按钮元素
    const buttonElement = document.createElement('button')
    buttonElement.classList.add('bottomButton')
    // 左侧字体图标
    const buttonIconElement = document.createElement('i')
    buttonIconElement.classList.add('iconfont', 'icon-mulu')
    buttonElement.appendChild(buttonIconElement)
    // 右侧文字
    const buttonLiteralElement = document.createElement('span')
    buttonLiteralElement.classList.add('literal')
    buttonLiteralElement.textContent = '专注目录'
    buttonElement.appendChild(buttonLiteralElement)
    buttonElement.addEventListener('click', concentrateCatalogue)
    articleElement.appendChild(buttonElement)
}

/**
 * 本函数用于渲染非激活状态的文章区域
 * 非激活状态的文章区域结构为:
 * <div class="article" data-simplebar>
 *     <h2 class="title"></h2>
 *
 *     <p class="content"></p>
 *
 *     <button class="bottomButton">开启文章</button>
 * </div>
 * */
function renderInactiveArticle() {
    // 卸载SimpleBar自定义滚动条
    unmountSimpleBar(articleElement)

    // 清空文章区域结构
    articleElement.replaceChildren()

    // 设置文章区域为非激活态
    articleElement.classList.remove('articleActive')
    articleElement.classList.add('articleInactive')

    // 构建文章区域内容
    // 创建标题元素
    const titleElement = document.createElement('h2')
    titleElement.classList.add('title')
    titleElement.textContent = state.activeNode.name
    articleElement.appendChild(titleElement)

    // 创建内容段落元素
    const paragraphElement = document.createElement('p')
    paragraphElement.classList.add('content')
    paragraphElement.textContent = state.activeNode.intro
    articleElement.appendChild(paragraphElement)

    // 创建写作日期元素
    const createdAtElement = document.createElement('span')
    createdAtElement.classList.add('createdAt')
    createdAtElement.textContent = state.activeNode.createdAt
    articleElement.appendChild(createdAtElement)

    // 创建底部按钮元素
    const buttonElement = document.createElement('button')
    buttonElement.classList.add('bottomButton')
    buttonElement.textContent = '开启文章'
    buttonElement.addEventListener('click', openArticle)
    articleElement.appendChild(buttonElement)

    // 为文章区域挂载SimpleBar自定义滚动条
    mountSimpleBar(articleElement)
}

/**
 * 本函数用于修改当前状态机中的渲染节点状态/激活节点/路径
 * @param {number} targetId - 目标节点的id
 * */
function changeActiveNode(targetId) {
    const {node, path} = dfsFindNodeWithPath(tree, targetId, [])
    state.activeNode = node
    state.rootToActivePath = path

    if (state.activeNode === null) {
        return
    }

    if (state.activeNode.type === 'folder') {
        state.phase = 'renderNonleaf'
    }

    if (state.activeNode.type === 'file') {
        state.phase = 'renderLeaf'
    }

    renderPageTitle()
    renderCatalogue()
    renderArticle()
}

/**
 * 本函数用于处理开启文章按钮的点击事件
 * 开启文章的逻辑:
 * 1. 找到当前非叶节点下的第一个叶子节点,并切换渲染状态到该叶子节点
 * 2. 在目录区域中展开从根节点到该叶子节点的父节点的路径
 * 3. 将该叶子节点滚动到可视区域
 * @param {MouseEvent} event - 点击事件对象
 * */
function openArticle(event) {
    const targetNonleafNode = dfsFindFirstLeafNode(tree, state.activeNode.id)
    if (targetNonleafNode === null) {
        return
    }

    // 切换渲染状态到该叶子节点
    changeActiveNode(targetNonleafNode.id)

    // 在目录区域中展开从根节点到该叶子节点的父节点的路径
    expandPath(state.rootToActivePath, catalogueElement)

    // 将该叶子节点滚动到可视区域
    const focusFolderId = state.rootToActivePath.length
        ? state.rootToActivePath[state.rootToActivePath.length - 1].id
        : null

    if (focusFolderId !== null) {
        const options = {
            behavior: 'smooth',
            block: 'center',
        }
        ensureNodeVisible(catalogueElement, focusFolderId, options)
    }
}

/**
 * 本函数用于处理专注目录按钮的点击事件
 * 专注目录的逻辑:
 * TODO: 这里的逻辑不太对 可能得靠改html结构或者加新的状态才能实现UI设计稿中的效果
 * 1. 切换渲染状态到当前非叶节点
 * @param {MouseEvent} event - 点击事件对象
 * */
function concentrateCatalogue(event) {
    // 切换渲染状态到当前非叶节点
    const focusFolderId = state.rootToActivePath.length
        ? state.rootToActivePath[state.rootToActivePath.length - 1].id
        : null
    if (focusFolderId === null) {
        return
    }

    changeActiveNode(focusFolderId)
}

/**
 * 本函数用于模拟生成非叶节点的内容
 * @param {Object} node - 非叶节点对象
 * @returns {string} - 生成的内容字符串
 * */
function getNonleafContent(node) {
    let content = node.name + '的内容'

    for (let i = 0; i < 10; i++) {
        content += content
    }

    return content
}

/**
 * 本函数用于处理树型结构中li的点击事件
 * 1. 切换节点的折叠/展开状态
 * 2. 渲染节点对应的内容
 * @param {MouseEvent} event - 点击事件对象
 * */
function clickHandle(event) {
    const rowElement = event.target.closest('.row')
    if (rowElement === null) {
        return
    }

    // 找到row的父li元素
    const liElement = rowElement.closest('li')
    if (liElement === null) {
        return
    }

    // 切换节点的折叠/展开状态
    toggleFolder(liElement)

    // 修改当前渲染状态
    const targetId = Number(liElement.dataset.id)
    changeActiveNode(targetId)
}
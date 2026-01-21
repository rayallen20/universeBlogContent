import {dfsFindNodeWithPath, initCollapsed, renderTree, tree} from "../structure/tree";
import {toggleFolder} from "../interaction/toggleFolder";

/**
 * @type {Object} state - 本对象用于保存页面当前的渲染状态
 * @property {string} phase - 当前渲染状态
 *      renderNonleaf: 渲染非叶节点(文件夹)
 *      renderLeaf: 渲染叶子节点(文件)
 * @property {Object} activeNode - 当前被渲染的节点对象
 * @property {Array<Object>} rootToActivePath - 从根节点到当前渲染节点的路径数组 若当前渲染节点为根节点则为null
 * */
const state = {
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
 * @type {HTMLHeadingElement} titleElement - 文章区域中的标题元素
 * */
const titleElement = document.querySelector('.article .title')

/**
 * @type {HTMLParagraphElement} contentElement - 文章区域中的内容元素
 * */
const contentElement = document.querySelector('.article .content')

/**
 * @type {HTMLButtonElement} bottomButtonElement - 目录区域底部的按钮元素
 * */
const bottomButtonElement = document.querySelector('.bottomButton')

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
        console.log(123)
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
}

/**
 * 本函数用于渲染激活状态的目录区域
 * */
function renderActiveCatalogue() {
    // 设置目录区域为激活态
    if (catalogueElement.classList.contains('catalogueInactive')) {
        catalogueElement.classList.remove('catalogueInactive')
    }
    catalogueElement.classList.add('catalogueActive')
}

/**
 * 本函数用于根据状态机中记录的当前状态渲染文章区域
 * */
function renderArticle() {
    // 渲染的节点为非叶节点
    if (state.phase === 'renderNonleaf') {
        renderInactiveArticle()
    }
}

/**
 * 本函数用于渲染非激活状态的文章区域
 * */
function renderInactiveArticle() {
    // 设置文章区域为非激活态
    if (articleElement.classList.contains('articleActive')) {
        articleElement.classList.remove('articleActive')
    }
    articleElement.classList.add('articleInactive')

    // 设置标题和内容
    titleElement.textContent = state.activeNode.name
    contentElement.textContent = state.activeNode.intro

    // 设置底部按钮文本
    bottomButtonElement.textContent = '开启文章'

    // 添加创建日期元素
    // 若已有创建日期元素 则更新其内容即可
    let createdAtElement = articleElement.querySelector('.createdAt')
    if (createdAtElement !== null) {
        createdAtElement.textContent = state.activeNode.createdAt
        return
    }

    // 否则创建新的创建日期元素
    createdAtElement = document.createElement('span')
    createdAtElement.textContent = state.activeNode.createdAt
    createdAtElement.classList.add('createdAt')

    // 创建日期元素插入到文章元素后面
    if (contentElement.nextElementSibling !== null) {
        articleElement.insertBefore(createdAtElement, contentElement.nextSibling)
        return
    }

    articleElement.appendChild(createdAtElement)
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
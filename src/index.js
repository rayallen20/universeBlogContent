import '../assets/reset.css'
import '../assets/font.css'
import '../assets/iconfont/iconfont.css'
import '../assets/index.css'
import '../assets/header.css'
import '../assets/tree.css'

const tree = [
    {
        id: 1,
        type: 'folder',
        name: '文件夹名称',
        children: [
            {
                id: 2,
                type: 'folder',
                name: '子文件夹A名称',
                children: [
                    {
                        id: 3,
                        type: 'file',
                        name: '文件A-1名称',
                    },
                    {
                        id: 4,
                        type: 'file',
                        name: '文件A-2名称',
                    },
                ]
            },
            {
                id: 5,
                type: 'folder',
                name: '子文件夹B名称',
                children: [
                    {
                        id: 6,
                        type: 'folder',
                        name: '子文件夹B-1名称',
                        children: [
                            {
                                id: 7,
                                type: 'file',
                                name: '文件B-1-1名称',
                            },
                            {
                                id: 8,
                                type: 'file',
                                name: '文件B-1-2名称',
                            },
                        ],
                    },
                    {
                        id: 9,
                        type: 'folder',
                        name: '子文件夹B-2名称',
                        children: [
                            {
                                id: 10,
                                type: 'file',
                                name: '文件B-2-1名称',
                            },
                            {
                                id: 11,
                                type: 'file',
                                name: '文件B-2-2名称',
                            },
                        ],
                    },
                ],
            },
        ]
    },
]

/**
 * @type {string} STORAGE_KEY 用于存储折叠文件夹ID集合的本地存储键名
 * */
const STORAGE_KEY = 'tree_folder_collapsed_ids'

/**
 * @type {Set<number>} collapsedIdSet 用于存储折叠文件夹ID的集合
 * */
const collapsedIdSet = new Set(loadCollapsedIds())

/**
 * 本函数用于读取本地存储中的折叠文件夹ID集合
 * @returns {Array<number>} - 折叠文件夹ID数组
 * */
function loadCollapsedIds() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw === null) {
            return []
        }

        const idCollection = JSON.parse(raw)
        if (!Array.isArray(idCollection)) {
            return []
        }

        return idCollection
    } catch {
        return []
    }
}

/**
 * 本函数用于将折叠文件夹ID集合保存到本地存储中
 * */
function saveCollapsedIds() {
    const idCollection = Array.from(collapsedIdSet)
    const raw = JSON.stringify(idCollection)
    localStorage.setItem(STORAGE_KEY, raw)
}

/**
 * 本函数用于根据节点ID和深度判断节点是否应在加载后折叠
 * 规则:
 *      - 若节点ID存在于collapsedIdSet中,则折叠
 *          - 也就是说,如果collapsedIdSet中不存在给定的节点ID,则说明该节点应展开
 *      - 默认: depth >= 1 的folder节点折叠
 * @param {number} nodeId - 节点ID
 * @param {number} depth - 节点深度
 * @returns {boolean} - 是否应折叠
 * */
function isInitiallyCollapsed(nodeId, depth) {
    if (collapsedIdSet.has(nodeId)) {
        return true
    }

    return depth >= 1
}

/**
 * 本函数用于将树形数据渲染为嵌套的HTML列表结构
 * @param {Array} nodes - 树形数据节点数组
 * @param {boolean} isRoot - 是否为根节点
 * @param {number} depth - 当前节点的深度
 * @returns {HTMLUListElement} - 渲染后的HTML列表元素
 * */
function renderTree(nodes, isRoot = false, depth = 0) {
    const ulElement = document.createElement('ul')
    ulElement.className = isRoot ? 'tree' : 'children'

    for (const node of nodes) {
        const liElement = createLiElement(node, depth)

        const hasChildren = node.type === 'folder' && Array.isArray(node.children) && node.children.length > 0
        if (!hasChildren) {
            ulElement.appendChild(liElement)
            continue
        }

        // 根据规则判断是否折叠
        if (isInitiallyCollapsed(node.id, depth)) {
            liElement.classList.add('isCollapsed')
        }

        depth += 1
        const childrenElement = renderTree(node.children, false, depth)
        liElement.appendChild(childrenElement)

        ulElement.appendChild(liElement)
    }

    return ulElement
}

/**
 * 本函数用于创建表示树中节点的li元素并设置其样式
 * @param {Object} node - 树形数据节点对象
 * @param {number} depth - 当前节点的深度
 * @returns {HTMLLIElement} - 创建的li元素
 * */
function createLiElement(node, depth) {
    const liElement = document.createElement('li')
    liElement.className = `node node_${node.type}`
    liElement.dataset.id = String(node.id)

    // 当前行
    const rowElement = document.createElement('div')
    rowElement.className = 'row'

    // 根节点对应的row添加特殊样式
    if (depth === 0) {
        rowElement.classList.add('primaryRow')

        // 左侧小梯形
        const leftTrapezoidElement = document.createElement('div')
        leftTrapezoidElement.classList.add('leftTrapezoid')
        rowElement.appendChild(leftTrapezoidElement)

        // 右侧文字
        const literalElement = document.createElement('span')
        literalElement.classList.add('literal')
        literalElement.textContent = node.name
        rowElement.appendChild(literalElement)

        liElement.appendChild(rowElement)
        return liElement
    }

    // folder节点的样式
    if (node.type === 'folder') {
        console.log(123)
        rowElement.classList.add('folderRow')

        // 左侧箭头字体图标
        const arrowElement = document.createElement('i')
        arrowElement.classList.add('iconfont', 'icon-right')
        rowElement.appendChild(arrowElement)

        // 右侧文字
        const literalElement = document.createElement('span')
        literalElement.classList.add('literal')
        literalElement.textContent = node.name
        rowElement.appendChild(literalElement)

        liElement.appendChild(rowElement)
        return liElement
    }

    // file节点的样式
    if (node.type === 'file') {
        rowElement.classList.add('fileRow')

        // 左侧文件字体图标
        const fileIconElement = document.createElement('i')
        fileIconElement.classList.add('iconfont', 'icon-file')
        rowElement.appendChild(fileIconElement)

        // 右侧文字
        const literalElement = document.createElement('span')
        literalElement.classList.add('literal')
        literalElement.textContent = node.name
        rowElement.appendChild(literalElement)
    }

    liElement.appendChild(rowElement)
    return liElement
}

const mountNode = document.querySelector('.catalogue')
const treeElement = renderTree(tree, true, 0)
mountNode.appendChild(treeElement)

// 监听点击事件,实现折叠/展开功能
mountNode.addEventListener('click', toggleFolder)

/**
 * 本函数用于切换文件夹的折叠/展开状态
 * @param {MouseEvent} event - 点击事件对象
 * */
function toggleFolder(event) {
    const rowElement = event.target.closest('.row')
    if (rowElement === null) {
        return
    }

    // 找到row的父li元素
    const liElement = rowElement.closest('li')
    if (liElement === null) {
        return
    }

    // 只处理文件夹节点
    if (!liElement.classList.contains('node_folder')) {
        return
    }

    const isCollapsed = liElement.classList.contains('isCollapsed')
    const childrenElement = liElement.querySelector(':scope > ul')
    liElement.classList.add('animating')

    const folderId = Number(liElement.dataset.id)
    if (isCollapsed) {
        collapsedIdSet.delete(folderId)
        saveCollapsedIds()
        unfoldChildren(liElement, childrenElement)
        return
    }

    collapsedIdSet.add(folderId)
    saveCollapsedIds()
    foldChildren(liElement, childrenElement)
}

/**
 * 本函数用于展开文件夹节点的子节点
 * @param {HTMLLIElement} liElement - 需要展开的文件夹节点的li元素
 * @param {HTMLUListElement} childrenElement - 需要展开的子节点的ul元素
 * */
function unfoldChildren(liElement, childrenElement) {
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
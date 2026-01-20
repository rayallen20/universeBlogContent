export const tree = {
    id: 1,
    type: 'folder',
    name: '文件夹名称',
    title: '根文件夹的标题',
    intro: '根文件夹的简介',
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
}

/**
 * @type {Set<number>} collapsedIdSet 用于存储折叠文件夹ID的集合
 * */
export const collapsedIdSet = new Set()

/**
 * 本函数用于根据节点ID和深度判断节点是否应在加载后折叠
 * 规则: 根节点默认展开,其他folder节点默认折叠
 * @param {Object} node - 树形数据节点对象
 * @param {number} depth - 节点深度
 * @returns {boolean} - 是否应折叠
 * */
export function initCollapsed(node, depth) {
    if (node.type === 'folder' && depth >= 1) {
        collapsedIdSet.add(node.id)
    }

    if (node.hasOwnProperty('children')) {
        node.children.forEach(child => {
            initCollapsed(child, depth + 1)
        })
    }
}

/**
 * 本函数用于渲染树型结构的根节点
 * @param {Object} root - 树形数据根节点对象
 * @return {HTMLUListElement} - 表示树的ul元素
 * */
export function renderTree(root) {
    const ulElement = document.createElement('ul')
    ulElement.classList.add('tree')
    ulElement.appendChild(renderNode(root, 0))
    return ulElement
}

/**
 * 本函数用于渲染树型结构的节点 内部递归调用渲染节点的子节点
 * @param {Object} node - 树形数据节点对象
 * @param {number} depth - 当前节点的深度
 * @return {HTMLLIElement} - 表示节点li元素
 * */
function renderNode(node, depth) {
    const liElement = createLiElement(node, depth)

    const hasChildren = node.hasOwnProperty('children') && Array.isArray(node.children) && node.children.length > 0
    if (!hasChildren) {
        return liElement
    }

    const ulElement = document.createElement('ul')
    ulElement.classList.add('children')
    for (const child of node.children) {
        ulElement.appendChild(renderNode(child, depth + 1))
    }

    liElement.appendChild(ulElement)
    return liElement
}

/**
 * 本函数用于创建表示树中节点的li元素并设置其样式
 * @param {Object} node - 树形数据节点对象
 * @param {number} depth - 当前节点的深度
 * @returns {HTMLLIElement|null} - 创建的li元素 若节点类型不为folder且不为file则返回null
 * */
function createLiElement(node, depth) {
    const liElement = document.createElement('li')
    liElement.className = `node node_${node.type}`
    liElement.style.setProperty('--depth', String(depth))
    liElement.dataset.id = String(node.id)

    if (node.type === 'folder' && collapsedIdSet.has(node.id)) {
        liElement.classList.add('isCollapsed')
    }

    // 当前行
    const rowElement = document.createElement('div')
    rowElement.className = 'row'
    rowElement.style.paddingLeft = depth * 21 + 'px'

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

        liElement.appendChild(rowElement)
        return liElement
    }

    return null
}

/**
 * 本函数以DFS方式查找指定ID的节点及其路径
 * @param {Object} node - 当前节点对象
 * @param {number} targetId - 目标节点ID
 * @param {Array<string>} nameStack - 路径数组 该数组中的每个元素表示路径上的节点名称(即node.name)
 * @returns {{node: Object|null, path: string}} - 包含找到的节点对象和路径数组的对象 若未找到节点则node为null且path为空数组
 * */
export function dfsFindNodeWithPath(node, targetId, nameStack) {
    const nextStack = nameStack.concat(node.name)

    if (node.id === targetId) {
        return {
            node: node,
            path: nextStack.join('/')
        }
    }

    if (node.type === 'folder' && Array.isArray(node.children)) {
        for (const child of node.children) {
            const hit = dfsFindNodeWithPath(child, targetId, nextStack)
            if (hit.node !== null) {
                return hit
            }
        }
    }

    return {
        node: null,
        path: '',
    }
}
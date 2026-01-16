import '../assets/reset.css'
import '../assets/index.css'
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
        const liElement = document.createElement('li')
        liElement.className = `node node_${node.type}`

        // 当前行
        const rowElement = document.createElement('div')
        rowElement.className = 'row'
        rowElement.textContent = node.name
        liElement.appendChild(rowElement)

        const hasChildren = node.type === 'folder' && Array.isArray(node.children) && node.children.length > 0
        if (!hasChildren) {
            ulElement.appendChild(liElement)
            continue
        }

        // 处理文件夹节点
        // 子文件夹默认折叠
        if (depth >= 1) {
            liElement.classList.add('isCollapsed')
        }

        depth += 1

        const childrenElement = renderTree(node.children, false, depth)
        liElement.appendChild(childrenElement)

        ulElement.appendChild(liElement)
    }

    return ulElement
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
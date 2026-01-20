import '../assets/reset.css'
import '../assets/font.css'
import '../assets/iconfont/iconfont.css'
import 'simplebar/dist/simplebar.css';
import SimpleBar from "simplebar";
import '../assets/index.css'
import '../assets/header.css'
import '../assets/articleWrap.css'
import '../assets/scroll/common.css'
import '../assets/scroll/verticalScroll.css'
import '../assets/scroll/horizontalScroll.css'
import '../assets/catalogue.css'
import '../assets/article.css'
import '../assets/tree.css'
import {initCollapsed, renderTree, tree} from "./structure/tree";
import {toggleFolder} from "./interaction/toggleFolder";
import {renderIntro} from "./interaction/renderIntro";

const mountNode = document.querySelector('.catalogue')
initCollapsed(tree, 0)
const treeElement = renderTree(tree)
mountNode.appendChild(treeElement)

// 监听点击事件,实现折叠/展开功能
mountNode.addEventListener('click', clickHandle)

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

    // 渲染节点对应的内容
    renderIntro(liElement)
}
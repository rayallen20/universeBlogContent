import {dfsFindNodeWithPath, tree} from "../structure/tree";

export function renderIntro(liElement) {
    const targetId = liElement.dataset.id
    const {node, path} = dfsFindNodeWithPath(tree, Number(targetId), [])
    console.log(node)
    console.log(path)
}
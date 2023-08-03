const h = (tag, props, children) => {

    //vNode 是一个js对象
    return {
        tag,
        props,
        children
    }
}

const mount = (vNode, container) => {
    //vNode->element
    let el = vNode.el = document.createElement(vNode.tag);

    //处理props
    if (vNode.props) {
        for (const key in vNode.props) {
            if (Object.hasOwnProperty.call(vNode.props, key)) {
                //处理特殊情况，事件监听的实现
                if (key.startsWith("on")) {
                    el.addEventListener(key.slice(2).toLocaleLowerCase(), vNode.props[key])
                } else {
                    el.setAttribute(key, vNode.props[key])
                }
            }
        }
    }

    //处理children
    if (vNode.children) {
        if (typeof vNode.children === "string") {
            el.textContent = vNode.children
        } else if (Array.isArray(vNode.children)) {
            vNode.children.forEach(item => {
                if (typeof item === "string") {
                    el.textContent = item
                } else {
                    mount(item, el)
                }
            })
        } else {
            //对象的处理
        }
    }

    //将我们的el挂载到container中
    container.append(el)
}

const patch = (n1, n2) => {
    if (n1.tag !== n2.tag) {
        //类型不同直接取消旧的挂载
        let parent = n1.el.parentElement;
        parent.removeChildren(n1.el);
        mount(n2, parent);
    } else {
        //引用可以进行el的同步
        let el = n2.el = n1.el;
        //处理props
        const oldProps = n1.props || {};
        const newProps = n2.props || {};
        for (const key in newProps) {
            if (Object.hasOwnProperty.call(newProps, key)) {
                const newValue = newProps[key];
                const oldValue = oldProps[key];
                if (newValue !== oldValue) {
                    if (key.startsWith("on")) {
                        el.addEventListener(key.slice(2).toLocaleLowerCase(), newValue)
                    } else {
                        el.setAttribute(key, newValue)
                    }
                }
            }
        }

        //删除旧的props
        for (const key in oldProps) {
            //预先删除这个事件
            if (key.startsWith("on")) {
                const value = oldProps[key]
                el.removeEventListener(key.slice(2).toLocaleLowerCase(), value);
            }
            if (Object.hasOwnProperty(key)) {
                el.removeAttribute(key);

            }
        }

        //处理children
        const oldChildren = n1.children || [];
        const newChildren = n2.children || [];
        if (typeof newChildren === "string") {
            if (oldChildren === newChildren) return;
            //这里不可以用innerHtml会造成数据不响应
            //因为innerHtml会接收html???
            // debugger;
            el.textContent = newChildren;
        } else if (Array.isArray(newChildren)) {
            if (typeof oldChildren === "string") {
                el.textContent = "";
                newChildren.forEach(item => mount(item, el))
            } else {
                //拿到公共的长度（没有key的操作）
                const commonLength = Math.min(newChildren.length, oldChildren.length);
                //前面有相同节点的元素进行patch
                for (let i = 0; i < commonLength; i++) {
                    patch(oldChildren[i], newChildren[i]);
                }

                //newLength>oldLength
                if (newChildren.length > oldChildren.length) {
                    // for (let i = commonLength - 1; i < newChildren.length; i++) {
                    //     mount(newChildren[i], el);
                    // }
                    newChildren.slice(oldChildren.length).forEach(item => {
                        //特殊情况没有处理
                        mount(item, el);
                    })
                } else if (newChildren < oldChildren) {
                    oldChildren.slice(newChildren.length).forEach(item => {
                        el.removeChild(item.el)
                    })
                }
            }
        }
    }
}
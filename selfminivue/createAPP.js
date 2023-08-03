function createApp(app) {
    return {
        mount(selector) {
            const rootEl = document.querySelector(selector);
            let isMounted = false;
            let oldVNode = null
            watchEffect(() => {
                if (!isMounted) {
                    oldVNode = app.render();
                    mount(oldVNode, rootEl);
                    isMounted = true;
                } else {
                    const newVNode = app.render();
                    patch(oldVNode, newVNode);
                    oldVNode = newVNode;
                }
            })
        }
    }
}
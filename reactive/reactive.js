class Dep {
    constructor() {
        this.subscribes = new Set();
    }
    notify() {
        this.subscribes.forEach(effect => effect())
    };
    depend() {
        if (activeEffect) {
            this.subscribes.add(activeEffect)
        }
    }
};

let activeEffect = null;

function watchEffect(effect) {
    activeEffect = effect;
    effect()
    activeEffect = null;
};

const targetMap = new WeakMap();

function getDep(target, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    };

    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Dep();
        depsMap.set(key, dep);
        dep = depsMap.get(key);
    };
    return dep;
};

//浅响应
function reactive(raw) {
    //vue2数据劫持
    Object.keys(raw).forEach(key => {
        const dep = getDep(raw, key);
        let value = raw[key];
        //进行深层次的响应
        if (value instanceof Object) {
            value = reactive(value);
        }
        Object.defineProperty(raw, key, {
            get() {
                //当获取数据的值时，进行调用，存储此值所依赖的副作用
                dep.depend();
                return value;
            },
            set(newValue) {
                //当你设置值的时候调用所用依赖的副作用
                if (value !== newValue) {
                    value = newValue;
                    dep.notify();
                }
            }
        })
    })
    return raw;
};

//vue3通过proxy进行数据劫持
function reactiveProxy(raw) {
    return new Proxy(raw, {
        get(target, property) {
            const dep = getDep(target, property);
            dep.depend()
            return Reflect.get(...arguments);
        },
        set(target, property, newValue) {
            const dep = getDep(target, property);
            // Reflect.set(...arguments);
            target[property] = newValue;
            dep.notify();
        }
    })
}

// const info = reactive({ counter: 100, name: "张三", friend: { name: "李四" } });
const foo = reactiveProxy({ height: 169 })


// watchEffect(function() {
//     console.log("c*2:" + info.counter * 2);
// });
// watchEffect(function() {
//     console.log("c^2:" + Math.pow(info.counter, 2));
// });
// watchEffect(function() {
//     console.log("h*2:" + foo.height * 2);
// });
// watchEffect(function() {
//     console.log(info.friend.name);
// });
watchEffect(function() {
    console.log(foo.height);
});
// info.friend.name = "anna";
// info.counter++;
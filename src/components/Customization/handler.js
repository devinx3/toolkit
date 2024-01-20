export class RouteBuilder {
    static KEY_PREFIX = "customize-cat"
    static PATH_PREFIX = "/customize/cat"
    static builder(storeObj) {
        const builder = new RouteBuilder();
        builder.setCategory(storeObj.category);
        builder.setName(storeObj.name)
        builder.setComponent(storeObj.component)
        builder.setIcon(storeObj.icon)
        return builder;
    }
    setCategory(_category) { this._category = _category }
    setName(_name) { this._name = _name; }
    setComponent(_component) { this._component = _component; }
    setIcon(_icon) { this._icon = _icon }
    store() {
        return { category: this._category, name: this._name, component: this._component, icon: this._icon }
    }
    build({ createIconFont, createComponent }) {
        return {
            key: `${RouteBuilder.KEY_PREFIX}-${this._category}`,
            name: this._name,
            icon: createIconFont(this._icon),
            path: `${RouteBuilder.PATH_PREFIX}/${this._category}`,
            component: createComponent(this._category, this._name),
        }
    }
}
export const StorageHelper = (() => {
    const STORE_KEY = "devinx3.toolkit.customization.manage"
    const getStorage = () => {
        const str = localStorage.getItem(STORE_KEY);
        return str ? JSON.parse(str) : null;
    }
    const setStorage = (storeObj) => localStorage.setItem(STORE_KEY, JSON.stringify(storeObj));
    const listRoutes = () => {
        const obj = getStorage() || {};
        return obj?.routes || [];
    }
    const addRoute = (routeBuilder) => {
        const obj = getStorage() || {};
        obj.routes = obj.routes || [];
        obj.routes.push(routeBuilder.store());
        setStorage(obj);
    }
    const updateRoute = (routeBuilder) => {
        const obj = getStorage() || {};
        if (!obj?.routes) return;
        const storeRoute = routeBuilder.store();
        for (let i = 0; i < obj.routes.length; i++) {
            const route = obj.routes[i];
            if (route.category === storeRoute.category) {
                obj.routes[i] = storeRoute;
                break;
            }
        }
        setStorage(obj);
    }
    const removeRoute = (category) => {
        const obj = getStorage();
        if (!obj?.routes) return;
        obj.routes = obj.routes.filter(x => x.category !== category);
        setStorage(obj);
    }
    return { listRoutes, addRoute, updateRoute, removeRoute  }
})();
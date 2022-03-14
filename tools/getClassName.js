import classnames from "classnames";

export default function getClassName({
    className,
    modifiers = {},
    rootClass,
    styles = {},
}) {
    function getModifiers() {
        const updatedModifiers = {};
        const modifierKeys = Object.keys(modifiers);
        if (modifierKeys.length) {
            modifierKeys.forEach((modKey) => {
                const classKey = `${rootClass}--${modKey}`;
                const newClassName = styles[classKey] || classKey;

                updatedModifiers[newClassName] = modifiers[modKey];
            });
        }

        return updatedModifiers;
    }

    function getChildClass(childClassName) {
        const classKey = `${rootClass}__${childClassName}`;
        return styles[classKey] || classKey;
    }

    function getRootStyles() {
        return classnames(
            className,
            {
                ...getModifiers(),
            },
            styles[rootClass] || rootClass
        );
    }

    return [getRootStyles(), getChildClass];
}

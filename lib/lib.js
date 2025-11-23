const assert = (condition, message = "Assertion failed.") => {
    if(!condition) {
        throw new Error(message);
    }
};

const assertDefined = (obj) => {
    Object.entries(obj).forEach(([key, value]) => assert(typeof value !== "undefined", `Expected \`${key}\` to be defined`));
};

const unimplemented = () => { throw new Error("Unimplemented"); };

// who needs react
const makeElement = spec => {
    let classNames, id, rest;
    [ spec, ...classNames ] = spec.split(".");
    [ spec, id, ...rest ] = spec.split("#");
    assert(rest.length === 0, "Cannot have multiple IDs in specifier");
    let el = document.createElement(spec);
    if(classNames.length) {
        assert(classNames.every(name => !name.includes("#")), "ID specifier must come before class names");
        el.classList.add(...classNames);
    }
    if(id) {
        el.id = id;
    }
    return el;
};

export {
    assert,
    assertDefined,
    unimplemented,
    makeElement,
};

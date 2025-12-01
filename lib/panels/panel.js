import { assert } from "../lib.js";

class Panel {
    constructor({ base } = { base: document }) {
        this.base = base;
        this.transitionConcepts = [];
        this.panelEngine = null;
    }

    addTransitionConcept(cssOrElement, panelName, beforeFocus) {
        this.transitionConcepts.push({ cssOrElement, panelName, beforeFocus });
    }

    setPanelEngine(panelEngine) {
        this.panelEngine = panelEngine;
    }

    // XXX:
    // TODO: this is called every time a panel is viewed, but currently implementations contain one-time initialization stuff
    // split into initialize() and onFocus()
    initialize() {
        assert(this.panelEngine, `Cannot initialize panel ${this.constructor.name} without panel engine attached`);
    }

    querySelector(query) {
        return this.base.querySelector(query);
    }

    querySelectorAll(query) {
        return this.base.querySelectorAll(query);
    }
}

export { Panel };

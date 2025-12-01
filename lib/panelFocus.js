import { assert, assertDefined } from "./lib.js";

class PanelFocuser extends EventTarget {
    constructor({ base } = { base: document }) {
        super();
        assertDefined({ base });
        this.base = base;
        this.panels = new Map();
    }

    focus(panelCSSClass) {
        // TODO: warn for focusing same focus
        assertDefined({ panelCSSClass });
        let panelElements = [...this.base.querySelectorAll(".naixt-panel")];
        let targetPanel = panelElements.find(panel => panel.classList.contains(panelCSSClass));
        assert(targetPanel, `Cannot find ${panelCSSClass} panel`);

        let panelOrgans = this.panels.get(targetPanel);
        if(panelOrgans) {
            panelOrgans.initialize();
        }
        else {
            console.warn("No panel behavior defined for", panelCSSClass);
        }

        this.dispatchEvent(new CustomEvent("beforeFocus", { detail: panelCSSClass }));
        panelElements.forEach(panel => {
            panel.classList.add("hidden");
        });
        targetPanel.classList.remove("hidden");
    }
    
    addPanel(panelConstructor, cssOrElement, options = {}) {
        options = { base: this.base, ...options };
        let panel = new panelConstructor(options);
        panel.setPanelEngine(this);
        panel.transitionConcepts.forEach(({ cssOrElement, panelName, beforeFocus }) => {
            this.#addButtonTransition(cssOrElement, panelName, beforeFocus);
        });
        let element = this.base.querySelector(cssOrElement);
        assert(element, `Cannot add button transition to ${cssOrElement}: not defined`);
        this.panels.set(element, panel);
    }

    #addButtonTransition(cssOrElement, panelName, beforeFocus) {
        assertDefined(cssOrElement);
        let button = typeof cssOrElement === "string"
            ? this.base.querySelector(cssOrElement)
            : cssOrElement;
        assert(button, `Cannot add button transition to ${cssOrElement}: not defined`);
        button.addEventListener("click", () => {
            this.focus(panelName);
        });
        if(beforeFocus) {
            this.addEventListener("beforeFocus", ev => {
                if(ev.detail === panelName) {
                    beforeFocus()
                }
            });
        }
    }
};

export { PanelFocuser };

import { assert, assertDefined } from "./lib.js";

class PanelFocuser extends EventTarget {
    constructor({ base } = { base: document }) {
        super();
        assertDefined({ base });
        this.base = base;
    }

    focus(panelClass) {
        // TODO: warn for focusing same focus
        assertDefined({ panelClass });
        let panels = [...this.base.querySelectorAll(".naixt-panel")];
        let targetPanel = panels.find(panel => panel.classList.contains(panelClass));
        assert(targetPanel, `Cannot find ${panelClass} panel`);
        this.dispatchEvent(new CustomEvent("beforeFocus", { detail: panelClass }));
        panels.forEach(panel => {
            panel.classList.add("hidden");
        });
        targetPanel.classList.remove("hidden");
    }
    
    addButtonTransition(cssOrElement, panelName, beforeFocus) {
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

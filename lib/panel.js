import { assertDefined } from "./lib.js";

class PanelFocuser extends EventTarget {
    constructor({ base } = { base: document }) {
        super();
        assertDefined({ base });
        this.base = base;
    }

    focus(panelClass) {
        // TODO: warn for focusing same focus
        assertDefined({ panelClass });
        this.dispatchEvent(new CustomEvent("beforeFocus", { detail: panelClass }));
        this.base.querySelectorAll(".naixt-panel").forEach(panel => {
            panel.classList.toggle("hidden", !panel.classList.contains(panelClass));
        });
    }
    
    addButtonTransition(cssOrElement, panelName, beforeFocus) {
        assertDefined(cssOrElement);
        let button = typeof cssOrElement === "string"
            ? this.base.querySelector(cssOrElement)
            : cssOrElement;
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

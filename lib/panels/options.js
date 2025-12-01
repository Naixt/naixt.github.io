import { NaixtLocalStorage } from "../storage.js";
import { Panel } from "./panel.js";

class OptionsPanel extends Panel {
    constructor(options = {}) {
        super(options);
        this.optionsPeerServer = this.querySelector(".options-peer-server");
        this.optionsSaveButton = this.querySelector(".options-save");
        this.addTransitionConcept(".options-return", "interface-view");
    }

    syncOptionsVisualState() {
        this.optionsSaveButton.disabled = this.optionsPeerServer.value === NaixtLocalStorage.get("peerServer");
    }

    initialize() {
        super.initialize();
        this.optionsPeerServer.addEventListener("input", () => {
            this.syncOptionsVisualState();
        });
        this.optionsSaveButton.addEventListener("click", () => {
            NaixtLocalStorage.set("peerServer", this.optionsPeerServer.value);
            this.syncOptionsVisualState();
        });
        this.optionsPeerServer.value = NaixtLocalStorage.get("peerServer");
        this.syncOptionsVisualState();
    }
}

export { OptionsPanel };

import { assertDefined } from "../lib.js";
import { Panel } from "./panel.js";

class MainMenuPanel extends Panel {
    constructor(options) {
        super(options);
        let { peer } = options
        assertDefined({ peer });
        this.peer = peer;
        this.addTransitionConcept(".connect", "lobby-view");
    }

    initialize() {

    }
}

export { MainMenuPanel };

exports.PanelChanger = class {
    constructor(mapRef, panelConfig) {
        this.mapRef = mapRef;
        this.panelConfig = panelConfig;
        this.panelIndex = 0;

        // Change the panel once every ten seconds
        this.timeTimerId = setInterval(() => {
            this.panelAdvance();
        }, 10000);
    }

    panelAdvance() {
        this.mapRef.set(this.panelConfig[this.panelIndex]);
        this.panelIndex = (this.panelIndex + 1) % this.panelConfig.length;
    }
};
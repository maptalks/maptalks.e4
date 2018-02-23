import * as maptalks from 'maptalks';
import * as echarts from 'echarts';
import * as echartsgl from 'echarts-gl';
/**
 * set echart container dom attribute
 */
const options = {
    'container': 'front',
    'renderer': 'dom',
    'hideOnZooming': false,
    'hideOnMoving': false,
    'hideOnRotating': false
};

export class E4Layer extends maptalks.Layer {

    constructor(id, ecOptions, options, maptalksLayer = null) {
        super(id, options);
        this._ecOptions = ecOptions;
        this._maptalksLayer = maptalksLayer;
    }

    getEChartsOption() {
        return this._ecOptions;
    }
    
    getAdditionalLayer(){
        return this._maptalksLayer;
    }

    setEChartsOption(ecOption) {
        this._ecOptions = ecOption;
        if (this._getRenderer()) {
            this._getRenderer()._clearAndRedraw();
        }
        return this;
    }

    /**
     * Export the E3Layer's JSON.
     * @return {Object} layer's JSON
     */
    toJSON() {
        return {
            'type': this.getJSONType(),
            'id': this.getId(),
            'ecOptions': this._ecOptions,
            'options': this.config()
        };
    }

    /**
     * Reproduce an E3Layer from layer's JSON.
     * @param  {Object} json - layer's JSON
     * @return {maptalks.E3Layer}
     * @static
     * @private
     * @function
     */
    static fromJSON(json) {
        if (!json || json['type'] !== 'E3Layer') { return null; }
        return new E4Layer(json['id'], json['ecOptions'], json['options']);
    }
}

E4Layer.mergeOptions(options);

E4Layer.registerJSONType('E4Layer');

E4Layer.registerRenderer('dom', class {

    constructor(layer) {
        this.layer = layer;
    }

    render() {
        //init Container
        if (!this._container) {
            this._createLayerContainer();
        }
        //init echart
        if (!this._ec) {
            this._ec = echarts.init(this._container);
            this._prepareECharts();
            this._ec.setOption(this.layer._ecOptions, false);
            this._ecMaptalks = this._ec.getModel().getComponent('maptalks3D').getMaptalks();
            const _additionalLayer = this.layer.getAdditionalLayer();
            if(_additionalLayer){
                this._ecMaptalks.addLayer(_additionalLayer);
            } 
        }
        //resize 
        else if (this._isVisible()) {
            this._ec.resize();
        }
        //
        this.layer.fire('layerload');
    }

    drawOnInteracting() {
        if (this._isVisible()) {
            this._clearAndRedraw();
        }
    }

    needToRedraw() {
        const map = this.getMap();
        const renderer = map._getRenderer();
        return map.isInteracting() || renderer && (renderer.isStateChanged && renderer.isStateChanged() || renderer.isViewChanged && renderer.isViewChanged());
    }

    getMap() {
        return this.layer.getMap();
    }

    _isVisible() {
        return this._container && this._container.style.display === '';
    }

    show() {
        if (this._container) {
            this._container.style.display = '';
        }
    }

    hide() {
        if (this._container) {
            this._container.style.display = 'none';
        }
    }

    remove() {
        this._ec.clear();
        this._ec.dispose();
        delete this._ec;
        this._removeLayerContainer();
    }

    clear() {
        this._ec.clear();
    }

    setZIndex(z) {
        this._zIndex = z;
        if (this._container) {
            this._container.style.zIndex = z;

        }
    }

    isCanvasRender() {
        return false;
    }

    _prepareECharts() {
        //ecOptions
        const ecOptions = this.layer._ecOptions,
            map = this.getMap(),
            center = map.getCenter(),
            zoom = map.getZoom(),
            pitch = map.getPitch(),
            bearing = map.getBearing();
        //modify view
        ecOptions.maptalks3D.center = [center.x, center.y];
        ecOptions.maptalks3D.zoom = zoom;
        ecOptions.maptalks3D.pitch = pitch;
        ecOptions.maptalks3D.bearing = bearing;
        //series
        const series = this.layer._ecOptions.series;
        if (series) {
            for (let i = series.length - 1; i >= 0; i--) {
                //change coordinateSystem to maptalks
                series[i]['coordinateSystem'] = 'maptalks3D'
                //disable update animations
                series[i]['animation'] = false;
            }
        }
    }

    _createLayerContainer() {
        const container = this._container = maptalks.DomUtil.createEl('div');
        container.style.cssText = 'position:absolute;left:0px;top:0px;';
        if (this._zIndex) {
            container.style.zIndex = this._zIndex;
        }
        this._resetContainer();
        const parentContainer = this.layer.options['container'] === 'front' ? this.getMap()._panels['frontStatic'] : this.getMap()._panels['backStatic'];
        parentContainer.appendChild(container);
    }

    _removeLayerContainer() {
        if (this._container) {
            maptalks.DomUtil.removeDomNode(this._container);
        }
        delete this._levelContainers;
    }

    _resetContainer() {
        const size = this.getMap().getSize();
        this._container.style.width = size.width + 'px';
        this._container.style.height = size.height + 'px';
    }

    getEvents() {
        return {
            '_zoomstart': this.onZoomStart,
            '_zoomend': this.onZoomEnd,
            '_dragrotatestart': this.onDragRotateStart,
            '_dragrotateend': this.onDragRotateEnd,
            '_movestart': this.onMoveStart,
            '_moveend': this.onMoveEnd,
            '_resize': this._resetContainer
        };
    }

    _clearAndRedraw() {
        if (this._container && this._container.style.display === 'none') {
            return;
        }
        //this._ec.clear();
        const map = this.getMap(),
            center = map.getCenter(),
            zoom = map.getZoom(),
            pitch = map.getPitch(),
            bearing = map.getBearing();
        const ecMaptalks = this._ecMaptalks;
        ecMaptalks.setCenter([center.x, center.y]);
        ecMaptalks.setZoom(zoom);
        ecMaptalks.setPitch(pitch);
        ecMaptalks.setBearing(bearing);
        //this._ec.resize();
    }

    onZoomStart() {
        if (!this.layer.options['hideOnZooming']) {
            return;
        }
        this.hide();
    }

    onZoomEnd() {
        if (!this.layer.options['hideOnZooming']) {
            return;
        }
        this.show();
        this._clearAndRedraw();
    }

    onDragRotateStart() {
        if (!this.layer.options['hideOnRotating']) {
            return;
        }
        this.hide();
    }

    onDragRotateEnd() {
        if (!this.layer.options['hideOnRotating']) {
            return;
        }
        this.show();
        this._clearAndRedraw();
    }

    onMoveStart() {
        if (!this.layer.options['hideOnMoving']) {
            return;
        }
        this.hide();
    }

    onMoveEnd() {
        if (!this.layer.options['hideOnMoving']) {
            return;
        }
        this.show();
        this._clearAndRedraw();
    }

});
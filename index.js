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
    constructor(id, ecOptions, options) {
        super(id, options);
        this._ecOptions = ecOptions;
    }
}

E4Layer.mergeOptions(options);

E4Layer.registerRenderer('dom', class {

    constructor(layer) {
        this.layer = layer;
    }
    /**
     * 
     */
    _resetContainer() {
        const size = this.getMap().getSize();
        this._container.style.width = size.width + 'px';
        this._container.style.height = size.height + 'px';
    }
    /**
     * 
     */
    isCanvasRender() {
        return false;
    }
    /**
     * 
     * @param {Int} z 
     */
    setZIndex(z) {
        this._zIndex = z;
        if (this._container) {
            this._container.style.zIndex = z;
        }
    }
    /**
     * 
     */
    getMap() {
        return this.layer.getMap();
    }
    /**
     * 
     */
    render() {
        //create div
        if (!this._container)
            this._createLayerContainer();
        //init ec
        if (!this._ec)
            this._createEcharts();
        //set echarts options
        this._ec.setOption(this.layer._ecOptions, false);
        //fire event
        this.layer.fire('layerload');
    }
    /**
     * create div to init　echarts
     */
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
    /**
     * init echarts by container
     */
    _createEcharts() {
        const ec = this._ec = echarts.init(this._container);
        //prepareCharts
        this._coordSystemName = 'maptalks' + maptalks.Util.GUID();
        /**
         * https://github.com/ecomfe/echarts/blob/debcd7f324b77ad444f7ba31195535c749d08e53/src/echarts.js#L1957
         */
        echarts.registerCoordinateSystem(this._coordSystemName, this._getE3CoordinateSystem(this.getMap()));
        //modify series's coordinateSystem
        const series = this.layer._ecOptions.series;
        series?this._monitorSeries(series):null;
    }
        /**
     * Coordinate System for echarts 3
     * based on echarts's bmap plugin
     * https://github.com/ecomfe/echarts/blob/f383dcc1adb4c7b9e1888bda3fc976561a788020/extension/bmap/BMapCoordSys.js
     */
    _getE3CoordinateSystem(map) {
        const CoordSystem = function (map) {
            this.map = map;
            this._mapOffset = [0, 0];
        };
        const me = this;
        CoordSystem.create = function (ecModel/*, api*/) {
            ecModel.eachSeries(function (seriesModel) {
                if (seriesModel.get('coordinateSystem') === me._coordSystemName) {
                    seriesModel.coordinateSystem = new CoordSystem(map);
                }
            });
        };

        CoordSystem.getDimensionsInfo = function () {
            return ['x', 'y'];
        };

        CoordSystem.dimensions = ['x', 'y'];

        maptalks.Util.extend(CoordSystem.prototype, {
            dimensions : ['x', 'y'],

            setMapOffset(mapOffset) {
                this._mapOffset = mapOffset;
            },

            dataToPoint(data) {
                const coord = new maptalks.Coordinate(data);
                const px = this.map.coordinateToContainerPoint(coord);
                const mapOffset = this._mapOffset;
                return [px.x - mapOffset[0], px.y - mapOffset[1]];
            },

            pointToData(pt) {
                const mapOffset = this._mapOffset;
                const data = this.map.containerPointToCoordinate({
                    x: pt[0] + mapOffset[0],
                    y: pt[1] + mapOffset[1]
                });
                return [data.x, data.y];
            },

            getViewRect() {
                const size = this.map.getSize();
                return new echarts.graphic.BoundingRect(0, 0, size.width, size.height);
            },

            getRoamTransform() {
                return echarts.matrix.create();
            }
        });

        return CoordSystem;
    }
    /**
     * 
     */
    _monitorSeries(series) {
        for (let i = series.length - 1; i >= 0; i--) {
            //change coordinateSystem to maptalks
            series[i]['coordinateSystem'] = this._coordSystemName;
            //disable update animations
            series[i]['animation'] = false;
        }
    }

});

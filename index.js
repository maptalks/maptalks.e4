import * as maptalks from 'maptalks';
import * as echarts from 'echarts';
import * as echartsgl from 'echarts-gl';
/**
 * set echart container dom attribute
 */
const options = {
    'container' : 'front',
    'renderer' : 'dom',
    'hideOnZooming' : false,
    'hideOnMoving' : false,
    'hideOnRotating' : false
};

export class E4Layer extends maptalks.Layer {
    constructor(id, ecOptions, options) {
        super(id, options);
        this._ecOptions = ecOptions;
    }
}

E4Layer.mergeOptions(options);

E3Layer.registerRenderer('dom',class{

    constructor(layer) {
        this.layer = layer;
    }

    getMap() {
        return this.layer.getMap();
    }

    render(){
        //create div
        if(!this._container)
            this._createLayerContainer();
        //init ec
        if(!this._ec)
            this._createEcharts();
        //set echarts options
        this._ec.setOption(this.layer._ecOptions,false);
    }

    /**
     * create div to init　echarts
     */
    _createLayerContainer(){
        const container = this._container = maptalks.DomUtil.createEl('div');
        container.style.cssText = 'position:absolute;left:0px;top:0px;';
        if (this._zIndex) {
            container.style.zIndex = this._zIndex;
        }
        this._resetContainer();
        const parentContainer = this.layer.options['container'] === 'front' ? this.getMap()._panels['frontStatic'] : this.getMap()._panels['backStatic'];
        parentContainer.appendChild(container);
    }

    _createEcharts(){
        const ec = this._ec = echarts.init(this._container);
        //prepareCharts
        this._coordSystemName = 'maptalks' + maptalks.Util.GUID();
        /**
         * https://github.com/ecomfe/echarts/blob/debcd7f324b77ad444f7ba31195535c749d08e53/src/echarts.js#L1957
         */
        echarts.registerCoordinateSystem(this._coordSystemName, this._getE3CoordinateSystem(this.getMap()));
        //modify series's coordinateSystem
        const series = this.layer._ecOptions.series;
        if (series) {
            for (let i = series.length - 1; i >= 0; i--) {
                //change coordinateSystem to maptalks
                series[i]['coordinateSystem'] = this._coordSystemName;
                //disable update animations
                series[i]['animation'] = false;
            }
        }
    }


    _prepareECharts(){

    }

    _createLayerContainer(){

    }





});

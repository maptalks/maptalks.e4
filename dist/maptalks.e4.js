/*!
 * maptalks.e4 v1.0.0
 * LICENSE : ISC
 * (c) 2016-2018 maptalks.org
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('maptalks'), require('echarts'), require('echarts-gl')) :
	typeof define === 'function' && define.amd ? define(['exports', 'maptalks', 'echarts', 'echarts-gl'], factory) :
	(factory((global.maptalks = global.maptalks || {}),global.maptalks,global.echarts,global.echartsGl));
}(this, (function (exports,maptalks,echarts,echartsGl) { 'use strict';

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var options = {
    'container': 'front',
    'renderer': 'dom',
    'hideOnZooming': false,
    'hideOnMoving': false,
    'hideOnRotating': false
};

var E4Layer = function (_maptalks$Layer) {
    _inherits(E4Layer, _maptalks$Layer);

    function E4Layer(id, ecOptions, options) {
        var maptalksLayer = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

        _classCallCheck(this, E4Layer);

        var _this = _possibleConstructorReturn(this, _maptalks$Layer.call(this, id, options));

        _this._ecOptions = ecOptions;
        _this._maptalksLayer = maptalksLayer;
        return _this;
    }

    E4Layer.prototype.getEChartsOption = function getEChartsOption() {
        return this._ecOptions;
    };

    E4Layer.prototype.getAdditionalLayer = function getAdditionalLayer() {
        return this._maptalksLayer;
    };

    E4Layer.prototype.setEChartsOption = function setEChartsOption(ecOption) {
        this._ecOptions = ecOption;
        if (this._getRenderer()) {
            this._getRenderer()._clearAndRedraw();
        }
        return this;
    };

    E4Layer.prototype.toJSON = function toJSON() {
        return {
            'type': this.getJSONType(),
            'id': this.getId(),
            'ecOptions': this._ecOptions,
            'options': this.config()
        };
    };

    E4Layer.fromJSON = function fromJSON(json) {
        if (!json || json['type'] !== 'E3Layer') {
            return null;
        }
        return new E4Layer(json['id'], json['ecOptions'], json['options']);
    };

    return E4Layer;
}(maptalks.Layer);

E4Layer.mergeOptions(options);

E4Layer.registerJSONType('E4Layer');

E4Layer.registerRenderer('dom', function () {
    function _class(layer) {
        _classCallCheck(this, _class);

        this.layer = layer;
    }

    _class.prototype.render = function render() {
        if (!this._container) {
            this._createLayerContainer();
        }

        if (!this._ec) {
            this._prepareECharts();
            this._ec = echarts.init(this._container);
            this._ec.setOption(this.layer._ecOptions, false);
            var maptalks3DComponent = this._ec.getModel().getComponent('maptalks3D');
            var maptalks2DComponent = this._ec.getModel().getComponent('maptalks2D');
            this._ecMaptalks3D = maptalks3DComponent ? maptalks3DComponent.getMaptalks() : null;
            this._ecMaptalks2D = maptalks2DComponent ? maptalks2DComponent.getMaptalks() : null;
            if (this._ecMaptalks3D && this.layer.options['removeBaseLayer']) {
                this._ecMaptalks3D.removeBaseLayer();
            }
            if (this._ecMaptalks2D && this.layer.options['removeBaseLayer']) {
                this._ecMaptalks2D.removeBaseLayer();
            }
        } else if (this._isVisible()) {
                this._ec.resize();
            }

        this.layer.fire('layerload');
    };

    _class.prototype.drawOnInteracting = function drawOnInteracting() {
        if (this._isVisible()) {
            this._clearAndRedraw();
        }
    };

    _class.prototype.needToRedraw = function needToRedraw() {
        var map = this.getMap();
        var renderer = map._getRenderer();
        return map.isInteracting() || renderer && (renderer.isStateChanged && renderer.isStateChanged() || renderer.isViewChanged && renderer.isViewChanged());
    };

    _class.prototype.getMap = function getMap() {
        return this.layer.getMap();
    };

    _class.prototype._isVisible = function _isVisible() {
        return this._container && this._container.style.display === '';
    };

    _class.prototype.show = function show() {
        if (this._container) {
            this._container.style.display = '';
        }
    };

    _class.prototype.hide = function hide() {
        if (this._container) {
            this._container.style.display = 'none';
        }
    };

    _class.prototype.remove = function remove() {
        this._ec.clear();
        this._ec.dispose();
        delete this._ec;
        this._removeLayerContainer();
    };

    _class.prototype.clear = function clear() {
        this._ec.clear();
    };

    _class.prototype.setZIndex = function setZIndex(z) {
        this._zIndex = z;
        if (this._container) {
            this._container.style.zIndex = z;
        }
    };

    _class.prototype.isCanvasRender = function isCanvasRender() {
        return false;
    };

    _class.prototype._prepareECharts = function _prepareECharts() {
        var ecOptions = this.layer._ecOptions,
            map = this.getMap(),
            center = map.getCenter(),
            zoom = map.getZoom(),
            pitch = map.getPitch(),
            bearing = map.getBearing();

        var series = ecOptions.series;
        if (series) {
            for (var i = series.length - 1; i >= 0; i--) {
                series[i]['animation'] = false;
            }
        }

        if (ecOptions.maptalks3D) {
            ecOptions.maptalks3D.center = [center.x, center.y];
            ecOptions.maptalks3D.zoom = zoom;
            ecOptions.maptalks3D.pitch = pitch;
            ecOptions.maptalks3D.bearing = bearing;
        }

        var maptalks2DCoordSys = this._createMaptalks2DCoordinateSystem(map);

        var maptalks2DModal = echarts.extendComponentModel({
            type: 'maptalks2D',
            getMaptalks: function getMaptalks() {
                return this.map;
            },
            defaultOption: {
                center: [104.114129, 37.550339],
                zoom: 5
            }
        });

        var maptalks2DView = echarts.extendComponentView({
            type: 'maptalks2D',
            render: function render(maptalksModel2D, ecModel, api) {}
        });

        echarts.registerCoordinateSystem('maptalks2D', maptalks2DCoordSys);
    };

    _class.prototype._createMaptalks2DCoordinateSystem = function _createMaptalks2DCoordinateSystem(map) {

        var Maptalks2DCoorSys = function Maptalks2DCoorSys(map, api) {
            this.map = map;
            this.dimensions = ['lng', 'lat'];
            this._mapOffset = [0, 0];
            this._api = api;
        };

        Maptalks2DCoorSys.prototype.dimensions = ['lng', 'lat'];

        Maptalks2DCoorSys.dimensions = Maptalks2DCoorSys.prototype.dimensions;

        Maptalks2DCoorSys.create = function (ecModel, api) {

            var maptalks2dCoordSys;

            ecModel.eachComponent('maptalks2D', function (maptalks2DModel) {
                maptalks2DModel.map = map;
                maptalks2DModel.coordinateSystem = maptalks2dCoordSys = new Maptalks2DCoorSys(map, api);
            });

            ecModel.eachSeries(function (seriesModel) {
                if (seriesModel.get('coordinateSystem') === 'maptalks2D') {
                    seriesModel.coordinateSystem = maptalks2dCoordSys;
                }
            });
        };

        maptalks.Util.extend(Maptalks2DCoorSys.prototype, {
            setMapOffset: function setMapOffset(mapOffset) {
                this._mapOffset = mapOffset;
            },
            dataToPoint: function dataToPoint(data) {
                var coord = new maptalks.Coordinate(data);
                var px = this.map.coordinateToContainerPoint(coord);
                var mapOffset = this._mapOffset;
                return [px.x - mapOffset[0], px.y - mapOffset[1]];
            },
            pointToData: function pointToData(pt) {
                var mapOffset = this._mapOffset;
                var data = this.map.containerPointToCoordinate({
                    x: pt[0] + mapOffset[0],
                    y: pt[1] + mapOffset[1]
                });
                return [data.x, data.y];
            },
            getViewRect: function getViewRect() {
                var size = this.map.getSize();
                return new echarts.graphic.BoundingRect(0, 0, size.width, size.height);
            },
            getRoamTransform: function getRoamTransform() {
                return echarts.matrix.create();
            }
        });

        return Maptalks2DCoorSys;
    };

    _class.prototype._createLayerContainer = function _createLayerContainer() {
        var container = this._container = maptalks.DomUtil.createEl('div');
        container.style.cssText = 'position:absolute;left:0px;top:0px;';
        if (this._zIndex) {
            container.style.zIndex = this._zIndex;
        }
        this._resetContainer();
        var parentContainer = this.layer.options['container'] === 'front' ? this.getMap()._panels['frontStatic'] : this.getMap()._panels['backStatic'];
        parentContainer.appendChild(container);
    };

    _class.prototype._removeLayerContainer = function _removeLayerContainer() {
        if (this._container) {
            maptalks.DomUtil.removeDomNode(this._container);
        }
        delete this._levelContainers;
    };

    _class.prototype._resetContainer = function _resetContainer() {
        var size = this.getMap().getSize();
        this._container.style.width = size.width + 'px';
        this._container.style.height = size.height + 'px';
    };

    _class.prototype.getEvents = function getEvents() {
        return {
            '_zoomstart': this.onZoomStart,
            '_zoomend': this.onZoomEnd,
            '_dragrotatestart': this.onDragRotateStart,
            '_dragrotateend': this.onDragRotateEnd,
            '_movestart': this.onMoveStart,
            '_moveend': this.onMoveEnd,
            '_resize': this._resetContainer
        };
    };

    _class.prototype._clearAndRedraw = function _clearAndRedraw() {
        if (this._container && this._container.style.display === 'none') {
            return;
        }
        var map = this.getMap(),
            center = map.getCenter(),
            zoom = map.getZoom(),
            pitch = map.getPitch(),
            bearing = map.getBearing();
        var ecMaptalks2D = this._ecMaptalks2D;
        var ecMaptalks3D = this._ecMaptalks3D;
        if (ecMaptalks2D) {
            ecMaptalks2D.setCenter([center.x, center.y]);
            ecMaptalks2D.setZoom(zoom);
            ecMaptalks2D.setPitch(pitch);
            ecMaptalks2D.setBearing(bearing);
            this._ec.resize();
        }
        if (ecMaptalks3D) {
            ecMaptalks3D.setCenter([center.x, center.y]);
            ecMaptalks3D.setZoom(zoom);
            ecMaptalks3D.setPitch(pitch);
            ecMaptalks3D.setBearing(bearing);
        }
    };

    _class.prototype.onZoomStart = function onZoomStart() {
        if (!this.layer.options['hideOnZooming']) {
            return;
        }
        this.hide();
    };

    _class.prototype.onZoomEnd = function onZoomEnd() {
        if (!this.layer.options['hideOnZooming']) {
            return;
        }
        this.show();
        this._clearAndRedraw();
    };

    _class.prototype.onDragRotateStart = function onDragRotateStart() {
        if (!this.layer.options['hideOnRotating']) {
            return;
        }
        this.hide();
    };

    _class.prototype.onDragRotateEnd = function onDragRotateEnd() {
        if (!this.layer.options['hideOnRotating']) {
            return;
        }
        this.show();
        this._clearAndRedraw();
    };

    _class.prototype.onMoveStart = function onMoveStart() {
        if (!this.layer.options['hideOnMoving']) {
            return;
        }
        this.hide();
    };

    _class.prototype.onMoveEnd = function onMoveEnd() {
        if (!this.layer.options['hideOnMoving']) {
            return;
        }
        this.show();
        this._clearAndRedraw();
    };

    return _class;
}());

exports.E4Layer = E4Layer;

Object.defineProperty(exports, '__esModule', { value: true });

typeof console !== 'undefined' && console.log('maptalks.e4 v1.0.0');

})));

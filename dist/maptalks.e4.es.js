/*!
 * maptalks.e4 v1.0.0
 * LICENSE : ISC
 * (c) 2016-2018 maptalks.org
 */
import { Coordinate, DomUtil, Layer, Util } from 'maptalks';
import { graphic, init, matrix } from 'echarts';
import 'echarts-gl';

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
        _classCallCheck(this, E4Layer);

        var _this = _possibleConstructorReturn(this, _maptalks$Layer.call(this, id, options));

        _this._ecOptions = ecOptions;
        return _this;
    }

    return E4Layer;
}(Layer);

E4Layer.mergeOptions(options);

E4Layer.registerRenderer('dom', function () {
    function _class(layer) {
        _classCallCheck(this, _class);

        this.layer = layer;
    }

    _class.prototype._resetContainer = function _resetContainer() {
        var size = this.getMap().getSize();
        this._container.style.width = size.width + 'px';
        this._container.style.height = size.height + 'px';
    };

    _class.prototype.isCanvasRender = function isCanvasRender() {
        return false;
    };

    _class.prototype.setZIndex = function setZIndex(z) {
        this._zIndex = z;
        if (this._container) {
            this._container.style.zIndex = z;
        }
    };

    _class.prototype.getMap = function getMap() {
        return this.layer.getMap();
    };

    _class.prototype.render = function render() {
        if (!this._container) this._createLayerContainer();

        if (!this._ec) this._createEcharts();

        this._ec.setOption(this.layer._ecOptions, false);

        this.layer.fire('layerload');
    };

    _class.prototype._createLayerContainer = function _createLayerContainer() {
        var container = this._container = DomUtil.createEl('div');
        container.style.cssText = 'position:absolute;left:0px;top:0px;';
        if (this._zIndex) {
            container.style.zIndex = this._zIndex;
        }
        this._resetContainer();
        var parentContainer = this.layer.options['container'] === 'front' ? this.getMap()._panels['frontStatic'] : this.getMap()._panels['backStatic'];
        parentContainer.appendChild(container);
    };

    _class.prototype._createEcharts = function _createEcharts() {
        var ec = this._ec = init(this._container);
    };

    _class.prototype._getE3CoordinateSystem = function _getE3CoordinateSystem(map) {
        var CoordSystem = function CoordSystem(map) {
            this.map = map;
            this._mapOffset = [0, 0];
        };
        var me = this;
        CoordSystem.create = function (ecModel) {
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
        Util.extend(CoordSystem.prototype, {
            dimensions: ['x', 'y'],
            setMapOffset: function setMapOffset(mapOffset) {
                this._mapOffset = mapOffset;
            },
            dataToPoint: function dataToPoint(data) {
                var coord = new Coordinate(data);
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
                return new graphic.BoundingRect(0, 0, size.width, size.height);
            },
            getRoamTransform: function getRoamTransform() {
                return matrix.create();
            }
        });

        return CoordSystem;
    };

    _class.prototype._monitorSeries = function _monitorSeries(series) {
        for (var i = series.length - 1; i >= 0; i--) {
            series[i]['coordinateSystem'] = 'maptalks3D';

            series[i]['animation'] = false;
        }
    };

    return _class;
}());

export { E4Layer };

typeof console !== 'undefined' && console.log('maptalks.e4 v1.0.0');

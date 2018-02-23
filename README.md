# maptalks.e4
A plugin for echarts 4.0

### usage ###
```javascript
//new map
var map = new maptalks.Map("map", {
  center: [104.114129, 37.550339],
  zoom: 3,
  attributionControl: {
    'content': '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
});
//new e4layer
var e4Layer = new maptalks.E4Layer('e4', ecOption, { hideOnZooming: false, hideOnRotating: false, hideOnMoving: false }).addTo(map);
```
>if you want to use an addintial layer instead of echart-gl's default tile map layer,you can set addintlayer options in e4layer
```javascript
var addintiallayer = new maptalks.TileLayer('base', {
  'urlTemplate': 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
  'subdomains': ['a', 'b', 'c', 'd']
});
//set addintiallayer parameter
var e4Layer = new maptalks.E4Layer('e4', ecOption, { hideOnZooming: false, hideOnRotating: false, hideOnMoving: false },addintiallayer).addTo(map);
```

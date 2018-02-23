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
![2rr56x ti 7 8 h r_x](https://user-images.githubusercontent.com/5127112/36574772-3ab165de-1882-11e8-8af8-f11ec53d9732.png)
>adding addintlayer options in e4layer to replace echart-gl's default tile map layer
```javascript
var addintiallayer = new maptalks.TileLayer('base', {
  'urlTemplate': 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
  'subdomains': ['a', 'b', 'c', 'd']
});
//set addintiallayer parameter
var e4Layer = new maptalks.E4Layer('e4', ecOption, { hideOnZooming: false, hideOnRotating: false, hideOnMoving: false },addintiallayer).addTo(map);
```
![opflbx7j_py l u9hn _uf](https://user-images.githubusercontent.com/5127112/36574770-391da534-1882-11e8-8d21-e690179a06d6.png)

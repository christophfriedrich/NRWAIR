// config
var baseurlmap = 'http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/WMTS/1.0.0/?service=WMTS&request=GetTile&version=1.0.0&layer=Canvas_World_Light_Gray_Base&style=default&format=image/png&tilematrixset=default028mm&';
var baseurlref = 'http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Reference/MapServer/WMTS/1.0.0/?service=WMTS&request=GetTile&version=1.0.0&layer=Canvas_World_Light_Gray_Reference&style=default&format=image/png&tilematrixset=default028mm&';
var baseurlapi = '/52n-sos-webapp/service';

// global variables
var currX, currY, currZoom = 0;
var maxX,  maxY,  maxZoom  = 0;
var ajax;

function displayCurrentMapParameters() {
  document.getElementById('mapparameters').innerHTML =
    'X = ' + currX + ' <br> ' +
    'Y = ' + currY + ' <br> ' +
    'Zoom = ' + currZoom + ' <br> ' +
    'Time = ' + new Date(parseInt(document.getElementById('time').value+'000')).toLocaleDateString();
}

function showTile(zoom, x, y) {
  document.getElementById('upperleft').src    = baseurlmap + 'tilematrix=' + zoom + '&tilerow=' + (x-1) + '&tilecol=' + (y-1);
  document.getElementById('uppermiddle').src  = baseurlmap + 'tilematrix=' + zoom + '&tilerow=' + (x-1) + '&tilecol=' +  y;
  document.getElementById('upperright').src   = baseurlmap + 'tilematrix=' + zoom + '&tilerow=' + (x-1) + '&tilecol=' + (y+1);
  document.getElementById('centerleft').src   = baseurlmap + 'tilematrix=' + zoom + '&tilerow=' +  x    + '&tilecol=' + (y-1);
  document.getElementById('centermiddle').src = baseurlmap + 'tilematrix=' + zoom + '&tilerow=' +  x    + '&tilecol=' +  y;
  document.getElementById('centerright').src  = baseurlmap + 'tilematrix=' + zoom + '&tilerow=' +  x    + '&tilecol=' + (y+1);
  document.getElementById('lowerleft').src    = baseurlmap + 'tilematrix=' + zoom + '&tilerow=' + (x+1) + '&tilecol=' + (y-1);
  document.getElementById('lowermiddle').src  = baseurlmap + 'tilematrix=' + zoom + '&tilerow=' + (x+1) + '&tilecol=' + y;
  document.getElementById('lowerright').src   = baseurlmap + 'tilematrix=' + zoom + '&tilerow=' + (x+1) + '&tilecol=' + (y+1);
  
  document.getElementById('upperleft2').src    = baseurlref + 'tilematrix=' + zoom + '&tilerow=' + (x-1) + '&tilecol=' + (y-1);
  document.getElementById('uppermiddle2').src  = baseurlref + 'tilematrix=' + zoom + '&tilerow=' + (x-1) + '&tilecol=' +  y;
  document.getElementById('upperright2').src   = baseurlref + 'tilematrix=' + zoom + '&tilerow=' + (x-1) + '&tilecol=' + (y+1);
  document.getElementById('centerleft2').src   = baseurlref + 'tilematrix=' + zoom + '&tilerow=' +  x    + '&tilecol=' + (y-1);
  document.getElementById('centermiddle2').src = baseurlref + 'tilematrix=' + zoom + '&tilerow=' +  x    + '&tilecol=' +  y;
  document.getElementById('centerright2').src  = baseurlref + 'tilematrix=' + zoom + '&tilerow=' +  x    + '&tilecol=' + (y+1);
  document.getElementById('lowerleft2').src    = baseurlref + 'tilematrix=' + zoom + '&tilerow=' + (x+1) + '&tilecol=' + (y-1);
  document.getElementById('lowermiddle2').src  = baseurlref + 'tilematrix=' + zoom + '&tilerow=' + (x+1) + '&tilecol=' + y;
  document.getElementById('lowerright2').src   = baseurlref + 'tilematrix=' + zoom + '&tilerow=' + (x+1) + '&tilecol=' + (y+1);
  
  displayCurrentMapParameters();
  updateMarkers();
}

function showCurrTile() {
  showTile(currZoom, currX, currY);
}

function up() {
  if(currX != 0) {
    currX -= 1;
    showCurrTile();
  }
}

function down() {
  if(currX != maxX) {
    currX += 1;
    showCurrTile();
  }
}

function left() {
  if(currY != 0) {
    currY -= 1;
    showCurrTile();
  }
}

function right() {
  if(currY != maxY) {
    currY += 1;
    showCurrTile();
  }
}

function zoomIn() {
  if(currZoom != maxZoom) {
    currZoom += 1;
    currX *= 2;
    currY *= 2;
    maxX *= 2 || 1;
    maxY *= 2 || 1;
    showCurrTile();
  }
}

function zoomOut() {
  if(currZoom != 1) {
    currZoom -= 1;
    currX = Math.floor(currX / 2);
    currY = Math.floor(currY / 2);
    maxX = Math.floor(maxX / 2);
    maxY = Math.floor(maxY / 2);
    showCurrTile();
  }
}

function timeForward() {
  var slider = document.getElementById('time');
  if(slider.value != slider.max) {
    slider.value = parseInt(slider.value) + parseInt(slider.step);
    slider.onchange();
  }
}

function timeBackward() {
  var slider = document.getElementById('time');
  if(slider.value != slider.min) {
    slider.value = parseInt(slider.value) - parseInt(slider.step);
    slider.onchange();
  }
}

// http://gis.stackexchange.com/q/153839
function latLonToPixels(lat, lon) {
  var sinLat = Math.sin(lat * Math.PI / 180.0);
  var pixelX = ((lon + 180) / 360) * 256 * Math.pow(2,currZoom) - (currY-1)*256; //% 256;
  var pixelY = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (Math.PI * 4)) * 256 * Math.pow(2,currZoom) - (currX-1)*256;// % 256;
  //document.getElementById('punkt').style.top = (pixelY+10-24) + 'px';
  //document.getElementById('punkt').style.left = (pixelX+10-12) + 'px';
  return [pixelX, pixelY];
}

function addMarker(lat, lon, value, caption) {
  var pixelcoords = latLonToPixels(lat, lon);
  var marker = document.createElement("div");
  marker.innerHTML = '<svg baseProfile="basic" xmlns="http://www.w3.org/2000/svg" width="24" height="26" viewBox="0 0 48 48"><path d="M24 0c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z"></path></svg>';
  marker.classList.add('marker');
  marker.style.left = (pixelcoords[0]) + 'px';
  marker.style.top  = (pixelcoords[1]) + 'px';
  marker.dataset.lat = lat;
  marker.dataset.lon = lon;
  marker.dataset.value = value;
  marker.title = caption;
  document.getElementById('markers').appendChild(marker);
}

function updateMarkers() {
  Array.from(document.getElementById('markers').children).forEach(
    function(e,i,a) {
      var pixelcoords = latLonToPixels(parseFloat(e.dataset.lat), parseFloat(e.dataset.lon));
      e.style.left = pixelcoords[0] + 'px';
      e.style.top = pixelcoords[1] + 'px';
    }
  )
}

function loadDataAtTime(epoch) {
  document.getElementById('markers').innerHTML = ''; 
  
  d1 = new Date(epoch*1000-3600);
  d2 = new Date(epoch*1000+3600);
  
  ajax = new XMLHttpRequest();
  ajax.open('POST', baseurlapi, true);
  ajax.onreadystatechange = showData;
  ajax.setRequestHeader('Content-Type', 'application/json');
  ajax.setRequestHeader('Accept', 'application/json');
  
  var request = {
    "request": "GetObservation",
    "service": "SOS",
    "version": "2.0.0",
    "temporalFilter": {
      "during": {
        "ref": "om:phenomenonTime",
        "value": [
          d1.toISOString(),
          d2.toISOString()
        ]
      }
    }
  };
  
  ajax.send(JSON.stringify(request));
  displayCurrentMapParameters();
}

function showData() {
  if (ajax.readyState === XMLHttpRequest.DONE)
  {
    if (ajax.status === 200)
    {
      obs = JSON.parse(ajax.responseText).observations;
      console.log(obs);
      obs.forEach(function(e,i,a)
      {
        addMarker(e.featureOfInterest.geometry.coordinates[0],
                  e.featureOfInterest.geometry.coordinates[1],
                  e.result.value,
                  e.procedure.replace(' - procedure', '') + ' - ' + e.result.value + e.result.uom);
      });
    }
    else
    {
      console.log('big fail');
    }
  }
  else
  {
    console.log('not done yet');
  }
}

function handleShortcuts(e) {
  switch(e.key)
  {
    case '+': zoomIn(); break;
    case '-': zoomOut(); break;
    case 'w': up(); break;
    case 'a': left(); break;
    case 's': down(); break;
    case 'd': right(); break;
    case 'q': timeBackward(); break;
    case 'e': timeForward(); break;
  }  
}

function init() {
  currX = 21;
  currY = 33;
  currZoom = 6;
  maxX = Math.pow(2, 6);
  maxY = Math.pow(2, 6);
  showCurrTile();
  loadDataAtTime(document.getElementById('time').value);
  document.addEventListener('keyup', handleShortcuts, false);
}
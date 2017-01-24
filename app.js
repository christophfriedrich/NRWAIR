// config
var baseurlmap = 'http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/WMTS/1.0.0/?service=WMTS&request=GetTile&version=1.0.0&layer=Canvas_World_Light_Gray_Base&style=default&format=image/png&tilematrixset=default028mm&';
var baseurlref = 'http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Reference/MapServer/WMTS/1.0.0/?service=WMTS&request=GetTile&version=1.0.0&layer=Canvas_World_Light_Gray_Reference&style=default&format=image/png&tilematrixset=default028mm&';
var baseurlapi = '/52n-sos-webapp/service';

// global variables
var currX, currY, currZoom = 0;
var maxX, maxY, maxZoom = 0;
var ajax;

function log() {
  document.getElementById('log').innerHTML = 'X=' + currX + ' <br> ' +
                                             'Y=' + currY + ' <br> ' +
                                             'Zoom=' + currZoom + ' <br> ' +
                                             'Zeit=' + new Date(parseInt(document.getElementById('time').value+'000')).toLocaleDateString();
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
  
  log();
  
  updateMarkers();
}

function showCurrTile() {
  showTile(currZoom, currX, currY);
}

function up() {
  if(currX != 1) currX -= 1;
  showCurrTile();
}

function down() {
  if(currX != maxX) currX += 1;
  showCurrTile();
}

function left() {
  if(currY != 1) currY -= 1;
  showCurrTile();
}

function right() {
  if(currY != maxY) currY += 1;
  showCurrTile();
}

function zoomIn() {
  if(currZoom != maxZoom) currZoom += 1;
  currX *= 2;
  currY *= 2;
  showCurrTile();
}

function zoomOut() {
  if(currZoom != 0) currZoom -= 1;
  currX = Math.floor(currX / 2);
  currY = Math.floor(currY / 2);
  showCurrTile();
}

function timeBackward() {
  var slider = document.getElementById('time');
  if(slider.value != slider.min) slider.value = parseInt(slider.value) - parseInt(slider.step);
  slider.onchange();
}

function timeForward() {
  var slider = document.getElementById('time');
  if(slider.value != slider.max) slider.value = parseInt(slider.value) + parseInt(slider.step);
  slider.onchange();
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

function addMarkerAlt(lat, lon) {
  var pixelcoords = latLonToPixels(lat, lon);
  var marker = document.createElement("div");
  marker.innerHTML = '<svg baseProfile="basic" xmlns="http://www.w3.org/2000/svg" width="24" height="26" viewBox="0 0 48 48"><path d="M24 0c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z"></path></svg>';
  marker.classList.add('marker');
  //marker.style.position = "relative";
  marker.style.left = (pixelcoords[0]) + 'px';
  marker.style.top  = (pixelcoords[1]) + 'px';
  marker.dataset.lat = lat;
  marker.dataset.lon = lon;
  document.getElementById('markers').appendChild(marker);
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
  //showTile(6, 21, 33);
  currX = 21;
  currY = 33;
  currZoom = 6;
  showCurrTile();
  scrollTime(document.getElementById('time').min);
  document.addEventListener('keyup', handleShortcuts, false);
}

function getData() {
  ajax = new XMLHttpRequest();
   if (!ajax) {
      alert('Giving up :( Cannot create an XMLHTTP instance');
      return false;
    }
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
          "2017-01-10T14:00:00+01:00",
          "2017-01-30T15:00:00+01:00"
        ]
      }
    }
  };
  
  ajax.send(JSON.stringify(request));
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

function scrollTime(epoch) {
  document.getElementById('markers').innerHTML = ''; 
  
  d = new Date(epoch*1000-3600);
  d2 = new Date(epoch*1000+3600);
  
  ajax = new XMLHttpRequest();
   if (!ajax) {
      alert('Giving up :( Cannot create an XMLHTTP instance');
      return false;
    }
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
          d.toISOString(),
          d2.toISOString()
          //"2017-01-10T14:00:00+01:00",
          //"2017-01-30T15:00:00+01:00"
        ]
      }
    }
  };
  
  ajax.send(JSON.stringify(request));
  log();
}
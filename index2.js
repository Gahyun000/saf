$(document).ready(function($){
  init();
});


/************************************************************************

const citymap = {
  chicago: {
    center: { lat: 41.878, lng: -87.629 },
    population: 2714856,
  },
  newyork: {
    center: { lat: 40.714, lng: -74.005 },
    population: 8405837,
  },
  losangeles: {
    center: { lat: 34.052, lng: -118.243 },
    population: 3857799,
  },
  vancouver: {
    center: { lat: 49.25, lng: -123.1 },
    population: 603502,
  },
};

function initMap() {
  // Create the map.
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4,
    center: { lat: 37.09, lng: -95.712 },
    mapTypeId: "terrain",
  });

  // Construct the circle for each value in citymap.
  // Note: We scale the area of the circle based on the population.
  for (const city in citymap) {
    // Add the circle for this city to the map.
    const cityCircle = new google.maps.Circle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      map,
      center: citymap[city].center,
      radius: Math.sqrt(citymap[city].population) * 100,
    });
  }
}

window.initMap = initMap;
******************************************************************************/


class SpecSAF
{
  constructor()
  {

  }

  initMap(whch, ll)
  {
    this.pos = {
      center : {lat:36.30916, lng:127.22740},
      zoom : 12,
      mapTypeId : 'terrain',
    };

    this.pos.center.lat = ll[0];
    this.pos.center.lng = ll[1];

    this.map = new google.maps.Map( document.getElementById(whch), this.pos);

    // 클릭 시 빨간 원 생성 + 좌표 콘솔 출력
    this.map.addListener('click', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      console.log(`Clicked at: lat=${lat.toFixed(6)}, lng=${lng.toFixed(6)}`);
      this.drawCircle([lat, lng], 500);
    });
	// 여기까지
  }
  

  markMap(pos)
  {
    var _pos = {
      position: this.pos.center,
      map: this.map,
      title: "SForce",
    }
    this.marker = new google.maps.Marker( _pos );
  }

  drawCircle(ll, radius)
  {
    var _attrb = {
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      map: this.map,
      center: {lat:36.30916, lng:127.22740},
      radius: 1000,
    }

    _attrb.center.lat = ll[0];
    _attrb.center.lng = ll[1];
    _attrb.radius = radius;

    const circle = new google.maps.Circle(_attrb);
  }

  drawLine(p1, p2)
  {
    var coord = [new google.maps.LatLng(p1[0], p1[1]), new google.maps.LatLng(p2[0], p2[1])];

    var _attrb = {
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWidth: 1,
      altitudeMode: "absolute",
      extruded: true,
      map: this.map,
    }

    _attrb.path = coord;

    const line = new google.maps.Polyline(_attrb);
  }


  rad(x)
  {
    return (x * Math.PI) / 180;
  }

  getDistance(p1, p2)
  {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = this.rad(p2[0] - p1[0]);
    var dLong = this.rad(p2[1] - p1[1]);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.rad(p1[0])) * Math.cos(this.rad(p2[1])) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(Math.abs(a)), Math.sqrt(Math.abs(1 - a)));
    var d = R * c;

    return d; // returns the distance in meter
  }

  setPoint(ll, radius)
  {
    var i = 0;

    this.point = {
      pos0 : { ll : {lat:36.30916, lng:127.22740}, radius : 10 },
      pos1 : { ll : {lat:37.30916, lng:128.22740}, radius : 20 },
    }

    var _pos = "pos0";

    for ( i=0 ;    ; i++ )
    {
      _pos = "pos" + i;
      if ( this.point[_pos] == null ) break;
    }

    this.point[_pos] = {ll : {lat:ll[0], lng:ll[1]}, radius : radius};
  }


  getPoints()
  {
    var i = 0;
    var _pos = "pos0";

    for ( i=0 ;    ; i++ )
    {
      _pos = "pos" + i;
      if ( this.point[_pos] == null ) break;
      console.log(this.point[_pos]);
    }
  }

}


function init()
{
}

function initMap()
{
  const _saf = new SpecSAF();
  _saf.initMap('map', [36.30916, 127.22740]);
  _saf.markMap(0);

  _saf.setPoint([36.30916, 127.15000], 800);
  _saf.getPoints();

  _saf.drawCircle([36.30916, 127.10000], 1000);
  _saf.drawCircle([36.30916, 127.15000], 700);
  _saf.drawCircle([36.30916, 127.22740], 500);

  var distance = _saf.getDistance([36.30916, 127.10000], [36.30916, 127.22740]);
  console.log(distance);

  distance = _saf.getDistance([36.30916, 127.15000], [36.30916, 127.22740]);
  console.log(distance);

  _saf.drawLine([36.30916, 127.15000], [36.30916, 127.22740]);
}

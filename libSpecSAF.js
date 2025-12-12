class jsPath
{
  begin = 0;
  end = 0;

  constructor()
  {

  }
}

class SpecSAF
{
  _this = this;

  start = 0;
  stop = 0;
  shape = "Circle";
  circle_attrb = {
      id : 0,
      move : 0,
      teamType : "Drone",
      teamColor : "BLUE",
      shape : "Circle",
      target: {lat:0.0, lng:0.0, distance:0.0, offset:{x:0.0001, y:0.0001}},
      speed:0.0,
      strokeColor: "#0000FF",
      strokeOpacity: 0.8,
      strokeWidth: 1,
      strokeWeight: 2,
      fillColor: "#0000FF",
      fillOpacity: 0.35,
      map: this.map,
      editable: false,
      clickable: true,
      center: {lat:36.30916, lng:127.22740},
      altitude : 0,
      radius: 1000,
  };

  line_attrb = {
      id : 0,
      shape: "Line",
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWidth: 1,
      altitudeMode: "absolute",
      extruded: true,
      map: this.map,
      clickable: true,
  };

  constructor()
  {
    this.point = new Array();
    this.circle = new Array();
    this.line = new Array();

    this.path = new jsPath();

    ///// temporary
    this.selectedCircle = -1;
    this.selectedLine = -1;
  }

  onMouseClick(event)
  {

  }


  onMouseDrag(event)
  {
    g_SAF.stop = g_SAF.start = 0;
    g_SAF.eventFx(g_SAF, 0x00E3, this);

  }

  onMouseMove(event)
  {
    g_SAF.stop = g_SAF.start = 0;
    g_SAF.eventFx(g_SAF, 0x00E0, this);

  }


  onMouseUp(event)
  {
    var attrb = {
      center : {lat : 0, lng : 0},
    };

    attrb.center.lat = event.latLng.lat();
    attrb.center.lng = event.latLng.lng();

    g_SAF.circle_attrb.center = attrb.center;

    g_SAF.eventFx(g_SAF, 0x00E1, this);
  }

  onMouseDown(event)
  {
    g_SAF.start = window.performance.now();
    g_SAF.eventFx(g_SAF, 0x00E2, this);
  }

  initMap(whch, ll, eventFx)
  {
    this.pos = {
                center : {lat:36.30916, lng:127.22740},   //{lat:36.30916, lng:127.22740},
                zoom : 12,
                mapTypeId : 'terrain',
              };

    this.pos.center.lat = ll[0];
    this.pos.center.lng = ll[1];

    this.eventFx = eventFx;

    this.map = new google.maps.Map( document.getElementById(whch), this.pos);

    this.elevator = new google.maps.ElevationService();


    google.maps.event.addListener(this.map, 'click', this.onMouseClick);
    google.maps.event.addListener(this.map, 'mousedown', this.onMouseDown);
    google.maps.event.addListener(this.map, 'mouseup', this.onMouseUp);
    google.maps.event.addListener(this.map, 'mousemove', this.onMouseMove);
    google.maps.event.addListener(this.map, 'drag', this.onMouseDrag);

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


  onCircleClick(event)
  {
    g_SAF.eventFx(g_SAF, 0xC0E0, this);
  }

  onCircleRightClick(event)
  {
    g_SAF.eventFx(g_SAF, 0xC0E1, this);
  }

  onCircleMouseMove(event)
  {
    g_SAF.eventFx(g_SAF, 0xC0E2, this);
  }

  onCircleMouseDown(event)
  {
    g_SAF.eventFx(g_SAF, 0xC0E3, this);
  }

  onCircleMouseUp(event)
  {
    g_SAF.eventFx(g_SAF, 0xC0E4, this);
  }

  onCallbackAtitude(results, status)
  {
    g_SAF.circle[g_SAF.selectedCircle].altitude = g_SAF.circle_attrb.altitude = results[0].elevation;
    g_SAF.eventFx(g_SAF, 0x00E5, this);
  }

  drawCircle(ll, radius, index=-1)
  {
    this.circle_attrb = {
      id : 0,
      move : 0,
      teamType : "Drone",
      teamColor : "BLUE",
      target: {lat:0.0, lng:0.0, distance:0.0, offset:{x:0.0001, y:0.0001}},
      speed:0.0,
      strokeColor: "#0000FF",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#0000FF",
      fillOpacity: 0.35,
      map: this.map,
      editable: false,
      clickable: true,
      center: {lat:36.30916, lng:127.22740},
      altitude : 0,
      radius: 1000,
    };

    this.circle_attrb.center.lat = ll[0];
    this.circle_attrb.center.lng = ll[1];
    this.circle_attrb.radius = radius;


    var idx = index==-1?this.circle.length:index;

    var i = 0;
    for ( i=0 ; i<this.circle.length ; i++ )
    {
      if ( this.circle[i] == 0 )
      {
        idx = i;
        break;
      }
    }


    this.circle[idx] = new google.maps.Circle(this.circle_attrb);
    this.circle[idx].id = this.selectedCircle = idx;
    this.circle[idx].addListener('click', this.onCircleClick);
    this.circle[idx].addListener('rightclick', this.onCircleRightClick);
    this.circle[idx].addListener('mousemove', this.onCircleMouseMove);
    this.circle[idx].addListener('mouseup', this.onCircleMouseUp);
    this.circle[idx].addListener('mousedown', this.onCircleMouseDown);

    this.getAltitude( {lat:ll[0], lng:ll[1] } );

    return idx;
  }

  getAltitude(ll)
  {
    var locations = [ ll ];
    this.elevator.getElevationForLocations({locations}, this.onCallbackAtitude);
  }

  onLineClick(event)
  {
    g_SAF.eventFx(g_SAF, 0x10E0, this);
  }

  onLineRightClick(event)
  {
    g_SAF.eventFx(g_SAF, 0x10E1, this);
  }

  onLineMouseMove(event)
  {
    g_SAF.eventFx(g_SAF, 0x10E2, this);
  }

  onLineMouseDown(event)
  {
    g_SAF.eventFx(g_SAF, 0x10E3, this);
  }

  onLineMouseUp(event)
  {
    g_SAF.eventFx(g_SAF, 0x10E4, this);
  }


  drawLine(p1, p2, index=-1)
  {
    var coord = [new google.maps.LatLng(p1[0], p1[1]), new google.maps.LatLng(p2[0], p2[1])];

    this.line_attrb = {
                id : 0,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWidth: 1,
                altitudeMode: "absolute",
                extruded: true,
                map: this.map,
                clickable: true,
    };

    this.line_attrb.path = coord;

    var idx = index==-1?this.line.length:index;
    var i = 0;
    for ( i=0 ; i<this.line.length ; i++ )
    {
      if ( this.line[i] == 0 )
      {
        idx = i;
        break;
      }
    }

    this.line[idx] = new google.maps.Polyline(this.line_attrb);

    this.line[idx].id = idx;
    this.line[idx].addListener('click', this.onLineClick);
    this.line[idx].addListener('rightclick', this.onLineRightClick);
    this.line[idx].addListener('mousemove', this.onLineMouseMove);
    this.line[idx].addListener('mousedown', this.onLineMouseDown);
    this.line[idx].addListener('mouseup', this.onLineMouseUp);

    return idx;
  }


  setCallback(callback, msec)
  {
    this.callback = callback;
    this.msec = msec;
  }

  periodicDraw(param)
  {
    this.callback(param);
    clearTimeout(this.tmr);
    this.tmr = setTimeout(this.periodicDraw.bind(this), this.msec, param);
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



  /****

  setPoint(ll, radius, index=-1)
  {

    var _attrb = {
                  ll : {lat:36.30916, lng:127.22740},
                  radius : 10,
    }

    _attrb.ll.lat = ll[0];
    _attrb.ll.lng = ll[1];
    _attrb.radius = radius;

    if ( index == -1 ) this.point.push(_attrb);
    else this.point[index] = _attrb;

    return this.point.length;
  }
  ****/

  /****
  getPoints()
  {
    var i = 0;
    for ( i=0 ; i<this.point.length ; i++ )
    {
      console.log(this.point[i].ll.lat + ", " + this.point[i].ll.lng + ", " + this.point[i].radius);
    }

  }
  ****/
}

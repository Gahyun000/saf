class jsAttribute
{
  constructor(map)
  {
    this.v = {
        id : 0,
        move : 0,
        objType : "Drone",
        objColor : "BLUE",
        objShape : "Circle",
        target: {lat:0.0, lng:0.0, alt:0.0, distance:0.0, offset:{x:0.0001, y:0.0001}},
        speed:0.0,
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWidth: 1,
        strokeWeight: 2,
        fillColor: "#0000FF",
        fillOpacity: 0.35,
        map: map,
        editable: false,
        clickable: false,
        center: {lat:36.30916, lng:127.22740},
        altitude : 0,
        radius: 1000,
        altitudeMode: "absolute",
        extruded: true,
    };

  }

}

class jsObject
{
  begin = 0;
  end = 0;
  id = -1;
  constructor(obj)
  {
    this._attrb = new jsAttribute(obj);
  }
}

class jsCircle extends jsObject
{
  obj = null;
  constructor(map)
  {
    super(map);
  }
  setObject(attrb)
  {
    return this.obj = new google.maps.Circle(attrb);
  }
}

class jsPath extends jsObject
{
  obj = null;
  constructor(map)
  {
    super(map);
  }
  setObject(attrb)
  {
    return this.obj = new google.maps.Polyline(attrb);
  }
}





gMap = 0;
class jsMap
{
  _this = this;

  start = 0;
  stop = 0;
  shape = "Circle";
  _route = 0;
  //_mouse = 0;

  constructor()
  {
    this.point = new Array();
    this.path = new Array();

    this.tempObj = 0;
    this._attrb = 0;

    ///// temporary
    this.selectedCircle = -1;
    this.selectedPath = -1;
  }

  onMouseClick(event)
  {

  }


  onMouseDrag(event)
  {
    gMap.stop = gMap.start = 0;
    gMap.eventFx(gMap, 0x00E3, this);

  }

  onMouseMove(event)
  {
    gMap._attrb = new jsAttribute(gMap.map);

    gMap._attrb.v.center.lat = event.latLng.lat();
    gMap._attrb.v.center.lng = event.latLng.lng();
    gMap.getAltitude( {lat:gMap._attrb.v.center.lat, lng:gMap._attrb.v.center.lng } );

    gMap.stop = gMap.start = 0;

    gMap.eventFx(gMap, 0x00E3, this);
  }


  onMouseUp(event)
  {
    gMap._attrb = new jsAttribute(gMap.map);

    gMap._attrb.v.center.lat = event.latLng.lat();
    gMap._attrb.v.center.lng = event.latLng.lng();
    gMap.getAltitude( {lat:gMap._attrb.v.center.lat, lng:gMap._attrb.v.center.lng } );

    gMap.stop = window.performance.now();

    gMap.eventFx(gMap, 0x00E1, this);
  }

  onMouseDown(event)
  {
    gMap._attrb = new jsAttribute(gMap.map);

    gMap._attrb.v.center.lat = event.latLng.lat();
    gMap._attrb.v.center.lng = event.latLng.lng();
    gMap.getAltitude( {lat:gMap._attrb.v.center.lat, lng:gMap._attrb.v.center.lng } );

    gMap.start = window.performance.now();
    gMap.eventFx(gMap, 0x00E2, this);
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
    gMap.eventFx(gMap, 0xC0E0, this);
  }

  onCircleRightClick(event)
  {
    gMap.eventFx(gMap, 0xC0E1, this);
  }

  onCircleMouseMove(event)
  {
    gMap.eventFx(gMap, 0xC0E2, this);
  }

  onCircleMouseDown(event)
  {
    gMap.eventFx(gMap, 0xC0E3, this);
  }

  onCircleMouseUp(event)
  {
    gMap.eventFx(gMap, 0xC0E4, this);
  }

  onCallbackAtitude(results, status)
  {
    gMap._attrb.v.altitude = results[0].elevation;
    gMap.eventFx(gMap, 0x00E5, this);
  }


  drawCircle(ll, radius, index=-1)
  {
    var att = new jsAttribute(this.map);

    att.v.center.lat = ll[0];
    att.v.center.lng = ll[1];
    att.v.radius = radius;
    att.v.clickable = false;


    this.getAltitude( {lat:ll[0], lng:ll[1] } );

    var _jc = new jsCircle(this.map);
    _jc.setObject(att.v); //google.maps.Polyline(this.line_attrb);

    _jc.obj.addListener('click',      this.onCircleClick);
    _jc.obj.addListener('rightclick', this.onCircleRightClick);
    _jc.obj.addListener('mousemove',  this.onCircleMouseMove);
    _jc.obj.addListener('mouseup',    this.onCircleMouseUp);
    _jc.obj.addListener('mousedown',  this.onCircleMouseDown);

    return _jc;

    //return new jsCircle(this.map, _coord.v);//new google.maps.Circle(this.circle._attrb.v);
  }


  /***
  drawCircle(ll, radius, index=-1)
  {
    var _coord = new jsAttribute(this.map);

    _coord.v.center.lat = ll[0];
    _coord.v.center.lng = ll[1];
    _coord.v.radius = radius;
    _coord.v.clickable = false;

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

    this._attrb = _coord;

    this.circle[idx] = new jsCircle(this.map, _coord.v);//new google.maps.Circle(this.circle._attrb.v);
    this.circle[idx].id = this.selectedCircle = idx;
    this.circle[idx].addListener('click',      this.onCircleClick);
    this.circle[idx].addListener('rightclick', this.onCircleRightClick);
    this.circle[idx].addListener('mousemove',  this.onCircleMouseMove);
    this.circle[idx].addListener('mouseup',    this.onCircleMouseUp);
    this.circle[idx].addListener('mousedown',  this.onCircleMouseDown);

    this.getAltitude( {lat:ll[0], lng:ll[1] } );

    return idx;
  }
  ***/

  getAltitude(ll, callback=null)
  {
    var locations = [ ll ];
    this.elevator.getElevationForLocations({locations}, (callback==null)?this.onCallbackAtitude:callback);
  }

  onPathClick(event)
  {
    gMap.eventFx(gMap, 0x10E0, this);
  }

  onPathRightClick(event)
  {
    gMap.eventFx(gMap, 0x10E1, this);
  }

  onPathMouseMove(event)
  {
    gMap.eventFx(gMap, 0x10E2, this);
  }

  onPathMouseDown(event)
  {
    gMap.eventFx(gMap, 0x10E3, this);
  }

  onPathMouseUp(event)
  {
    gMap.eventFx(gMap, 0x10E4, this);
  }

  drawPath(p0, p1)
  {
    var _path = [new google.maps.LatLng(p0[0], p0[1]), new google.maps.LatLng(p1[0], p1[1])];
    var att = new jsAttribute(this.map);

    att.v.path = _path;
    att.v.strokeColor = "#FF0000";
    att.v.strokeWidth = 2;

    var _jl = new jsPath(this.map);
    _jl.setObject(att.v); //google.maps.Polyline(this.line_attrb);


    _jl.obj.addListener('click',      this.onPathClick);
    _jl.obj.addListener('rightclick', this.onPathRightClick);
    _jl.obj.addListener('mousemove',  this.onPathMouseMove);
    _jl.obj.addListener('mousedown',  this.onPathMouseDown);
    _jl.obj.addListener('mouseup',    this.onPathMouseUp);

    return _jl;
  }


  /****
  drawPath(p0, p1, index=-1)
  {
    var _path = [new google.maps.LatLng(p0[0], p0[1]), new google.maps.LatLng(p1[0], p1[1])];
    var _coord = new jsAttribute(this.map);

    _coord.v.path = _path;
    _coord.v.strokeColor = "#FF0000";
    _coord.v.strokeWidth = 2;

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

    this.line[idx] = new jsPath(this.map, _coord.v); //google.maps.Polyline(this.line_attrb);
    this.line[idx].id = idx;
    this.line[idx].addListener('click',      this.onPathClick);
    this.line[idx].addListener('rightclick', this.onPathRightClick);
    this.line[idx].addListener('mousemove',  this.onPathMouseMove);
    this.line[idx].addListener('mousedown',  this.onPathMouseDown);
    this.line[idx].addListener('mouseup',    this.onPathMouseUp);

    return idx;
  }
  ****/


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

    var v = {
                  ll : {lat:36.30916, lng:127.22740},
                  radius : 10,
    }

    v.ll.lat = ll[0];
    v.ll.lng = ll[1];
    v.radius = radius;

    if ( index == -1 ) this.point.push(v);
    else this.point[index] = v;

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

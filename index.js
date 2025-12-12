$(document).ready(function($){
  init();
  // 시나리오는 '새 시나리오 시작' 버튼을 눌렀을 때만 시작합니다...
});

MIN = 500;
MAX = 3000;

prevPath = null;

aPath = new Array();
aCircle = new Array();

// =======================
// 공통 저장용 변수/함수
// =======================
let lastLiveSaveByObj = {};
let currentScenarioId = null;
let scenarioStarted = false;

/**
 * 시나리오가 시작되었는지 확인 (시작 전이면 저장/기록을 막음)
 */
function isScenarioReady(silent = false) {
    if (currentScenarioId === null || scenarioStarted !== true) {
        if (!silent) {
            alert("먼저 '새 시나리오 시작'을 눌러 시나리오를 시작하세요.");
        }
        return false;
    }
    return true;
}


/**
 * 정적인 좌표(Circle / Path / Path_Segment)를 map_points 테이블에 저장
 */
function savePointToDatabase(lat, lng, shape_type) {
    if (!isScenarioReady()) return;

    const dataToSave = {
        lat: lat,
        lng: lng,
        shape_type: shape_type,
        scenario_id: currentScenarioId
    };

    fetch('/cgi-bin/save_point.py', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            console.log(`✅ ${shape_type} saved successfully. ID: ${data.id} (scenario ${currentScenarioId})`);
        } else {
            console.error(`❌ MariaDB Save Failed for ${shape_type}: ${data.message}`);
        }
    })
    .catch((error) => {
        console.error('🚨 Fetch or Parsing Error:', error.message);
    });
}


/**
 * 실시간 이동 좌표를 movement_log 테이블에 저장 (스로틀 적용)
 */
/**
 * 실시간 이동 좌표를 movement_log 테이블에 저장 (스로틀 적용)
 */
function saveLivePointThrottled(objectId, lat, lng, shapeType = "LiveMove") {
  if (!isScenarioReady(true)) return;

  const now = Date.now();
  const last = lastLiveSaveByObj[objectId] || 0;

  if (now - last > 300) { // 객체별 0.3초 1번 저장
    saveLiveMove(objectId, lat, lng, shapeType, currentScenarioId);
    lastLiveSaveByObj[objectId] = now;
  }
}


// saveLiveMove 함수 정의 수정
function saveLiveMove(objectId, lat, lng, shapeType, scenarioId) { // 👈 scenarioId를 인수로 받도록 수정
    const data = {
        object_id: objectId,
        lat: lat,
        lng: lng,
        shape_type: shapeType,
        scenario_id: scenarioId // 👈 DB로 전달
    };

    fetch('/cgi-bin/save_movement.py', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    })
    .then(res => res.json())
    .then(data => console.log("Live saved", data))
    .catch(err => console.error("Error:", err));
}


// =======================
// 기존 로직들
// =======================

function assignObject(array, obj, index)
{
  var idx = index==-1?array.length:index;

  var i = 0;
  for ( i=0 ; i<array.length ; i++ )
  {
    if ( (array[i] == 0) || (array[i] == null))
    {
      idx = i;
      break;
    }
  }

  obj.id = idx;

  array[idx] = obj;

  return idx;
}  


function fxPath(obj, begin, end)
{
  var _map = obj;

  if ( begin != null )
  {
    _map.path[0] = [begin[0], begin[1]];

  }

  if ( end != null )
  {
    if (_map.path[0] == null ) return;
    _map.path[1] = [end[0], end[1]];

    var v = {
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
        editable: false,
        clickable: false,
        center: {lat:36.30916, lng:127.22740},
        altitude : 0,
        radius: 1000,
        altitudeMode: "absolute",
        extruded: true,
    };

    v.path = [new google.maps.LatLng(_map.path[0][0],_map.path[0][1]), new google.maps.LatLng(_map.path[1][0],_map.path[1][1])];
    v.strokeColor = "#FF0000";
    v.strokeWidth = 2;

    v.map = _map.map;

    return prevPath = _map.drawPath( [_map.path[0][0], _map.path[0][1]], [_map.path[1][0], _map.path[1][1]] )
  }
}


function fxCircle(obj, ll)
{
  var _map = obj;

  _map._attrb.v.radius = parseInt($("#edtCircleRadius").text());

  return _map.drawCircle([ll[0], ll[1]], _map._attrb.v.radius);

}


function fx(x, p1, p2)
{

  var dx = p1[0]-p2[0];
  var dy = p1[1]-p2[1];

  var tan = dy/dx;

  console.log(dx, dy);

  return tan*(x - p1[0]) + p1[1];
}


function lineTest(obj)
{
  var _map = obj;
  var point = [
      [36.413891, 127.260702],
      [36.297539, 127.298124]];


  _map.drawPath([point[0][0], point[0][1]], [point[1][0], point[1][1]]);

  distance = _map.getDistance([point[0][0], point[0][1]], [point[1][0], point[1][1]]);

  console.log(distance);

  var x = 36.333891;
  var y = fx(x, point[0], point[1]);

  _map.drawCircle([ x, y ], 1000);

}


function assignCircle(obj)
{

}


function assignPath(obj)
{

}

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////                 /////////////////////////////////
/////////////////////////////////                 /////////////////////////////////
/////////////////////////////////                 /////////////////////////////////
///////////////////////////                               /////////////////////////
///////////////////////////////                       /////////////////////////////
///////////////////////////////////               /////////////////////////////////
////////////////////////////////////////    ///////////////////////////////////////
///////////////////////////////////////// /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

function onCallbackCircleAltitude(results, status)
{
  gMap.tempObj._attrb.v.altitude = gMap._attrb.v.altitude;
}

function onMouseUp(obj, ecode, owner)
{
  var _map = obj;

  $("#edtCircleLat").text(_map._attrb.v.center.lat);
  $("#edtCircleLng").text(_map._attrb.v.center.lng);

  if ( _map.shape == "Circle" )
  {
    if ( ((_map.stop - _map.start) < MIN) || ((_map.stop - _map.start) > MAX) ) return;

    newCircle = fxCircle(obj, [ _map._attrb.v.center.lat, _map._attrb.v.center.lng ]);
    _map._attrb.v.clickable = true;
    _map._attrb.v.editable = false;
    _map._attrb.v.strokeColor = "#0000FF";
    _map._attrb.v.objShape = _map.shape;

    _map.getAltitude({lat:_map._attrb.v.center.lat, lng:_map._attrb.v.center.lng }, onCallbackCircleAltitude);

    _map.tempObj = newCircle;
    newCircle.obj.setOptions(_map._attrb.v);
    newCircle.obj.id = assignObject(aCircle, newCircle, -1);
    
    // Circle의 중심 좌표 저장
    savePointToDatabase(_map._attrb.v.center.lat, _map._attrb.v.center.lng, "Circle");
  }
  else if ( _map.shape == "Path" )
  {
    if ( ((_map.stop - _map.start) < MIN) || ((_map.stop - _map.start) > MAX) ) return;

    // 경로 그리기 상태 토글
    _map._route = (_map._route==1?0:1);

    if ( _map._route == 1 )
    {
      // 새로운 경로 시작 (onMouseUp이 두 번 클릭 스타일로 사용될 경우)
      prevPath = null;
      fxPath(obj, [ _map._attrb.v.center.lat, _map._attrb.v.center.lng ], null);
    }

    // 경로 그리기 완료 또는 중간점 지정
    newPath = fxPath(obj, null, [ _map._attrb.v.center.lat, _map._attrb.v.center.lng ]);
    _map._attrb.v.clickable = true;
    _map._attrb.v.editable = false;
    _map._attrb.v.strokeColor = "#FF0000";
    _map._attrb.v.objShape = _map.shape;

    _map.tempObj = newPath;

    newPath.obj.setOptions(_map._attrb.v);

    if ( _map._route == 0 )
    {
      // 경로가 최종적으로 완성되었을 때만 저장 (두 번째 클릭)
      newPath.obj.id = assignObject(aPath, newPath, -1);
      
      // Path의 끝점 좌표 저장
      savePointToDatabase(_map._attrb.v.center.lat, _map._attrb.v.center.lng, "Path");
    }
    
  }
  else if ( _map.shape == "Rectangle" )
  {

  }

}



function onMouseDown(obj, ecode, owner)
{
  var _map = obj;

  $("#edtCircleLat").text(_map._attrb.v.center.lat);
  $("#edtCircleLng").text(_map._attrb.v.center.lng);

  if ( _map.shape == "Circle" )
  {

  }
  else if ( _map.shape == "Path" )
  {
    // 경로 그리기 플래그 설정
    _map._route = 1;
    
    // 경로의 시작점 설정
    if (prevPath != null) prevPath.obj.setMap(null); // 이전 미리보기 경로 지우기
    fxPath(obj, [ _map._attrb.v.center.lat, _map._attrb.v.center.lng ], null);
  }
  else if ( _map.shape == "Rectangle" )
  {

  }
}

function onMouseMove(obj, ecode, owner)
{
  var _map = obj;
  $("#edtCircleLat").text(_map._attrb.v.center.lat);
  $("#edtCircleLng").text(_map._attrb.v.center.lng);

  if ( _map.shape == "Circle" )
  {

  }
  else if ( _map.shape == "Path" )
  {
    if ( _map._route == 1 )
    {
      fxPath(obj, null, [ _map._attrb.v.center.lat, _map._attrb.v.center.lng ]);
	  
      // Path 그리면서 중간 좌표 저장
	  savePointToDatabase(_map._attrb.v.center.lat, _map._attrb.v.center.lng, "Path_Segment");
    }
  }
  else if ( _map.shape == "Rectangle" )
  {

  }

}


function onMouseEvent(obj, ecode, owner)
{
  var _map = obj;
}

function onCircleSelected(obj, ecode, owner)
{
  var _map = obj;
}

function onCircleContextMenu(obj, ecode, owner)
{
  var _map = obj;
  _map.selectedCircle = owner.id;

  var v = {
      editable: false,
  }

  _map.circle[_map.selectedCircle].setOptions( v );

}

function onCircleMouseMove(obj, ecode, owner)
{

}

function onCircleMouseDown(obj, ecode, owner)
{
  var _map = obj;

  if ( event.altKey )
  {
    return;
  }

  _map.start = window.performance.now();
}


function onCircleMouseUp(obj, ecode, owner)
{
  var _map = obj;

  if ( event.altKey )
  {
    $("#did").text(owner.id);

    $("#edtDstCircleLat").text(owner.center.lat);
    $("#edtDstCircleLng").text(owner.center.lng);
    $("#edtDstCircleAlt").text(aCircle[owner.id]._attrb.v.altitude);

    return;
  }

  $("#id").text(owner.id);

  $("#edtCircleLat").text(owner.center.lat());
  $("#edtCircleLng").text(owner.center.lng());
  $("#edtCircleAlt").text(aCircle[owner.id]._attrb.v.altitude);


  if ( owner.objColor == "BLUE" )
  {
    owner.fillColor = "#0000FF";
  }
  else
  {
    owner.fillColor = "#FF0000";
  }


  $("#edtCircleColor").text(owner.fillColor);
  $("#edtCircleRadius").text(owner.radius);
  $("#cbxCircleColor").val(owner.objColor).attr("selected", "selected");
  $("#cbxCircleType").val(owner.objType).attr("selected", "selected");
  $("#cbxShape").val(owner.objShape).attr("selected", "selected");


  _map.tempObj = owner;

  _map.stop = window.performance.now();

  if ( (_map.stop - _map.start) >= MIN && (_map.stop - _map.start) <= MAX )
  {
    var v = {
        editable: true,
    }
    if ( owner.editable == true )
    {
      v.editable = false;
    }
    aCircle[owner.id].obj.setOptions( v );
  }
}


function onCallbackAtitude(obj, ecode, owner)
{
  var _map = obj;
  $("#edtCircleAlt").text(_map._attrb.v.altitude);
}


function onPathClick(obj, ecode, owner)
{
  $("#id").text(owner.id);
}

function onPathRightClick(obj, ecode, owner)
{
}

function onPathMouseMove(obj, ecode, owner)
{
}

function onPathMouseDown(obj, ecode, owner)
{
}

function onPathMouseUp(obj, ecode, owner)
{
  var _map = obj;

  $("#id").text(owner.id);

  $("#cbxShape").val(owner.objShape).attr("selected", "selected");

  _map.tempObj = owner;

}

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////                 /////////////////////////////////
/////////////////////////////////                 /////////////////////////////////
/////////////////////////////////                 /////////////////////////////////
///////////////////////////                               /////////////////////////
///////////////////////////////                       /////////////////////////////
///////////////////////////////////               /////////////////////////////////
////////////////////////////////////////    ///////////////////////////////////////
///////////////////////////////////////// /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////


function onEvent(obj, ecode, owner)
{
  var _map = obj;

  if ( ecode == 0x00E0 )
  {
    onMouseEvent(obj, ecode, owner);
  }
  else if ( ecode == 0x00E1 )
  {
    onMouseUp(obj, ecode, owner);
  }
  else if ( ecode == 0x00E2 )
  {
    onMouseDown(obj, ecode, owner);
  }
  else if ( ecode == 0x00E3 )
  {
    onMouseMove(obj, ecode, owner);
  }
  else if ( ecode == 0x00E5 )
  {
    onCallbackAtitude(obj, ecode, owner);
  }


  else if ( ecode == 0xC0E0 )
  {
    onCircleSelected(obj, ecode, owner);
  }
  else if ( ecode == 0xC0E1 )
  {
    onCircleContextMenu(obj, ecode, owner);
  }
  else if ( ecode == 0xC0E2 )
  {
    onCircleMouseMove(obj, ecode, owner);
  }
  else if ( ecode == 0xC0E3 )
  {
    onCircleMouseDown(obj, ecode, owner);
  }
  else if ( ecode == 0xC0E4 )
  {
    onCircleMouseUp(obj, ecode, owner);
  }


  else if ( ecode == 0x10E0 )
  {
    onPathClick(obj, ecode, owner);
  }
  else if ( ecode == 0x10E1 )
  {
    onPathRightClick(obj, ecode, owner);
  }
  else if ( ecode == 0x10E2 )
  {
    onPathMouseMove(obj, ecode, owner);
  }
  else if ( ecode == 0x10E3 )
  {
    onPathMouseDown(obj, ecode, owner);
  }
  else if ( ecode == 0x10E4 )
  {
    onPathMouseUp(obj, ecode, owner);
  }

}



function initMap()
{
  const _map = new jsMap();
  gMap = _map;
  _map.initMap('map', [36.30916, 127.22740], onEvent);
  _map.markMap(0);

  _map.setCallback(updateMap, 500);
  _map.periodicDraw(_map);
}


var nLat = 36.30916;
var nLng = 127.10000;

function updateMap(param)
{
  var _map = param;

  var v = { center : {lat:0.0, lng:0.0} };

  for ( i=0 ; i<aCircle.length ; i++ )
  {
    if (!aCircle[i] || !aCircle[i].obj) continue;

    if ( aCircle[i].obj.move == 1 )
    {

      v.center.lat = aCircle[i].obj.center.lat() - aCircle[i].obj.target.offset.x;
      v.center.lng = aCircle[i].obj.center.lng() - aCircle[i].obj.target.offset.y;

      // 실시간 이동 좌표 저장 (movement_log)
      saveLivePointThrottled(aCircle[i].obj.id, v.center.lat, v.center.lng, "LiveMove");

      gMap.getAltitude( {lat:v.center.lat, lng:v.center.lng } );
      aCircle[i].obj.altitude = gMap._attrb.altitude;

      aCircle[i].obj.setOptions( v );

		if ( (Math.abs(aCircle[i].obj.center.lat() - aCircle[i].obj.target.lat) < 0.005) &&
			 (Math.abs(aCircle[i].obj.center.lng() - aCircle[i].obj.target.lng) < 0.005) )
		{
		  v.center.lat = aCircle[i].obj.target.lat;
		  v.center.lng = aCircle[i].obj.target.lng;
		  aCircle[i].obj.setOptions( v );

          saveLiveMove(aCircle[i].obj.id, v.center.lat, v.center.lng, "LiveMove", currentScenarioId);
		  
		  aCircle[i].obj.move = 0;
		  break;
		}
    }
  }
}

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

function onEditCircleLatChange(e)
{
  if ( e.keyCode == 13 )
  {
    e.preventDefault();

    var v = { center : {lat:0.0, lng:0.0} };

    v.center.lat = parseFloat($("#edtCircleLat").text());
    v.center.lng = aCircle[gMap.tempObj.id].center.lng();

    aCircle[gMap.tempObj.id].setOptions( v );
  }
}

function onEditCircleLngChange(e)
{
  if ( e.keyCode == 13 )
  {
    e.preventDefault();

    var v = { center : {lat:0.0, lng:0.0} };

    v.center.lat = aCircle[gMap.tempObj.id].center.lat();
    v.center.lng = parseFloat($("#edtCircleLng").text());

    aCircle[gMap.tempObj.id].setOptions( v );
  }
}


function onEditCircleColorChange(e)
{
  if ( e.keyCode == 13 )
  {
    e.preventDefault();

    var v = {
        strokeColor: "#0000FF",
        fillColor: "#0000FF",
    }

    v.strokeColor = v.fillColor = $("#edtCircleColor").text();

    aCircle[gMap.tempObj.id].obj.setOptions( v );
  }
}

function onEditCircleRadiusChange(e)
{
  if ( e.keyCode == 13 )
  {
    e.preventDefault();

    aCircle[gMap.tempObj.id].setRadius( parseInt($("#edtCircleRadius").text(), 10) );
  }
}


function onEditCircleSpeedChange(e)
{


}


function onButtonMoveClick(e)
{
  if ( gMap.tempObj.objShape != "Circle" ) return;

  console.log( gMap.tempObj.id );
  console.log(aCircle[gMap.tempObj.id].obj.move);
  aCircle[gMap.tempObj.id].obj.move = 1;

  var lat = aCircle[gMap.tempObj.id].obj.target.lat = parseFloat( $("#edtDstCircleLat").text());
  var lng = aCircle[gMap.tempObj.id].obj.target.lng = parseFloat( $("#edtDstCircleLng").text());

  console.log(lat);
  console.log(lng);

  console.log(aCircle[gMap.tempObj.id].obj.center.lat());
  console.log(aCircle[gMap.tempObj.id].obj.center.lng());

  fxPath( gMap, [aCircle[gMap.tempObj.id].obj.center.lat(), aCircle[gMap.tempObj.id].obj.center.lng()], [lat, lng]);

  var distance = aCircle[gMap.tempObj.id].obj.target.distance = gMap.getDistance([aCircle[gMap.tempObj.id].obj.center.lat(), aCircle[gMap.tempObj.id].obj.center.lng()], [lat, lng]);

  $("#edtDistance").text(distance);

  var speed = aCircle[gMap.tempObj.id].obj.speed = parseFloat( $("#edtCircleSpeed").text() );

  var ndps = distance / ( (1000 * speed)/3600 );

  var dps = distance / ndps;

  $("#edtDistancePerSec").text(dps);

  var ofsx = (aCircle[gMap.tempObj.id].obj.center.lat()-lat);
  var ofsy = (aCircle[gMap.tempObj.id].obj.center.lng()-lng);

  aCircle[gMap.tempObj.id].obj.target.offset.x = ofsx/ndps;
  aCircle[gMap.tempObj.id].obj.target.offset.y = ofsy/ndps;

}

function onButtonMoveMouseOver(e)
{
  $("#btnMove").css("background-color", "#FFFFFF");
}

function onButtonMoveMouseOut(e)
{
  $("#btnMove").css("background-color", "#AAAAAA");
}

function onButtonStopClick(e)
{
  aCircle[gMap.tempObj.id].obj.move = 0;
}

function onButtonStopAllClick(e)
{
  var i = 0;
  for ( i=0 ; i<aCircle.length ; i++ )
  {
    if (!aCircle[i] || !aCircle[i].obj) continue;
    aCircle[i].obj.move = 0;
  }
}

function onButtonStopMouseOver(e)
{
  $("#btnStop").css("background-color", "#FFFFFF");
}

function onButtonStopMouseOut(e)
{
  $("#btnStop").css("background-color", "#AAAAAA");
}

function onButtonDeleteClick(e)
{
  if ( gMap.tempObj.objShape == "Circle" )
  {
    aCircle[gMap.tempObj.id].obj.setMap(null);
    aCircle[gMap.tempObj.id] = null;
  }
  else if ( gMap.tempObj.objShape == "Path" )
  {
    aPath[gMap.tempObj.id].obj.setMap(null);
    aPath[gMap.tempObj.id] = null;
  }
}

function onButtonDeleteMouseOver(e)
{
  $("#btnDelete").css("background-color", "#FFFFFF");
}

function onButtonDeleteMouseOut(e)
{
  $("#btnDelete").css("background-color", "#AAAAAA");
}


function onCbxCircleColorChange(e)
{
  var objColor = $("#cbxCircleColor option:selected").val();

  var v = {
      objColor: "BLUE",
      strokeColor: "#FF0000",
      fillColor: "#FF0000",
  }

  v.objColor = objColor;

  if ( objColor == "BLUE" )
  {
    v.strokeColor = v.fillColor = "#0000FF";
  }
  else if ( objColor == "RED" )
  {
    v.strokeColor = v.fillColor = "#FF0000";
  }
  aCircle[gMap.tempObj.id].obj.setOptions( v );

  $("#edtCircleColor").text(v.fillColor);

}


function onCbxCircleTypeChange(e)
{
  var objType = $("#cbxCircleType option:selected").val();

  var v = {
      objType: "Drone",
  }

  v.objType = objType;
  aCircle[gMap.tempObj.id].obj.setOptions( v );

}


function onCbxShapeChange(e)
{
  var shp = $("#cbxShape option:selected").val();

  gMap.shape = shp;
}



function init()
{
  $("#edtCircleLat").keydown(onEditCircleLatChange);
  $("#edtCircleLng").keydown(onEditCircleLngChange);
  $("#edtCircleColor").keydown(onEditCircleColorChange);
  $("#edtCircleRadius").keydown(onEditCircleRadiusChange);
  $("#edtCircleSpeed").keydown(onEditCircleSpeedChange);

  // 새 시나리오 시작 버튼(있으면 연결)
  if ($('#btnNewScenario').length) {
    $('#btnNewScenario').off('click').on('click', startNewScenario);
  }
}


function loadMovementHistory(sid) {
    sid = parseInt(sid, 10);
    if (!sid || sid < 1) {
        alert("시나리오 번호를 입력하세요.");
        return;
    }

    fetch(`/cgi-bin/load_movement.py?scenario_id=${sid}`)   // ✅ scenario_id 전달
        .then(res => res.json())
        .then(result => {
            if (result.status !== "success") {
                console.error("불러오기 실패:", result.message);
                alert("불러오기 실패: " + (result.message || ""));
                return;
            }

            const history = result.data || [];
            console.log("▶ 불러온 이동 기록:", history);

            history.forEach(point => {
                const lat = parseFloat(point.lat);
                const lng = parseFloat(point.lng);

                new google.maps.Circle({
                    strokeColor: "#00FF00",
                    strokeOpacity: 0.8,
                    strokeWeight: 1,
                    fillColor: "#00FF00",
                    fillOpacity: 0.35,
                    map: gMap.map,
                    center: {lat, lng},
                    radius: 30
                });
            });

            alert(`시나리오 ${sid} 이동 기록 표시 완료!`);
        })
        .catch(err => console.error("Error:", err));
}

/**
 * 서버에서 새로운 시나리오 ID를 받아와 전역 변수에 설정
 */
function startNewScenario() {
    fetch('/cgi-bin/new_scenario.py', {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            currentScenarioId = data.scenario_id;
            scenarioStarted = true;
            lastLiveSave = 0;

            // (선택) UI 표시 업데이트
            if (document.getElementById('currentScenarioLabel')) {
                document.getElementById('currentScenarioLabel').textContent = String(currentScenarioId);
            }

            console.log(`🚀 New Scenario Started. ID: ${currentScenarioId}`);
            alert(`시나리오 ${currentScenarioId} 시작! 이제부터 찍고/움직이는 모든 기록이 이 시나리오로 저장됩니다.`);
        } else {
            console.error('❌ Failed to get new scenario ID:', data.message);
        }
    })
    .catch((error) => {
        console.error('🚨 Fetch or Parsing Error:', error.message);
    });
}

// =======================
// Replay (멀티 트랙 동시 재생) - Circle 기반
// =======================
const REPLAY_SPEEDS = [1, 2, 4, 8, 16, 32, 64]; // ✅ 선택 가능한 배속 목록
let replaySpeed = 1; 

let replayTracks = {};   // { [objectId]: { pts:[], idx:0, circle:null, trail:null, startMark:null, endMark:null } }
let replayTimers = {};   // { [objectId]: timerId }
let replayPlaying = false;

let replayStartMs = null;   // 전체 시나리오 시작시간(ms)
let replayEndMs = null;     // 전체 시나리오 끝시간(ms)
let replayUseTime = false;  // created_at이 유효하면 true

function toMs(t) {
  if (!t) return null;
  const s = String(t).replace(' ', 'T'); // "YYYY-MM-DD HH:MM:SS" 대응
  const ms = new Date(s).getTime();
  return Number.isNaN(ms) ? null : ms;
}

// ✅ 리플레이 원 반경(지도 반경) 가져오기: 현재 UI 반경 우선, 없으면 기본 1000
function getReplayRadius() {
  const el = document.getElementById("edtCircleRadius");
  const r = el ? parseInt(el.textContent, 10) : NaN;
  return Number.isFinite(r) ? r : 1000;
}

// 하단 바에서 시나리오 번호 입력으로 불러오기
function loadScenarioFromBar() {
  const el = document.getElementById("replayScenarioInput");
  const sid = parseInt(el ? el.value : "", 10);

  if (!sid || sid < 1) {
    alert("시나리오 번호를 입력하세요.");
    return;
  }
  loadScenarioMovement(sid);
}

// ✅ “시나리오 상황”을 먼저 화면에 띄우는 함수(트랙 생성)
function loadScenarioMovement(sid) {
  stopReplay();
  clearReplayOverlay();

  fetch(`/cgi-bin/load_movement.py?scenario_id=${sid}`)
    .then(res => res.json())
    .then(result => {
      if (result.status !== "success") {
        console.error("불러오기 실패:", result.message);
        alert("불러오기 실패: " + (result.message || ""));
        return;
      }

      const rows = result.data || result.records || [];
      if (!rows || rows.length === 0) {
        alert("해당 시나리오 이동 기록이 없습니다.");
        return;
      }

      // 1) object_id별 그룹핑
      replayTracks = {};
      const allTimes = [];
      let anyPoint = false;

      rows.forEach(r => {
        // object_id 안전 변환(문자열/NULL 대비)
        const oidRaw = (r.object_id ?? 0);
        const oid = Number.isFinite(+oidRaw) ? +oidRaw : 0;

        const lat = parseFloat(r.lat);
        const lng = parseFloat(r.lng);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return;

        const ms = toMs(r.created_at);
        if (ms !== null) allTimes.push(ms);

        if (!replayTracks[oid]) {
          replayTracks[oid] = {
            pts: [],
            idx: 0,
            circle: null,
            trail: null,
            startMark: null,
            endMark: null
          };
        }

        // id(정렬 fallback용)도 같이 넣어둠
        replayTracks[oid].pts.push({
          lat,
          lng,
          ms,
          id: r.id ?? null
        });

        anyPoint = true;
      });

      if (!anyPoint || Object.keys(replayTracks).length === 0) {
        alert("유효한 좌표가 없습니다.");
        return;
      }

      // 2) 트랙 정렬
      // - 시간이 있으면 시간순
      // - 시간이 없으면 id 순(있으면) / 입력순 유지
      Object.values(replayTracks).forEach(tr => {
        tr.pts.sort((a, b) => {
          // 둘 다 시간 있으면 시간순
          if (a.ms !== null && b.ms !== null) return a.ms - b.ms;

          // 시간 없을 땐 id로 정렬(있으면)
          if (a.id !== null && b.id !== null) return a.id - b.id;

          return 0;
        });
      });

      // 3) 전체 시간 범위
      replayUseTime = allTimes.length > 0;
      if (replayUseTime) {
        replayStartMs = Math.min(...allTimes);
        replayEndMs = Math.max(...allTimes);
      } else {
        replayStartMs = null;
        replayEndMs = null;
      }

      // 4) 지도 오버레이 생성 (트랙마다 Circle + trail + 시작/도착 표시)
      let radius = 1000;
      try {
        if (typeof getReplayRadius === "function") {
          const r = getReplayRadius();
          if (Number.isFinite(r) && r > 0) radius = r;
        }
      } catch (e) {}

      const bounds = new google.maps.LatLngBounds();

      Object.entries(replayTracks).forEach(([oid, tr]) => {
        if (!tr.pts || tr.pts.length === 0) return;

        const start = tr.pts[0];
        const end = tr.pts[tr.pts.length - 1];

        // bounds는 전체 경로로
        tr.pts.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));

        // ✅ 움직일 "원"(Circle)
        tr.circle = new google.maps.Circle({
          map: gMap.map,
          center: { lat: start.lat, lng: start.lng },
          radius: radius,
          strokeColor: "#0000FF",
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: "#0000FF",
          fillOpacity: 0.25,
          clickable: false
        });

        // trail(이동 궤적)
        tr.trail = new google.maps.Polyline({
          map: gMap.map,
          path: [{ lat: start.lat, lng: start.lng }],
          strokeOpacity: 0.9,
          strokeWeight: 3
        });

        // ✅ 시작점(초록) / 도착점(빨강) 표시
        tr.startMark = new google.maps.Circle({
          map: gMap.map,
          center: { lat: start.lat, lng: start.lng },
          radius: 30,
          strokeColor: "#00FF00",
          strokeOpacity: 1,
          strokeWeight: 2,
          fillColor: "#00FF00",
          fillOpacity: 0.35,
          clickable: false
        });

        tr.endMark = new google.maps.Circle({
          map: gMap.map,
          center: { lat: end.lat, lng: end.lng },
          radius: 30,
          strokeColor: "#FF0000",
          strokeOpacity: 1,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.35,
          clickable: false
        });

        tr.idx = 0;
      });

      // bounds가 유효할 때만 fitBounds (방어)
      try {
        if (!bounds.isEmpty && typeof bounds.isEmpty === "function") {
          if (!bounds.isEmpty()) gMap.map.fitBounds(bounds);
        } else {
          // 일부 환경에서 isEmpty 없으면 그냥 fitBounds 시도
          gMap.map.fitBounds(bounds);
        }
      } catch (e) {
        // fitBounds 실패해도 기능은 계속
        console.warn("fitBounds 실패(무시):", e);
      }

      // UI 초기화
      const btn = document.getElementById("btnReplayPlay");
      if (btn) btn.disabled = false;

      setSeek(0);
      setTimeLabel(0, 100);
    })
    .catch(err => console.error("Error:", err));
}

function toggleReplay() {
  if (!replayTracks || Object.keys(replayTracks).length === 0) {
    alert("먼저 시나리오를 불러오세요.");
    return;
  }

  replayPlaying = !replayPlaying;
  document.getElementById("btnReplayPlay").textContent = replayPlaying ? "⏸" : "▶";

  if (replayPlaying) {
    startAllTracks();
  } else {
    Object.values(replayTimers).forEach(id => clearTimeout(id));
    replayTimers = {};
  }
}

function stopReplay() {
  replayPlaying = false;
  Object.values(replayTimers).forEach(id => clearTimeout(id));
  replayTimers = {};
  const btn = document.getElementById("btnReplayPlay");
  if (btn) btn.textContent = "▶";
}

function startAllTracks() {
  Object.values(replayTimers).forEach(id => clearTimeout(id));
  replayTimers = {};

  const sp = (typeof replaySpeed === "number" && replaySpeed > 0) ? replaySpeed : 1;

  Object.entries(replayTracks).forEach(([oid, tr]) => {
    if (!tr.pts || tr.pts.length < 2) return;

    if (replayUseTime && tr.pts[0].ms !== null && replayStartMs !== null) {
      // ✅ 원래 오프셋(실시간 ms)
      let firstDelay = Math.max(0, tr.pts[0].ms - replayStartMs);

      // ✅ 배속 적용 (64배면 오프셋도 1/64로 줄어야 동시 재생처럼 보임)
      firstDelay = Math.max(0, Math.floor(firstDelay / sp));

      replayTimers[oid] = setTimeout(() => scheduleNextForTrack(oid), firstDelay);
    } else {
      // 시간 정보 없을 때도 배속 반영(선택이지만 권장)
      const base = 200;
      const delay = Math.max(5, Math.floor(base / sp));
      replayTimers[oid] = setTimeout(() => scheduleNextForTrack(oid), delay);
    }
  });
}


function scheduleNextForTrack(oid) {
  if (!replayPlaying) return;

  const tr = replayTracks[oid];
  if (!tr || !tr.pts || tr.pts.length < 2) return;

  // 이 트랙 끝이면 종료
  if (tr.idx >= tr.pts.length - 1) {
    updateGlobalProgress();
    return;
  }

  // 다음 포인트로 이동
  tr.idx++;
  const p = tr.pts[tr.idx];

  // ✅ 원 이동(커서 말고 Circle)
  if (tr.circle) tr.circle.setCenter({ lat: p.lat, lng: p.lng });

  // 궤적(trail) 늘리기
  if (tr.trail) {
    const path = tr.trail.getPath();
    path.push(new google.maps.LatLng(p.lat, p.lng));
  }

  // 진행률 갱신
  updateGlobalProgress();

  // 다음 딜레이 계산
  let delay = 200;

  if (replayUseTime) {
    const prev = tr.pts[tr.idx - 1];
    if (prev && prev.ms !== null && p.ms !== null) {
      const dt = p.ms - prev.ms;
      // dt 그대로 쓰면 너무 길거나 너무 짧을 수 있으니 클램프
      delay = Math.min(Math.max(dt, 20), 1000);
    }
  }

  // ✅ 배속 적용: 2배면 절반 시간, 64배면 1/64
  // (replaySpeed가 1,2,4,8,16,32,64 중 하나라고 가정)
  const sp = (typeof replaySpeed === "number" && replaySpeed > 0) ? replaySpeed : 1;
  delay = Math.max(5, Math.floor(delay / sp)); // 너무 0에 가까워지지 않게 최소 5ms

  replayTimers[oid] = setTimeout(() => scheduleNextForTrack(oid), delay);
}

function updateGlobalProgress() {
  if (replayUseTime && replayStartMs !== null && replayEndMs !== null && replayEndMs > replayStartMs) {
    let maxMs = replayStartMs;

    Object.values(replayTracks).forEach(tr => {
      const p = tr.pts[tr.idx];
      if (p && p.ms !== null) maxMs = Math.max(maxMs, p.ms);
    });

    const pct = Math.round(((maxMs - replayStartMs) / (replayEndMs - replayStartMs)) * 100);
    setSeek(Math.max(0, Math.min(100, pct)));
    setTimeLabel(pct, 100);
    return;
  }

  let sum = 0, n = 0;
  Object.values(replayTracks).forEach(tr => {
    if (tr.pts.length >= 2) {
      sum += tr.idx / (tr.pts.length - 1);
      n++;
    }
  });
  const pct = n ? Math.round((sum / n) * 100) : 0;
  setSeek(pct);
  setTimeLabel(pct, 100);
}

function clearReplayOverlay() {
  Object.values(replayTracks).forEach(tr => {
    if (tr.circle) tr.circle.setMap(null);
    if (tr.trail) tr.trail.setMap(null);
    if (tr.startMark) tr.startMark.setMap(null);
    if (tr.endMark) tr.endMark.setMap(null);
  });
  replayTracks = {};

  Object.values(replayTimers).forEach(id => clearTimeout(id));
  replayTimers = {};

  replayPlaying = false;
  const btn = document.getElementById("btnReplayPlay");
  if (btn) btn.textContent = "▶";

  setSeek(0);
  setTimeLabel(0, 0);
}

function setSeek(v) {
  const el = document.getElementById("replaySeek");
  if (el) el.value = v;
}

function setTimeLabel(cur, total) {
  const el = document.getElementById("replayTime");
  if (el) el.textContent = `${cur} / ${total}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnReplaySpeed");
  const menu = document.getElementById("replaySpeedMenu");
  if (!btn || !menu) return;

  if (btn.dataset.bound === "1") return;     // ✅ 중복 방지
  btn.dataset.bound = "1";

  function closeMenu(){ menu.classList.remove("open"); }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
  });

  document.addEventListener("click", () => closeMenu());

  menu.querySelectorAll("button[data-speed]").forEach(b => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      const s = parseInt(b.getAttribute("data-speed"), 10);
      if (!REPLAY_SPEEDS.includes(s)) return;

      replaySpeed = s;

      menu.querySelectorAll("button").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      btn.textContent = `⚙ ${replaySpeed}x`;

      closeMenu();
    });
  });

  btn.textContent = `⚙ ${replaySpeed}x`;
  const initBtn = menu.querySelector(`button[data-speed="${replaySpeed}"]`);
  if (initBtn) initBtn.classList.add("active");
});



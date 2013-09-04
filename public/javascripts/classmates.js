var map;
var tdt = {};
//轨迹数据
tdt.trackData = {
    'friend1': [
        [116.412, 39.883],
        [114.352, 36.117],
        [110.81, 26.37]
    ],
    'friend2': [
        [103.82, 30.92],
        [113.61, 38.98],
        [109.255, 34.382]
    ],
    'friend3': [
        [111.412, 39.883],
        [114.352, 30.117],
        [110.81, 23.37]
    ],
    'friend4': [
        [103.82, 32.92],
        [112.61, 38.98],
        [105.255, 34.382]
    ],
    'friend5': [
        [113.412, 39.883],
        [110.352, 36.117],
        [118.81, 26.37]
    ],
    'friend6': [
        [103.82, 28.92],
        [113.11, 38.98],
        [108.255, 32.382]
    ],
    'friend7': [
        [108.412, 39.883],
        [125.352, 36.117],
        [110.81, 22.37]
    ],
    'friend8': [
        [113.82, 30.92],
        [113.61, 30.98],
        [119.255, 36.382]
    ]
};

$(function () {

    // $('.selftooltip').tooltip();
    var zoom = 4;
    var config = {
        projection: "EPSG:900913"
    }
    //初始化地图对象
    map = new TMap("mapDiv", config);

    function locationSuccess (position){
        var coords = position.coords, lonlat = new TLngLat(coords.longitude, coords.latitude);
        map.centerAndZoom(lonlat, zoom);


    };

    function locationError (){
        map.centerAndZoom(new TLngLat(113.40969, 35.94940), 5);
        var config = {
            strokeColor:"blue", //圆边线颜色
            fillColor:"#FFFFFF",    //填充颜色。
            strokeWeight:"5px", //圆边线线的宽度，以像素为单位
            strokeOpacity:0.5,  //圆边线线的透明度，取值范围0 - 1
            fillOpacity:0.5,            //填充的透明度，取值范围0 - 1
            strokeStyle:"solid" //圆边线线的样式，solid或dashed
        };
        // 定义该矩形的显示区域
        circle = new TCircle(map.getCenter(),500000,config);
        // map.addOverLay(circle);
    };

    //设置显示地图的中心点和级别，利用地理定位功能
    if (navigator.geolocation) {
        // navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
        locationError();
    } else {
        locationError();
    }

    //允许鼠标双击放大地图
    map.enableHandleMouseScroll();
    //激活平滑拖动
    map.enableInertia();
    map.addControl(new TNavigationControl({
        type: "TMAP_NAVIGATION_CONTROL_ZOOM",
        anchor: "TMAP_ANCHOR_TOP_RIGHT",
        offset: [0, 0]
    }));

    //添加版权内容及事件
    var copyRightControl = new TCopyrightControl();
    copyRightControl.addCopyright({
        id:1,
        content:'<a href="http://www.tianditu.cn">东林 ● 朋友</a>',
        bounds:new TBounds(10,30,160,80)
    });
    //设置版权的位置
    copyRightControl.setRight(10);
    copyRightControl.setBottom(6);
    map.addControl(copyRightControl);

    //请求数据，加载分布情况
    $.get("info.txt", function(data) {
        var lines = data.split('\n');
        $.each(lines, function(index, value) {
            // if (index > 1) return false;
            var array = value.split("\t");
            var r = Math.round(Math.random(1)*25 );
            var icon = new TIcon("images/" + r + ".jpg",
                new TSize(30, 30)
            );
            icon.containerDiv.className = 'markerDiv';
            icon.containerDiv.title = array[0];
            var lonlat = new TLngLat(array[2], array[3]);
            var marker = new TMarker(lonlat, {icon: icon});
            marker.attr = {sex: array[4]};
            TEvent.addListener(marker, "click", function() {
                var s = array[0] + '<button type="button" id="track" class="btn btn-link view-track" onclick="tdt.viewTrack()">链接</button>';
                var infoWin = marker.openInfoWinHtml(s);
                infoWin.setTitle(array[1]);


            });
            map.addOverLay(marker);

        });
    });

    //只显示男生，女生 或者全部
    $('.filter-btn').click(function(e){
        e.preventDefault();
        var sex = parseInt($(this).attr('data-sex'));
        $.each(map.overlays, function(i, n){
            n.show();
            if ($(this).is('.filter-all')) return ;
            if (n.attr && n.attr.sex && n.attr.sex == sex) {
                n.hide();
            }
        })

    });

    //查看附近的人
    $('#nearby-btn').click(function(e){
        e.preventDefault();
        var center;
        function locationSuccess (position){
            var coords = position.coords, lonlat = new TLngLat(coords.longitude, coords.latitude);
            // map.centerAndZoom(lonlat, zoom);
            center = lonlat;
            alert('定位成功');
            filterNearbyMark(center);
            map.centerAndZoom(center, 8);
        };
        function locationError () {
            alert('定位失败');
            center = map.getCenter();
            filterNearbyMark(center);
        }

        function filterNearbyMark(center) {
            var radius = 150000, circle = tdt.addCircle(center,radius);
            var bounds = circle.getBounds();
            $.each(map.overlays, function(i, n){
                n.hide && n.hide();
                if (n.attr && n.attr.sex && center.distanceFrom(n.getLngLat()) <= radius) {
                    n.show();
                }
            });
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(locationSuccess, locationError);

        } else {
            alert('浏览器不支持地理定位！');
        }


    });

    //添加想去的地方
    $('#future-btn').click(function(e){
        e.preventDefault();
        tdt.addMarkTool();
    });

    //查看中国10个最美丽的地方
    $('#tenarea-btn').click(function(e){
        e.preventDefault();
        tdt.addTenBeauArea();
    });

    //大家想去
    $('#guyswantgo-btn').click(function(e){
        e.preventDefault();
        //请求数据，加载分布情况
        $.get("data/wantgo.txt", function(data) {
            var lines = data.split('\n');
            $.each(lines, function(index, value) {
                var array = value.split("\t");
                var lonlat = new TLngLat(array[1], array[2]);
                var marker = new TMarker(lonlat);
                TEvent.addListener(marker, "click", function() {
                    var s = array[0] + '<br/><strong>' + array[3] + '人想去</strong>';
                    var infoWin = marker.openInfoWinHtml(s);
                    //infoWin.setTitle(array[1]);
                });
                map.addOverLay(marker);

            });
        });
    });


});
tdt.viewTrack = function(){
    var a = Math.round(Math.random() * 8), b = 'friend' + a;
    var tdata = tdt.trackData[b];
    var r = Math.round(Math.random() * 255),
        g = Math.round(Math.random() * 255),
        b = Math.round(Math.random() * 255),
        rgb = 'rgb(' + r + ',' + g + ',' + b + ')';
    tdt.addPolyline(tdata, rgb);
};

//增加轨迹点
tdt.addPolyline = function(tdata, color){
    var points = [];
    for (var i = tdata.length - 1; i >= 0; i--) {
        var arr = tdata[i];
        points.push(new TLngLat(arr[0], arr[1]));
    };

    var polyline = new TPolyline(points,{strokeColor:color, strokeWeight:3});
    map.addOverLay(polyline);
};

//增加圆,返回circle
tdt.addCircle = function(center, radius){
    var config = {
        strokeColor:"#685300", //圆边线颜色
        fillColor:"#68A3CA",    //填充颜色。
        strokeWeight:"2px", //圆边线线的宽度，以像素为单位
        strokeOpacity:0.5,  //圆边线线的透明度，取值范围0 - 1
        fillOpacity:0.2,            //填充的透明度，取值范围0 - 1
        strokeStyle:"solid" //圆边线线的样式，solid或dashed
    };
    var radius = radius || 150000;
    // 定义该矩形的显示区域
    var circle = new TCircle(center, radius, config);
    map.addOverLay(circle);
    return circle;
}

//添加标注功能
tdt.addMarkTool = function() {
    var markerTool = new TMarkTool(map);
    TEvent.addListener(markerTool, "mouseup", function(point){
        var marker = new TMarker(point);
        marker.div.className = 'bounce';
        map.addOverLay(marker);
        TEvent.addListener(marker, "click", function() {
            var s = '<div class="input-append">' +
                    '<input class="span2" id="place-text" type="text" placeholder="这是哪里...">' +
                    '<button class="btn" type="button" id="readygo-btn">走起</button></div>'
            var infoWin = marker.openInfoWinHtml(s);
            infoWin.setTitle('输入地名');

            $(infoWin.content).on('click', 'button', function(){
                infoWin.setLabel($('#place-text').val());
                infoWin.setTitle('');

            });

            // infoWin.content.style.marginTop = 0;
        });
        markerTool.close();
    });
    markerTool.open();

}

tdt.addTenBeauArea = function() {

    //请求数据，加载分布情况
    $.get("data/10beautiful-area.txt", function(data) {
        var lines = data.split('\n');
        $.each(lines, function(index, value) {
            //if (index > 3) return false;
            var arr = value.split("\t");

            var icon = new TIcon("images/area.jpg" ,
                new TSize(30, 30)
            );
            // icon.containerDiv.className = 'markerDiv';
            var arrtmp = arr[1].split(',');
            var lonlat = new TLngLat(arrtmp[0], arrtmp[1]);
            var marker = new TMarker(lonlat, {icon: icon});
            // marker.attr = {sex: array[4]};
            TEvent.addListener(marker, "click", function() {
                var s = '<img class="detailimg img-polaroid" src="data/areaimages/' +
                    arr[3] + '" alt="' + arr[0] + '"><p class="areadeatil">' + arr[2] + '</p>';
                var infoWin = marker.openInfoWinHtml(s);
                infoWin.setTitle(arr[0]);
            });
            map.addOverLay(marker);

        });
    });

}

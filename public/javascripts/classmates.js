var map;
var tdt = {};
//轨迹数据
tdt.trackData = {
    'friend1': [
        [106.549 ,29.560],
        [112.474, 34.554],
        [126.187, 41.156]
    ],
    'friend2': [
        [113.602, 38.977],
        [103.0003, 30.831],
        [107.759, 29.3259]
    ],
    'friend3': [
        [118.1214, 24.47001367120],
        [103.82117849200, 30.92349052700],
        [112.632253, 31.23019146760]
    ],
    'friend4': [
        [114.72136800000 ,   24.60591999980],
        [112.18177900000,    37.21079100030],
        [100.23863200000,    26.86919099980]
    ],
    'friend5': [
        [120.60890000100,    31.31104499940],
        [109.25541296500,    34.38278461430],
        [116.10450200000,    42.21356566294]
    ],
    'friend6': [
        [120.60890000100,    31.31104499940],
        [112.18177900000,    37.21079100030],
        [103.0003, 30.831]
    ],
    'friend7': [
        [112.18177900000,    37.21079100030],
        [120.60890000100,    31.31104499940],
        [100.23863200000,    26.86919099980]
    ],
    'friend8': [
        [118.1214, 24.47001367120],
        [120.60890000100,    31.31104499940],
        [112.632253, 31.23019146760]
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
        circle = new TCircle(map.getCenter(), 500000, config);
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
    tdt.addData('info.txt');

    //当前登录都位置
    var icon = new TIcon("images/map-marker1.png",
        new TSize(50, 50)
    );
    icon.containerDiv.className = 'selfmark';
    icon.containerDiv.title = '自己';
    var lonlat = new TLngLat(115, 39);
    var marker = new TMarker(lonlat, {icon: icon});
    tdt.isSend = false;
    tdt.mystatus = '';
    TEvent.addListener(marker, "click", function() {
        var infoWin = marker.openInfoWinHtml(s);
        infoWin.setTitle('');
        if (!tdt.isSend) {
            var s = '<div class="selfstatus">' +
                    '<textarea rows="3" placeholder="最近发生了什么..."></textarea>' +
                    '<button class="btn" type="button" id="sendStatus">发布</button></div>'
            tdt.isSend = true;

            infoWin.setLabel(s);
        } else {
            var s = tdt.mystatus;
            infoWin.setLabel('helo');
        }
        $(infoWin.content).on('click', 'button', function(){
            var status = $('.selfstatus textarea').val(),
                s = '<li><a href="#">自己</a>&nbsp;&nbsp;' + status + '&nbsp;&nbsp;刚刚</li>';
            tdt.mystatus = status;
            $('.list-content .inner ul').prepend(s);
            infoWin.closeInfoWindow();
        });
    });
    marker.div.className = 'selfmarkdiv';
    map.addOverLay(marker);

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
            setTimeout(function() {
                circle.setFillOpacity(0.1);
            }, 4000);
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
                var icon = new TIcon("images/marker/map-marker-marker-outside-azure.png",
                    new TSize(50, 50)
                );
                var marker = new TMarker(lonlat, {icon: icon});
                TEvent.addListener(marker, "click", function() {
                    var s = array[0] + '<br/><b class="totip" title="刘芳,李响,计含">' + array[3] + '</b>人想去';
                    var infoWin = marker.openInfoWinHtml(s);
                    infoWin.setTitle('');
                    $('.totip').tooltip();
                });
                map.addOverLay(marker);

            });
        });
    });

    //查看pm2.5值
    $('#pm25-btn').click(function (e) {
        e.preventDefault();
        $('#pm25-legend').show();
        $.ajax({
            type : 'GET',
            dataType : 'jsonp',
            url : 'http://www.kaiwenmap.cn/media/uploads/pm25/hourlyaqi.jsonp',
            jsonpCallback : 'json',
            success : function(data) {
                var cityname = '', pmdata = [], count = 1, pmvalue = 0, color = '';
                $.each(data, function(i, item){
                    if (item.city === cityname) {
                        if (parseInt(item.pm25) != 0) {++count;}
                        pmvalue += parseInt(item.pm25);
                    } else {
                        if (pmdata.length) {
                            var i = pmdata[pmdata.length-1];
                            i.pm = Math.round(pmvalue/count);
                            // console.log(i.city, i.pm);
                            var llat = new TLngLat(i.lon, i.lat), color = '';
                            if (0 < i.pm && i.pm <= 50) {
                                //优
                                color = '#43CE17';
                            }
                            if (50 < i.pm && i.pm <= 100) {
                                //良
                                color = '#FDFF00';
                            }
                            if (100 < i.pm && i.pm <= 150) {
                                //轻度污染
                                color = '#FF9500';
                            }
                            if (150 < i.pm && i.pm <= 200) {
                                //中度污染
                                color = '#FB0010';
                            }
                            if (200 < i.pm && i.pm <= 300) {
                                //重度污染
                                color = '#950066';
                            }
                            if (300 < i.pm) {
                                //严重污染
                                color = '#660029';
                            }
                            if (i.pm !== 0) {
                                tdt.addCircle(llat, 40000, color);
                            }
                        };
                        pmdata.push({
                            'city': item.city,
                            'lon': item.lng,
                            'lat': item.lat,
                            'pm': parseInt(item.pm25)
                        });
                        count = 1;
                        pmvalue = 0;
                    };
                    cityname = item.city;
                });
            }
        });

    });

    //最新状态关闭功能
    $('.list-content .close').click(function (e) {
        e.preventDefault();
        $(this).parent().hide();
    });

    $('#year11').click(function(){
        tdt.addData('info2011.txt');
    });
    $('#year12').click(function(){
        tdt.addData('info2012.txt');
    });
    $('#year13').click(function(){
        tdt.addData('info.txt');
    });
    $('.totip').tooltip();
});
tdt.addData = function(txtname){
    $('#t_overlaysDiv').empty();
    $.get("data/" + txtname, function(data) {
        var lines = data.split('\n');
        $.each(lines, function(index, value) {
            // if (index > 0) return false;
            var array = value.split("\t");
            var r = Math.round(Math.random(1)*25 );
            var icon = new TIcon("images/" + r + ".jpg",
                new TSize(30, 30)
            );
            icon.containerDiv.className = 'markerDiv';
            if (!parseInt(array[4])) {
                icon.containerDiv.className = 'markerDiv boy';
            }
            icon.containerDiv.title = array[0];
            var lonlat = new TLngLat(array[2], array[3]);
            var marker = new TMarker(lonlat, {icon: icon});
            marker.attr = {sex: array[4]};
            TEvent.addListener(marker, "click", function() {
                var s = array[1] + '<button type="button" id="track" class="btn btn-link view-track"' +
                ' onclick="tdt.viewTrack(' + array[2] + ',' + array[3] + ')">轨迹</button>';
                var infoWin = marker.openInfoWinHtml(s);
                infoWin.setTitle(array[0]);
            });

            map.addOverLay(marker);
        });
    });
}
tdt.viewTrack = function(lon, lat){
    var a = Math.round(Math.random() * 8), b = 'friend' + a;
    var tdata = tdt.trackData[b];
    // for (var i = 0; i < 2; i++) {
    //     var a = Math.round(Math.random() * 20);
    //     var p = map.overlays[a].point;
    //     tdata.push([p.getLng(), p.getLat()]);
    // };
    tdata.push([lon, lat]);
    var r = Math.round(Math.random() * 255),
        g = Math.round(Math.random() * 255),
        b = Math.round(Math.random() * 255),
        rgb = 'rgb(' + r + ',' + g + ',' + b + ')';
    tdt.addPolyline(tdata, rgb);
};

//增加轨迹点
tdt.addPolyline = function(tdata, color){
    var points = [];
    for (var i = 0; i < tdata.length - 1; i++) {
        var arr = tdata[i];
        points.push(new TLngLat(arr[0], arr[1]));
    };

    var polyline = new TPolyline(points,{strokeColor:color,
        strokeWeight:8,
        strokeOpacity:0});
    map.addOverLay(polyline);
};

//增加圆,返回circle
tdt.addCircle = function(center, radius, color){
    var config = {
        strokeColor: "#685300", //圆边线颜色
        fillColor: color || "#68A3CA",    //填充颜色。
        strokeWeight: "2px", //圆边线线的宽度，以像素为单位
        strokeOpacity: 0.5,  //圆边线线的透明度，取值范围0 - 1
        fillOpacity: 0.7,            //填充的透明度，取值范围0 - 1
        strokeStyle: "solid" //圆边线线的样式，solid或dashed
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
                    '<input class="col-md-2" id="place-text" type="text" placeholder="这是哪里...">' +
                    '<button class="btn btn-default" type="button" id="readygo-btn">走起</button></div>'
            var infoWin = marker.openInfoWinHtml(s);
            infoWin.setTitle('输入地名');

            $(infoWin.content).on('click', 'button', function(){
                var place = $('#place-text').val(), s = place + ',<a href="#">小房</a>,第一个想来这里';
                infoWin.setTitle('');
                infoWin.setLabel(s);
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

            var icon = new TIcon("images/marker/map-marker-marker-outside-chartreuse.png" ,
                new TSize(50, 50),
                {
                    //anchor: new TPixel(-25,80)
                }
            );
            // icon.containerDiv.className = 'markerDiv';
            var arrtmp = arr[1].split(',');
            var lonlat = new TLngLat(arrtmp[0], arrtmp[1]);
            var marker = new TMarker(lonlat, {icon: icon});
            TEvent.addListener(marker, "click", function() {
                var s = '<img class="detailimg img-polaroid" src="data/areaimages/' +
                    arr[3] + '" alt="' + arr[0] + '"><p class="areadeatil m5">' + arr[2] +
                    '有<b class="m5 totip text-info" title="刘芳,李响,计含">3</b>' +
                    '个人想去，<a href="#" class="btn btn-link">我想去</a></p>';
                var infoWin = marker.openInfoWinHtml(s);
                infoWin.setTitle(arr[0]);
                $('.totip').tooltip();
            });
            map.addOverLay(marker);
        });
    });
}

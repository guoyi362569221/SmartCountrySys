////json data

import gsJsonData from 'assets/geojson/gs.json';
import plsJsonData from 'assets/geojson/pls.json';
import jcxJsonData from 'assets/geojson/jcx.json';
import yjxJsonData from 'assets/geojson/yjx.json';

import rightPanel from 'layout/right-panel/RightPanel.vue';

import locateBtn from 'customComponetns/comm/LocateControl/LocateControl.vue';

import echarts from 'echarts';

import L from 'leaflet';

var esri = require('esri-leaflet') ;

import {utils} from 'utils/utils';
import {dateUtils} from 'utils/dateUtils';

import Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'libs/Leaflet-ext/BaseMapSwitch/L.Control.Basemaps.css';

export default {
    components: {
        'right-panel': rightPanel,
        'locate-btn': locateBtn
    },
    data() {
        return {
            ////模块基础数据信息
            name: 'Home',
            toggleStatus: 'open',
            padding: 8,
            marginWidth:0,
            panelWidth: 0,
            rightPanelWidth: this.$$appConfig.layout.rightPanel.width,
            toggle: this.$$appConfig.layout.rightPanel.toggle,
            isConfigLoaded: false,
            config: {},
            ////业务数据

            //geojsont图层
            currentTime: new Date(),
            currentInfoTime: new Date(),    ////右侧面板的时间
            dateType: 'hour',
            defaultMapType:'night',

            gsJsonData:gsJsonData,
            plsJsonData:plsJsonData,
            jcxJsonData:jcxJsonData,
            yjxJsonData:yjxJsonData,

            tcglShow:true,
            cjShow:true,

            zoom: 0,
            currBounds: [],
            currType:null,

            borderLayer:null,

            location: {},
            locate: '',

            rightPanelTitle: "空气质量实时数据 ",

            layerArray : [],

            mapOptions:[],

            checkedLayers:[],

            defaultProps: {
              children: 'children',
              label: 'label'
            },

            monitorJCZData:[],

            gsSrc:"static/images/gs.png",

            paraObj:{
                Q3:1.5,
                g1:3,
                g2:10,
                g3:15
            },

            points:[],
            lines:new L.polyline([]),
            tempLines:new L.polyline([],{dashArray:5}),
            pointsLayer:new L.LayerGroup(),
            ycPointsLayer:new L.LayerGroup(),
            linesLayer:new L.LayerGroup(),
            tempLinesLayer:new L.LayerGroup(),


            rectangleMeasure:{
                startPoint: null,
                endPoint: null,
                rectangle:null,
                tips:null,
                layer: L.layerGroup(),
                color: "#0D82D7"
            },

            nodeData:null,

            tableData: [{L:"-",Q1:"-",Q2:"-",L1:"-",L2:"-",N:"-",p:"-"}],
            isShowExportBtn:false
        }
    },

    created() {
        this.rightPanelWidth = this.panelWidth === undefined ? this.$$appConfig.layout.rightPanel.width : this.panelWidth;
        this.$$resize(this.onResize);
        this.$$getConfig(this.onGetConfig);
    },

    mounted() {},

    methods: {
        /**
         * 获取当前模块配置文件
         * @param config json格式的配置信息
         */
        onGetConfig(config) {
            this.config = config;
            this.isConfigLoaded = true;
            ////////////////////////////////////
           
            this.defaultMapType = config.settings.mapType.default;

            this.location = config.localInfoObj.location;
            this.locate = config.localInfoObj.locate;

            this.mapOptions = config.mapOptions;
            this.checkedLayers = config.checkedLayers;

            this.paraObj = config.paraObj;


            this.monitorJCZData = config.settings.monitorJCZData;

            if(config.rightPanelTitle){
                this.rightPanelTitle = config['rightPanelTitle'];
            }

            this.$nextTick(() => {
                this.initMap();
                this.onResize();
            });
        },
        /**
         * 视图大小更改事件
         */
        onResize() {
            /*这里动态计算div的宽高去实现完全自适应*/
            this.$nextTick(() => {
               if(this.map && this.map.invalidateSize){
                    this.map.invalidateSize();
                    if(this.currBounds){
                        this.map.fitBounds(this.currBounds);
                    }
                }
            });            
            setTimeout(()=>{
                this.$nextTick(() => {
                    
                });
            }, 300);                 
        },

        /**
         * 右边面板状态更改事件
         * @param status 当前状态 open|close
         */
        onTogglePanel(status) {
            this.toggleStatus = status;
            this.rightPanelWidth = status === 'close' ? 0 : this.$$appConfig.layout.rightPanel.width;
        },
       
        onSetHDPoint(){
            
            if(this.map){
                this.map.off('mousedown');
                this.map.off('mouseup');
                this.nodeData = null;
            }

            this.tableData = [{L:"-",Q1:"-",Q2:"-",L1:"-",L2:"-",N:"-",p:"-"}];
            this.isShowExportBtn = false;

            this.points=[]
            this.lines = new L.polyline([]);
            this.tempLines = new L.polyline([],{dashArray:5});

            this.linesLayer.clearLayers();
            this.tempLinesLayer.clearLayers();
            this.pointsLayer.clearLayers();
            this.ycPointsLayer.clearLayers();

            this.map.on('click', this.onClick);    //点击地图
            this.map.on('mousemove',this.onMove)//双击地图
        },

        onCloseTC(){
            let that = this;

            that.tcglShow = !that.tcglShow;
        },

        onCloseCJ(){
            let that = this;

            that.cjShow = !that.cjShow;
        },

        onYCHDPoint(){
            let that = this;

            this.tableData = [{L:"-",Q1:"-",Q2:"-",L1:"-",L2:"-",N:"-",p:"-"}];
            this.isShowExportBtn = false;
            if(this.points.length===3){
                
                this.lines = new L.polyline([]);
                this.tempLines = new L.polyline([],{dashArray:5});

                this.linesLayer.clearLayers();
                this.tempLinesLayer.clearLayers();
                this.ycPointsLayer.clearLayers();

                for(let i=0;i<this.points.length;i++){
                    this.lines.addLatLng([this.points[i][0],this.points[i][1]]);
                }
                this.linesLayer.addLayer(this.lines);
                this.map.addLayer(this.linesLayer);
                this.$$CreatePointLayer({
                    data: {
                        suffixName:"_Point"
                    },
                    fn: data => {
                        if (data) {
                            let dataSource = data.split("_Point")[0];
                            let attrValues = [];
                            let attrNames = ["Id"];
                            for(let i=0;i<this.points.length;i++){
                                let objTemp = {
                                    fieldValues:[i],
                                    x:this.points[i][1],
                                    y:this.points[i][0]
                                }
                                attrValues.push(objTemp);
                            }
                            this.$$AddPointFeatures({
                                data: {
                                    attrNames:attrNames,
                                    attrValues:attrValues,
                                    layerName:data,
                                    dataSource:dataSource
                                },
                                fn: data1 => {
                                    if (data1) {
                                        this.$$InvokingProcessorA({
                                            data:{
                                                parageoProcessors:["",data,"",""],
                                                dataSource:dataSource,
                                                calculateParas:that.paraObj
                                            },
                                            fn: data2 => {
                                                if (data2) {
                                                    let points = data2.Points;
                                                    let resultValue = data2.ResultValue
                                                    
                                                    if(points.length===4){
                                                        this.lines.addLatLng([points[3]["POINT_Y"],points[3]["POINT_X"]]);
                                                        this.linesLayer.addLayer(this.lines);
                                                        this.map.addLayer(this.linesLayer);

                                                        this.ycPointsLayer.addLayer(L.circle([points[3]["POINT_Y"],points[3]["POINT_X"]], {radius:5,color:'#ff0000',fillColor:'green',fillOpacity:1}));
                                                        this.map.addLayer(this.ycPointsLayer);
                                                    }

                                                    this.tableData = [resultValue];
                                                    this.isShowExportBtn = true;
                                                }
                                            },
                                            errFun: err => {
                                                
                                            }
                                        });
                                    }
                                },
                                errFun: err => {
                                    
                                }
                            });
                        }
                    },
                    errFun: err => {
                        
                    }
                });
            }else{
                alert("请先设置滑动点！");
            }
        },

        onClear(){
            let that = this;

            this.tableData = [{L:"-",Q1:"-",Q2:"-",L1:"-",L2:"-",N:"-",p:"-"}];
            this.isShowExportBtn = false;
            this.points=[]
            this.lines = new L.polyline([]);
            this.tempLines = new L.polyline([],{dashArray:5});

            this.linesLayer.clearLayers();
            this.tempLinesLayer.clearLayers();
            this.pointsLayer.clearLayers();
            this.ycPointsLayer.clearLayers();
        },

        /*
        * 切换区域
        */        
        onLocationChange(bound){
            if(bound){
                this.currBounds = bound.value;
                this.currType = bound.type;
                if (this.map) {
                    this.map.fitBounds(this.currBounds);
                    this._drawBorderLayer(bound.type);
                }
            }
            
        },  

        onCheckChange(data, checked, indeterminate){
            let that = this;
            
            if(data){
                switch(data.type){
                    case "tdt":
                    if(checked){
                        let layer = L.tileLayer(data.url, {
                                maxZoom: 21,
                                id: data.layerId,
                                zIndex:data.zIndex
                        });
                        that.map.addLayer(layer);
                        that.layerArray.push(layer);
                    }else{
                        if(that.layerArray&&that.layerArray.length>0){
                            for(let i=0;i<that.layerArray.length;i++){
                                if(that.layerArray[i]["options"].id===data.layerId){
                                    that.map.removeLayer(that.layerArray[i]);
                                    that.layerArray.splice(i,1); 
                                }
                            }
                        }
                    }
                    break;
                    case "MapServer":
                        if(checked){
                            let dynamicLayer = esri.dynamicMapLayer({
                                        id:data.layerId,
                                        url:data.url,
                                        f:'json',
                                        zIndex:data.zIndex
                                    });
                            that.map.addLayer(dynamicLayer);
                            that.layerArray.push(dynamicLayer);
                            // dynamicLayer.setOpacity(0.5);
                        }else{
                            if(that.layerArray&&that.layerArray.length>0){
                                for(let i=0;i<that.layerArray.length;i++){
                                    if(that.layerArray[i]["options"].id===data.layerId){
                                        that.map.removeLayer(that.layerArray[i]);
                                        that.layerArray.splice(i,1); 
                                    }
                                }
                            }
                        }
                    break;
                    case "tile":
                        if(checked){
                        let layerTile = L.tileLayer(data.url, {
                                maxZoom: 21,
                                id: data.layerId,
                                zIndex:data.zIndex
                        });
                        that.map.addLayer(layerTile);
                        that.layerArray.push(layerTile);
                    }else{
                        if(that.layerArray&&that.layerArray.length>0){
                            for(let i=0;i<that.layerArray.length;i++){
                                if(that.layerArray[i]["options"].id===data.layerId){
                                    that.map.removeLayer(that.layerArray[i]);
                                    that.layerArray.splice(i,1); 
                                }
                            }
                        }
                    }
                    break;
                }
            }
        },

        onQueryStatusChange(obj){
            let that = this;
            
            switch(obj.mapQuery){
                case true:
                    that.nodeData = obj;
                break;
                case false:
                    that.nodeData = null;
                break;
            }
        },

        onLKQueryChange(){
            let that = this;
            switch(that.nodeData.mapQuery){
                case true:
                    this.map.on('mousedown', function(e){
                        that.mousedown(e);
                    });
                    this.map.on('mouseup', function(e){
                        that.mouseup(e);
                    });
                break;
                case false:
                    this.map.off('mousedown');
                    this.map.off('mouseup');
                    that.nodeData = null;
                break;
            }
        },

        onExportExcel(){
            let that = this;

            let excelTableData = []; // Excel数据表格
            excelTableData.push(["L滑距(米)","L1(米)","L2(米)","θ1(°)","θ2(°)","θ3(°)","φ1(°)","φ2(°)","φ3(°)","η","δ"]);
            // tableData: [{L:"-",Q1:"-",Q2:"-",L1:"-",L2:"-",N:"-",p:"-"}]
            excelTableData.push(
                [
                that.tableData[0]["L"],
                that.tableData[0]["L1"],
                that.tableData[0]["L2"],
                that.tableData[0]["Q1"],
                that.tableData[0]["Q2"],
                that.paraObj.Q3,
                that.paraObj.g1,
                that.paraObj.g2,
                that.paraObj.g3,
                that.tableData[0]["N"],
                that.tableData[0]["p"]]
            );
            

            // 这里开始设置Excel其他属性
            let toExcelObj = {
                ws_val: excelTableData,
                ws_name: dateUtils.dateToStr("yyyyMMddHHmmss", new Date())+"_预测结果",
                ws_type: "xlsx",
                ws_merge: [],
                ws_sheetName: ["滑距预测结果"],
                cellfilter: (cell, C, R) => {
                    if (R==0) {
                        cell.s.font.bold = true;
                    }
                    return cell;
                }
            };
            utils.toExcel(toExcelObj);
        },

        /*
        * 地图的初始化
        */        
        initMap(){

            // let mapOption = utils.deepCopy(this.$$appConfig.map);
            // Object.assign(mapOption['options'], utils.deepCopy(this.config.mapOption)); 

            // this.map = new $3clearMap('HomePageMonitorMapDiv', mapOption, this.defaultMapType).llMap;
            
            // this.map.on("zoomend", (event) => {
            //     this.zoom = this.map.getZoom();
            // });
            // this.map.on("moveend", (event) => {
            // });
            // this.map.fitBounds(this.currBounds);
            
            // this.borderLayer = L.layerGroup().addTo(this.map);

            // this._drawBorderLayer(this.currType);

            // debugger;
            // L.esri.tiledMapLayer({
            //         url:"http://192.168.3.19:6080/arcgis/rest/services/TaiPing_DK/taiping_dk/MapServer",//地图服务地址
            //         minZoom:1,//最小缩放等级
            //         minZoom:21,//最大缩放等级
            // }).addTo(this.map);//加载


            // L.esri.dynamicMapLayer({
            //         url:"http://192.168.3.19:6080/arcgis/rest/services/TaiPing_DK/taiping_dk/MapServer",//地图服务地址
            //         minZoom:1,//最小缩放等级
            //         minZoom:21,//最大缩放等级
            // }).addTo(this.map);//加载

            
            // var map = L.map('HomePageMonitorMapDiv').setView([45.528, -122.680], 13);
            //   L.esri.basemapLayer("Gray").addTo(map);

            //   var parks = L.esri.featureLayer({
            //     url: "https://services.arcgis.com/rOo16HdIMeOBI4Mb/arcgis/rest/services/Portland_Parks/FeatureServer/0",
            //     style: function () {
            //       return { color: "#70ca49", weight: 2 };
            //     }
            //   }).addTo(map);

            //   var popupTemplate = "<h3>{NAME}</h3>{ACRES} Acres<br><small>Property ID: {PROPERTYID}<small>";

            //   parks.bindPopup(function(e){
            //     return L.Util.template(popupTemplate, e.feature.properties)
            //   });


            //this.map = L.map("HomePageMonitorMapDiv");

            //  // 影像
            // L.tileLayer("http://t{s}.tianditu.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles", {
            //     subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"]
            // }).addTo(this.map);
            // // 地名标注
            // L.tileLayer("http://t{s}.tianditu.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles", {
            //     subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"]
            // }).addTo(this.map);
            // // 边界
            // L.tileLayer("http://t{s}.tianditu.cn/ibo_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=ibo&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles", {
            //     subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"]
            // }).addTo(this.map);


            // esri.tiledMapLayer(
            //     {url: "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer"}
            // ).addTo(this.map);

            // var normalMapm = L.tileLayer('http://t3.tianditu.com/vec_c/wmts?layer=vec&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk=ca9c419b9135b2179d0ff37413bba8b7', {
            //     zoomOffset: 1
            // })
            // var normalMapa = L.tileLayer('http://t0.tianditu.gov.cn/cva_c/wmts?layer=cva&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk=ca9c419b9135b2179d0ff37413bba8b7', {
            //     zoomOffset: 1
            // })
     
            // var imgMapm = L.tileLayer('http://t0.tianditu.gov.cn/img_c/wmts?layer=img&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk=ca9c419b9135b2179d0ff37413bba8b7', {
            //     zoomOffset: 1
            // })

            // var imgMapa = L.tileLayer('http://t0.tianditu.gov.cn/cia_c/wmts?layer=cia&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk=ca9c419b9135b2179d0ff37413bba8b7', {
            //     zoomOffset: 1
            // })

            // var normalMap = L.layerGroup([normalMapm, normalMapa]),
            //     imgMap = L.layerGroup([imgMapm, imgMapa]);
            // var baseLayers = { "行政": normalMap ,"卫星":imgMap};
     
            // var overlayLayers = {}
     
            // this.map = L.map("HomePageMonitorMapDiv", {
            //     crs: L.CRS.EPSG4326,
            //     center: [27.335483, 103.785457],
            //     zoom: 12,
            //     layers: [normalMap],
            //     zoomControl: false
            // });

            // L.control.layers(baseLayers, overlayLayers).addTo(this.map);

            // L.control.zoom({
            //     zoomInTitle: '放大',
            //     zoomOutTitle: '缩小'
            // }).addTo(this.map);

            let that = this;

            // var url0 = "http://192.168.3.121/imgServer/{z}/{x}/{y}.png";
            // var url_zj0 = "http://localhost/imgServer_ZJ/{z}/{x}/{y}.png";
            // var url = "https://t3.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=fb1bfb9e06cd7681813a42f4c934e1ea";
            // var url_zj = "https://t5.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=fb1bfb9e06cd7681813a42f4c934e1ea";
            //初始化 地图，这个view要设置到离线地图的范围，不然什么都没有
            this.map = L.map("HomePageMonitorMapDiv", {
                crs: L.CRS.EPSG3857, //要使用的坐标参考系统，默认的坐标参考系,互联网地图主流坐标系
                //crs: L.CRS.EPSG4326, //WGS 84坐标系，GPS默认坐标系
                zoomControl: true,
                // minZoom: 1,
                attributionControl: true,
            });
                    
            if(that.checkedLayers&&that.checkedLayers.length>0){
                for(let i=0;i<that.mapOptions.length;i++){
                    for(let j=0;j<that.checkedLayers.length;j++){
                        if(that.mapOptions[i].id === that.checkedLayers[j]){
                            switch(that.mapOptions[i].type){
                                case "tdt":
                                    let layer = L.tileLayer(that.mapOptions[i].url, {
                                        maxZoom: 21,
                                        id: that.mapOptions[i].layerId,
                                        zIndex:that.mapOptions[i].zIndex
                                    });
                                    that.map.addLayer(layer);
                                    that.layerArray.push(layer);

                                break;
                                case "MapServer":
                                    let dynamicLayer = esri.dynamicMapLayer({
                                        id:that.mapOptions[i].layerId,
                                        url:that.mapOptions[i].url,
                                        f:'json',
                                        zIndex:that.mapOptions[i].zIndex
                                    });
                                    this.map.addLayer(dynamicLayer);
                                    that.layerArray.push(dynamicLayer);
                                break;
                                case "tile":
                                    let layerTile = L.tileLayer(that.mapOptions[i].url, {
                                        maxZoom: 21,
                                        id: that.mapOptions[i].layerId,
                                        zIndex:that.mapOptions[i].zIndex
                                    });
                                    that.map.addLayer(layerTile);
                                    that.layerArray.push(layerTile);

                                break;
                            }
                        }
                    }
                }
            }

            // //将图层加载到地图上，并设置最大的聚焦还有map样式
            // L.tileLayer(url, {
            //         maxZoom: 19,
            //         id: "mapbox.streets"
            // }).addTo(this.map);

            //  //将图层加载到地图上，并设置最大的聚焦还有map样式
            // L.tileLayer(url_zj, {
            //         maxZoom: 19,
            //         id: "mapbox.streets"
            // }).addTo(this.map);


            //将图层加载到地图上，并设置最大的聚焦还有map样式
            // L.tileLayer(url0, {
            //         maxZoom: 19,
            //         id: "mapbox.streets"
            // }).addTo(this.map);

            //this.map.fitBounds(this.currBounds);

            this.borderLayer = L.layerGroup().addTo(this.map);

            this._drawBorderLayer(this.currType);

            // let tiledLayer = esri.tiledMapLayer({
            //         url:"http://192.168.3.19:6080/arcgis/rest/services/HFT_DOM/heifangtai_dom/MapServer",//地图服务地址
            //         maxZoom:19//最大缩放等级
            // }).addTo(this.map);//加载

            // let dynamicLayer = esri.dynamicMapLayer({
            //     url:'http://192.168.3.19:6080/arcgis/rest/services/HFT_DEM/heifangtai_dem/MapServer',
            //     f:'json'
            // });
            
            // this.map.addLayer(dynamicLayer);

            let myIcon = L.icon({
                iconUrl: require('./assets/images/clz.png'),
                shadowUrl: require('./assets/images/shadow.png'),
                iconSize: [18, 25],
                iconAnchor: [7, 25],
                popupAnchor: [1, -20],
                shadowSize: [25, 25]
            });

            var markerLayer = new L.LayerGroup();
            let layer = L.geoJson(this.monitorJCZData, {
                pointToLayer: function (feature, latlng) {
                    var name = feature.properties.name;
                    var number = feature.properties.number;
                    var marker = L.marker(L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]), {icon: myIcon,title:name});
                    var content =   '<div class="popuCustomerPanel">'+
                                        '<div class="popuCustomerPanelTitle">'+name+'</div>'+
                                        '<div class="popuCustomerPanelContent" id="marker' + number + '"></div>'+
                                    '</div>';
                    marker.bindPopup(content, {});
                    marker.on('click', function(e) {
                      that.markerPopuFun(feature);
                    })
                    markerLayer.addLayer(marker);
                }
            });
            this.map.addLayer(markerLayer);

            // L.tileLayer("http://localhost:6080/arcgis/rest/services/HFT_DOM/heifangtai_dom/MapServer/tile/{z}/{y}/{x}", {
            //         maxZoom: 19,
            //         id: "mapbox.streets"
            // }).addTo(this.map);


            // this.map.on("click", (event) => {
            //     debugger;


            //     var southWest = L.latLng(45.51, -122.70);
            //     var northEast = L.latLng(45.52, -122.64);
            //     var bounds = L.latLngBounds(southWest, northEast);
            //     var query = esri.query({
            //         url:'http://localhost:6080/arcgis/rest/services/HFT_INSAR/hftinsar/MapServer/0'
            //     });
            //     query.within(bounds); //within,还有其他的within\contains\intersects\bboxIntersects\overlap\nearby
            //     query.run(function(error, featureCollection, response){
            //         console.log('Found ' + featureCollection.features.length + ' features');
            //     })
            // });


            
            
            
            

        },

        onClick(e){
            this.points.push([e.latlng.lat,e.latlng.lng])
            this.lines.addLatLng(e.latlng)

            this.linesLayer.addLayer(this.lines);
            this.tempLinesLayer.addLayer(this.tempLines);

            this.map.addLayer(this.tempLinesLayer);
            this.map.addLayer(this.linesLayer);

            this.pointsLayer.addLayer(L.circle(e.latlng,{radius:5,color:'#ff0000',fillColor:'ff0000',fillOpacity:1}));
            this.map.addLayer(this.pointsLayer);

            if(this.points.length===3){
                this.map.off('mousemove')
                this.map.off('click');    //点击地图
            }
        },

        onMove(e){
           if(this.points.length>0) {
                let ls =[this.points[this.points.length-1],[e.latlng.lat,e.latlng.lng]]
                this.tempLines.setLatLngs(ls)
                this.map.addLayer(this.tempLines)
            }
        },

        markerPopuFun(feature){
            let that = this;
            let number = feature.properties.number;
            let calc = feature.properties.calc;
            let calcObj = feature.properties.calcObj;
            let queryType = feature.properties.queryType;
            let calcSL = feature.properties.calcSL;
            let nowTime = new Date();
            let startTimeStr = (nowTime.getFullYear()-1) + "-" + (nowTime.getMonth() + 1) + "-" + nowTime.getDate();
            let endTimeStr = nowTime.getFullYear() + "-" + (nowTime.getMonth() + 1) + "-" + nowTime.getDate();
            
            let xAxisArray = [];
            let seriesArray = [];
            let seriesArraySL = [];

            if(queryType==="MonitorYLSJDataQuery"){
                this.$$MonitorYLSJDataQuery({
                    data: {
                        startTimeStr: startTimeStr,
                        endTimeStr: endTimeStr,
                        code: number
                    },
                    fn: data => {
                        if (data) {
                            for(let i=0;i<data.length;i++){
                                let timeStr = dateUtils.dateToStr("yyyy-MM-dd", new Date(data[i]["测量日期"].replace("T"," ")));
                                let value = data[i]["测量值"];
                                let temp = data[i]["测量值"];
                                xAxisArray.push(timeStr);
                                seriesArray.push(value.toFixed(3));
                            }  
                            that.setChartData(feature,xAxisArray,seriesArray);
                        }
                    },
                    errFun: err => {
                        that.setChartData(feature,xAxisArray,seriesArray);
                    }
                });
            }else{
                this.$$MonitorCLSJDataQuery({
                    data: {
                        startTimeStr: startTimeStr,
                        endTimeStr: endTimeStr,
                        code: number
                    },
                    fn: data => {
                        if (data) {
                            for(let i=0;i<data.length;i++){
                                let timeStr = dateUtils.dateToStr("yyyy-MM-dd", new Date(data[i]["测量日期"].replace("T"," ")));
                                let value = data[i]["测量值"];
                                let temp = data[i]["测量值"];
                                if(i>0){
                                    let valueSL = (data[i]["测量值"]-data[i-1]["测量值"])*365;
                                    seriesArraySL.push(valueSL.toFixed(3));
                                }else{
                                    seriesArraySL.push("-");
                                }
                                if(calc){
                                    switch(calcObj.type){
                                        case "dxsw":
                                            value = calcObj.height - (temp - calcObj.initValue)*0.1;
                                        break;
                                        case "cxy":
                                            value = 2*calcObj.height*Math.sin(((temp - calcObj.initValue)/2)*Math.PI/180)*Math.cos(((temp + calcObj.initValue)/2)*Math.PI/180);
                                        break;
                                    }
                                }
                                xAxisArray.push(timeStr);
                                seriesArray.push(value.toFixed(3));
                            }
                            if(!calcSL){
                                that.setChartData(feature,xAxisArray,seriesArray);
                            }else{
                                that.setChartSLData(feature,xAxisArray,seriesArray,seriesArraySL);
                            }
                            
                        }
                    },
                    errFun: err => {
                        that.setChartData(feature,xAxisArray,seriesArray);
                    }
                });
            }
        },

        setChartData(feature,xAxisArray,seriesArray){
            // 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('marker' + feature.properties.number));
            // 指定图表的配置项和数据
            let option = {
                tooltip: {
                  trigger: 'axis',
                  axisPointer: {
                    type: 'cross'
                  }
                },
                grid: {
                    left: '3%',
                    right: '3%',
                    bottom: '3%',
                    top:'12%',
                    containLabel: true
                },
                xAxis: [{
                  type: 'category',
                  data: xAxisArray,
                  axisLabel: {
                        show: true,
                        textStyle: {
                          fontSize : 10      //更改坐标轴文字大小
                        }
                  }
                }],
                yAxis: {
                    type: 'value',
                    name: '单位('+feature.properties.unit+')',
                    nameTextStyle:{
                        padding:[0, 0, -8, 0],
                        fontSize:10,
                        color:"rgb(49, 126, 236)"
                    },
                    axisLabel: {
                        show: true,
                        textStyle: {
                          fontSize : 10      //更改坐标轴文字大小
                        }
                    },
                    axisTick: {
                        inside: true
                    },
                    scale: true
                },
                series: [{
                    name: '测量值',
                    type: 'line',
                    yAxisIndex: 0,
                    data: seriesArray,
                    itemStyle:{
                        normal:{
                            color:'#fc8a0f', //折点颜色
                            lineStyle:{
                                color:'rgb(49, 126, 236)' //折线颜色
                            }
                        }
                   }
                }]
            };
            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
        },

        setChartSLData(feature,xAxisArray,seriesArray,seriesArraySL){
            // 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('marker' + feature.properties.number));
            // 指定图表的配置项和数据
            let option = {
                color: ['#5793f3', '#d14a61'],
                tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                  formatter: function(params) {
                        let str = '';
                        params.forEach((item, idx) => {
                            str += `${item.marker}${item.seriesName}: ${item.data}`
                            switch (idx){
                                case 0:
                                    str += '';
                                    break;
                                case 1:
                                    str += ' /年';
                                    break;
                            }
                            str += idx === params.length -1? '': '<br/>'
                        })
                        return str
                    }
                },
                grid: {
                    left: '3%',
                    right: '3%',
                    bottom: '3%',
                    top:'17%',
                    containLabel: true
                },
                xAxis: [{
                  type: 'category',
                  data: xAxisArray,
                  axisLabel: {
                        show: true,
                        textStyle: {
                          fontSize : 10      //更改坐标轴文字大小
                        }
                  }
                }],
                yAxis: [{
                        type: 'value',
                        name: '测量值',
                        position: 'left',
                        axisLine: {
                            lineStyle: {
                                color: "#5793f3"
                            }
                        },
                        axisLabel: {
                            formatter: '{value} '
                        },
                        splitLine: {
                            show: false
                        }
                    },
                    {
                        type: 'value',
                        name: '变化速率',
                        position: 'right',
                        axisLine: {
                            lineStyle: {
                                color: "#d14a61"
                            }
                        },
                        axisLabel: {
                            formatter: '{value}'
                        },
                        splitLine: {
                            show: false
                        }
                }],
                series: [{
                    name: '测量值',
                    type: 'line',
                    yAxisIndex: 0,
                    data: seriesArray
                },{
                    name: '变化速率',
                    type: 'line',
                    yAxisIndex: 1,
                    data: seriesArraySL
                }]
            };
            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
        },

        setInSarChartData(xArray,yArray_WYBX,yArray_WYBXSL,id){
            // 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('popu_' + id));
            // 指定图表的配置项和数据
            let option = {
                color: ['#5793f3', '#d14a61'],

                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    },
                    formatter: function(params) {
                        let str = '';
                        params.forEach((item, idx) => {
                            str += `${item.marker}${item.seriesName}: ${item.data}`
                            switch (idx){
                                case 0:
                                    str += ' mm';
                                    break;
                                case 1:
                                    str += ' mm/年';
                                    break;
                            }
                            str += idx === params.length -1? '': '<br/>'
                        })
                        return str
                    }
                },
                grid: {
                    left: '3%',
                    right: '3%',
                    bottom: '2%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        dataView: {show: false, readOnly: false},
                        restore: {show: false},
                        saveAsImage: {show: false}
                    }
                },
                legend: {
                    data:['位移变形','位移变化速率'],
                    formatter: function (name) {
                        switch(name){
                            case "位移变形":
                                return name+"(单位:mm)";
                            break;
                            case "位移变化速率":
                                return name+"(单位:mm/年)";
                            break;
                        }
                        
                    }
                },
                xAxis: [
                    {
                        type: 'category',
                        axisTick: {
                            alignWithLabel: true
                        },
                        data: xArray
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        name: '位移变形',
                        position: 'left',
                        axisLine: {
                            lineStyle: {
                                color: "#5793f3"
                            }
                        },
                        axisLabel: {
                            formatter: '{value} '
                        },
                        splitLine: {
                            show: false
                        }
                    },
                    {
                        type: 'value',
                        name: '位移变形速率',
                        position: 'right',
                        axisLine: {
                            lineStyle: {
                                color: "#d14a61"
                            }
                        },
                        axisLabel: {
                            formatter: '{value}'
                        },
                        splitLine: {
                            show: false
                        }
                    }
                ],
                series: [
                   
                    {
                        name:'位移变形',
                        type:'line',
                        data:yArray_WYBX
                    },
                    {
                        name:'位移变化速率',
                        type:'line',
                        yAxisIndex: 1,
                        data:yArray_WYBXSL
                    }
                ]
            };
            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
        },

        _drawBorderLayer(type){
            if (this.map&&type!=="hft") {
                let borderJsonData = null;
                if(this.borderLayer&&type){
                    this.borderLayer.clearLayers();
                    borderJsonData = this[type+"JsonData"].features;

                    L.geoJSON(borderJsonData, {
                        style: function (feature) {
                            return {
                                color: '#BCAE18',
                                fillOpacity: 0,
                                weight: 5
                            };
                        }
                    }).addTo(this.borderLayer);

                    L.geoJSON(borderJsonData, {
                        style: function (feature) {
                            return {
                                color: '#1D9004',
                                fillOpacity: 0,
                                weight: 1
                            };
                        }
                    }).addTo(this.borderLayer);
                }
                
            }
        },
           

        /*
        * 返回数据库中的查询字段
        */
        getInfoOfUTFtime(utTime, type = 'hour'){
            let time = null;
            if(utTime){
                let utStr = utTime.replace(/T/g, ' ');
                let utDate = dateUtils.strToDate(utStr);
                if(type === 'hour'){
                    time = dateUtils.dateToStr('MM月dd日 HH时',utDate);
                }else{
                    time = dateUtils.dateToStr('yyyy-MM-dd',utDate);
                }
            }
            return time;
        },    

        addRectangle(){
            let that = this;

            that.destory();
            var bounds = [];
            bounds.push(that.rectangleMeasure.startPoint);
            bounds.push(that.rectangleMeasure.endPoint);
            that.rectangleMeasure.rectangle = L.rectangle(bounds, {color: that.rectangleMeasure.color, weight: 1});
            that.rectangleMeasure.rectangle.addTo(that.rectangleMeasure.layer);        
            
            //that.addTips(area.toFixed(3));
            that.rectangleMeasure.layer.addTo(that.map);
        },
        mousedown(e){
            let that = this;
            that.rectangleMeasure.rectangle = null;
            that.map.dragging.disable();
            that.rectangleMeasure.startPoint = e.latlng;
            that.map.on('mousemove',that.mousemove)
        },
        mousemove(e){
            let that = this;

            that.rectangleMeasure.endPoint = e.latlng;
            that.addRectangle();
            that.map.off('mousedown');
            that.map.on('mouseup', that.mouseup);
        },
        mouseup(e){    
            let that = this;

            that.map.dragging.enable();
            that.map.off('mousemove');
            that.map.off('mouseup')
            that.map.off('mousedown');

            that.destory();

            var southWest = L.latLng(that.rectangleMeasure.startPoint.lat, that.rectangleMeasure.startPoint.lng);
            var northEast = L.latLng(that.rectangleMeasure.endPoint.lat, that.rectangleMeasure.endPoint.lng);
            var bounds = L.latLngBounds(southWest, northEast);
            
            if(that.nodeData){
                var query = esri.query({
                    url:that.nodeData.queryLayer
                });
                query.within(bounds); //within,还有其他的within\contains\intersects\bboxIntersects\overlap\nearby
                query.run(function(error, featureCollection, response){
                    if(featureCollection&&featureCollection.features){
                        if(featureCollection.features.length===0){
                            that.$message({
                              showClose: true,
                              message: '未选中InSar点',
                              type: 'warning',
                              duration:1000
                            });
                        }else if(featureCollection.features.length===1){
                            let timeArray = [];
                            let valueArray_WYBX = [];
                            let valueArray_WYBXSL = [];
                            let properties = featureCollection.features[0]["properties"];
                            for (var item in properties){
                                if(item.startsWith("D_")){
                                    let timeStr = item.replace("D_","");
                                    let pattern = /(\d{4})(\d{2})(\d{2})/;
                                    let formatedDate = timeStr.replace(pattern, '$1-$2-$3');
                                    let value = properties[item];
                                    timeArray.push(formatedDate);
                                    valueArray_WYBX.push(value);
                                }
                            }

                            if(valueArray_WYBX.length>0){
                                valueArray_WYBXSL.push("-");
                                for (let i = 1; i <valueArray_WYBX.length ; i++) {
                                    let bxValue = valueArray_WYBX[i]-valueArray_WYBX[i-1];
                                    let days = that.datedifference(timeArray[i],timeArray[i-1]);
                                    let resultValue = 0;
                                    if(days!=0){
                                        resultValue = (bxValue*1.0/days)*365;
                                    }
                                    valueArray_WYBXSL.push(resultValue.toFixed(4));
                                }

                            }
                            let id = featureCollection.features[0]["id"];
                            let content =   '<div class="insarPopuCustomerPanel">'+
                                                '<div class="insarPopuCustomerPanelTitle">'+id+'号InSar点位移变形信息</div>'+
                                                '<div class="insarPopuCustomerPanelContent" id="popu_'+id+'"></div>'+
                                            '</div>';
                            let popup = L.popup().setLatLng([featureCollection.features[0]["geometry"]["coordinates"][1],featureCollection.features[0]["geometry"]["coordinates"][0]]).setContent(content).openOn(that.map);
                            that.setInSarChartData(timeArray,valueArray_WYBX,valueArray_WYBXSL,id);
                            that.map.off('mousedown');
                            that.map.off('mouseup');
                        }else if(featureCollection.features.length>1){
                            that.$message({
                              showClose: true,
                              message: '只能选1个InSar点',
                              type: 'warning',
                              duration:1000
                            });
                        }
                    }
                })   
            }
        },
        destory(){
            let that = this;
            if(that.rectangleMeasure.rectangle){
                // that.rectangleMeasure.layer.removeLayer(that.rectangleMeasure.rectangle);
                that.rectangleMeasure.layer.clearLayers();
            }
        },

        datedifference(sDate1, sDate2) {    //sDate1和sDate2是2006-12-18格式 
            var dateSpan,
                tempDate,
                iDays;
            sDate1 = Date.parse(sDate1);
            sDate2 = Date.parse(sDate2);
            dateSpan = sDate2 - sDate1;
            dateSpan = Math.abs(dateSpan);
            iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
            return iDays
        }
      
    },

    activated: function () {   
        this.onResize();
    },

    deactivated: function () {
            
    },

    beforeRouteLeave: function (to, from, next) {
        next(true);
    }
}


import _ from 'lodash'
//utils
import FileSaver from 'file-saver';
import {dateUtils} from "utils/dateUtils";
import lib__ from 'underscore';

export let utils = {
    deepCopy: function (obj) {
        // return JSON.parse(JSON.stringify(obj))
        if (typeof obj === "object") {
            if (_.isArray(obj)) {
                let newArr = [];
                for (let i = 0; i < obj.length; i++) newArr.push(obj[i]);
                return newArr;
            } else {
                let newObj = {};
                for (let key in obj) {
                    newObj[key] = this.deepCopy(obj[key]);
                }
                return newObj;
            }
        } else {
            return obj;
        }
    },
    //配合数组自带的sort进行按照数组中对象的属性进行自定义排序，支持多个属性排序
    sortByProps: function (item1, item2) {
        var props = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            props[_i - 2] = arguments[_i];
        }

        var cps = []; // 存储排序属性比较结果。
        // 如果未指定排序属性，则按照全属性升序排序。
        var asc = true;
        if (props.length < 1) {
            for (var p in item1) {
                if (item1[p] > item2[p]) {
                    cps.push(1);
                    break; // 大于时跳出循环。
                } else if (item1[p] === item2[p]) {
                    cps.push(0);
                } else {
                    cps.push(-1);
                    break; // 小于时跳出循环。
                }
            }
        } else {
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                for (var o in prop) {
                    asc = prop[o] === "asc";
                    if (item1[o] > item2[o]) {
                        cps.push(asc ? 1 : -1);
                        break; // 大于时跳出循环。
                    } else if (item1[o] === item2[o]) {
                        cps.push(0);
                    } else {
                        cps.push(asc ? -1 : 1);
                        break; // 小于时跳出循环。
                    }
                }
            }
        }

        for (var j = 0; j < cps.length; j++) {
            if (cps[j] === 1 || cps[j] === -1) {
                return cps[j];
            }
        }
        return 0;
    },

    addSubToLabel: function (label) {
        let pol = label.toUpperCase();
        let flg = false;
        if (pol.indexOf("NO2") !== -1) {
            flg = true;
            pol = pol.replace(/NO2/g, "NO<sub>2</sub>");
        }
        if (pol.indexOf("SO2") !== -1) {
            flg = true;
            pol = pol.replace(/SO2/g, "SO<sub>2</sub>");
        }
        if (pol.indexOf("O3") !== -1) {
            flg = true;
            pol = pol.replace("O3", "O<sub>3</sub>");
        }
        if (pol.indexOf("PM2.5") !== -1) {
            flg = true;
            pol = pol.replace("PM2.5", "PM<sub>2.5</sub>");
        }
        if (pol.indexOf("PM25") !== -1) {
            flg = true;
            pol = pol.replace("PM25", "PM<sub>2.5</sub>");
        }
        if (pol.indexOf("PM10") !== -1) {
            flg = true;
            pol = pol.replace("PM10", "PM<sub>10</sub>");
        }
        if (pol.indexOf("CO") !== -1) {
            flg = true;
        }
        if (flg)
            return pol;
        else
            return label;
    },

    /*墨卡托转经纬度*/
    mercatorToLatLon: function (Point) {

        let templat = Point.y / (6378137 * Math.PI) * 180;
        return {
            lng: Point.x / (6378137 * Math.PI) * 180,
            lat: 180 / Math.PI * (2 * Math.atan(Math.exp(templat * Math.PI / 180)) - Math.PI / 2)
        };
    },

    /*经纬度转墨卡托*/
    latLonToMercator: function (latlon) {

        return [
            latlon[0] * 6378137 * Math.PI / 180,
            Math.log(Math.tan((90 + latlon[1]) * Math.PI / 360)) * 6378137
        ];
    },

    /**
     *  导出表格
     * 参数dataOption  Object类型
     * 属性：
     *    ws_val:[] 表格数据，Array
     *  ws_name:'' 表格名字，String
     *  ws_type:'' 表格格式，String   "xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm"
     *    ws_merge:[] 合并单元格的数组 Array
     *    cellStyle:{} 单元格样式 Object
     *  cellfilter:function (cell,C,R)自定义单元格函数 对单元格进行过滤 返回cell表示当前单元格信息 ，C表示当前单元格所在的列的索引，R表示行的索引
     * @private
     */
    toExcel: function (dataOption) {
        let cell_s = {
            alignment: {
                horizontal: 'center',
                vertical: 'center'
            },
            font: {
                name: '微软雅黑',
                sz: 12,
                color: {
                    rgb: "222222"
                }

            },
            fill: {
                fgColor: {
                    rgb: "f6f6f6"
                }
            },
            border: {
                right: {
                    style: 'thin',
                    color: {
                        rgb: '222222'
                    }
                },
                bottom: {
                    style: 'thin',
                    color: {
                        rgb: '222222'
                    }
                },
                left: {
                    style: 'thin',
                    color: {
                        rgb: '222222'
                    }
                },
                top: {
                    style: 'thin',
                    color: {
                        rgb: '222222'
                    }
                }
            }

        };
        let defaultOption = {
            ws_val: [],//表格数据
            ws_name: "表格",//初始化表名
            ws_type: "xlsx",//初始化格式"xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm"
            ws_merge: [],//初始化合并的数组
            cellStyle: cell_s,//表格初始化样式
            dateFormat: "YYYY-MM-DD",
            cellfilter: (cell, C, R) => {
                return cell
            }


        };

        function Workbook() {
            if (!(this instanceof Workbook)) return new Workbook();
            this.SheetNames = [];
            this.Sheets = {};
        };

        function datenum(v, date1904) {
            if (date1904) v += 1462;
            var epoch = Date.parse(v);
            return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
        }

        function s2ab(s) {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        };
        /* convert state to workbook */
        let data = [];
        let objs = {};

        for (let x in defaultOption) {
            if (dataOption && dataOption[x]) {
                objs[x] = dataOption[x];
            } else {
                objs[x] = defaultOption[x];
            }
        }

        data = objs['ws_val'];
        const ws = sheet_from_array_of_arrays(data, objs);
        const wb = new Workbook();
        ws['!merges'] = objs['ws_merge'];


        let wsTitle = objs['ws_name'] + "." + objs['ws_type'];
        var ws_name = objs['ws_name'];
        wb.SheetNames.push(ws_name);
        wb.Sheets[ws_name] = ws;
        /* generate XLSX file */
        const wbout = XLSX.write(wb, {
            type: "binary",
            bookType: objs['ws_type']

        });
        /* send to client */
        FileSaver.saveAs(new Blob([s2ab(wbout)], {
            type: "application/octet-stream"
        }), wsTitle);

        function sheet_from_array_of_arrays(data, opts) {

            var ws = {};
            ws['!cols'] = [];
            var range = {
                s: {
                    c: 10000000,
                    r: 10000000
                },
                e: {
                    c: 0,
                    r: 0
                }
            };
            for (var R = 0; R != data.length; ++R) {
                for (var C = 0; C != data[R].length; ++C) {
                    if (range.s.r > R) range.s.r = R;
                    if (range.s.c > C) range.s.c = C;
                    if (range.e.r < R) range.e.r = R;
                    if (range.e.c < C) range.e.c = C;
                    var cell = {
                        v: data[R][C]
                    };

                    if (cell.v == null) continue;
                    var cell_ref = XLSX.utils.encode_cell({
                        c: C,
                        r: R
                    });

                    if (typeof cell.v === 'number') cell.t = 'n';
                    else if (typeof cell.v === 'boolean') cell.t = 'b';
                    else if (cell.v instanceof Date) {
                        cell.t = 's';

                        cell.v = dateUtils.dateToStr(opts.dateFormat, cell.v);

                        ws['!cols'][C] = {
                            wpx: 150
                        }
                    } else {


                        cell.t = 's';
                        ws['!cols'][C]={wpx:100};
//							if(cell.v.length){
//								let w=cell.v.length*8;
//								if(ws['!cols'][C]!==undefined&&ws['!cols'][C]['wpx']){
//									if(ws['!cols'][C]['wpx']<w){	
//										ws['!cols'][C]={wpx:w};
//									}
//								}else{
//									if(w<100) w=70;	
//									ws['!cols'][C]={wpx:w};
//								}
//								
//							}

                    }


                    if (opts.cellStyle) {
                        cell.s = opts.cellStyle;
                    } else {
                        cell.s = defaultOption['cellStyle'];
                    }
                    if (opts.cellfilter) {
                        cell = opts.cellfilter(_.cloneDeep(cell), C, R);

                    }

                    ws[cell_ref] = cell;


                }
            }
            if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
            return ws;
        }
    }
};
# EMFSys介绍
* Environmental Monitoring and Forecast System(环境监测与预报系统)

# 开发者
* 3Clear R&D Center LanZhou

## 架构模式特点：
* 易于协作开发
* 方便拓展与维护
* 结构清晰明了
* 灵活，可自定义配置

## Install
```bush
// install dependencies
npm install
```
## Run
### Development
```bush
npm run dev
```
### Production(Build)
```bush
npm run build
```
## 文件结构
```shell
.
├── build  项目构建配置
├── config 运行环境配置
├── static 静态资源文件夹(不会被打包)
└── src
    ├── 3ClearLz 我们自己封装的组件或类库
    ├── libs  第三方类库或工具方法
    ├── apis  接口文件
    ├── assets 静态资源文件(img、css)
    ├── router  路由配置
    ├── store  状态管理
    ├── components 业务组件
    ├── config  系统总配置文件夹
    ├── layout  系统布局视图
    ├── register 第三方库注册或公用方法添加
    └── utils 工具库
```

## 涵盖技术包含

#### 技术点：
* [Vue](http://cn.vuejs.org/) 当下最流行的前端JavaScript框架
* [VueRouter](https://router.vuejs.org/zh-cn/) 基于Vue的路由插件
* [Vuex](https://vuex.vuejs.org/zh-cn/) 管理Vue中多组件共享状态的插件，类似react的redux
* [Axios](https://github.com/mzabriskie/axios) 当前最流行的一个http库
* [ElementUI](https://github.com/ElemeFE/element) 饿了么团队开发的基于Vue的一套UI组件库
* [Leaflet](http://leafletjs.com/) a JavaScript library for interactive maps
* [ECharts](http://echarts.baidu.com/) ECharts，一个纯 Javascript 的图表库
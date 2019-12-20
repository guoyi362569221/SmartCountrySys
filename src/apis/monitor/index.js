const MONITOR_API_PATH = '/api/Monitor/';
const FZS_API_PATH = '/api/FZS/';
export default [
  {
    name: '测量数据',
    method: 'MonitorCLSJDataQuery',
    path: MONITOR_API_PATH + 'MonitorCLSJDataQuery',
    type: 'get'
  },
  {
    name: '雨量计数据',
    method: 'MonitorYLSJDataQuery',
    path: MONITOR_API_PATH + 'MonitorYLSJDataQuery',
    type: 'get'
  },
  {
    name: '雨量计数据',
    method: 'CreatePointLayer',
    path: FZS_API_PATH + 'CreatePointLayer',
    type: 'post'
  },
  {
    name: '雨量计数据',
    method: 'AddPointFeatures',
    path: FZS_API_PATH + 'AddPointFeatures',
    type: 'post'
  },
  {
    name: '雨量计数据',
    method: 'InvokingProcessorA',
    path: FZS_API_PATH + 'InvokingProcessorA',
    type: 'post'
  },
  {
    name: '雨量计数据',
    method: 'InvokingProcessorB',
    path: FZS_API_PATH + 'InvokingProcessorB',
    type: 'post'
  }
];

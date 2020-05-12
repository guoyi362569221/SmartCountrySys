const OAUTH_API_PATH = '/api/OAuth/';
const CITYSTATIONINFO_API_PATH = '/api/CityStationInfo/';
export default [
  {
    name: '获取公钥',
    method: 'getOAuthKeys',
    path: OAUTH_API_PATH + 'GetOAuthKeys',
    type: 'get',
  }, {
    name: '获取token',
    method: 'getToken',
    path: '/token',
    type: 'get',
  }, {
    name: '区域信息查询',
    method: 'ArearInfoQuery',
    path: CITYSTATIONINFO_API_PATH + 'ArearInfoQuery',
    type: 'get',
  }

]

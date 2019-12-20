const OAUTH_API_PATH = '/api/OAuth/';
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
  }

]

import basic from './basic/';
import monitor from './monitor/';
import account from  './account';

export default [{
	module: 'basic',
	name: '基本信息',
	list: basic
}, {
	module: 'monitor',
	name: '监测接口',
	list: monitor
}, {
	module: 'account',
	name: '用户、角色',
	list: account
}];

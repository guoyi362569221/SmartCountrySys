
const ACCOUNT_API_PATH = '/api/Account/';

export default [

	{
		name: '用户登录',
		method: 'login',
		path: ACCOUNT_API_PATH + 'QueryUserInfo',
		type: 'post',
	},

    {
        name: '获取组织信息',
        method: 'getOrgs',
        path: ACCOUNT_API_PATH + 'QueryOrgByCondition',
        type: 'get',
    },
    {
        name: '添加组织',
        method: 'addOrg',
        path: ACCOUNT_API_PATH + 'AddOrg',
        type: 'post',
    },{
        name: '删除组织',
        method: 'deleteOrg',
        path: ACCOUNT_API_PATH + 'DeleteOrg',
        type: 'get',
    },{
        name: '更新组织信息',
        method: 'updateOrg',
        path: ACCOUNT_API_PATH + 'UpdateOrg',
        type: 'post',
    },

	{
		name: '获取角色信息',
		method: 'getRoles',
		path: ACCOUNT_API_PATH + 'QueryRoleByCondition',
		type: 'get',
	},
	{
		name: '添加角色',
		method: 'addRole',
		path: ACCOUNT_API_PATH + 'AddRole',
		type: 'post',
	},{
		name: '删除角色',
		method: 'deleteRole',
		path: ACCOUNT_API_PATH + 'DeleteRole',
		type: 'get',
	},{
		name: '更新角色信息',
		method: 'updateRole',
		path: ACCOUNT_API_PATH + 'UpdateRole',
		type: 'post',
	},
	{
		name: '获取用户列表',
		method: 'getUsers',
		path: ACCOUNT_API_PATH + 'QueryUserByCondition',
		type: 'get',
	},{
		name: '添加用户',
		method: 'addUser',
		path: ACCOUNT_API_PATH + 'AddUser',
		type: 'post',
	},{
		name: '删除用户',
		method: 'deleteUser',
		path: ACCOUNT_API_PATH + 'DeleteUser',
		type: 'get',
	},{
		name: '更用户信息',
		method: 'updateUser',
		path: ACCOUNT_API_PATH + 'UpdateUser',
		type: 'post',
	},{
		name: '修改用户密码',
		method: 'updatePsw',
		path: ACCOUNT_API_PATH + 'UpdateUserPassword',
		type: 'post',
	},{
		name: '通过自定义信息查询用户',
		method: 'QueryUserByCondition',
		path: ACCOUNT_API_PATH + 'QueryUserByCondition',
		type: 'get',
	}


]

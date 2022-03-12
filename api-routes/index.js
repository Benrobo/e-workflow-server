

const API_ROUTE = {
    userAuth: "/api/auth/users/register",
    adminAuth: "/api/auth/admin_auth/register",
    logIn: "/api/auth/users/logIn",
    approveRegRequest: "/api/users/request/registeration",
    rejectRegRequest: "/api/users/request/registeration/reject",
    setPermission: "/api/staff/permission/set",
    changePermission: "/api/staff/permission/edit",
    getAllUsers: "/api/users/all",
    getUsersById: "/api/users/id",
    createToken: "/api/token/generate",
    getTokens: "/api/token/getToken",
    deleteToken: "/api/token/deleteToken",
    sendMail: "/api/user/sendMail",
    getGroupByUserId: "/api/user/groups/all",
    getGroupMembers: "/api/user/groups/members",
    createGroup: "/api/user/groups/create",
    addGroupMembers: "/api/user/groups/addMembers",
    editGroup: "/api/user/groups/edit",
    deleteGroupMembers: "/api/user/groups/deleteMemebers",
    deleteGroup: "/api/user/groups/deleteGroup",
    addDocument: "/api/user/documents/add",
    editDocument: "/api/user/documents/edit",
    deleteDocument: "/api/user/documents/delete",
    getAllDocs: "/api/documents/all",
    getDocsById: "/api/documents/id",
    getDocsGroupId: "/api/documents/groups/id",
}

export default API_ROUTE;
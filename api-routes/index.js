

const API_ROUTE = {
    userAuth: "/api/auth/users/register",
    adminAuth: "/api/auth/admin_auth/register",
    logIn: "/api/auth/users/logIn",
    approveRegRequest: "/api/users/request/registeration",
    rejectRegRequest: "/api/users/request/registeration/reject",
    createCode: "/api/code/generate",
    sendMail: "/api/user/sendMail",
    createGroup: "/api/user/groups/create",
    addGroupMembers: "/api/user/groups/addMembers",
    editGroup: "/api/user/groups/edit",
    deleteGroupMembers: "/api/user/groups/deleteMemebers",
    deleteGroup: "/api/user/groups/deleteGroup",
    addDocument: "/api/user/documents/add",
    editDocument: "/api/user/documents/edit",
    deleteDocument: "/api/user/documents/delete",
}

export default API_ROUTE;
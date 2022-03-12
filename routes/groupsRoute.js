import { router, util } from "../helpers/global.js"
import API_ROUTE from "../api-routes/index.js"
import { checkAuth } from "../middlewares/auth.js"
import Group from "../services/groups.js"

const GROUP = new Group()

export const getGroupsByUserId = router.post(API_ROUTE.getGroupByUserId, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "group fetching require a valid payload but got none" }, 404)
        }

        return GROUP.allGroupsByUserId(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})

export const getGroupMembers = router.post(API_ROUTE.getGroupMembers, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "group members fetching require a valid payload but got none" }, 404)
        }

        return GROUP.getGroupMembers(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})

export const createGroup = router.post(API_ROUTE.createGroup, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "group creation require a valid payload but got none" }, 404)
        }

        return GROUP.create(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})

export const addMembers = router.post(API_ROUTE.addGroupMembers, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "adding of members to a group require a valid payload but got none" }, 404)
        }

        return GROUP.addMembers(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})

export const editGroup = router.put(API_ROUTE.editGroup, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "editing of group data require a valid payload but got none" }, 404)
        }

        return GROUP.editGroup(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})


export const deleteGroupMembers = router.delete(API_ROUTE.deleteGroupMembers, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "group deletion require a valid payload but got none" }, 404)
        }

        return GROUP.deleteMemebers(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})

export const deleteGroup = router.delete(API_ROUTE.deleteGroup, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "group deletion require a valid payload but got none" }, 404)
        }

        return GROUP.deleteGroup(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})
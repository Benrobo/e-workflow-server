import { router, util } from "../helpers/global.js"
import API_ROUTE from "../api-routes/index.js"
import { checkAuth } from "../middlewares/auth.js"
import Permission from "../services/permissions.js"

const PERMISSIONS = new Permission()


export const setPermission = (API_ROUTE.setPermission, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "setting of staffs permissions require a valid payload but got none" }, 404)
        }

        return PERMISSIONS.set(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})
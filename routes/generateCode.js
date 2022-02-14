import { router, util } from "../helpers/global.js"
import createCodes from "../services/createCode.js"
import API_ROUTE from "../api-routes/index.js"


const createCode = router.post(API_ROUTE.createCode, async (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "authentication required a valid payload but got none" }, 404)
        }

        if (data.role !== undefined) {
            if (data.role.toLowerCase() === "student") {
                return util.sendJson(res, { message: "you dont have permissions to generate code" }, 500)
            }
            else if (data.role.toLowerCase() === "staff") {
                return util.sendJson(res, { message: "you dont have permissions to generate code" }, 500)
            }
            else if (data.role.toLowerCase() === "admin") {
                return createCodes(res, data)
            }
            return util.sendJson(res, { message: "you dont have permissions to generate code" }, 500)
        }
        return util.sendJson(res, { message: "generating of code requires a valid user role but got undefined" }, 500)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
});

export default createCode
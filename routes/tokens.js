import { router, util } from "../helpers/global.js"
import { createTokens, getTokens, deleteToken } from "../services/tokens.js"
import API_ROUTE from "../api-routes/index.js"
import { checkAuth } from "../middlewares/auth.js";


export const createToken = router.post(API_ROUTE.createToken, async (req, res) => {
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
                return createTokens(res, data)
            }
            return util.sendJson(res, { message: "you dont have permissions to generate code" }, 500)
        }
        return util.sendJson(res, { message: "generating of code requires a valid user role but got undefined" }, 500)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
});

export const getAllToken = router.post(API_ROUTE.getTokens, checkAuth, async (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "getting of tokens required a valid payload but got none" }, 404)
        }

        return getTokens(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
});

export const deleteSpecificToken = router.delete(API_ROUTE.deleteToken, checkAuth, async (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "token deletion required a valid payload but got none" }, 404)
        }
        return deleteToken(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
});
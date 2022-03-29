import { router, util } from "../helpers/global.js"
import Signature from "../services/signature.js"
import API_ROUTE from "../api-routes/index.js"
import { checkAuth } from "../middlewares/auth.js";


export const addSignature = router.post(API_ROUTE.addSignature, async (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "adding signature required a valid payload but got none" }, 404)
        }

        return Signature.add(res, data)

    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
});

export const deleteSignature = router.delete(API_ROUTE.deleteSignature, checkAuth, async (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "deleting signature required a valid payload but got none" }, 404)
        }

        return Signature.delete(res, data)

    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
});
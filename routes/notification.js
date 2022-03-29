import { router, util } from "../helpers/global.js"
import Notification from "../services/notification.js"
import API_ROUTE from "../api-routes/index.js"
import { checkAuth } from "../middlewares/auth.js";


export const getNotification = router.post(API_ROUTE.getNotifications, async (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "fetching notifications required a valid payload but got none" }, 404)
        }

        return Notification.get(res, data)

    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
});

export const deleteNotification = router.delete(API_ROUTE.deleteNotification, async (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "deleting signature required a valid payload but got none" }, 404)
        }

        return Notification.delete(res, data)

    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
});

export const updateNotification = router.put(API_ROUTE.updateNotification, checkAuth, async (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "marking notification as read required a valid payload but got none" }, 404)
        }

        return Notification.updateSeen(res, data)

    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
});
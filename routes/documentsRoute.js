import { router, util } from "../helpers/global.js"
import API_ROUTE from "../api-routes/index.js"
import { checkAuth } from "../middlewares/auth.js"
import Document from "../services/documents.js"

const DOCUMENT = new Document()

export const addDocument = router.post(API_ROUTE.addDocument, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "submitting of document require a valid payload but got none" }, 404)
        }

        // where FYP -> [Final Year Project]
        // where CF -> [ Course Form ]

        if (data.documentType === "FYP") {
            return DOCUMENT.addFYP(res, data)
        }
        else if (data.documentType === "CF") {
            return DOCUMENT.addCF(res, data)
        }
        else {
            return util.sendJson(res, { message: "failed submitting document: document type is invalid" }, 404)
        }

    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})

export const editDocument = router.post(API_ROUTE.editDocument, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "submitting of document require a valid payload but got none" }, 404)
        }

        return DOCUMENT.edit(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})

export const deleteDocument = router.post(API_ROUTE.deleteDocument, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "submitting of document require a valid payload but got none" }, 404)
        }

        return DOCUMENT.delete(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})

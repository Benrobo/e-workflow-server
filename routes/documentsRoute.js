import { router, util } from "../helpers/global.js"
import API_ROUTE from "../api-routes/index.js"
import { checkAuth } from "../middlewares/auth.js"
import Document from "../services/documents.js"

const DOCUMENT = new Document()

export const getAllDocs = router.get(API_ROUTE.getAllDocs, (req, res) => {
    try {
        return DOCUMENT.allDocs(res)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})


export const getDocsId = router.post(API_ROUTE.getDocsById, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "fetching of document require a valid payload but got none" }, 404)
        }

        return DOCUMENT.docsById(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})

export const getDocsByUserId = router.post(API_ROUTE.getDocsByUserId, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "fetching all document require a valid payload but got none" }, 404)
        }

        return DOCUMENT.docsByUserId(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})


export const addFeedback = router.post(API_ROUTE.addFeedback, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "submitting of document feedback require a valid payload but got none" }, 404)
        }
        return DOCUMENT.addFeedBack(res, data)

    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})

export const getDocFeedback = router.post(API_ROUTE.getDocFeedBack, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "fetching of document feedback require a valid payload but got none" }, 404)
        }

        return DOCUMENT.docFeedback(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})

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

export const approveDocument = router.put(API_ROUTE.approveDocument, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "approving of document require a valid payload but got none" }, 404)
        }
        return DOCUMENT.approveDocument(res, data)

    } catch (err) {
        console.log(err);
        return util.sendJson(res, { message: err.message }, 500)
    }
})

export const rejectDocument = router.put(API_ROUTE.rejectDocument, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "rejecting of document require a valid payload but got none" }, 404)
        }
        return DOCUMENT.rejectDocument(res, data)

    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})


export const editDocument = router.put(API_ROUTE.editDocument, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "editing of document require a valid payload but got none" }, 404)
        }

        if (data.documentType === "FYP") {
            return DOCUMENT.editFYP(res, data)
        }
        else if (data.documentType === "CF") {
            return DOCUMENT.editCF(res, data)
        }
        else {
            return util.sendJson(res, { message: "failed editing document: document type is invalid" }, 404)
        }

    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})

export const deleteDocument = router.delete(API_ROUTE.deleteDocument, checkAuth, (req, res) => {
    try {
        let data = req.body;
        if (!data || data === "" || typeof data === "function" || typeof data === "string" || data === null) {
            return util.sendJson(res, { message: "failed: payload is required" }, 400)
        }
        if (Object.entries(data).length === 0) {
            return util.sendJson(res, { message: "deleting of document require a valid payload but got none" }, 404)
        }

        return DOCUMENT.delete(res, data)
    } catch (err) {
        return util.sendJson(res, { message: err.message }, 500)
    }
})

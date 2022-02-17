import { util, db } from "../helpers/global.js"

/**
 * 
 * @Permissions_State
 * 
 * [ 1 ] -> READ/WRITE : normal staffs ( Course Cordinators)
 * [ 2 ] -> READ/WRITE : staff with higher responsibility ( HODS, School Officer )
 * [ 3 ] -> READ/WRITE/EXECUTE : admins only
 */

export default class Permission {
    set(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "setting of permissions requires a valid {res} object but got none"
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.userId === undefined || payload.staffId === undefined || payload.permissionLevel === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [userid,staffId, permissionLevel] but got undefined" }, 400)
            }

            if (payload.userId === "") {
                return util.sendJson(res, { error: true, message: "assigning document submission permissions requires a valid userid but got none" }, 400)
            }

            if (payload.permissionLevel === "") {
                return util.sendJson(res, { error: true, message: "assigning document submission permissions requires a valid permissionLevel but got none" }, 400)
            }

            if (payload.staffId === "") {
                return util.sendJson(res, { error: true, message: "assigning document submission permissions requires a valid staffId but got none" }, 400)
            }

            // validate permissionLevel
            if (typeof payload.permissionLevel === "string") {
                return util.sendJson(res, { error: true, message: "expected permission level to be an integer but got string" }, 403)
            }
            if (typeof payload.permissionLevel === "number" && payload.permissionLevel < 1) {
                return util.sendJson(res, { error: true, message: "permission level cant be less than 1 or 0" }, 403)
            }
            if (typeof payload.permissionLevel === "number" && payload.permissionLevel > 3) {
                return util.sendJson(res, { error: true, message: "permission level cant be greater than 3" }, 403)
            }

            try {
                // check if userid exist in db
                const q1 = `SELECT * FROM users WHERE "userId"=$1`
                db.query(q1, [payload.userId], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount === 0) {
                        return util.sendJson(res, { error: true, message: "fail to set document permissions: user [id] doesnt exist" }, 404)
                    }

                    // check if user assigning permission is an admin else block if not
                    if (result.rows[0].userRole !== "admin") {
                        return util.sendJson(res, { error: true, message: "only ADMIN can set/assign document permissions" }, 403)
                    }

                    // check if user type === staff and not student
                    if (result.rows[0].type === "student") {
                        return util.sendJson(res, { error: true, message: "only STAFF can be given documents permissions not student" }, 403)
                    }

                    const { staffId, permissionLevel } = payload;

                    const sql1 = `UPDATE users SET "documentPermissions"=$1 WHERE "userId"=$2`
                    db.query(sql1, [permissionLevel, staffId], (err) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        return util.sendJson(res, { error: false, message: "documentPermissions has been set succesfully" }, 200)
                    })
                })
            } catch (err) {
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }
    }
}
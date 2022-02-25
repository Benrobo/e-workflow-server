import { util, db } from "../helpers/global.js"

export class Users {
    all(res) {
        if (res === "" || res === undefined || res === null) {
            return "getting of users requires a valid {res} object but got none"
        }

        try {
            const sql = `SELECT * FROM users`
            db.query(sql, (err, result) => {
                if (err) {
                    return util.sendJson(res, { error: true, message: err.message }, 400)
                }
                return util.sendJson(res, { error: false, data: result.rows }, 200)
            })
        } catch (err) {
            console.log(err);
            return util.sendJson(res, { error: true, message: err.message }, 500)
        }
    }

    byId(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "getting of users requires a valid {res} object but got none"
        }

        if (payload.userId === undefined) {
            return util.sendJson(res, { error: true, message: "failed to get users with id undefined" }, 400)
        }

        if (payload.userId === "") {
            return util.sendJson(res, { error: true, message: "failed to get users: id is empty" }, 400)
        }

        try {
            const sql = `SELECT * FROM users WHERE "userId"=$1`
            db.query(sql, [payload.userId], (err, result) => {
                if (err) {
                    return util.sendJson(res, { error: true, message: err.message }, 400)
                }
                return util.sendJson(res, { error: false, data: result.rows }, 200)
            })
        } catch (err) {
            console.log(err);
            return util.sendJson(res, { error: true, message: err.message }, 500)
        }
    }
}
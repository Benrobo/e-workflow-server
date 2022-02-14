import { db, util } from "../helpers/global.js";


export default function createCodes(res, data) {
    if (res === "" || res === undefined || res === null) {
        return "adding of case requires a valid {res} object but got none"
    }

    if (data && Object.entries(data).length > 0) {
        if (data.userId === undefined || data.token === undefined) {
            return util.sendJson(res, { error: true, message: "data requires a valid fields [userid,token] but got undefined" }, 400)
        }

        if (data.userId === "") {
            return util.sendJson(res, { error: true, message: "code generation requires a valid userid but got none" }, 400)
        }
        if (data.token === "") {
            return util.sendJson(res, { error: true, message: "code generation requires a valid token but got none" }, 400)
        }

        try {
            // check if officer id and userid exist in db
            const q1 = `SELECT * FROM users WHERE "userId"=$1`
            db.query(q1, [data.userId], (err, result) => {
                if (err) {
                    return util.sendJson(res, { error: true, message: err.message }, 400)
                }

                if (result.rowCount === 0) {
                    return util.sendJson(res, { error: true, message: "fail to generate code: user [id] doesnt exist" }, 404)
                }

                const { userId, token } = data;


                // check if token exist in db
                const sql1 = `SELECT * FROM codes WHERE token=$1 AND "userId"=$2`
                db.query(sql1, [token, userId], (err, dataReturned) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (dataReturned.rowCount > 0) {
                        return util.sendJson(res, { error: true, message: "fail to generate code: code already exist", code: dataReturned.rows[0].token }, 400)
                    }

                    const date = util.formatDate()
                    const sql = `INSERT INTO codes("userId",token,"issued_at") VALUES($1,$2,$3)`;
                    db.query(sql, [userId, token, date], (err) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        return util.sendJson(res, { error: false, message: "code generated succesfully" }, 200)
                    })
                })
            })
        } catch (err) {
            return util.sendJson(res, { error: true, message: err.message }, 500)
        }
    }
}

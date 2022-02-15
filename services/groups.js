import { db, util } from "../helpers/global.js"

/**
 * 
 * {
    "studentId": "62447136-30c3-4f72-a36e-0c638d217c0d",
    "usersId": [
        "sdcdscdsc",
        "sdcsdcdsc"
    ],
    "name": "Group Amazon",
    "courseName": "Intro to Operating System",
    "courseType": "Computer Science"
   }
 */

export default class Group {

    create(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "group creation requires a valid {res} object but got none"
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.studentId === undefined || payload.usersId === undefined || payload.name === undefined || payload.courseName === undefined || payload.courseType === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [studentId, usersId,name,courseName,courseType] but got undefined" }, 400)
            }
            if (payload.studentId === "") {
                return util.sendJson(res, { error: true, message: "studentId cant be empty" }, 400)
            }
            if (payload.usersId.length === 0) {
                return util.sendJson(res, { error: true, message: "group users cant be empty" }, 400)
            }
            if (payload.name === "") {
                return util.sendJson(res, { error: true, message: "group name cant be empty" }, 400)
            }
            if (payload.courseName === "") {
                return util.sendJson(res, { error: true, message: "group courseName cant be empty" }, 400)
            }
            if (payload.courseType === "") {
                return util.sendJson(res, { error: true, message: "group courseType cant be empty" }, 400)
            }

            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE mail=$1`
                db.query(sql, [data.email], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount === 0) {
                        return util.sendJson(res, { error: false, message: "user with that email dont exists" }, 404)
                    }

                    // verify password
                    if (util.compareHash(data.password, result.rows[0].hash) === false) {
                        return util.sendJson(res, { error: false, message: "password given is incorrect" }, 403)
                    }

                    // update data
                    const tokenPayload = {
                        id: result.rows[0].userId,
                        type: result.rows[0].userType,
                        role: result.rows[0].userRole,
                        status: result.rows[0].userStatus,
                    }
                    const refreshToken = util.genRefreshToken(tokenPayload)
                    // const accessToken = util.genAccessToken(tokenPayload)
                    const sql2 = `UPDATE users SET "refreshToken"=$1 WHERE mail=$2`
                    db.query(sql2, [refreshToken, data.email], (err) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        tokenPayload["refreshToken"] = refreshToken;

                        return util.sendJson(res, { error: false, message: "user loggedIn succesfully.", data: [tokenPayload] }, 200)
                    })
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: false, message: err.message }, 500)
            }
        }
    }

    edit(res, payload) {

    }

    delete(res, payload) {

    }

}
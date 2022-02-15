import { db, util } from "../helpers/global.js"

/**
 * 
 * {
    "studentId": "ace32d77-4607-47ed-999a-f1ecb4c2f4f2",
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
            if (payload.studentId === undefined || payload.name === undefined || payload.courseName === undefined || payload.courseType === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [studentId,name,courseName,courseType] but got undefined" }, 400)
            }
            if (payload.studentId === "") {
                return util.sendJson(res, { error: true, message: "studentId cant be empty" }, 400)
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
                const sql = `SELECT * FROM users WHERE "userId"=$1`
                db.query(sql, [payload.studentId], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount === 0) {
                        return util.sendJson(res, { error: false, message: "user with that id dont exists: " + payload.studentId }, 404)
                    }

                    // create group info
                    const { name, courseName, courseType, studentId } = payload;
                    const id = util.genId()
                    const date = util.formatDate()

                    let sql2 = `INSERT INTO groups(id, name, "courseType", "courseName","usersId","created_at") VALUES($1,$2,$3,$4,$5,$6)`
                    db.query(sql2, [id, name, courseType, courseName, Array(studentId)])
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
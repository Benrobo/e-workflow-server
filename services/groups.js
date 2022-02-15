import { db, util } from "../helpers/global.js"

/**
 * @DataPayload
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

                    // check if user already exist in a group before creating new group

                    const sql2 = `SELECT * FROM groups WHERE name=$1`
                    db.query(sql2, [payload.name.trim()], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rowCount > 0) {
                            if (data1.rows[0].usersId.includes(payload.studentId)) {
                                return util.sendJson(res, {
                                    error: true, message: `a group you belong to already exist with this name {${data1.rows[0].name}}`, data: {
                                        groupName: data1.rows[0].name,
                                        courseName: data1.rows[0].courseName,
                                        courseType: data1.rows[0].courseType,
                                    }
                                }, 403)
                            }
                        }


                        // create group info
                        const { name, courseName, courseType, studentId } = payload;
                        const id = util.genId()
                        const date = util.formatDate()

                        let sql3 = `INSERT INTO groups(id, name, "courseType", "courseName","usersId","created_at") VALUES($1, $2, $3, $4, $5, $6)`
                        db.query(sql3, [id, name.trim(), courseType.trim(), courseName.trim(), Array(studentId.trim()), date.trim()], (err, data) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            return util.sendJson(res, { error: false, message: "group created successfully" }, 200)
                        })
                    })
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: false, message: err.message }, 500)
            }
        }
    }

    addMembers(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "group creation requires a valid {res} object but got none"
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.membersId === undefined || payload.name === undefined || payload.groupId === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [membersId,name,courseName,courseType] but got undefined" }, 400)
            }
            if (payload.membersId.length === 0) {
                return util.sendJson(res, { error: true, message: "membersId cant be empty" }, 400)
            }
            if (payload.name === "") {
                return util.sendJson(res, { error: true, message: "group name cant be empty" }, 400)
            }

            try {
                let DbAvailableUsers = []
                let groupAvailableMembers = []

                // 1. check if user exists in main database

                const sql1 = `SELECT "userId" FROM users`
                db.query(sql1, (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    result.rows.forEach((list) => {
                        DbAvailableUsers.push(list.userId)
                    })

                    if (!DbAvailableUsers.includes(payload.membersId)) {
                        return util.sendJson(res, { error: false, message: `failed to add members to [${payload.name}]: user not found ` }, 404)
                    }


                    //  check if the user id has a role of either staff or admin
                    // we dont want student to add staff or admin to individual created group

                    const sql2 = `  SELECT * FROM users WHERE "userId"=$1`
                    db.query(sql2, [payload.membersId], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rowCount > 0 && data1.rows[0].type === "admin" || data1.rows[0].type === "staff") {
                            return util.sendJson(res, { error: false, message: `user with the type of {admin} and {staff} cant be added to any group` }, 403)
                        }

                        // 3. check if user exists in that specific group
                        const sql3 = `SELECT * FROM groups WHERE id=$1`
                        db.query(sql3, [payload.groupId], (err, data2) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            if (data2.rowCount === 0) {
                                return util.sendJson(res, { error: false, message: `failed to add members to [${payload.name}]: group not found ` }, 404)
                            }

                            data2.rows[0].usersId.forEach((list) => {
                                groupAvailableMembers.push(list)
                            })

                            if (groupAvailableMembers.includes(payload.membersId) === true) {
                                return util.sendJson(res, { error: false, message: `failed to add members to [${payload.name}]: member already exist ` }, 400)
                            }
                            // create a copy of prev usersIds and new users id
                            let usersIdCopy = data2.rows[0].usersId
                            usersIdCopy = [...usersIdCopy, payload.membersId]

                            // add member to group
                            const sql4 = `UPDATE groups SET "usersId"=$1 WHERE id=$2`
                            db.query(sql4, [usersIdCopy, payload.groupId], (err) => {
                                if (err) {
                                    return util.sendJson(res, { error: true, message: err.message }, 400)
                                }

                                return util.sendJson(res, { error: false, message: `member was added successfully to ${payload.name}` }, 200)
                            })
                        })
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
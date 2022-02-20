import { db, util } from "../helpers/global.js"

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


                    if (result.rowCount > 0 && result.rows[0].type === "admin" || result.rows[0].type === "staff") {
                        return util.sendJson(res, { error: false, message: `user with the type of {admin} and {staff} cant be added to any group` }, 403)
                    }

                    // check if user already exist in a group before creating new group

                    const sql2 = `SELECT * FROM groups WHERE name=$1 AND "userId"=$2`
                    db.query(sql2, [payload.name.trim(), payload.studentId.trim()], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rowCount > 0) {
                            return util.sendJson(res, { error: true, message: `failed to create group: you belong to ${data1.rows[0].name}` }, 403)
                        }

                        // create group info
                        const { name, courseName, courseType, studentId } = payload;
                        const id = util.genId()
                        const date = util.formatDate()

                        let sql3 = `INSERT INTO groups(id, name, "courseType", "courseName","userId","created_at") VALUES($1, $2, $3, $4, $5, $6)`
                        db.query(sql3, [id, name.trim(), courseType.trim(), courseName.trim(), studentId.trim(), date.trim()], (err, data) => {
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
            return "adding of members requires a valid {res} object but got none"
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.memberId === undefined || payload.groupId === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [memberId,courseName,courseType] but got undefined" }, 400)
            }
            if (payload.memberId === "") {
                return util.sendJson(res, { error: true, message: "memberId cant be empty" }, 400)
            }

            try {
                // 1. check if user exists in main database
                const sql1 = `SELECT "userId" FROM users WHERE "userId"=$1`
                db.query(sql1, [payload.memberId], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount === 0) {
                        return util.sendJson(res, { error: false, message: `failed to add members to [${payload.name}]: user not found ` }, 404)
                    }

                    //  check if the user id has a role of either staff or admin
                    // we dont want student to add staff or admin to individual created group

                    const sql2 = `SELECT * FROM users WHERE "userId"=$1`
                    db.query(sql2, [payload.memberId], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rowCount > 0 && data1.rows[0].type === "admin" || data1.rows[0].type === "staff") {
                            return util.sendJson(res, { error: false, message: `user with the type of {admin} and {staff} cant be added to any group` }, 403)
                        }

                        // 3. check if group exists;

                        const sql3 = `SELECT * FROM groups WHERE id=$1`
                        db.query(sql3, [payload.groupId.trim()], (err, data2) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            if (data2.rowCount === 0) {
                                return util.sendJson(res, { error: false, message: `failed to add members: group not found ` }, 404)
                            }

                            // check if member already exist in group

                            const sql4 = `SELECT * FROM groups WHERE "userId"=$1 AND id=$2`
                            db.query(sql4, [payload.memberId.trim(), payload.groupId.trim()], (err, data3) => {
                                if (err) {
                                    return util.sendJson(res, { error: true, message: err.message }, 400)
                                }

                                return res.json({data: data3.rowCount, gid: payload.groupId, mid: payload.memberId})

                                if (data3.rowCount > 0) {
                                    return util.sendJson(res, { error: false, message: `failed to add members to [${data2.rows[0].name}]: member already exist ` }, 400)
                                }

                                // add member to group
                                const { courseName, courseType, memberId } = payload;
                                const id = util.genId()
                                const date = util.formatDate()
                                const groupName = data2.rows[0].name

                                let sql5 = `INSERT INTO groups(id, name, "courseType", "courseName","userId","created_at") VALUES($1, $2, $3, $4, $5, $6)`
                                db.query(sql5, [id, groupName.trim(), courseType.trim(), courseName.trim(), memberId.trim(), date.trim()], (err) => {
                                    if (err) {
                                        return util.sendJson(res, { error: true, message: err.message }, 400)
                                    }

                                    return util.sendJson(res, { error: false, message: `member was added successfully to ${groupName}` }, 200)
                                })
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

    editGroup(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "editing of group requires a valid {res} object but got none"
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.userId === undefined || payload.groupId === undefined || payload.courseName === undefined || payload.courseType === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [userId,courseName,courseType, groupId] but got undefined" }, 400)
            }
            if (payload.userId === "") {
                return util.sendJson(res, { error: true, message: "userId cant be empty" }, 400)
            }
            if (payload.groupId === "") {
                return util.sendJson(res, { error: true, message: "groupId cant be empty" }, 400)
            }
            if (payload.courseName === "") {
                return util.sendJson(res, { error: true, message: "courseName cant be empty" }, 400)
            }
            if (payload.courseType === "") {
                return util.sendJson(res, { error: true, message: "courseType cant be empty" }, 400)
            }
            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE "userId"=$1`
                db.query(sql, [payload.userId], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount === 0) {
                        return util.sendJson(res, { error: false, message: "user with that id dont exists: " + payload.userId }, 404)
                    }

                    // check if user already exist in a group before creating editing group info
                    const sql2 = `SELECT * FROM groups WHERE id=$1`
                    db.query(sql2, [payload.groupId], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rows.length === 0) {
                            return util.sendJson(res, { error: false, message: `fail to edit group, no group found` }, 404)
                        }

                        let membersIds = data1.rows[0].usersId;

                        // check if userid trying to edit group detail is present
                        if (membersIds.includes(payload.userId) === false) {
                            return util.sendJson(res, { error: false, message: `cant edit group you dont belong to` }, 404)
                        }

                        const { name, courseName, courseType, groupId } = payload;

                        const sql3 = `UPDATE groups SET "courseName"=$1, "courseType"=$2, "name"=$3 WHERE id=$4`
                        db.query(sql3, [courseName.trim(), courseType.trim(), name.trim(), groupId.trim()], (err) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            return util.sendJson(res, { error: false, message: "successfully edited group info" }, 200)
                        })

                    })
                })

            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: false, message: err.message }, 500)
            }
        }
    }

    deleteMemebers(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "deleting of group members requires a valid {res} object but got none"
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.userId === undefined || payload.groupId === undefined || payload.memberId === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [userId,memberId, groupId] but got undefined" }, 400)
            }
            if (payload.userId === "") {
                return util.sendJson(res, { error: true, message: "userId cant be empty" }, 400)
            }
            if (payload.groupId === "") {
                return util.sendJson(res, { error: true, message: "groupId cant be empty" }, 400)
            }
            if (payload.memberId === "") {
                return util.sendJson(res, { error: true, message: "memberId cant be empty" }, 400)
            }
            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE "userId"=$1 AND "userId"=$2`
                db.query(sql, [payload.userId, payload.memberId], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount === 0) {
                        return util.sendJson(res, { error: false, message: "user with that id dont exists: " + payload.userId }, 404)
                    }

                    // check if user already exist in a group before creating editing group info
                    const sql2 = `SELECT * FROM groups WHERE id=$1`
                    db.query(sql2, [payload.groupId], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rows.length === 0) {
                            return util.sendJson(res, { error: false, message: `fail to edit group, no group found` }, 404)
                        }

                        let membersIds = data1.rows[0].usersId;

                        // check if userid trying to delete group member detail is present
                        if (membersIds.includes(payload.userId) === false || membersIds.includes(payload.memberId) === false) {
                            return util.sendJson(res, { error: false, message: `cant delete group members: cause member doesnt exists` }, 404)
                        }

                        let restMembers = membersIds.filter((list) => {
                            return list !== payload.memberId
                        })

                        const { groupId } = payload;

                        const sql3 = `UPDATE groups SET "usersId"=$1 WHERE id=$2`
                        db.query(sql3, [restMembers, groupId.trim()], (err) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            return util.sendJson(res, { error: false, message: "successfully deleted group member" }, 200)
                        })

                    })
                })

            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: false, message: err.message }, 500)
            }
        }
    }

    deleteGroup(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "deleting of group requires a valid {res} object but got none"
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.userId === undefined || payload.groupId === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [userId, groupId] but got undefined" }, 400)
            }
            if (payload.userId === "") {
                return util.sendJson(res, { error: true, message: "userId cant be empty" }, 400)
            }
            if (payload.groupId === "") {
                return util.sendJson(res, { error: true, message: "groupId cant be empty" }, 400)
            }
            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE "userId"=$1`
                db.query(sql, [payload.userId], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount === 0) {
                        return util.sendJson(res, { error: false, message: "user with that id dont exists: " + payload.userId }, 404)
                    }

                    // check if user already exist in a group before creating editing group info
                    const sql2 = `SELECT * FROM groups WHERE id=$1`
                    db.query(sql2, [payload.groupId], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rows.length === 0) {
                            return util.sendJson(res, { error: false, message: `fail to delete group, you dont belong to the group id provided` }, 404)
                        }

                        let membersIds = data1.rows[0].usersId;

                        // check if userid trying to delete group member detail is present
                        if (membersIds.includes(payload.userId) === false) {
                            return util.sendJson(res, { error: false, message: `cant delete group members: cause member doesnt exists` }, 404)
                        }

                        const { groupId } = payload;

                        const sql3 = `DELETE FROM groups WHERE id=$1`
                        db.query(sql3, [groupId.trim()], (err) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            return util.sendJson(res, { error: false, message: "successfully deleted group" }, 200)
                        })

                    })
                })

            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: false, message: err.message }, 500)
            }
        }
    }

}
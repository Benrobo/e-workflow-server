import { db, util } from "../helpers/global.js"

export default class Group {

    allGroupsByUserId(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "fetching all groups requires a valid {res} object but got none"
        }

        if (payload.userId === undefined) {
            return util.sendJson(res, { error: true, message: "payload requires a valid fields [userId] but got undefined" }, 400)
        }

        if (payload.userId === "") {
            return util.sendJson(res, { error: true, message: "payload requires a valid userId but got empty" }, 400)
        }

        try {
            const sql = `SELECT * FROM groups WHERE "memberId"=$1`
            db.query(sql, [payload.userId.trim()], (err, result) => {
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

    getGroupMembers(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "fetching all groups member requires a valid {res} object but got none"
        }

        if (payload.userId === undefined || payload.groupId === undefined) {
            return util.sendJson(res, { error: true, message: "payload requires a valid fields [userId, groupId] but got undefined" }, 400)
        }

        if (payload.userId === "") {
            return util.sendJson(res, { error: true, message: "payload requires a valid userId but got empty" }, 400)
        }
        if (payload.groupId === "") {
            return util.sendJson(res, { error: true, message: "payload requires a valid groupId but got empty" }, 400)
        }

        try {
            // check if user exist first
            const q1 = `SELECT * FROM users WHERE "userId"=$1`
            db.query(q1, [payload.userId.trim()], (err, data1) => {
                if (err) {
                    return util.sendJson(res, { error: true, message: err.message }, 400)
                }

                if (data1.rowCount === 0) {
                    return util.sendJson(res, { error: true, message: "failed to get group members, user doesnt exist" }, 404)
                }

                // check  if groups exists
                const q2 = `SELECT * FROM groups WHERE id=$1`
                db.query(q2, [payload.groupId.trim()], (err, data2) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (data2.rowCount === 0) {
                        return util.sendJson(res, { error: true, message: "group doesnt exist" }, 404)
                    }

                    const sql = `
                            SELECT 
                                groups.id,
                                groups."userId",
                                groups."memberId",
                                groups.name,
                                groups."courseName",
                                groups."courseType",
                                users."userName",
                                users.mail
                            FROM
                                groups
                            INNER JOIN
                                users
                            ON
                                users."userId"=groups."memberId"
                            WHERE
                                groups.id=$1
                            `
                    db.query(sql, [payload.groupId.trim()], (err, result) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        return util.sendJson(res, { error: false, data: result.rows }, 200)
                    })
                })
            })

        } catch (err) {
            console.log(err);
            return util.sendJson(res, { error: true, message: err.message }, 500)
        }

    }

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
                db.query(sql, [payload.studentId.trim()], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount === 0) {
                        return util.sendJson(res, { error: false, message: "user with that id dont exists: " + payload.studentId }, 404)
                    }


                    if (result.rowCount > 0 && result.rows[0].type === "admin" || result.rows[0].type === "staff") {
                        return util.sendJson(res, { error: false, message: `user with the type of {admin} and {staff} cant are not allowed to create a group` }, 403)
                    }

                    // check if user already exist in a group before creating new group

                    const sql2 = `SELECT * FROM groups WHERE name=$1 AND "userId"=$2`
                    db.query(sql2, [payload.name.trim(), payload.studentId.trim()], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rowCount > 0) {
                            return util.sendJson(res, { error: true, message: `failed to create group: [${data1.rows[0].name}] already exist` }, 403)
                        }

                        // create group info
                        const { name, courseName, courseType, studentId } = payload;
                        const id = util.genId()
                        const date = util.formatDate()

                        let sql3 = `INSERT INTO groups(id, name, "courseType", "courseName","userId", "memberId","created_at") VALUES($1, $2, $3, $4, $5, $6,$7)`
                        db.query(sql3, [id, name.trim(), courseType.trim(), courseName.trim(), studentId.trim(), studentId.trim(), date.trim()], (err, data) => {
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
            if (payload.memberId === undefined || payload.groupId === undefined || payload.userId === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [memberId,courseName,courseType] but got undefined" }, 400)
            }
            if (payload.memberId === "") {
                return util.sendJson(res, { error: true, message: "memberId cant be empty" }, 400)
            }
            if (payload.groupId === "") {
                return util.sendJson(res, { error: true, message: "groupId cant be empty" }, 400)
            }
            if (payload.userId === "") {
                return util.sendJson(res, { error: true, message: "userId cant be empty" }, 400)
            }

            try {
                // 1. check if user exists in main database
                const sql1 = `SELECT "userId" FROM users WHERE "userId"=$1`
                db.query(sql1, [payload.userId.trim()], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount === 0) {
                        return util.sendJson(res, { error: true, message: `failed to add members to [${payload.name}]: user not found ` }, 404)
                    }

                    // check if member exist in database cause we wanna prevent adding members whichn doesnt exists

                    const sql2 = `SELECT "userId" FROM users WHERE "userId"=$1`
                    db.query(sql2, [payload.memberId.trim()], (err, result) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (result.rowCount === 0) {
                            return util.sendJson(res, { error: true, message: `failed to add member. member doesnt exist.` }, 404)
                        }

                        //  check if the user id has a role of either staff or admin
                        // we dont want student to add staff or admin to individual created group

                        const sql3 = `SELECT * FROM users WHERE "userId"=$1`
                        db.query(sql3, [payload.memberId.trim()], (err, data1) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            if (data1.rowCount > 0 && data1.rows[0].type === "admin" || data1.rows[0].type === "staff") {
                                return util.sendJson(res, { error: true, message: `user with the type of {admin} and {staff} cant be added to any group` }, 403)
                            }

                            // 3. check if group exists;
                            const sql3 = `SELECT * FROM groups WHERE id=$1 AND "userId"=$2`
                            db.query(sql3, [payload.groupId.trim(), payload.userId.trim()], (err, data2) => {
                                if (err) {
                                    return util.sendJson(res, { error: true, message: err.message }, 400)
                                }

                                if (data2.rowCount === 0) {
                                    return util.sendJson(res, { error: true, message: `group not found. create one.` }, 404)
                                }

                                // check if member already exist in group

                                const sql4 = `SELECT * FROM groups WHERE "memberId"=$1 AND id=$2`
                                db.query(sql4, [payload.memberId.trim(), payload.groupId.trim()], (err, data3) => {
                                    if (err) {
                                        return util.sendJson(res, { error: true, message: err.message }, 400)
                                    }
                                    if (data3.rowCount > 0) {
                                        return util.sendJson(res, { error: true, message: `member already exist in that group.` }, 400)
                                    }

                                    // add member to group
                                    const { userId, memberId, groupId } = payload;
                                    const date = util.formatDate()
                                    const groupName = data2.rows[0].name;
                                    const courseName = data2.rows[0].courseName;
                                    const courseType = data2.rows[0].courseType;

                                    let sql5 = `INSERT INTO groups(id, name, "courseName", "courseType","userId","memberId","created_at") VALUES($1, $2, $3, $4,$5,$6,$7)`
                                    db.query(sql5, [groupId.trim(), groupName, courseName, courseType, userId.trim(), memberId.trim(), date.trim()], (err) => {
                                        if (err) {
                                            return util.sendJson(res, { error: true, message: err.message }, 400)
                                        }

                                        return util.sendJson(res, { error: false, message: `member added successfully.` }, 200)
                                    })
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

                    // check if user already exist in a group before editing group info
                    const sql2 = `SELECT * FROM groups WHERE id=$1`
                    db.query(sql2, [payload.groupId.trim()], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rowCount === 0) {
                            return util.sendJson(res, { error: false, message: `fail to edit group, no group found` }, 404)
                        }

                        // check if user belong to that group

                        const sql3 = `SELECT * FROM groups WHERE id=$1 AND "userId"=$2`
                        db.query(sql3, [payload.groupId.trim(), payload.userId.trim()], (err, data2) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            if (data2.rowCount === 0) {
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
                const sql = `SELECT * FROM users WHERE "userId"=$1 OR "userId"=$2`
                db.query(sql, [payload.userId.trim(), payload.memberId.trim()], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }


                    if (result.rowCount === 0 || result.rowCount === 1) {
                        return util.sendJson(res, { error: true, message: `either you or member doesnt exist` }, 404)
                    }

                    // check if user already exist in a group before deleting group members
                    const sql2 = `SELECT * FROM groups WHERE id=$1`
                    db.query(sql2, [payload.groupId.trim()], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rowCount === 0) {
                            return util.sendJson(res, { error: true, message: `fail to delete group members, no group found` }, 404)
                        }

                        // check if userid trying to delete group member detail is present
                        const sql3 = `SELECT * FROM groups WHERE id=$1 AND "userId"=$2`
                        db.query(sql3, [payload.groupId.trim(), payload.userId.trim()], (err, data2) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            if (data2.rowCount === 0) {
                                return util.sendJson(res, { error: true, message: `group deletion failed: you dont have permission.` }, 403)
                            }

                            // check if member exist before deletion takes place
                            const sql4 = `SELECT * FROM groups WHERE id=$1 AND "memberId"=$2`
                            db.query(sql4, [payload.groupId.trim(), payload.memberId.trim()], (err, data3) => {
                                if (err) {
                                    return util.sendJson(res, { error: true, message: err.message }, 400)
                                }

                                if (data3.rowCount === 0) {
                                    return util.sendJson(res, { error: true, message: `deletion failed: member doesnt exist` }, 404)
                                }

                                const { groupId, memberId } = payload;

                                const sql3 = `DELETE FROM groups WHERE id=$1 AND "memberId"=$2`
                                db.query(sql3, [groupId.trim(), memberId.trim()], (err) => {
                                    if (err) {
                                        return util.sendJson(res, { error: true, message: err.message }, 400)
                                    }

                                    return util.sendJson(res, { error: false, message: "group member successfully deleted" }, 200)
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
                    const sql2 = `SELECT * FROM groups WHERE id=$1 AND "userId"=$2`
                    db.query(sql2, [payload.groupId.trim(), payload.userId.trim()], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rows.length === 0) {
                            return util.sendJson(res, { error: false, message: `fail to delete group, you dont belong to the group id provided` }, 404)
                        }

                        let q1 = `DELETE FROM documents WHERE "groupId"=$1 AND "userId"=$2`
                        let q2 = `DELETE FROM "docFeedback" WHERE "groupId"=$1`
                        const { groupId, userId } = payload;

                        // go ahead if it was the student who posted it
                        db.query(q1, [groupId.trim(), userId.trim()], (err) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            // delete documentFeedback
                            db.query(q2, [groupId.trim()], (err) => {
                                if (err) {
                                    return util.sendJson(res, { error: true, message: err.message }, 400)
                                }

                                const q4 = `DELETE FROM groups WHERE id=$1 AND "userId"=$2`
                                db.query(q4, [groupId.trim(), userId.trim()], (err) => {
                                    if (err) {
                                        return util.sendJson(res, { error: true, message: err.message }, 400)
                                    }
                                    return util.sendJson(res, { error: false, message: "group successfully deleted" }, 200)
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

}
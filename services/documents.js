import { db, util } from "../helpers/global.js"

export default class Document {

    allDocs(res) {
        if (res === "" || res === undefined || res === null) {
            return "getting all documents requires a valid {res} object but got none"
        }
        try {
            const sql = `SELECT * FROM documents`
            db.query(sql, (err, result) => {
                if (err) {
                    return util.sendJson(res, { error: true, message: err.message }, 400)
                }

                let documentData = []

                if (result.rowCount > 0) {
                    result.rows.forEach((data) => {
                        documentData.push(data)
                    })
                }

                return util.sendJson(res, { error: false, document: documentData }, 200)
            })
        } catch (err) {
            console.log(err);
            return util.sendJson(res, { error: true, message: err.message }, 500)
        }

    }

    docsById(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "deleting documents requires a valid {res} object but got none"
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.documentId === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [documentId] but got undefined" }, 400)
            }
            if (payload.documentId === "") {
                return util.sendJson(res, { error: true, message: "documentId cant be empty" }, 400)
            }

            // check if user exist
            try {
                const sql = `SELECT * FROM documents WHERE documents.id=$1 `
                db.query(sql, [payload.documentId.trim()], async (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    documentData["document"] = result.rows

                    return util.sendJson(res, { error: false, documentData }, 200)
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }
    }

    docsByUserId(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "deleting documents requires a valid {res} object but got none"
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.userId === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [userId] but got undefined" }, 400)
            }

            if (payload.userId === "") {
                return util.sendJson(res, { error: true, message: "userId cant be empty" }, 400)
            }

            try {
                const sql = `SELECT * FROM documents WHERE "userId"=$1`
                db.query(sql, [payload.userId.trim()], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    // check if 
                    let members = []

                    let documentData = {
                        ...result.rows,
                        ...members
                    }


                    return util.sendJson(res, { error: false, document: documentData }, 200)
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }
    }

    docsByGroupId(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "deleting documents requires a valid {res} object but got none"
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.groupId === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [groupId] but got undefined" }, 400)
            }

            if (payload.groupId === "") {
                return util.sendJson(res, { error: true, message: "groupId cant be empty" }, 400)
            }

            // check if user exist
            try {
                let groupData = {}

                const sql = `SELECT * FROM documents WHERE "groupId"=$1`
                db.query(sql, [payload.groupId.trim()], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rows.length > 0) {
                        groupData["name"] = result.rows[0].name
                        groupData["users"] = result.rows[0].users
                    }

                    // return util.sendJson(res, { error: false, data: result.rows }, 200)
                })

                return groupData
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }
    }

    addFYP(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "submitting documents requires a valid {res} object but got none"
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.title === undefined || payload.userId === undefined || payload.staffId === undefined || payload.groupId === undefined || payload.courseName === undefined || payload.courseType === undefined || payload.file === undefined || payload.documentType === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [userId,staffId,groupId,courseName,courseType,title,file,documentType] but got undefined" }, 400)
            }
            if (payload.title === "") {
                return util.sendJson(res, { error: true, message: "title cant be empty" }, 400)
            }
            if (payload.userId === "") {
                return util.sendJson(res, { error: true, message: "userId cant be empty" }, 400)
            }
            if (payload.staffId === "") {
                return util.sendJson(res, { error: true, message: "staffId cant be empty" }, 400)
            }
            if (payload.groupId === "") {
                return util.sendJson(res, { error: true, message: "groupId cant be empty" }, 400)
            }
            if (payload.courseType === "") {
                return util.sendJson(res, { error: true, message: "courseType cant be empty" }, 400)
            }
            if (payload.courseName === "") {
                return util.sendJson(res, { error: true, message: "courseName cant be empty" }, 400)
            }
            if (Object.entries(payload.file).length === 0) {
                return util.sendJson(res, { error: true, message: "file cant be empty" }, 400)
            }
            if (payload.documentType === "") {
                return util.sendJson(res, { error: true, message: "documentType cant be empty" }, 400)
            }

            // validate file
            const validFileExt = ["pdf"]
            if (payload.file.type !== undefined && validFileExt.includes(payload.file.type) === false) {
                return util.sendJson(res, { error: true, message: `invalid file type [ ${payload.file.type} ] valid file [.pdf]` }, 400)
            }
            if (payload.file.data === undefined || payload.file.data === "") {
                return util.sendJson(res, { error: true, message: "expected file data, but got nothing" }, 400)
            }

            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE "userId"=$1`
                db.query(sql, [payload.userId], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount === 0) {
                        return util.sendJson(res, { error: true, message: "failed to submit document: student doesnt exist" }, 400)
                    }

                    // check if user submitting document isnt a staff
                    if (result.rows[0].type === "staff") {
                        return util.sendJson(res, { error: true, message: "only students are meant to submit document not staff" }, 400)
                    }

                    // check if staff/cordinator exists
                    db.query(sql, [payload.staffId], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rowCount === 0) {
                            return util.sendJson(res, { error: true, message: "failed to submit document: cordinator doesnt exists" }, 404)
                        }

                        // check if user submitting document is a staff
                        if (data1.rows[0].type !== "staff") {
                            return util.sendJson(res, { error: true, message: "cordinator added isnt a staff" }, 400)
                        }

                        // check if group exists
                        const sql2 = `SELECT * FROM groups WHERE id=$1`
                        db.query(sql2, [payload.groupId.trim()], (err, data2) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            if (data2.rowCount === 0) {
                                return util.sendJson(res, { error: true, message: "the group you added doesnt exists." }, 404)
                            }

                            // check if student/user trying to submit document for a specific group exist in that group

                            const sql3 = `SELECT * FROM groups WHERE id=$1 AND "userId"=$2`
                            db.query(sql3, [payload.groupId.trim(), payload.userId.trim()], (err, data3) => {
                                if (err) {
                                    return util.sendJson(res, { error: true, message: err.message }, 400)
                                }

                                if (data3.rowCount === 0) {
                                    return util.sendJson(res, { error: true, message: "fialed: cant submit document for a group you dont belong to." }, 403)
                                }

                                // check if document which the group is trying to submit already exists
                                const sql3 = `SELECT * FROM documents WHERE "groupId"=$1 AND "documentType"=$2 AND title=$3 AND "courseType"=$4 AND "courseName"=$5`
                                db.query(sql3, [payload.groupId, payload.documentType, payload.title, payload.courseType, payload.courseName], (err, data4) => {
                                    if (err) {
                                        return util.sendJson(res, { error: true, message: err.message }, 400)
                                    }

                                    if (data4.rowCount > 0) {
                                        return util.sendJson(res, { error: true, message: "document youre trying to submit already exist." }, 200)
                                    }

                                    // save document in database
                                    const { title, documentType, userId, groupId, staffId, courseName, courseType, file } = payload
                                    const fileData = file.data;
                                    const id = util.genId()
                                    const status = "pending"
                                    const date = util.formatDate()

                                    const sql4 = `INSERT INTO documents(id,title,"documentType","courseType","courseName","userId","groupId","staffId","status","file","created_at") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`;
                                    db.query(sql4, [id.trim(), title.trim(), documentType.trim(), courseType.trim(), courseName.trim(), userId.trim(), groupId.trim(), staffId.trim(), status.trim(), fileData.trim(), date.trim()], (err) => {
                                        if (err) {
                                            return util.sendJson(res, { error: true, message: err.message }, 400)
                                        }

                                        return util.sendJson(res, { error: true, message: "document submitted successfully." }, 200)
                                    })
                                })
                            })
                        })
                    })
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }
    }

    addCF(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "submitting documents requires a valid {res} object but got none"
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.title === undefined || payload.userId === undefined || payload.staffId === undefined || payload.courseName === undefined || payload.courseType === undefined || payload.file === undefined || payload.documentType === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [userId,staffId,courseName,courseType,title,file,documentType] but got undefined" }, 400)
            }
            if (payload.title === "") {
                return util.sendJson(res, { error: true, message: "title cant be empty" }, 400)
            }
            if (payload.userId === "") {
                return util.sendJson(res, { error: true, message: "userId cant be empty" }, 400)
            }
            if (payload.staffId === "") {
                return util.sendJson(res, { error: true, message: "staffId cant be empty" }, 400)
            }
            if (payload.courseType === "") {
                return util.sendJson(res, { error: true, message: "courseType cant be empty" }, 400)
            }
            if (payload.courseName === "") {
                return util.sendJson(res, { error: true, message: "courseName cant be empty" }, 400)
            }
            if (Object.entries(payload.file).length === 0) {
                return util.sendJson(res, { error: true, message: "file cant be empty" }, 400)
            }
            if (payload.documentType === "") {
                return util.sendJson(res, { error: true, message: "documentType cant be empty" }, 400)
            }

            // validate file
            const validFileExt = ["pdf"]
            if (payload.file.type !== undefined && validFileExt.includes(payload.file.type) === false) {
                return util.sendJson(res, { error: true, message: `invalid file type [ ${payload.file.type} ] valid file [.pdf]` }, 400)
            }
            if (payload.file.data === undefined || payload.file.data === "") {
                return util.sendJson(res, { error: true, message: "expected file data, but got nothing" }, 400)
            }

            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE "userId"=$1`
                db.query(sql, [payload.userId], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount === 0) {
                        return util.sendJson(res, { error: true, message: "failed to submit document: student doesnt exist" }, 400)
                    }

                    // check if user submitting document isnt a staff
                    if (result.rows[0].type === "staff") {
                        return util.sendJson(res, { error: true, message: "only students are meant to submit document not staff" }, 400)
                    }

                    // check if staff/cordinator exists
                    db.query(sql, [payload.staffId], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rowCount === 0) {
                            return util.sendJson(res, { error: true, message: "failed to submit document: cordinator doesnt exists" }, 404)
                        }

                        // check if user submitting document isnt a staff
                        if (data1.rows[0].type !== "staff") {
                            return util.sendJson(res, { error: true, message: "cordinator added isnt a staff" }, 400)
                        }

                        // check if document which the user/student is trying to submit already exists
                        const sql3 = `SELECT * FROM documents WHERE "userId"=$1 AND "documentType"=$2 AND title=$3 AND "courseType"=$4 AND "courseName"=$5`
                        db.query(sql3, [payload.userId, payload.documentType, payload.title, payload.courseType, payload.courseName], (err, data3) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            if (data3.rowCount > 0) {
                                return util.sendJson(res, { error: true, message: "document youre trying to submit already exist." }, 200)
                            }

                            // save document in database
                            const { title, documentType, userId, staffId, courseName, courseType, file } = payload
                            const fileData = file.data;
                            const id = util.genId()
                            const status = "pending"
                            const date = util.formatDate()

                            const sql4 = `INSERT INTO documents(id,title,"documentType","courseType","courseName","userId","staffId","status","file","created_at") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;
                            db.query(sql4, [id.trim(), title.trim(), documentType.trim(), courseType.trim(), courseName.trim(), userId.trim(), staffId.trim(), status.trim(), fileData.trim(), date.trim()], (err) => {
                                if (err) {
                                    return util.sendJson(res, { error: true, message: err.message }, 400)
                                }

                                return util.sendJson(res, { error: false, message: "document submitted successfully." }, 200)
                            })
                        })
                    })
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }
    }

    editFYP(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "editing documents requires a valid {res} object but got none"
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.title === undefined || payload.userId === undefined || payload.staffId === undefined || payload.groupId === undefined || payload.courseName === undefined || payload.courseType === undefined || payload.changeFile === undefined || payload.documentType === undefined || payload.documentId === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [userId,staffId,groupId,courseName,courseType,title,file,documentType,changeFile,documentId] but got undefined" }, 400)
            }
            if (payload.title === "") {
                return util.sendJson(res, { error: true, message: "title cant be empty" }, 400)
            }
            if (payload.userId === "") {
                return util.sendJson(res, { error: true, message: "userId cant be empty" }, 400)
            }
            if (payload.staffId === "") {
                return util.sendJson(res, { error: true, message: "staffId cant be empty" }, 400)
            }
            if (payload.groupId === "") {
                return util.sendJson(res, { error: true, message: "groupId cant be empty" }, 400)
            }
            if (payload.courseType === "") {
                return util.sendJson(res, { error: true, message: "courseType cant be empty" }, 400)
            }
            if (payload.courseName === "") {
                return util.sendJson(res, { error: true, message: "courseName cant be empty" }, 400)
            }
            if (Object.entries(payload.file).length === 0) {
                return util.sendJson(res, { error: true, message: "file cant be empty" }, 400)
            }
            if (payload.documentType === "") {
                return util.sendJson(res, { error: true, message: "documentType cant be empty" }, 400)
            }
            if (payload.documentId === "") {
                return util.sendJson(res, { error: true, message: "documentId cant be empty" }, 400)
            }

            // validate file
            const validFileExt = ["pdf"]
            if (payload.changeFile === true && payload.file.type !== undefined && validFileExt.includes(payload.file.type) === false) {
                return util.sendJson(res, { error: true, message: `invalid file type [ ${payload.file.type} ] valid file [.pdf]` }, 400)
            }
            if (payload.changeFile === true && payload.file.data === undefined || payload.file.data === "") {
                return util.sendJson(res, { error: true, message: "expected file data, but got nothing" }, 400)
            }

            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE "userId"=$1`
                db.query(sql, [payload.userId.trim()], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount === 0) {
                        return util.sendJson(res, { error: true, message: "failed to edit document: student doesnt exist" }, 400)
                    }

                    // check if user editting document isnt a staff
                    if (result.rows[0].type === "staff") {
                        return util.sendJson(res, { error: true, message: "only students are meant to edit document not staff" }, 400)
                    }

                    // check if staff/cordinator exists
                    db.query(sql, [payload.staffId.trim()], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rowCount === 0) {
                            return util.sendJson(res, { error: true, message: "failed to submit document: cordinator doesnt exists" }, 404)
                        }

                        // check if user submitting document is a staff
                        if (data1.rows[0].type !== "staff") {
                            return util.sendJson(res, { error: true, message: "cordinator added isnt a staff" }, 400)
                        }

                        // check if group exists
                        const sql2 = `SELECT * FROM groups WHERE id=$1`
                        db.query(sql2, [payload.groupId.trim()], (err, data2) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            if (data2.rowCount === 0) {
                                return util.sendJson(res, { error: true, message: "the group you added doesnt exists." }, 404)
                            }

                            // check if student/user trying to editing document for a specific group exist in that group

                            const membersIds = data2.rows[0].usersId;

                            if (membersIds.includes(payload.userId) === false) {
                                return util.sendJson(res, { error: true, message: "fialed: cant edit document for a group you dont belong to." }, 403)
                            }


                            // check if document which the group is trying to edit exists
                            const sql3 = `SELECT * FROM documents WHERE "groupId"=$1 AND "documentType"=$2 AND "userId"=$3 AND id=$4`
                            db.query(sql3, [payload.groupId.trim(), payload.documentType.trim(), payload.userId.trim(), payload.documentId.trim()], (err, data3) => {
                                if (err) {
                                    return util.sendJson(res, { error: true, message: err.message }, 400)
                                }

                                if (data3.rowCount === 0) {
                                    return util.sendJson(res, { error: true, message: "failed to delete: document not found." }, 404)
                                }

                                // save document in database
                                const { title, documentType, documentId, userId, groupId, staffId, courseName, courseType, changeFile } = payload
                                const date = util.formatDate()

                                // check if the user is trying to edit file
                                if (changeFile === false) {
                                    const sql4 = `UPDATE documents SET title=$1, "documentType"=$2,"courseType"=$3,"courseName"=$4, "userId"=$5 ,"groupId"=$6 ,"staffId"=$7 ,"created_at"=$8 WHERE "groupId"=$9 AND "userId"=$10 AND id=$11`;
                                    db.query(sql4, [title.trim(), documentType.trim(), courseType.trim(), courseName.trim(), userId.trim(), groupId.trim(), staffId.trim(), date.trim(), groupId.trim(), userId.trim(), documentId.trim()], (err) => {
                                        if (err) {
                                            return util.sendJson(res, { error: true, message: err.message }, 400)
                                        }

                                        return util.sendJson(res, { error: true, message: "document updated successfully." }, 200)
                                    })
                                }

                                if (changeFile === true) {
                                    const fileData = payload.file.data
                                    const sql5 = `UPDATE documents SET title=$1, "documentType"=$2,"courseType"=$3,"courseName"=$4, "userId"=$5 ,"groupId"=$6, "staffId"=$7, file=$8 ,"created_at"=$9 WHERE "groupId"=$10 AND "userId"=$11 AND id=$12`;

                                    db.query(sql5, [title.trim(), documentType.trim(), courseType.trim(), courseName.trim(), userId.trim(), groupId.trim(), staffId.trim(), fileData.trim(), date.trim(), groupId.trim(), userId.trim(), documentId.trim()], (err) => {
                                        if (err) {
                                            return util.sendJson(res, { error: true, message: err.message }, 400)
                                        }

                                        return util.sendJson(res, { error: true, message: "document updated successfully." }, 200)
                                    })
                                }

                            })

                        })
                    })
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }
    }

    editCF(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "editing documents requires a valid {res} object but got none"
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.title === undefined || payload.userId === undefined || payload.staffId === undefined || payload.courseName === undefined || payload.courseType === undefined || payload.changeFile === undefined || payload.documentType === undefined || payload.documentId === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [userId,staffId,courseName,courseType,title,file,documentType] but got undefined" }, 400)
            }
            if (payload.title === "") {
                return util.sendJson(res, { error: true, message: "title cant be empty" }, 400)
            }
            if (payload.userId === "") {
                return util.sendJson(res, { error: true, message: "userId cant be empty" }, 400)
            }
            if (payload.staffId === "") {
                return util.sendJson(res, { error: true, message: "staffId cant be empty" }, 400)
            }
            if (payload.courseType === "") {
                return util.sendJson(res, { error: true, message: "courseType cant be empty" }, 400)
            }
            if (payload.courseName === "") {
                return util.sendJson(res, { error: true, message: "courseName cant be empty" }, 400)
            }
            if (Object.entries(payload.file).length === 0) {
                return util.sendJson(res, { error: true, message: "file cant be empty" }, 400)
            }
            if (payload.documentType === "") {
                return util.sendJson(res, { error: true, message: "documentType cant be empty" }, 400)
            }
            if (payload.documentId === "") {
                return util.sendJson(res, { error: true, message: "documentId cant be empty" }, 400)
            }

            // validate file
            const validFileExt = ["pdf"]
            if (payload.changeFile === true && payload.file.type !== undefined && validFileExt.includes(payload.file.type) === false) {
                return util.sendJson(res, { error: true, message: `invalid file type [ ${payload.file.type} ] valid file [.pdf]` }, 400)
            }
            if (payload.changeFile === true && payload.file.data === undefined || payload.file.data === "") {
                return util.sendJson(res, { error: true, message: "expected file data, but got nothing" }, 400)
            }

            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE "userId"=$1`
                db.query(sql, [payload.userId.trim()], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount === 0) {
                        return util.sendJson(res, { error: true, message: "failed to edit document: student doesnt exist" }, 400)
                    }

                    // check if user editting document isnt a staff
                    if (result.rows[0].type === "staff") {
                        return util.sendJson(res, { error: true, message: "only students are meant to edit document not staff" }, 400)
                    }

                    // check if staff/cordinator exists
                    db.query(sql, [payload.staffId.trim()], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rowCount === 0) {
                            return util.sendJson(res, { error: true, message: "failed to submit document: cordinator doesnt exists" }, 404)
                        }

                        // check if user submitting document is a staff
                        if (data1.rows[0].type !== "staff") {
                            return util.sendJson(res, { error: true, message: "cordinator added isnt a staff" }, 400)
                        }

                        // check if document which the group is trying to edit exists

                        const sql3 = `SELECT * FROM documents WHERE id=$1 AND "documentType"=$2 AND "userId"=$3`
                        db.query(sql3, [payload.documentId.trim(), payload.documentType.trim(), payload.userId.trim()], (err, data3) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            if (data3.rowCount === 0) {
                                return util.sendJson(res, { error: true, message: "failed to delete: document not found." }, 404)
                            }

                            // update document in database
                            const { title, documentType, documentId, userId, staffId, courseName, courseType, changeFile } = payload
                            const date = util.formatDate()

                            // check if the user is trying to edit file
                            if (changeFile === false) {
                                const sql4 = `UPDATE documents SET title=$1, "documentType"=$2,"courseType"=$3,"courseName"=$4, "userId"=$5 ,"staffId"=$6 ,"created_at"=$7 WHERE "userId"=$8 AND id=$9`;
                                db.query(sql4, [title.trim(), documentType.trim(), courseType.trim(), courseName.trim(), userId.trim(), staffId.trim(), date.trim(), userId.trim(), documentId.trim()], (err) => {
                                    if (err) {
                                        return util.sendJson(res, { error: true, message: err.message }, 400)
                                    }

                                    return util.sendJson(res, { error: true, message: "document updated successfully." }, 200)
                                })
                            }

                            if (changeFile === true) {
                                const fileData = payload.file.data
                                const sql5 = `UPDATE documents SET title=$1, "documentType"=$2,"courseType"=$3,"courseName"=$4, "userId"=$5, "staffId"=$6, file=$7 ,"created_at"=$8 WHERE "userId"=$9 AND id=$10`;

                                db.query(sql5, [title.trim(), documentType.trim(), courseType.trim(), courseName.trim(), userId.trim(), staffId.trim(), fileData.trim(), date.trim(), userId.trim(), documentId.trim()], (err) => {
                                    if (err) {
                                        return util.sendJson(res, { error: true, message: err.message }, 400)
                                    }

                                    return util.sendJson(res, { error: true, message: "document updated successfully." }, 200)
                                })
                            }

                        })
                    })
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }
    }

    delete(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "deleting documents requires a valid {res} object but got none"
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.userId === undefined || payload.documentId === undefined || payload.documentType === undefined) {
                return util.sendJson(res, { error: true, message: "payload requires a valid fields [userId,documentId,documentType] but got undefined" }, 400)
            }
            if (payload.userId === "") {
                return util.sendJson(res, { error: true, message: "userId cant be empty" }, 400)
            }
            if (payload.documentType === "") {
                return util.sendJson(res, { error: true, message: "documentType cant be empty" }, 400)
            }
            if (payload.documentId === "") {
                return util.sendJson(res, { error: true, message: "documentId cant be empty" }, 400)
            }

            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE "userId"=$1`
                db.query(sql, [payload.userId.trim()], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount === 0) {
                        return util.sendJson(res, { error: true, message: "failed to delete document: student doesnt exist" }, 400)
                    }

                    // check if user deleting document isnt a staff
                    if (result.rows[0].type === "staff") {
                        return util.sendJson(res, { error: true, message: "only students are meant to delete document not staff" }, 400)
                    }

                    // check if document which the group/user is trying to edit exists
                    const sql2 = `SELECT * FROM documents WHERE id=$1 AND "documentType"=$2 AND "userId"=$3`
                    db.query(sql2, [payload.documentId.trim(), payload.documentType.trim(), payload.userId.trim()], (err, data1) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (data1.rowCount === 0) {
                            return util.sendJson(res, { error: true, message: "failed to delete: document not found." }, 404)
                        }

                        // update document in database
                        const { documentType, documentId, userId } = payload

                        // check if the user is trying to edit file
                        const sql3 = `DELETE FROM documents WHERE id=$1 AND "userId"=$2 AND "documentType"=$3`;
                        db.query(sql3, [documentId.trim(), userId.trim(), documentType.trim()], (err) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            return util.sendJson(res, { error: true, message: "document deleted successfully." }, 200)
                        })

                    })
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }
    }

}
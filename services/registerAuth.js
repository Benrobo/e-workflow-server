
import { db, util } from "../helpers/global.js";

export default class RegisterAuth {

    // register student
    async student(res, data) {
        if (res === "" || res === undefined || res === null) {
            return "user authentication requires a valid {res} object but got none"
        }

        if (data && Object.entries(data).length > 0) {
            if (data.email === undefined || data.userName === undefined || data.password === undefined || data.type === undefined || data.phoneNumber === "") {
                return util.sendJson(res, { error: true, message: "data requires a valid fields [userName, email, password, type] but got undefined" }, 400)
            }
            if (data.userName === "") {
                return util.sendJson(res, { error: true, message: "userName cant be empty" }, 400)
            }
            if (data.email === "") {
                return util.sendJson(res, { error: true, message: "email cant be empty" }, 400)
            }
            if (data.type === "") {
                return util.sendJson(res, { error: true, message: "type cant be empty" }, 400)
            }
            if (data.phoneNumber === "") {
                return util.sendJson(res, { error: true, message: "phoneNumber cant be empty" }, 400)
            }
            if (data.password === "") {
                return util.sendJson(res, { error: true, message: "user password cant be empty" }, 400)
            }
            // validate data
            if (util.validateEmail(data.email) === false) {
                return util.sendJson(res, { error: true, message: "user mail is invalid" })
            }

            if (util.validatePhonenumber(data.phoneNumber) === false) {
                return util.sendJson(res, { error: true, message: "user phone number is invalid" })
            }

            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE mail=$1 OR "phoneNumber"=$2`
                db.query(sql, [data.email, data.phoneNumber], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount > 0) {
                        return util.sendJson(res, { error: true, message: "student with that email or phone number already exists" }, 400)
                    }

                    // insert data
                    const { userName, email, phoneNumber, password, type } = data
                    const id = util.genId()
                    const userId = util.genId()
                    const refreshToken = 0
                    const hash = util.genHash(password)
                    const status = "pending"
                    const joined = util.formatDate()
                    const role = "user"
                    const sql2 = `INSERT INTO users(id, "userId", "userName","mail","phoneNumber",hash,"type","userStatus", "userRole","refreshToken","joined") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`
                    db.query(sql2, [id, userId, userName, email, phoneNumber, hash, type, status, role, refreshToken, joined], (err, result) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        return util.sendJson(res, { error: false, message: "user registerd succesfully." }, 200)
                    })
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }

    }

    // register staff
    async staff(res, data) {
        if (res === "" || res === undefined || res === null) {
            return "user authentication requires a valid {res} object but got none"
        }

        if (data && Object.entries(data).length > 0) {
            if (data.email === undefined || data.userName === undefined || data.password === undefined || data.type === undefined || data.token === undefined) {
                return util.sendJson(res, { error: true, message: "data requires a valid fields [userName, email, password, token, type] but got undefined" }, 400)
            }
            if (data.userName === "") {
                return util.sendJson(res, { error: true, message: "userName cant be empty" }, 400)
            }
            if (data.email === "") {
                return util.sendJson(res, { error: true, message: "email cant be empty" }, 400)
            }
            if (data.type === "") {
                return util.sendJson(res, { error: true, message: "type cant be empty" }, 400)
            }
            if (data.token === "") {
                return util.sendJson(res, { error: true, message: "token cant be empty" }, 400)
            }
            if (data.password === "") {
                return util.sendJson(res, { error: true, message: "user password cant be empty" }, 400)
            }
            // validate data
            if (util.validateEmail(data.email) === false) {
                return util.sendJson(res, { error: true, message: "user mail is invalid" })
            }

            if (util.validatePhonenumber(data.phoneNumber) === false) {
                return util.sendJson(res, { error: true, message: "user phone number is invalid" })
            }

            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE mail=$1 OR "phoneNumber"=$2`
                db.query(sql, [data.email, data.phoneNumber], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount > 0) {
                        return util.sendJson(res, { error: true, message: "user with that email or phone number already exists" }, 400)
                    }

                    // check if token entered match the created token in database
                    const sql2 = `SELECT * FROM codes WHERE token=$1`
                    db.query(sql2, [data.token], (err, resultData) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        if (resultData.rowCount === 0) {
                            return util.sendJson(res, { error: true, message: "token as either expired or is invalid" }, 403)
                        }

                        // insert data
                        const { userName, email, phoneNumber, password, type } = data
                        const id = util.genId()
                        const userId = util.genId()
                        const refreshToken = 0
                        const hash = util.genHash(password)
                        const status = "pending"
                        const joined = util.formatDate()
                        const role = "user"
                        const sql3 = `INSERT INTO users(id, "userId", "userName","mail","phoneNumber",hash,"type","userStatus", "userRole","refreshToken","joined") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`
                        db.query(sql3, [id, userId, userName, email, phoneNumber, hash, type, status, role, refreshToken, joined], (err, result) => {
                            if (err) {
                                return util.sendJson(res, { error: true, message: err.message }, 400)
                            }

                            return util.sendJson(res, { error: false, message: "user registerd succesfully. waiting to be approved by admin" }, 200)
                        })

                    })
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }

    }

    // register admin
    async admin(res, data) {
        if (res === "" || res === undefined || res === null) {
            return "officerAuth requires a valid {res} object but got none"
        }

        if (data && Object.entries(data).length > 0) {
            if (data.email === undefined || data.userName === undefined || data.password === undefined || data.phoneNumber === undefined || data.type === undefined) {
                return util.sendJson(res, { error: true, message: "data requires a valid fields [userName, email, password, phonenumber, type] but got undefined" }, 400)
            }
            if (data.userName === "") {
                return util.sendJson(res, { error: true, message: "userName cant be empty" }, 400)
            }
            if (data.email === "") {
                return util.sendJson(res, { error: true, message: "email cant be empty" }, 400)
            }
            if (data.password === "") {
                return util.sendJson(res, { error: true, message: "user password cant be empty" }, 400)
            }
            if (data.phoneNumber === "") {
                return util.sendJson(res, { error: true, message: "user phone number cant be empty" }, 400)
            }
            if (data.type === "") {
                return util.sendJson(res, { error: true, message: "user type cant be empty" }, 400)
            }
            // validate data
            if (util.validateEmail(data.email) === false) {
                return util.sendJson(res, { error: true, message: "user mail is invalid" })
            }

            if (util.validatePhonenumber(data.phoneNumber) === false) {
                return util.sendJson(res, { error: true, message: "user phone number is invalid" })
            }

            // check if user exist
            try {
                const sql = `SELECT * FROM users WHERE mail=$1 OR "phoneNumber"=$2`
                db.query(sql, [data.email, data.phoneNumber], (err, result) => {
                    if (err) {
                        return util.sendJson(res, { error: true, message: err.message }, 400)
                    }

                    if (result.rowCount > 0) {
                        return util.sendJson(res, { error: true, message: "user with that email or phone number already exists" }, 400)
                    }


                    // insert data
                    const { userName, email, phoneNumber, password, type } = data
                    const id = util.genId()
                    const userId = util.genId()
                    const refreshToken = 0
                    const hash = util.genHash(password)
                    const status = "approved"
                    const joined = util.formatDate()
                    const role = "admin"
                    const sql2 = `INSERT INTO users(id, "userId", "userName","mail","phoneNumber",hash,"type","userStatus", "userRole","refreshToken","joined") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`
                    db.query(sql2, [id, userId, userName, email, phoneNumber, hash, type, status, role, refreshToken, joined], (err, result) => {
                        if (err) {
                            return util.sendJson(res, { error: true, message: err.message }, 400)
                        }

                        return util.sendJson(res, { error: false, message: "user registerd succesfully" }, 200)
                    })
                })
            } catch (err) {
                console.log(err);
                return util.sendJson(res, { error: true, message: err.message }, 500)
            }
        }
    }

}
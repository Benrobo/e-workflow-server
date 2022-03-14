import { util, db } from "../helpers/global.js";

export class Users {
    all(res) {
        if (res === "" || res === undefined || res === null) {
            return "getting of users requires a valid {res} object but got none";
        }

        try {
            const sql = `SELECT * FROM users`;
            db.query(sql, (err, result) => {
                if (err) {
                    return util.sendJson(res, { error: true, message: err.message }, 400);
                }
                return util.sendJson(res, { error: false, data: result.rows }, 200);
            });
        } catch (err) {
            console.log(err);
            return util.sendJson(res, { error: true, message: err.message }, 500);
        }
    }

    byId(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "getting of users requires a valid {res} object but got none";
        }

        if (payload.userId === undefined) {
            return util.sendJson(
                res,
                { error: true, message: "failed to get users with id undefined" },
                400
            );
        }

        if (payload.userId === "") {
            return util.sendJson(
                res,
                { error: true, message: "failed to get users: id is empty" },
                400
            );
        }

        try {
            const sql = `SELECT * FROM users WHERE "userId"=$1`;
            db.query(sql, [payload.userId], (err, result) => {
                if (err) {
                    return util.sendJson(res, { error: true, message: err.message }, 400);
                }
                return util.sendJson(res, { error: false, data: result.rows }, 200);
            });
        } catch (err) {
            console.log(err);
            return util.sendJson(res, { error: true, message: err.message }, 500);
        }
    }

    updateAccount(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "updating account requires a valid {res} object but got none";
        }

        if (
            payload.userId === undefined ||
            payload.userName === undefined ||
            payload.mail === undefined ||
            payload.phoneNumber === undefined ||
            payload.passwordState === undefined
        ) {
            return util.sendJson(
                res,
                {
                    error: true,
                    message:
                        "failed to update account, requires a valid payloads but got undefined [userId, userName, mail, phonenumber, passwordState]",
                },
                400
            );
        }

        if (payload.userName === "") {
            return util.sendJson(
                res,
                { error: true, message: "userName cant be empty" },
                400
            );
        }
        if (payload.mail === "") {
            return util.sendJson(
                res,
                { error: true, message: "email cant be empty" },
                400
            );
        }
        if (payload.type === "") {
            return util.sendJson(
                res,
                { error: true, message: "type cant be empty" },
                400
            );
        }
        if (payload.phoneNumber === "") {
            return util.sendJson(
                res,
                { error: true, message: "phoneNumber cant be empty" },
                400
            );
        }
        if (payload.passwordState === true && payload.password === "") {
            return util.sendJson(
                res,
                { error: true, message: "user password cant be empty" },
                400
            );
        }
        // validate payload
        if (util.validateEmail(payload.mail) === false) {
            return util.sendJson(res, {
                error: true,
                message: "user mail is invalid",
            });
        }

        if (util.validatePhonenumber(payload.phoneNumber) === false) {
            return util.sendJson(res, {
                error: true,
                message: "user phone number is invalid",
            });
        }

        try {
            // check if user exist
            const { userId, userName, mail, phoneNumber, passwordState } = payload;
            const sql = `SELECT * FROM users WHERE "userId"=$1 AND mail=$2`;
            db.query(sql, [userId.trim(), mail.trim()], (err, result) => {
                if (err) {
                    return util.sendJson(res, { error: true, message: err.message }, 400);
                }

                if (result.rowCount === 0) {
                    return util.sendJson(
                        res,
                        {
                            error: true,
                            message:
                                "failed to update profile. user with mail or id doesnt exist",
                        },
                        404
                    );
                }

                // check if user phoneNumber belongs to someone else already

                let sql;

                if (passwordState) {
                    const hash = util.genHash(payload.password, 10);
                    sql = `UPDATE users SET "userName"=$1, mail=$2, "phoneNumber"=$3, hash=$4 WHERE "userId"=$5 AND mail=$6`;
                    return db.query(
                        sql,
                        [
                            userName.trim(),
                            mail.trim(),
                            phoneNumber.trim(),
                            hash.trim(),
                            userId.trim(),
                            mail.trim(),
                        ],
                        (err) => {
                            if (err) {
                                return util.sendJson(
                                    res,
                                    { error: true, message: err.message },
                                    400
                                );
                            }

                            return util.sendJson(
                                res,
                                { error: false, message: "account updated successfully" },
                                400
                            );
                        }
                    );
                }

                sql = `UPDATE users SET "userName"=$1, mail=$2, "phoneNumber"=$3 WHERE "userId"=$4 AND mail=$5`;
                db.query(
                    sql,
                    [
                        userName.trim(),
                        mail.trim(),
                        phoneNumber.trim(),
                        userId.trim(),
                        mail.trim(),
                    ],
                    (err) => {
                        if (err) {
                            return util.sendJson(
                                res,
                                { error: true, message: err.message },
                                400
                            );
                        }

                        return util.sendJson(
                            res,
                            { error: false, message: "account updated successfully" },
                            400
                        );
                    }
                );
            });
        } catch (err) {
            console.log(err);
            return util.sendJson(res, { error: true, message: err.message }, 500);
        }
    }

    deleteAccount(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "updating account requires a valid {res} object but got none";
        }

        if (payload.userId === undefined) {
            return util.sendJson(
                res,
                {
                    error: true,
                    message:
                        "failed to delete account, requires a valid payload but got undefined [userId]",
                },
                400
            );
        }

        try {
            // check if user exist
            const { userId } = payload;
            const sql = `SELECT * FROM users WHERE "userId"=$1`;
            db.query(sql, [userId.trim()], (err, result) => {
                if (err) {
                    return util.sendJson(res, { error: true, message: err.message }, 400);
                }

                if (result.rowCount === 0) {
                    return util.sendJson(
                        res,
                        {
                            error: true,
                            message: "failed to delete profile. user doesnt exist",
                        },
                        404
                    );
                }

                // delete related user data if account is deleted from database
                const q1 = `DELETE FROM groups WHERE "memberId"=$1 OR "userId"=$2`;
                const q2 = `DELETE FROM codes WHERE "userId"=$1`;
                // before deleting document, check if the document was uploaded by that user
                const check = `SELECT * FROM documents WHERE "userId"=$1`
                const q3 = `DELETE FROM documents WHERE "userId"=$1`;
                const q4 = `DELETE FROM users WHERE "userId"=$1`;

                db.query(q1, [userId.trim(), userId.trim()], (err) => {
                    if (err) {
                        return util.sendJson(
                            res,
                            { error: true, message: err.message },
                            400
                        );
                    }

                    db.query(q2, [userId.trim()], (err) => {
                        if (err) {
                            return util.sendJson(
                                res,
                                { error: true, message: err.message },
                                400
                            );
                        }

                        // chekc here
                        db.query(check, [userId.trim()], (err, data2) => {
                            if (err) {
                                return util.sendJson(
                                    res,
                                    { error: true, message: err.message },
                                    400
                                );
                            }

                            if (data2.rowCount > 0) {

                                // go ahead and execute
                                return db.query(q3, [userId.trim()], (err) => {
                                    if (err) {
                                        return util.sendJson(
                                            res,
                                            { error: true, message: err.message },
                                            400
                                        );
                                    }

                                    db.query(q4, [userId.trim()], (err) => {
                                        if (err) {
                                            return util.sendJson(
                                                res,
                                                { error: true, message: err.message },
                                                400
                                            );
                                        }

                                        return util.sendJson(
                                            res,
                                            {
                                                error: false,
                                                message: "user account deleted successfully.",
                                            },
                                            400
                                        );
                                    });
                                });
                            }

                            db.query(q4, [userId.trim()], (err) => {
                                if (err) {
                                    return util.sendJson(
                                        res,
                                        { error: true, message: err.message },
                                        400
                                    );
                                }

                                return util.sendJson(
                                    res,
                                    {
                                        error: false,
                                        message: "user account deleted successfully.",
                                    },
                                    400
                                );
                            });
                        })
                    });
                });
            });
        } catch (err) {
            console.log(err);
            return util.sendJson(res, { error: true, message: err.message }, 500);
        }
    }
}

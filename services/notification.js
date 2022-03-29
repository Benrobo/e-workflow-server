import { db, util } from "../helpers/global.js";
import sendMail from "./sendMail.js";



class Notification {

    get(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "fetching document requires a valid {res} object but got none";
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.userId === undefined) {
                return util.sendJson(
                    res,
                    {
                        error: true,
                        message:
                            "payload requires a valid fields [userId] but got undefined",
                    },
                    400
                );
            }

            if (payload.userId === "") {
                return util.sendJson(
                    res,
                    { error: true, message: "userId cant be empty" },
                    400
                );
            }

            const { userId } = payload

            // check if user exists
            const q1 = `SELECT * FROM users WHERE "userId"=$1`
            db.query(q1, [userId.trim()], (err, result) => {
                if (err) {
                    return util.sendJson(
                        res,
                        { error: true, message: err.message },
                        400
                    );
                }

                if (result.rowCount === 0) {
                    return util.sendJson(
                        res,
                        { error: true, message: "User doesnt exists." },
                        404
                    )
                }

                const sql = `SELECT * FROM notifications WHERE "userId"=$1`
                db.query(sql, [userId.trim()], (err, data) => {
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
                            data: data.rows,
                        },
                        400
                    );

                })
            })
        }
    }

    updateSeen(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "fetching document requires a valid {res} object but got none";
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.userId === undefined || payload.notificationId === undefined) {
                return util.sendJson(
                    res,
                    {
                        error: true,
                        message:
                            "payload requires a valid fields [userId, notificationId] but got undefined",
                    },
                    400
                );
            }

            if (payload.userId === "") {
                return util.sendJson(
                    res,
                    { error: true, message: "userId cant be empty" },
                    400
                );
            }

            if (payload.notificationId === "") {
                return util.sendJson(
                    res,
                    { error: true, message: "notificationId cant be empty" },
                    400
                );
            }

            const { userId, notificationId } = payload

            // check if user exists
            const q1 = `SELECT * FROM users WHERE "userId"=$1`
            db.query(q1, [userId.trim()], (err, result) => {
                if (err) {
                    return util.sendJson(
                        res,
                        { error: true, message: err.message },
                        400
                    );
                }

                if (result.rowCount === 0) {
                    return util.sendJson(
                        res,
                        { error: true, message: "User doesnt exists." },
                        404
                    )
                }

                const sql = `SELECT * FROM notifications WHERE id=$1 AND "userId"=$2`
                db.query(sql, [notificationId.trim(), userId.trim()], (err, data) => {
                    if (err) {
                        return util.sendJson(
                            res,
                            { error: true, message: err.message },
                            400
                        );
                    }


                    if (data.rowCount === 0) {
                        return util.sendJson(
                            res,
                            { error: true, message: "Cant update notification: not found." },
                            404
                        )
                    }


                    const isSeen = true
                    const q2 = `UPDATE notifications SET "isSeen"=$1 WHERE id=$2`
                    db.query(q2, [isSeen, notificationId.trim()], (err) => {
                        if (err) {
                            return util.sendJson(
                                res,
                                { error: true, message: err.message },
                                400
                            );
                        }

                        return util.sendJson(
                            res,
                            { error: false, message: "notification mark as seen" },
                            400
                        );
                    })

                })
            })
        }
    }

    delete(res, payload) {
        if (res === "" || res === undefined || res === null) {
            return "fetching document requires a valid {res} object but got none";
        }

        if (payload && Object.entries(payload).length > 0) {
            if (payload.userId === undefined || payload.notificationId === undefined) {
                return util.sendJson(
                    res,
                    {
                        error: true,
                        message:
                            "payload requires a valid fields [userId, notificationId] but got undefined",
                    },
                    400
                );
            }

            if (payload.userId === "") {
                return util.sendJson(
                    res,
                    { error: true, message: "userId cant be empty" },
                    400
                );
            }

            if (payload.notificationId === "") {
                return util.sendJson(
                    res,
                    { error: true, message: "notificationId cant be empty" },
                    400
                );
            }

            const { userId, notificationId } = payload

            const q1 = `SELECT * FROM users WHERE "userId"=$1`
            db.query(q1, [userId.trim()], (err, result) => {
                if (err) {
                    return util.sendJson(
                        res,
                        { error: true, message: err.message },
                        400
                    );
                }

                if (result.rowCount === 0) {
                    res,
                        { error: true, message: "failed to delete: user doesnt exists." },
                        404
                }

                // check if notification exists
                const q2 = `SELECT * FROM notifications WHERE id=$1`
                db.query(q2, [notificationId.trim()], (err, result) => {
                    if (err) {
                        return util.sendJson(
                            res,
                            { error: true, message: err.message },
                            400
                        );
                    }

                    if (result.rowCount === 0) {
                        return util.sendJson(
                            res,
                            { error: true, message: "failed to delete: notification doesnt exists." },
                            404
                        )
                    }

                    const sql = `DELETE FROM notifications WHERE "userId"=$1 AND id=$2`
                    db.query(sql, [userId.trim(), notificationId.trim()], (err, data) => {
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
                                message: "notification deleted",
                            },
                            400
                        );

                    })
                })
            })
        }
    }

}

export default new Notification()








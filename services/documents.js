import { db, util } from "../helpers/global.js";

/**
 * 
  Course form
    Hod *
    Course advisor 
    School Officer 

  Final project
    Supervisor 
    HOD *
    External Supervisor
 */

//  @Permissions_State (documents)
//  [Levels]
//   [ 1 ] -> READ/WRITE : normal staffs ( Course Cordinators)
//   [ 2 ] -> READ/WRITE : staff with higher responsibility ( HODS)
//   [ 3 ] -> READ/WRITE/EXECUTE/HighPermission : admins only
//   [ 4 ] -> READ/WRITE/EXECUTE : supervisor only
//   [ 5 ] -> READ/WRITE/EXECUTE : school officer only (for document approval / signing)
//   [ 6 ] -> READ/WRITE/EXECUTE : course advisor only (for document approval / signing)
//   [ 7 ] -> READ/WRITE/EXECUTE : External Supervisor only (for document approval / signing)

// Course form - School officer -> Course Advisor -> HOD
// Final year- Supervisor -> External examiner -> HOD

export default class Document {
  allDocs(res) {
    if (res === "" || res === undefined || res === null) {
      return "getting all documents requires a valid {res} object but got none";
    }
    try {
      const sql = `
                  SELECT 
                      documents.id,
                      documents.title,
                      documents."documentType",
                      documents."courseType",
                      documents."courseName",
                      documents."userId",
                      documents."groupId",
                      documents.status,
                      documents."HOD",
                      documents."supervisor",
                      documents."externalSupervisor",
                      documents."schoolOfficer",
                      documents."courseAdvisor",
                      users."userName",
                      documents.file
                  FROM 
                      documents
                  INNER JOIN
                      users
                  ON
                      users."userId"=documents."HOD"
                        `;
      db.query(sql, (err, result) => {
        if (err) {
          return util.sendJson(res, { error: true, message: err.message }, 400);
        }

        let documentData = [];

        if (result.rowCount > 0) {
          result.rows.forEach((data) => {
            documentData.push(data);
          });
        }

        return util.sendJson(
          res,
          { error: false, document: documentData },
          200
        );
      });
    } catch (err) {
      console.log(err);
      return util.sendJson(res, { error: true, message: err.message }, 500);
    }
  }

  docsById(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "fetching document requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (payload.documentId === undefined) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [documentId] but got undefined",
          },
          400
        );
      }
      if (payload.documentId === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentId cant be empty" },
          400
        );
      }

      // check if user exist
      try {
        const sql = `
                        SELECT 
                            documents.id,
                            documents.title,
                            documents."documentType",
                            documents."courseType",
                            documents."courseName",
                            documents."userId",
                            documents."groupId",
                            documents.status,
                            documents."HOD",
                            users."userName",
                            users."userName",
                            users.type,
                            users."documentPermissions",
                            documents.file
                        FROM 
                            documents
                        INNER JOIN
                            users
                        ON
                            users."userId"=documents."userId"
                        WHERE
                            documents.id=$1
                        `;
        db.query(sql, [payload.documentId.trim()], async (err, result) => {
          if (err) {
            return util.sendJson(
              res,
              { error: true, message: err.message },
              400
            );
          }

          const { id, title, documentType, courseType, courseName, userId, groupId, status, HOD, userName, type, documentPermissions, file } = result.rows[0]

          // getting HOD info from users table

          const q1 = `SELECT * FROM users WHERE "userId"=$1`
          db.query(q1, [HOD], (err, data1) => {
            if (err) {
              return util.sendJson(
                res,
                { error: true, message: err.message },
                400
              );
            }

            const sendData = {
              id,
              title,
              documentType,
              courseType,
              courseName,
              userId,
              groupId,
              status,
              HOD,
              hodName: data1.rows[0].userName,
              studentName: userName,
              type,
              documentPermissions: data1.rows[0].documentPermissions,
              file
            }

            return util.sendJson(
              res,
              { error: false, document: [sendData] },
              200
            );
          })


        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  docsByUserId(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "feteching documents requires a valid {res} object but got none";
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

      try {
        const { userId } = payload;
        // check if user exist
        const q1 = `SELECT * FROM users`;
        db.query(q1, [userId.trim()], (err, data1) => {
          if (err) {
            return util.sendJson(
              res,
              { error: true, message: err.message },
              400
            );
          }

          if (data1.rowCount === 0) {
            return util.sendJson(
              res,
              {
                error: true,
                message: "failed getting document: user doesnt exist",
              },
              404
            );
          }

          const q2 = `
                    SELECT *

                    FROM 
                        documents 
                    WHERE 
                        "userId"=$1
                    `;
          db.query(q2, [userId.trim()], (err, data2) => {
            if (err) {
              return util.sendJson(
                res,
                { error: true, message: err.message },
                400
              );
            }

            return util.sendJson(
              res,
              { error: false, document: data2.rows },
              200
            );
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  docsByGroupId(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "deleting documents requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (payload.groupId === undefined) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [groupId] but got undefined",
          },
          400
        );
      }

      if (payload.groupId === "") {
        return util.sendJson(
          res,
          { error: true, message: "groupId cant be empty" },
          400
        );
      }

      // check if user exist
      try {
        let groupData = {};

        const sql = `SELECT * FROM documents WHERE "groupId"=$1`;
        db.query(sql, [payload.groupId.trim()], (err, result) => {
          if (err) {
            return util.sendJson(
              res,
              { error: true, message: err.message },
              400
            );
          }

          if (result.rows.length > 0) {
            groupData["name"] = result.rows[0].name;
            groupData["users"] = result.rows[0].users;
          }

          // return util.sendJson(res, { error: false, data: result.rows }, 200)
        });

        return groupData;
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }
  // Add final
  addFYP(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "submitting documents requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.title === undefined ||
        payload.userId === undefined ||
        payload.supervisor === undefined ||
        payload.externalSupervisor === undefined ||
        payload.HOD === undefined ||
        payload.groupId === undefined ||
        payload.courseName === undefined ||
        payload.courseType === undefined ||
        payload.file === undefined ||
        payload.documentType === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [userId,supervisor,externalSupervisor,HOD,groupId,courseName,courseType,title,file,documentType] but got undefined",
          },
          400
        );
      }
      if (payload.title === "") {
        return util.sendJson(
          res,
          { error: true, message: "title cant be empty" },
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
      if (payload.supervisor === "") {
        return util.sendJson(
          res,
          { error: true, message: "supervisor cant be empty" },
          400
        );
      }
      if (payload.externalSupervisor === "") {
        return util.sendJson(
          res,
          { error: true, message: "externalSupervisor cant be empty" },
          400
        );
      }
      if (payload.HOD === "") {
        return util.sendJson(
          res,
          { error: true, message: "HOD cant be empty" },
          400
        );
      }
      if (payload.groupId === "") {
        return util.sendJson(
          res,
          { error: true, message: "groupId cant be empty" },
          400
        );
      }
      if (payload.courseType === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseType cant be empty" },
          400
        );
      }
      if (payload.courseName === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseName cant be empty" },
          400
        );
      }
      if (Object.entries(payload.file).length === 0) {
        return util.sendJson(
          res,
          { error: true, message: "file cant be empty" },
          400
        );
      }
      if (payload.documentType === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentType cant be empty" },
          400
        );
      }

      // validate file
      const validFileExt = ["pdf"];
      if (
        payload.file.type !== undefined &&
        validFileExt.includes(payload.file.type) === false
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message: `invalid file type [ ${payload.file.type} ] valid file [.pdf]`,
          },
          400
        );
      }
      if (payload.file.data === undefined || payload.file.data === "") {
        return util.sendJson(
          res,
          { error: true, message: "expected file data, but got nothing" },
          400
        );
      }

      // unpack data
      const {
        title,
        userId,
        supervisor,
        externalSupervisor,
        HOD,
        groupId,
        courseName,
        courseType,
        file,
        documentType,
      } = payload;

      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE "userId"=$1`;
        db.query(sql, [userId.trim()], (err, result) => {
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
              {
                error: true,
                message: "failed to submit document: student doesnt exist",
              },
              400
            );
          }

          // check if school officer exists in database
          const check1 = `SELECT * FROM users WHERE "userId"=$1`;
          // check if course advisor exists in database
          const check2 = `SELECT * FROM users WHERE "userId"=$1`;
          // check if HOD exists in database
          const check3 = `SELECT * FROM users WHERE "userId"=$1`;

          // CHECK 1

          db.query(check1, [supervisor.trim()], (err, data1) => {
            if (err) {
              return util.sendJson(
                res,
                { error: true, message: err.message },
                400
              );
            }

            if (data1.rowCount === 0) {
              return util.sendJson(
                res,
                {
                  error: true,
                  message: "failed to submit document: supervisor doesnt exist",
                },
                404
              );
            }
            // if exist, check if it has a documentPermission of 3
            if (data1.rowCount > 0 && data1.rows[0].documentPermissions !== 4) {
              return util.sendJson(
                res,
                {
                  error: true,
                  message: "the staff you added isnt a supervisor.",
                },
                403
              );
            }

            // CHECK 2

            db.query(check2, [externalSupervisor.trim()], (err, data2) => {
              if (err) {
                return util.sendJson(
                  res,
                  { error: true, message: err.message },
                  400
                );
              }

              if (data2.rowCount === 0) {
                return util.sendJson(
                  res,
                  {
                    error: true,
                    message:
                      "failed to submit document: external supervisor doesnt exist",
                  },
                  404
                );
              }

              // if exist, check if it has a documentPermission of 7
              if (
                data2.rowCount > 0 &&
                data2.rows[0].documentPermissions !== 7
              ) {
                return util.sendJson(
                  res,
                  {
                    error: true,
                    message: "the staff you added isnt external supervisor.",
                  },
                  403
                );
              }

              // CHECK 3
              db.query(check3, [HOD.trim()], (err, data3) => {
                if (err) {
                  return util.sendJson(
                    res,
                    { error: true, message: err.message },
                    400
                  );
                }

                if (data3.rowCount === 0) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message: "failed to submit document: HOD doesnt exist",
                    },
                    404
                  );
                }

                // if exist, check if it has a documentPermission of 5
                if (
                  data3.rowCount > 0 &&
                  data3.rows[0].documentPermissions !== 2
                ) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message: "the staff you added isnt an H.O.D.",
                    },
                    403
                  );
                }

                // Continue if all went well

                // check if user submitting document isnt a staff
                if (result.rows[0].type === "staff") {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message:
                        "only students are meant to submit document not staff",
                    },
                    400
                  );
                }

                // check if group exists
                const sql2 = `SELECT * FROM groups WHERE id=$1`;
                db.query(sql2, [groupId.trim()], (err, data4) => {
                  if (err) {
                    return util.sendJson(
                      res,
                      { error: true, message: err.message },
                      400
                    );
                  }

                  if (data4.rowCount === 0) {
                    return util.sendJson(
                      res,
                      {
                        error: true,
                        message: "the group you added doesnt exists.",
                      },
                      404
                    );
                  }

                  // check if student/user trying to submit document for a specific group exist in that group

                  const sql3 = `SELECT * FROM groups WHERE id=$1 AND "memberId"=$2`;
                  db.query(
                    sql3,
                    [payload.groupId.trim(), payload.userId.trim()],
                    (err, data5) => {
                      if (err) {
                        return util.sendJson(
                          res,
                          { error: true, message: err.message },
                          400
                        );
                      }

                      if (data5.rowCount === 0) {
                        return util.sendJson(
                          res,
                          {
                            error: true,
                            message:
                              "failed: cant submit document for a group you dont belong to.",
                          },
                          403
                        );
                      }

                      // check if document which the group is trying to submit already exists
                      const sql3 = `SELECT * FROM documents WHERE "groupId"=$1 AND "documentType"=$2 AND title=$3 AND "courseType"=$4 AND "courseName"=$5`;
                      db.query(
                        sql3,
                        [
                          payload.groupId,
                          payload.documentType,
                          payload.title,
                          payload.courseType,
                          payload.courseName,
                        ],
                        (err, data6) => {
                          if (err) {
                            return util.sendJson(
                              res,
                              { error: true, message: err.message },
                              400
                            );
                          }

                          if (data6.rowCount > 0) {
                            return util.sendJson(
                              res,
                              {
                                error: true,
                                message:
                                  "document youre trying to submit already exist.",
                              },
                              200
                            );
                          }

                          // save document in database
                          const fileData = file.data;
                          const id = util.genId();
                          const status = "pending";
                          const date = util.formatDate();

                          const sql4 = `INSERT INTO documents(id,title,"documentType","courseType","courseName","userId", "groupId","supervisor", "externalSupervisor", "HOD","status","file","created_at") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`;
                          db.query(
                            sql4,
                            [
                              id.trim(),
                              title.trim(),
                              documentType.trim(),
                              courseType.trim(),
                              courseName.trim(),
                              userId.trim(),
                              groupId.trim(),
                              supervisor,
                              externalSupervisor,
                              HOD,
                              status.trim(),
                              fileData.trim(),
                              date.trim(),
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
                                {
                                  error: false,
                                  message: "document submitted successfully.",
                                },
                                200
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                });
              });
            });
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }
  // Add COURSE FORM
  addCF(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "submitting documents requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.title === undefined ||
        payload.userId === undefined ||
        payload.schoolOfficer === undefined ||
        payload.courseAdvisor === undefined ||
        payload.HOD === undefined ||
        payload.courseName === undefined ||
        payload.courseType === undefined ||
        payload.file === undefined ||
        payload.documentType === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [userId,staffId,courseName,courseType,title,file,documentType] but got undefined",
          },
          400
        );
      }
      if (payload.title === "") {
        return util.sendJson(
          res,
          { error: true, message: "title cant be empty" },
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
      if (payload.schoolOfficer === "") {
        return util.sendJson(
          res,
          { error: true, message: "school officer cant be empty" },
          400
        );
      }
      if (payload.courseAdvisor === "") {
        return util.sendJson(
          res,
          { error: true, message: "course advisor cant be empty" },
          400
        );
      }
      if (payload.HOD === "") {
        return util.sendJson(
          res,
          { error: true, message: "HOD cant be empty" },
          400
        );
      }
      if (payload.courseName === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseName cant be empty" },
          400
        );
      }
      if (Object.entries(payload.file).length === 0) {
        return util.sendJson(
          res,
          { error: true, message: "file cant be empty" },
          400
        );
      }
      if (payload.documentType === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentType cant be empty" },
          400
        );
      }

      // validate file
      const validFileExt = ["pdf"];
      if (
        payload.file.type !== undefined &&
        validFileExt.includes(payload.file.type) === false
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message: `invalid file type [ ${payload.file.type} ] valid file [.pdf]`,
          },
          400
        );
      }
      if (payload.file.data === undefined || payload.file.data === "") {
        return util.sendJson(
          res,
          { error: true, message: "expected file data, but got nothing" },
          400
        );
      }

      // unpack data
      const {
        title,
        userId,
        schoolOfficer,
        courseAdvisor,
        HOD,
        courseName,
        courseType,
        file,
        documentType,
      } = payload;
      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE "userId"=$1`;
        db.query(sql, [userId.trim()], (err, result) => {
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
              {
                error: true,
                message: "failed to submit document: student doesnt exist",
              },
              404
            );
          }

          // check if school officer exists in database
          const check1 = `SELECT * FROM users WHERE "userId"=$1`;
          // check if course advisor exists in database
          const check2 = `SELECT * FROM users WHERE "userId"=$1`;
          // check if HOD exists in database
          const check3 = `SELECT * FROM users WHERE "userId"=$1`;

          db.query(check1, [schoolOfficer.trim()], (err, data1) => {
            if (err) {
              return util.sendJson(
                res,
                { error: true, message: err.message },
                400
              );
            }

            if (data1.rowCount === 0) {
              return util.sendJson(
                res,
                {
                  error: true,
                  message:
                    "failed to submit document: schoolOfficer doesnt exist",
                },
                404
              );
            }
            // if exist, check if it has a documentPermission of 5
            if (data1.rowCount > 0 && data1.rows[0].documentPermissions !== 5) {
              return util.sendJson(
                res,
                {
                  error: true,
                  message: "the staff you added isnt a school officer.",
                },
                403
              );
            }

            db.query(check2, [courseAdvisor.trim()], (err, data2) => {
              if (err) {
                return util.sendJson(
                  res,
                  { error: true, message: err.message },
                  400
                );
              }

              if (data2.rowCount === 0) {
                return util.sendJson(
                  res,
                  {
                    error: true,
                    message:
                      "failed to submit document: course advisor doesnt exist",
                  },
                  404
                );
              }

              // if exist, check if it has a documentPermission of 5
              if (
                data2.rowCount > 0 &&
                data2.rows[0].documentPermissions !== 6
              ) {
                return util.sendJson(
                  res,
                  {
                    error: true,
                    message: "the staff you added isnt a course advisor.",
                  },
                  403
                );
              }

              db.query(check3, [HOD.trim()], (err, data3) => {
                if (err) {
                  return util.sendJson(
                    res,
                    { error: true, message: err.message },
                    400
                  );
                }

                if (data3.rowCount === 0) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message: "failed to submit document: HOD doesnt exist",
                    },
                    404
                  );
                }

                // if exist, check if it has a documentPermission of 5
                if (
                  data3.rowCount > 0 &&
                  data3.rows[0].documentPermissions !== 2
                ) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message: "the staff you added isnt an H.O.D.",
                    },
                    403
                  );
                }

                // /Continue if all went well

                // check if user submitting document isnt a staff based on the first query above
                if (result.rows[0].type === "staff") {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message:
                        "only students are meant to submit document not staff",
                    },
                    400
                  );
                }

                // check if document which the user/student is trying to submit already exists
                const sql3 = `SELECT * FROM documents WHERE "userId"=$1 AND "documentType"=$2 AND title=$3 AND "courseType"=$4 AND "courseName"=$5`;
                db.query(
                  sql3,
                  [
                    userId.trim(),
                    documentType.trim(),
                    title.trim(),
                    courseType.trim(),
                    courseName.trim(),
                  ],
                  (err, data4) => {
                    if (err) {
                      return util.sendJson(
                        res,
                        { error: true, message: err.message },
                        400
                      );
                    }

                    if (data4.rowCount > 0) {
                      return util.sendJson(
                        res,
                        {
                          error: true,
                          message:
                            "document youre trying to submit already exist.",
                        },
                        200
                      );
                    }

                    // save document in database
                    const fileData = file.data;
                    const id = util.genId();
                    const status = "pending";
                    const date = util.formatDate();

                    const sql4 = `INSERT INTO documents(id,title,"documentType","courseType","courseName","userId","schoolOfficer", "courseAdvisor", "HOD","status","file","created_at") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`;
                    db.query(
                      sql4,
                      [
                        id.trim(),
                        title.trim(),
                        documentType.trim(),
                        courseType.trim(),
                        courseName.trim(),
                        userId.trim(),
                        schoolOfficer,
                        courseAdvisor,
                        HOD,
                        status.trim(),
                        fileData.trim(),
                        date.trim(),
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
                          {
                            error: false,
                            message: "document submitted successfully.",
                          },
                          200
                        );
                      }
                    );
                  }
                );
              });
            });
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  editFYP(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "editing documents requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.title === undefined ||
        payload.userId === undefined ||
        payload.staffId === undefined ||
        payload.groupId === undefined ||
        payload.courseName === undefined ||
        payload.courseType === undefined ||
        payload.changeFile === undefined ||
        payload.documentType === undefined ||
        payload.documentId === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [userId,staffId,groupId,courseName,courseType,title,file,documentType,changeFile,documentId] but got undefined",
          },
          400
        );
      }
      if (payload.title === "") {
        return util.sendJson(
          res,
          { error: true, message: "title cant be empty" },
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
      if (payload.staffId === "") {
        return util.sendJson(
          res,
          { error: true, message: "staffId cant be empty" },
          400
        );
      }
      if (payload.groupId === "") {
        return util.sendJson(
          res,
          { error: true, message: "groupId cant be empty" },
          400
        );
      }
      if (payload.courseType === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseType cant be empty" },
          400
        );
      }
      if (payload.courseName === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseName cant be empty" },
          400
        );
      }
      if (Object.entries(payload.file).length === 0) {
        return util.sendJson(
          res,
          { error: true, message: "file cant be empty" },
          400
        );
      }
      if (payload.documentType === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentType cant be empty" },
          400
        );
      }
      if (payload.documentId === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentId cant be empty" },
          400
        );
      }

      // validate file
      const validFileExt = ["pdf"];
      if (
        payload.changeFile === true &&
        payload.file.type !== undefined &&
        validFileExt.includes(payload.file.type) === false
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message: `invalid file type [ ${payload.file.type} ] valid file [.pdf]`,
          },
          400
        );
      }
      if (
        (payload.changeFile === true && payload.file.data === undefined) ||
        payload.file.data === ""
      ) {
        return util.sendJson(
          res,
          { error: true, message: "expected file data, but got nothing" },
          400
        );
      }

      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE "userId"=$1`;
        db.query(sql, [payload.userId.trim()], (err, result) => {
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
              {
                error: true,
                message: "failed to edit document: student doesnt exist",
              },
              400
            );
          }

          // check if user editting document isnt a staff
          if (result.rows[0].type === "staff") {
            return util.sendJson(
              res,
              {
                error: true,
                message: "only students are meant to edit document not staff",
              },
              400
            );
          }

          // check if staff/cordinator exists
          db.query(sql, [payload.staffId.trim()], (err, data1) => {
            if (err) {
              return util.sendJson(
                res,
                { error: true, message: err.message },
                400
              );
            }

            if (data1.rowCount === 0) {
              return util.sendJson(
                res,
                {
                  error: true,
                  message:
                    "failed to submit document: cordinator doesnt exists",
                },
                404
              );
            }

            // check if user submitting document is a staff
            if (data1.rows[0].type !== "staff") {
              return util.sendJson(
                res,
                { error: true, message: "cordinator added isnt a staff" },
                400
              );
            }

            // check if group exists
            const sql2 = `SELECT * FROM groups WHERE id=$1`;
            db.query(sql2, [payload.groupId.trim()], (err, data2) => {
              if (err) {
                return util.sendJson(
                  res,
                  { error: true, message: err.message },
                  400
                );
              }

              if (data2.rowCount === 0) {
                return util.sendJson(
                  res,
                  {
                    error: true,
                    message: "the group you added doesnt exists.",
                  },
                  404
                );
              }

              // check if student/user trying to editing document for a specific group exist in that group

              const membersIds = data2.rows[0].usersId;

              if (membersIds.includes(payload.userId) === false) {
                return util.sendJson(
                  res,
                  {
                    error: true,
                    message:
                      "fialed: cant edit document for a group you dont belong to.",
                  },
                  403
                );
              }

              // check if document which the group is trying to edit exists
              const sql3 = `SELECT * FROM documents WHERE "groupId"=$1 AND "documentType"=$2 AND "userId"=$3 AND id=$4`;
              db.query(
                sql3,
                [
                  payload.groupId.trim(),
                  payload.documentType.trim(),
                  payload.userId.trim(),
                  payload.documentId.trim(),
                ],
                (err, data3) => {
                  if (err) {
                    return util.sendJson(
                      res,
                      { error: true, message: err.message },
                      400
                    );
                  }

                  if (data3.rowCount === 0) {
                    return util.sendJson(
                      res,
                      {
                        error: true,
                        message: "failed to delete: document not found.",
                      },
                      404
                    );
                  }

                  // save document in database
                  const {
                    title,
                    documentType,
                    documentId,
                    userId,
                    groupId,
                    staffId,
                    courseName,
                    courseType,
                    changeFile,
                  } = payload;
                  const date = util.formatDate();

                  // check if the user is trying to edit file
                  if (changeFile === false) {
                    const sql4 = `UPDATE documents SET title=$1, "documentType"=$2,"courseType"=$3,"courseName"=$4, "userId"=$5 ,"groupId"=$6 ,"staffId"=$7 ,"created_at"=$8 WHERE "groupId"=$9 AND "userId"=$10 AND id=$11`;
                    db.query(
                      sql4,
                      [
                        title.trim(),
                        documentType.trim(),
                        courseType.trim(),
                        courseName.trim(),
                        userId.trim(),
                        groupId.trim(),
                        staffId.trim(),
                        date.trim(),
                        groupId.trim(),
                        userId.trim(),
                        documentId.trim(),
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
                          {
                            error: true,
                            message: "document updated successfully.",
                          },
                          200
                        );
                      }
                    );
                  }

                  if (changeFile === true) {
                    const fileData = payload.file.data;
                    const sql5 = `UPDATE documents SET title=$1, "documentType"=$2,"courseType"=$3,"courseName"=$4, "userId"=$5 ,"groupId"=$6, "staffId"=$7, file=$8 ,"created_at"=$9 WHERE "groupId"=$10 AND "userId"=$11 AND id=$12`;

                    db.query(
                      sql5,
                      [
                        title.trim(),
                        documentType.trim(),
                        courseType.trim(),
                        courseName.trim(),
                        userId.trim(),
                        groupId.trim(),
                        staffId.trim(),
                        fileData.trim(),
                        date.trim(),
                        groupId.trim(),
                        userId.trim(),
                        documentId.trim(),
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
                          {
                            error: true,
                            message: "document updated successfully.",
                          },
                          200
                        );
                      }
                    );
                  }
                }
              );
            });
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  editCF(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "editing documents requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.title === undefined ||
        payload.userId === undefined ||
        payload.staffId === undefined ||
        payload.courseName === undefined ||
        payload.courseType === undefined ||
        payload.changeFile === undefined ||
        payload.documentType === undefined ||
        payload.documentId === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [userId,staffId,courseName,courseType,title,file,documentType] but got undefined",
          },
          400
        );
      }
      if (payload.title === "") {
        return util.sendJson(
          res,
          { error: true, message: "title cant be empty" },
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
      if (payload.staffId === "") {
        return util.sendJson(
          res,
          { error: true, message: "staffId cant be empty" },
          400
        );
      }
      if (payload.courseType === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseType cant be empty" },
          400
        );
      }
      if (payload.courseName === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseName cant be empty" },
          400
        );
      }
      if (Object.entries(payload.file).length === 0) {
        return util.sendJson(
          res,
          { error: true, message: "file cant be empty" },
          400
        );
      }
      if (payload.documentType === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentType cant be empty" },
          400
        );
      }
      if (payload.documentId === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentId cant be empty" },
          400
        );
      }

      // validate file
      const validFileExt = ["pdf"];
      if (
        payload.changeFile === true &&
        payload.file.type !== undefined &&
        validFileExt.includes(payload.file.type) === false
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message: `invalid file type [ ${payload.file.type} ] valid file [.pdf]`,
          },
          400
        );
      }
      if (
        (payload.changeFile === true && payload.file.data === undefined) ||
        payload.file.data === ""
      ) {
        return util.sendJson(
          res,
          { error: true, message: "expected file data, but got nothing" },
          400
        );
      }

      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE "userId"=$1`;
        db.query(sql, [payload.userId.trim()], (err, result) => {
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
              {
                error: true,
                message: "failed to edit document: student doesnt exist",
              },
              400
            );
          }

          // check if user editting document isnt a staff
          if (result.rows[0].type === "staff") {
            return util.sendJson(
              res,
              {
                error: true,
                message: "only students are meant to edit document not staff",
              },
              400
            );
          }

          // check if staff/cordinator exists
          db.query(sql, [payload.staffId.trim()], (err, data1) => {
            if (err) {
              return util.sendJson(
                res,
                { error: true, message: err.message },
                400
              );
            }

            if (data1.rowCount === 0) {
              return util.sendJson(
                res,
                {
                  error: true,
                  message:
                    "failed to submit document: cordinator doesnt exists",
                },
                404
              );
            }

            // check if user submitting document is a staff
            if (data1.rows[0].type !== "staff") {
              return util.sendJson(
                res,
                { error: true, message: "cordinator added isnt a staff" },
                400
              );
            }

            // check if document which the group is trying to edit exists

            const sql3 = `SELECT * FROM documents WHERE id=$1 AND "documentType"=$2 AND "userId"=$3`;
            db.query(
              sql3,
              [
                payload.documentId.trim(),
                payload.documentType.trim(),
                payload.userId.trim(),
              ],
              (err, data3) => {
                if (err) {
                  return util.sendJson(
                    res,
                    { error: true, message: err.message },
                    400
                  );
                }

                if (data3.rowCount === 0) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message: "failed to delete: document not found.",
                    },
                    404
                  );
                }

                // update document in database
                const {
                  title,
                  documentType,
                  documentId,
                  userId,
                  staffId,
                  courseName,
                  courseType,
                  changeFile,
                } = payload;
                const date = util.formatDate();

                // check if the user is trying to edit file
                if (changeFile === false) {
                  const sql4 = `UPDATE documents SET title=$1, "documentType"=$2,"courseType"=$3,"courseName"=$4, "userId"=$5 ,"staffId"=$6 ,"created_at"=$7 WHERE "userId"=$8 AND id=$9`;
                  db.query(
                    sql4,
                    [
                      title.trim(),
                      documentType.trim(),
                      courseType.trim(),
                      courseName.trim(),
                      userId.trim(),
                      staffId.trim(),
                      date.trim(),
                      userId.trim(),
                      documentId.trim(),
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
                        {
                          error: true,
                          message: "document updated successfully.",
                        },
                        200
                      );
                    }
                  );
                }

                if (changeFile === true) {
                  const fileData = payload.file.data;
                  const sql5 = `UPDATE documents SET title=$1, "documentType"=$2,"courseType"=$3,"courseName"=$4, "userId"=$5, "staffId"=$6, file=$7 ,"created_at"=$8 WHERE "userId"=$9 AND id=$10`;

                  db.query(
                    sql5,
                    [
                      title.trim(),
                      documentType.trim(),
                      courseType.trim(),
                      courseName.trim(),
                      userId.trim(),
                      staffId.trim(),
                      fileData.trim(),
                      date.trim(),
                      userId.trim(),
                      documentId.trim(),
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
                        {
                          error: true,
                          message: "document updated successfully.",
                        },
                        200
                      );
                    }
                  );
                }
              }
            );
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  delete(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "deleting documents requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.userId === undefined ||
        payload.documentId === undefined ||
        payload.documentType === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [userId,documentId,documentType] but got undefined",
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
      if (payload.documentType === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentType cant be empty" },
          400
        );
      }
      if (payload.documentId === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentId cant be empty" },
          400
        );
      }

      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE "userId"=$1`;
        db.query(sql, [payload.userId.trim()], (err, result) => {
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
              {
                error: true,
                message: "failed to delete document: student doesnt exist",
              },
              400
            );
          }

          // check if user deleting document isnt a staff
          if (result.rows[0].type === "staff") {
            return util.sendJson(
              res,
              {
                error: true,
                message: "only students are meant to delete document not staff",
              },
              400
            );
          }

          // check if document which the group/user is trying to edit exists
          const sql2 = `SELECT * FROM documents WHERE id=$1 AND "documentType"=$2 AND "userId"=$3`;
          db.query(
            sql2,
            [
              payload.documentId.trim(),
              payload.documentType.trim(),
              payload.userId.trim(),
            ],
            (err, data1) => {
              if (err) {
                return util.sendJson(
                  res,
                  { error: true, message: err.message },
                  400
                );
              }

              if (data1.rowCount === 0) {
                return util.sendJson(
                  res,
                  {
                    error: true,
                    message: "failed to delete: document not found.",
                  },
                  404
                );
              }

              // update document in database
              const { documentType, documentId, userId } = payload;

              //   remove other data in relation with documents table before deleting main document

              const sql3 = `DELETE FROM "docFeedback" WHERE "documentId"=$1`;
              db.query(sql3, [documentId.trim()], (err) => {
                if (err) {
                  return util.sendJson(
                    res,
                    { error: true, message: err.message },
                    400
                  );
                }

                const sql4 = `DELETE FROM documents WHERE id=$1 AND "userId"=$2 AND "documentType"=$3`;
                db.query(
                  sql4,
                  [documentId.trim(), userId.trim(), documentType.trim()],
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
                      {
                        error: false,
                        message: "document deleted successfully.",
                      },
                      200
                    );
                  }
                );
              });
            }
          );
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  docFeedback(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "fetching document feedback requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (payload.documentId === undefined) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [documentId] but got undefined",
          },
          400
        );
      }
      if (payload.documentId === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentId cant be empty" },
          400
        );
      }

      // check if user exist
      try {
        const sql = `
                        SELECT 
                            "docFeedback".id,
                            "docFeedback".note,
                            "docFeedback"."staffId",
                            "docFeedback"."documentId",
                            users."userName"
                        FROM 
                            "docFeedback"
                        INNER JOIN
                            users
                        ON
                            users."userId"="docFeedback"."staffId"
                        WHERE
                            "docFeedback"."documentId"=$1
                        `;
        db.query(sql, [payload.documentId.trim()], async (err, result) => {
          if (err) {
            return util.sendJson(
              res,
              { error: true, message: err.message },
              400
            );
          }

          return util.sendJson(res, { error: false, data: result.rows }, 200);
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  addFeedBack(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "submitting documents feedback requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.note === undefined ||
        payload.staffId === undefined ||
        payload.documentId === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [staffId,documentId,note] but got undefined",
          },
          400
        );
      }
      if (payload.note === "") {
        return util.sendJson(
          res,
          { error: true, message: "note cant be empty" },
          400
        );
      }
      if (payload.staffId === "") {
        return util.sendJson(
          res,
          { error: true, message: "staffId cant be empty" },
          400
        );
      }
      if (payload.courseType === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseType cant be empty" },
          400
        );
      }
      if (payload.courseName === "") {
        return util.sendJson(
          res,
          { error: true, message: "courseName cant be empty" },
          400
        );
      }
      if (payload.documentId === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentId cant be empty" },
          400
        );
      }

      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE "userId"=$1`;
        db.query(sql, [payload.staffId.trim()], (err, result) => {
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
              {
                error: true,
                message:
                  "failed to submit document feedback: user doesnt exist",
              },
              400
            );
          }

          // check if user submitting document isnt a student
          if (result.rows[0].type === "student") {
            return util.sendJson(
              res,
              {
                error: true,
                message:
                  "only staff are meant to add document feedback not student",
              },
              400
            );
          }

          // check if staff/cordinator exists
          db.query(sql, [payload.staffId.trim()], (err, data1) => {
            if (err) {
              return util.sendJson(
                res,
                { error: true, message: err.message },
                400
              );
            }

            if (data1.rowCount === 0) {
              return util.sendJson(
                res,
                {
                  error: true,
                  message:
                    "failed to submit document feedback: cordinator doesnt exists",
                },
                404
              );
            }

            // check if document which the staff is trying to submit already exists
            const sql3 = `SELECT * FROM documents WHERE id=$1`;
            db.query(sql3, [payload.documentId.trim()], (err, data4) => {
              if (err) {
                return util.sendJson(
                  res,
                  { error: true, message: err.message },
                  400
                );
              }

              if (data4.rowCount === 0) {
                return util.sendJson(
                  res,
                  {
                    error: true,
                    message:
                      "document youre trying to submit feedback for doesnt exist.",
                  },
                  200
                );
              }

              // save feedback in database
              const { note, groupId, staffId, documentId } = payload;
              const id = util.genId();
              const date = util.formatDate();

              const sql4 = `INSERT INTO "docFeedback"(id,note,"staffId","documentId","created_at") VALUES($1,$2,$3,$4,$5)`;
              db.query(
                sql4,
                [
                  id.trim(),
                  note.trim(),
                  staffId.trim(),
                  documentId.trim(),
                  date.trim(),
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
                    {
                      error: false,
                      message: "feedback submitted successfully.",
                    },
                    200
                  );
                }
              );
            });
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  deleteFeedback(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "deleting document feedback requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.documentId === undefined ||
        payload.staffId === undefined ||
        payload.feedbackId === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [documentId, staffId, feedbackId] but got undefined",
          },
          400
        );
      }
      if (payload.documentId === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentId cant be empty" },
          400
        );
      }
      if (payload.staffId === "") {
        return util.sendJson(
          res,
          { error: true, message: "staffId cant be empty" },
          400
        );
      }
      if (payload.feedbackId === "") {
        return util.sendJson(
          res,
          { error: true, message: "feedbackId cant be empty" },
          400
        );
      }

      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE "userId"=$1`;
        db.query(sql, [payload.staffId.trim()], (err, result) => {
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
              {
                error: true,
                message:
                  "failed to delete document feedback: user doesnt exist",
              },
              400
            );
          }

          // check if user deleting document isnt a staff
          if (result.rows[0].type === "student") {
            return util.sendJson(
              res,
              {
                error: true,
                message:
                  "only staff are meant to delete document feedback not student",
              },
              403
            );
          }

          // check if document which the staff is trying to delete exists
          const sql2 = `SELECT * FROM documents WHERE id=$1`;
          db.query(sql2, [payload.documentId.trim()], (err, data1) => {
            if (err) {
              return util.sendJson(
                res,
                { error: true, message: err.message },
                400
              );
            }

            if (data1.rowCount === 0) {
              return util.sendJson(
                res,
                {
                  error: true,
                  message: "failed to delete feedback: document doesnt exist.",
                },
                404
              );
            }

            // update document in database
            const { feedbackId, documentId, staffId } = payload;

            // check if feedback exist before deletting
            const q3 = `SELECT * FROM "docFeedback" WHERE id=$1 AND "staffId"=$2`;
            db.query(q3, [feedbackId.trim(), staffId.trim()], (err, data2) => {
              if (err) {
                return util.sendJson(
                  res,
                  { error: true, message: err.message },
                  400
                );
              }

              if (data2.rowCount === 0) {
                return util.sendJson(
                  res,
                  {
                    error: true,
                    message: "failed to delete: feedback doesnt exist.",
                  },
                  404
                );
              }

              const sql3 = `DELETE FROM "docFeedback" WHERE id=$1 AND "staffId"=$2 AND "documentId"=$3`;
              db.query(
                sql3,
                [feedbackId.trim(), staffId.trim(), documentId.trim()],
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
                    {
                      error: false,
                      message: "document feedback deleted successfully.",
                    },
                    200
                  );
                }
              );
            });
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  approveDocument(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "approving documents requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.staffId === undefined ||
        payload.documentId === undefined ||
        payload.documentType === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [staffId,documentId, documentType] but got undefined",
          },
          400
        );
      }

      if (payload.staffId === "") {
        return util.sendJson(
          res,
          { error: true, message: "staffId cant be empty" },
          400
        );
      }
      if (payload.documentId === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentId cant be empty" },
          400
        );
      }
      if (payload.documentType === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentType cant be empty" },
          400
        );
      }

      const validType = ["CF", "FYP"];

      if (!validType.includes(payload.documentType)) {
        return util.sendJson(
          res,
          {
            error: true,
            message: `documentType [${payload.documentType}] is invalid`,
          },
          400
        );
      }

      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE "userId"=$1`;
        db.query(sql, [payload.staffId.trim()], (err, result) => {
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
              {
                error: true,
                message: "failed to approve document: user doesnt exist",
              },
              400
            );
          }

          // check if user submitting document isnt a student
          if (result.rows[0].type === "student") {
            return util.sendJson(
              res,
              {
                error: true,
                message: "only staff are meant to approve document not student",
              },
              403
            );
          }

          // check if staff/cordinator exists
          db.query(sql, [payload.staffId.trim()], (err, data1) => {
            if (err) {
              return util.sendJson(
                res,
                { error: true, message: err.message },
                400
              );
            }

            if (data1.rowCount === 0) {
              return util.sendJson(
                res,
                {
                  error: true,
                  message:
                    "failed to approve document: cordinator doesnt exists",
                },
                404
              );
            }

            // check if document exists
            const sql3 = `SELECT * FROM documents WHERE id=$1 AND "documentType"=$2`;
            db.query(
              sql3,
              [payload.documentId.trim(), payload.documentType.trim()],
              (err, data4) => {
                if (err) {
                  return util.sendJson(
                    res,
                    { error: true, message: err.message },
                    400
                  );
                }

                if (data4.rowCount === 0) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message: "document youre trying to approve doesnt exist.",
                    },
                    404
                  );
                }

                const { documentId, documentType, staffId } = payload;

                // make sure staff who wanna approve document, that document must be assgined to them
                if (data4.rows[0].staffId !== staffId) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message:
                        "you dont have permission to approve document which wasnt posted in behalf of you.",
                    },
                    403
                  );
                }

                // check if staff has permission to approve document
                if (
                  data1.rows[0].documentPermissions === 1 &&
                  documentType === "CF"
                ) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message:
                        "you dont have permission to approve course form document.",
                    },
                    403
                  );
                }
                const status = "approved";

                const sql4 = `UPDATE documents SET status=$1 WHERE id=$2 AND "documentType"=$3`;
                db.query(
                  sql4,
                  [status, documentId.trim(), documentType.trim()],
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
                      {
                        error: false,
                        message: "Document approved successfully.",
                      },
                      200
                    );
                  }
                );
              }
            );
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }

  rejectDocument(res, payload) {
    if (res === "" || res === undefined || res === null) {
      return "rejecting documents requires a valid {res} object but got none";
    }

    if (payload && Object.entries(payload).length > 0) {
      if (
        payload.staffId === undefined ||
        payload.documentId === undefined ||
        payload.documentType === undefined
      ) {
        return util.sendJson(
          res,
          {
            error: true,
            message:
              "payload requires a valid fields [staffId,documentId, documentType] but got undefined",
          },
          400
        );
      }

      if (payload.staffId === "") {
        return util.sendJson(
          res,
          { error: true, message: "staffId cant be empty" },
          400
        );
      }
      if (payload.documentId === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentId cant be empty" },
          400
        );
      }
      if (payload.documentType === "") {
        return util.sendJson(
          res,
          { error: true, message: "documentType cant be empty" },
          400
        );
      }

      const validType = ["CF", "FYP"];

      if (!validType.includes(payload.documentType)) {
        return util.sendJson(
          res,
          {
            error: true,
            message: `documentType [${payload.documentType}] is invalid`,
          },
          400
        );
      }

      // check if user exist
      try {
        const sql = `SELECT * FROM users WHERE "userId"=$1`;
        db.query(sql, [payload.staffId.trim()], (err, result) => {
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
              {
                error: true,
                message: "failed to reject document: user doesnt exist",
              },
              400
            );
          }

          // check if user submitting document isnt a student
          if (result.rows[0].type === "student") {
            return util.sendJson(
              res,
              {
                error: true,
                message: "only staff are meant to reject document not student",
              },
              403
            );
          }

          // check if staff/cordinator exists
          db.query(sql, [payload.staffId.trim()], (err, data1) => {
            if (err) {
              return util.sendJson(
                res,
                { error: true, message: err.message },
                400
              );
            }

            if (data1.rowCount === 0) {
              return util.sendJson(
                res,
                {
                  error: true,
                  message:
                    "failed to reject document: cordinator doesnt exists",
                },
                404
              );
            }

            // check if document exists
            const sql3 = `SELECT * FROM documents WHERE id=$1 AND "documentType"=$2`;
            db.query(
              sql3,
              [payload.documentId.trim(), payload.documentType.trim()],
              (err, data4) => {
                if (err) {
                  return util.sendJson(
                    res,
                    { error: true, message: err.message },
                    400
                  );
                }

                if (data4.rowCount === 0) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message: "document youre trying to approve doesnt exist.",
                    },
                    404
                  );
                }

                // save feedback in database
                const { documentId, documentType, staffId } = payload;

                // make sure staff who wanna approve document, that document must be assgined to them
                if (data4.rows[0].staffId !== staffId) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message:
                        "you dont have permission to reject document which wasnt posted in behalf of you.",
                    },
                    403
                  );
                }

                // check if staff has permission to approve document
                if (
                  data1.rows[0].documentPermissions === 1 &&
                  documentType === "CF"
                ) {
                  return util.sendJson(
                    res,
                    {
                      error: true,
                      message:
                        "you dont have permission to reject course form document.",
                    },
                    403
                  );
                }

                const status = "rejected";

                const sql4 = `UPDATE documents SET status=$1 WHERE id=$2 AND "documentType"=$3`;
                db.query(
                  sql4,
                  [status, documentId.trim(), documentType.trim()],
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
                      {
                        error: false,
                        message: "Document rejected successfully.",
                      },
                      200
                    );
                  }
                );
              }
            );
          });
        });
      } catch (err) {
        console.log(err);
        return util.sendJson(res, { error: true, message: err.message }, 500);
      }
    }
  }
}

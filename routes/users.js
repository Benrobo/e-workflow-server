import { router, util } from "../helpers/global.js";
import { Users } from "../services/users.js";
import API_ROUTE from "../api-routes/index.js";
import { checkAuth } from "../middlewares/auth.js";

const users = new Users();

export const getUsers = router.post(API_ROUTE.getAllUsers, async (req, res) => {
  try {
    return users.all(res);
  } catch (err) {
    return util.sendJson(res, { error: true, message: err.message }, 500);
  }
});

export const getUsersById = router.post(
  API_ROUTE.getUsersById,
  checkAuth,
  async (req, res) => {
    try {
      let data = req.body;
      if (
        !data ||
        data === "" ||
        typeof data === "function" ||
        typeof data === "string" ||
        data === null
      ) {
        return util.sendJson(
          res,
          { message: "failed: payload is required" },
          400
        );
      }
      if (Object.entries(data).length === 0) {
        return util.sendJson(
          res,
          {
            error: true,
            message: "getting of users required a valid payload but got none",
          },
          404
        );
      }

      return users.byId(res, data);
    } catch (err) {
      return util.sendJson(res, { error: true, message: err.message }, 500);
    }
  }
);

export const updateAccount = router.put(
  API_ROUTE.updateAccount,
  checkAuth,
  async (req, res) => {
    try {
      let data = req.body;
      if (
        !data ||
        data === "" ||
        typeof data === "function" ||
        typeof data === "string" ||
        data === null
      ) {
        return util.sendJson(
          res,
          { message: "failed: payload is required" },
          400
        );
      }
      if (Object.entries(data).length === 0) {
        return util.sendJson(
          res,
          {
            error: true,
            message: "updating account requires a valid payload but got none",
          },
          404
        );
      }

      return users.updateAccount(res, data);
    } catch (err) {
      return util.sendJson(res, { error: true, message: err.message }, 500);
    }
  }
);

export const deleteAccount = router.delete(
  API_ROUTE.deleteAccount,
  checkAuth,
  async (req, res) => {
    try {
      let data = req.body;
      if (
        !data ||
        data === "" ||
        typeof data === "function" ||
        typeof data === "string" ||
        data === null
      ) {
        return util.sendJson(
          res,
          { message: "failed: payload is required" },
          400
        );
      }
      if (Object.entries(data).length === 0) {
        return util.sendJson(
          res,
          {
            error: true,
            message: "deleting account requires a valid payload but got none",
          },
          404
        );
      }

      return users.deleteAccount(res, data);
    } catch (err) {
      return util.sendJson(res, { error: true, message: err.message }, 500);
    }
  }
);

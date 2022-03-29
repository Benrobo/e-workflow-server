import dotenv from "dotenv";
import { app, PATH, FS, __dirname } from "./helpers/global.js";
import bodyParser from "body-parser";
import cors from "cors";
import { registerUser, registerAdmin, logInUsers } from "./routes/auth.js";
import {
  deleteAccount,
  getUsers,
  getUsersById,
  updateAccount,
} from "./routes/users.js";
import {
  createToken,
  getAllToken,
  deleteSpecificToken,
} from "./routes/tokens.js";
import { approveRegRequest, rejectRegRequest } from "./routes/grantRequest.js";
import { setPermission } from "./routes/permissions.js";
import { mailSender } from "./routes/sendMail.js";
import {
  getGroupsByUserId,
  createGroup,
  addMembers,
  editGroup,
  deleteGroupMembers,
  deleteGroup,
  getGroupMembers,
} from "./routes/groupsRoute.js";
import {
  getAllDocs,
  getDocsId,
  getDocsByUserId,
  addDocument,
  editDocument,
  deleteDocument,
  addFeedback,
  getDocFeedback,
  approveDocument,
  rejectDocument,
  deleteFeedback,
} from "./routes/documentsRoute.js";
import { addSignature, deleteSignature } from "./routes/signature.js"
import { deleteNotification, getNotification, updateNotification } from "./routes/notification.js";

dotenv.config();
// main middlewares
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));

// routes middleware

app.get("/", (req, res) => {
  let sendData = [];
  // read the package.json file
  FS.readFile(PATH.join(__dirname, "/package.json"), (err, data) => {
    if (err) {
      return req.status(400).json(err);
    }
    let file = JSON.parse(data);

    sendData.push(file);

    return res.status(200).json(sendData);
  });
});

// authentication
app.use(registerUser);
app.use(registerAdmin);
app.use(logInUsers);

// users
app.use(getUsers);
app.use(getUsersById);
app.use(updateAccount);
app.use(deleteAccount);

// Tokens
app.use(createToken);
app.use(getAllToken);
app.use(deleteSpecificToken);
// staff stuff
app.use(mailSender);
app.use(approveRegRequest);
app.use(rejectRegRequest);
// staffs permissions
app.use(setPermission);
// student groups
app.use(getGroupsByUserId);
app.use(getGroupMembers);
app.use(createGroup);
app.use(addMembers);
app.use(editGroup);
app.use(deleteGroupMembers);
app.use(deleteGroup);

// documents
app.use(getAllDocs);
app.use(getDocsId);
app.use(getDocsByUserId);
app.use(addDocument);
app.use(addFeedback);
app.use(getDocFeedback);
app.use(deleteFeedback);
app.use(approveDocument);
app.use(rejectDocument);
app.use(editDocument);
app.use(deleteDocument);
// app.use(addDocument);

// Signature
app.use(addSignature)
app.use(deleteSignature)

// Notification
app.use(getNotification)
app.use(updateNotification)
app.use(deleteNotification)

// listen on a htp port to run and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT);

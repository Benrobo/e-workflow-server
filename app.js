import dotenv from "dotenv"
import { app, PATH, FS, __dirname } from "./helpers/global.js"
import bodyParser from "body-parser"
import cors from "cors"
import { registerUser, registerAdmin, logInUsers } from "./routes/auth.js"
import createCode from "./routes/generateCode.js"
import { approveRegRequest, rejectRegRequest } from "./routes/grantRequest.js"
import { mailSender } from "./routes/sendMail.js"
import { createGroup, addMembers, editGroup, deleteGroupMembers, deleteGroup } from "./routes/groupsRoute.js"
import { addDocument } from "./routes/documentsRoute.js"
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

app.use(registerUser);
app.use(registerAdmin);
app.use(logInUsers);
app.use(createCode);
app.use(mailSender);
app.use(approveRegRequest);
app.use(rejectRegRequest);
app.use(createGroup);
app.use(addMembers);
app.use(editGroup);
app.use(deleteGroupMembers);
app.use(deleteGroup);

// documents
app.use(addDocument);



// listen on a htp port to run and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT);

### E-workflow Logic

-------

This contain the backend logic of `e-workflow` client app.

This system is made up of two different users having different roles
`staffs` (this can also be an admin) and `students`.

The system can have multiple admins having level of permissions to take certain actions.

Before allowing other `users` to get registered into the system, staff are sent a one time `code` which would be used when creating a new account. If the code expires, request would lead to failure making it more secure from allowing fake users signing up as a staff.

The admin would then be able to `grant` staff request or `reject` request.

#### Permissions
This are the list of permissions present in the system

- `Admin`
  - [x] Grant other staffs requests when registering.
  - [x] View all staffs within the system.
  - [x] He would be able to set course form reviews for individual registered staffs.
  - [x] Assign roles: he/she would be able to assign roles to individual users (`users -> admin`, `admin -> user`)
  - [x] View all registered students.

- `Staffs`
    - [x] Notifications
    - [x] He/she would be able to view submitted `documents` specifically to the staff permissions.
    - [x] he/she would be able to view all `rejected/approved/pending` form reviews.  

- `Students`
  - [x] Notifications
  - [x] Collaboration `video / audio`. students would be able to have realtime audio / video collaborations.
  - [x] This enable student to submit different documents.  
  - [x] He/she would be able to view submitted `documents` specifically to the staff permissions.
  - [x] he/she would be able to view all `rejected/approved/pending` form reviews.  


------

### Tasks and Features to be added.

This are the curated list of backend logic yet to be implemented.

- [x] Authication.
  - [x] register admin.
  - [x] generate ontime code for each user who wanna get them selves registered into the system.
  - [x] send the one time code to the `staff` mail address using `node_mailer`.
  - [x] validate staff request data sent from client including the code.
  - [x] save staff data in `postgresqlDB`
- [x] Authorization.
  - [x] generate a `jwt_refresh_token` && `jwt_acccess_token` containing users details.
  - [x] send generated token to client which would then be used in `route` protection.
- [x] Groups
  - [ ] Students are able to create different groups for documents submission.
- [x] Documents.
  - [ ] Enable submission of documents from `students groups`
  - [ ] Set `staff` reviews permissions.
  - [ ] Each submitted documents would be able to have feedbacks from individual staffs.
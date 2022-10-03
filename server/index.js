/* ==== server/index.js ==== */
import './database.js';
import {Server} from 'core';
import deskController from "./controllers/deskController.js";
import userController from "./controllers/userController.js";

const app = new Server();
const port = process.env.PORT || 3000;

app.use(Server.json);
app.use(Server.logger);
app.use(Server.public);

app
    .path('/users')
    .get(userController.getAllUsers)
    .post(userController.createUser);

app
    .path('/users/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

app
    .path('/desks')
    .get(deskController.getAllDesks)
    .post(deskController.createDesk);

app
    .path('/desks/:id')
    .get(deskController.getDesk)
    .patch(deskController.updateDesk)
    .delete(deskController.deleteDesk);

app.listen(port, () => {
    console.log('Server is running at port', port);
});

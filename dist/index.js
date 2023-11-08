"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = require("jsonwebtoken");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
const port = 4000;
let jwtSecretKey;
if (process.env.SECRET_KEY && process.env.SECRET_KEY.length > 0) {
    jwtSecretKey = process.env.SECRET_KEY;
}
else {
    throw new Error("SECRET_KEY not set in .env");
}
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.use((0, cookie_parser_1.default)());
const db = [
    { username: "alice", password: process.env.ALICE_PASS, role: "admin" },
    { username: "bob", password: process.env.BOB_PASS, role: "member" },
];
app.get("/", (_, res) => {
    res.send(`
    <h1>Welcome</h1>
    <a href="/login">Login</a>
    <br />
    <a href="/members">Members Zone</a>
    <br />
    <a href="/admin">Admins Zone</a>
    <br />
    <a href="/logout">Logout</a>
    `);
});
app.get("/login", (_, res) => {
    res.send(`
    <h1>Login</h1>
    <form action="/logmein" method="post">
        <label for="login">Login:</label>
        <input type="text" name="login"><br><br>
        <label for="password">Password:</label>
        <input type="password" name="password"><br><br>
        <input type="submit" value="Submit">
    </form>
    `);
});
app.post("/logmein", (req, res) => {
    console.log(req.body);
    const userFromDB = db.find((el) => el.username === req.body.login);
    if (userFromDB && userFromDB.password === req.body.password) {
        const token = (0, jsonwebtoken_1.sign)({ user: userFromDB.username, role: userFromDB.role }, jwtSecretKey);
        res
            .cookie("jwt", "Bearer " + token)
            .send(`<p>Logged in as ${userFromDB.username}</p><br/><a href="/">back</a>`);
    }
    else {
        res.send(`<p>Bad Credentials</p>`);
    }
});
app.get("/members", (req, res) => {
    console.log(req.cookies);
    try {
        const tokenFromUser = (0, jsonwebtoken_1.verify)(req.cookies.jwt.split("Bearer ")[1], jwtSecretKey);
        console.log("verified token", tokenFromUser);
        res.send(`
        <h1>Welcome to the members zone</h1>
        <p>Your username: ${tokenFromUser.user}</p>
        <p>Your role: ${tokenFromUser.role}</p>
        <a href="/">back</a>
      `);
    }
    catch (err) {
        res.send(`<p>Bad Credentials</p><a href="/">back</a>`);
    }
});
app.get("/admin", (req, res) => {
    console.log(req.cookies);
    try {
        const tokenFromUser = (0, jsonwebtoken_1.verify)(req.cookies.jwt, jwtSecretKey);
        console.log("verified token", tokenFromUser);
        if (tokenFromUser.role === "admin") {
            res.send(`
          <h1>Welcome to the admin zone</h1>
          <p>Your username: ${tokenFromUser.user}</p>
          <p>Your role: ${tokenFromUser.role}</p>
          <a href="/">back</a>
        `);
        }
        else {
            res.send(`
          <h1>You are not admin</h1>
          <a href="/">back</a>
        `);
        }
    }
    catch (err) {
        res.send(`<p>Bad Credentials</p><a href="/">back</a>`);
    }
});
app.get("/logout", (_, res) => {
    res.clearCookie("jwt");
    res.send(`<p>You are now logged out</p><a href="/">back</a>`);
});
app.listen(port, () => {
    console.log(`App started http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map
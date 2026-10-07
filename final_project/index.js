const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Parse JSON and form bodies so endpoints can read input from req.body.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Customer routes share a session that stores the login token and username.
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }))

// Protect customer review endpoints: require a session token and verify its signature/expiry.
// Return 403 when login is missing or verification fails; otherwise continue to the route.
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        // Verification returns the decoded token payload, which is attached to the request.
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }

});

const PORT = 5000;

// Mount login/review routes under /customer and public catalog routes at the root.
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start listening on port 5000 and log once the server is ready to accept requests.
app.listen(PORT, () => console.log("Server is running"));

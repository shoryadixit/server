import jwt from "jsonwebtoken";

export async function isAuthenticated(req, res, next) {
    const token = req.session?.token;
    if (token) {
        try {
            console.log(jwt.verify(token, process.env.JWT_SECRET));
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            if (decode.id) {
                req.user = decode;
                next();
            } else {
                res.status(401).json({
                    status: 401, message: "Unauthorized - Invalid Token", success: false, data: {},
                });
            }
        } catch (err) {
            res.status(401).json({
                status: 401, message: "Unauthorized - Invalid Token", success: false, data: {},
            });
        }
    } else {
        res.status(401).json({
            status: 401, message: "Unauthorized - No Token Provided", success: false, data: {},
        });
    }
}
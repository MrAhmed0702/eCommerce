import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const secretKey = process.env.SECRET_KEY;

//Creating token
const createToken = async (user) => {
    try {
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
            },
            secretKey,
            {
                expiresIn: "10d",
                issuer: "eCommerce-backend",
                algorithm: "HS256",
            }
        )

        return token;
    } catch (error) {
        throw error;
    }
}

//Verifying token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, secretKey);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


export {createToken, verifyToken};
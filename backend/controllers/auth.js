import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import helpers from "../utils/helpers.js";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage" // This is a specific value for web clients to handle the code exchange
);

const googleLogin = async (request, response, next) => {
  try {
    const { code } = request.body;

    // 1. Exchange authorization code for tokens
    const { tokens } = await client.getToken(code);
    const idToken = tokens.id_token;

    // 2. Verify the ID token and get user payload
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // 3. Find or create a user in your database
    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      // If no user with that googleId, check if one exists with that email
      user = await User.findOne({ email: payload.email });

      if (user) {
        // If user exists with email, link the googleId
        user.googleId = payload.sub;
        await user.save();
      } else {
        // If no user found, create a new one
        const baseUsername = payload.email.split("@")[0];
        const username = await helpers.generateUniqueUsername(baseUsername);

        user = new User({
          googleId: payload.sub,
          email: payload.email,
          name: payload.name,
          username,
        });
        await user.save();
      }
    }

    // 4. Create your own JWT and send it back
    const token = helpers.generateToken(user);

    response
      .status(200)
      .send({ token, username: user.username, name: user.name });
  } catch (error) {
    next(error);
  }
};

export default { googleLogin };

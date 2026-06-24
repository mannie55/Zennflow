import test from "node:test";
import assert from "node:assert";
import jwt from "jsonwebtoken";
import helpers from "../utils/helpers.js";

test("generateToken creates a valid JWT token", () => {
  process.env.SECRET = "test_secret";
  const user = { username: "tester", _id: "123456" };
  const token = helpers.generateToken(user);

  assert.ok(token);
  const decoded = jwt.verify(token, "test_secret");
  assert.strictEqual(decoded.username, "tester");
  assert.strictEqual(decoded.id, "123456");
});

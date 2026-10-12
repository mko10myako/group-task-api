import "dotenv/config";
import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import app from "../src/app.js";
import User from "../src/models/user.model.js";

let testUser;
let validToken;

before(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  testUser = await User.create({
    name: "Test User",
    email: `test-${Date.now()}@example.com`,
    password: "password123",
  });

  validToken = jwt.sign(
    { userId: testUser._id },
    process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );
});

after(async () => {
  if (testUser) {
    await User.findByIdAndDelete(testUser._id);
  }

  await mongoose.disconnect();
});

test("valid token returns current user", async () => {
  const response = await request(app)
    .get("/api/v1/auth/me")
    .set("Authorization", `Bearer ${validToken}`);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.user.email, testUser.email);
  assert.equal(response.body.user.password, undefined);
});

test("missing token returns 401", async () => {
  const response = await request(app).get("/api/v1/auth/me");

  assert.equal(response.statusCode, 401);
  assert.equal(
    response.body.message,
    "Authentication token is required."
  );
});

test("invalid token returns 401", async () => {
  const response = await request(app)
    .get("/api/v1/auth/me")
    .set("Authorization", "Bearer junk-token");

  assert.equal(response.statusCode, 401);
  assert.equal(
    response.body.message,
    "Invalid or expired token."
  );
});
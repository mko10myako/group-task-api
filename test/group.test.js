import "dotenv/config";
import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import app from "../src/app.js";
import User from "../src/models/user.model.js";
import Group from "../src/models/group.model.js";

let testUser;
let validToken;
let createdGroup;

before(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  testUser = await User.create({
    name: "Group Test User",
    email: `group-test-${Date.now()}@example.com`,
    password: "password123",
  });

  validToken = jwt.sign(
    { userId: testUser._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );
});

test("valid token creates a group", async () => {
  const response = await request(app)
    .post("/api/v1/groups")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      name: "Backend Team",
      description: "Group creation test",
    });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.group.name, "Backend Team");
  assert.equal(response.body.group.description, "Group creation test");

  createdGroup = response.body.group;

  assert.equal(
  response.body.group.owner,
  testUser._id.toString()
);

assert.equal(response.body.group.members.length, 1);

assert.equal(
  response.body.group.members[0].user,
  testUser._id.toString()
);

assert.equal(
  response.body.group.members[0].role,
  "owner"
);

assert.deepEqual(
  Object.keys(response.body.group).sort(),
  [
    "__v",
    "_id",
    "createdAt",
    "description",
    "members",
    "name",
    "owner",
    "updatedAt",
  ].sort()
);
});

test("groups: missing name returns 400", async () => {
  const response = await request(app)
    .post("/api/v1/groups")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      description: "A group without a name",
    });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
  
  assert.equal(
  response.body.message,
  "Group name is required."
);

});

test("groups: missing token returns 401", async () => {
  const response = await request(app)
    .post("/api/v1/groups")
    .send({
      name: "Unauthorized Group",
      description: "This must not be created",
    });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.success, false);
  assert.equal(
    response.body.message,
    "Authentication token is required."
  );
});

after(async () => {
  if (createdGroup?._id) {
    await Group.findByIdAndDelete(createdGroup._id);
  }

  if (testUser?._id) {
    await User.findByIdAndDelete(testUser._id);
  }

  await mongoose.disconnect();
});


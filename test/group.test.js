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
let nonMemberUser;
let nonMemberToken;
let memberUser;
let memberToken;

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

  await User.deleteOne({ email: "nonmember@example.com" });
  nonMemberUser = await User.create({
    name: "Nonmember User",
    email: "nonmember@example.com",
    password: "password123"
  });

nonMemberToken = jwt.sign(
  { userId: nonMemberUser._id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);

await User.deleteOne({ email: "member@example.com" });

memberUser = await User.create({
  name: "Member User",
  email: "member@example.com",
  password: "password123",
});

memberToken = jwt.sign(
  { userId: memberUser._id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
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

test("groups: valid group ID returns one group" , async () => {
  const response = await request(app)
    .get(`/api/v1/groups/${createdGroup._id}`)
    .set("Authorization", `Bearer ${validToken}`)

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.group._id, createdGroup._id);
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

test("groups: malformed group ID returns 400", async () => {
  const response = await request(app)
    .get("/api/v1/groups/not-a-valid-id")
    .set("Authorization", `Bearer ${validToken}`);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
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

test("groups: valid but nonexistent group ID returns 404", async () => {
  const missingGroupId = new mongoose.Types.ObjectId().toString();

  const response = await request(app)
  .get(`/api/v1/groups/${missingGroupId}`)
  .set("Authorization" , `Bearer ${validToken}`);

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Group not found.");

});

test("groups: a logged-in nonmember requesting an existing group receives 404 so the API does not reveal that the group exists", async () => {
  const response = await request(app)
    .get(`/api/v1/groups/${createdGroup._id}`)
    .set("Authorization", `Bearer ${nonMemberToken}`);

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Group not found.");
});

test("groups: a member who is not the owner can get the group", async () => {
  await Group.findByIdAndUpdate(createdGroup._id, {
    $push: {
      members: {
        user: memberUser._id,
        role: "member",
      },
    },
  });

  const response = await request(app)
    .get(`/api/v1/groups/${createdGroup._id}`)
    .set("Authorization", `Bearer ${memberToken}`);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.group._id, createdGroup._id);
});

after(async () => {
  if (memberUser?._id) {
    await User.findByIdAndDelete(memberUser._id);
  }
  if (createdGroup?._id) {
    await Group.findByIdAndDelete(createdGroup._id);
  }

  if (nonMemberUser?._id) {
    await User.findByIdAndDelete(nonMemberUser._id);
  }

  if (testUser?._id) {
    await User.findByIdAndDelete(testUser._id);
  }

  await mongoose.disconnect();
});


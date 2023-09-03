const express = require("express");
const router = express.Router();
const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const { getToken } = require("../utils/helpers");

// Route to register a user
router.post("/register", async (req, res) => {
	const { email, password, firstName, lastName, username, role } = req.body;

	const user = await UserModel.findOne({
		$or: [{ email: email }, { username: username }],
	});
    
	if (user) {
		return res.status(403).json({ err: "User already exists" });
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const newUserData = {
		email,
		password: hashedPassword,
		firstName,
		lastName,
		username,
		role,
	};
	const newUser = await UserModel.create(newUserData);

	const token = await getToken(email, newUser);

	const userToReturn = { ...newUser.toJSON(), token };
	delete userToReturn.password;
	return res.status(200).json(userToReturn);
});

// Route to login a user
router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	const user = await UserModel.findOne({ email: email });
	if (!user) {
		return res.status(403).json({ err: "User does not exist" });
	}

	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		return res.status(403).json({ err: "Invalid credentials" });
	}

	const token = await getToken(email, user);

	const userToReturn = { ...user.toJSON(), token };
	delete userToReturn.password;
	return res.status(200).json(userToReturn);
});

module.exports = router;

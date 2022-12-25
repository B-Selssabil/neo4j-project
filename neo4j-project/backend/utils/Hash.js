const bcrypt = require("bcryptjs");

exports.encryptPassword = async (enteredPassword) => {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(enteredPassword, salt);

  return password;
};

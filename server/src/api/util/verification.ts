const bcrypt = require('bcrypt');

// Generates a random numeric code with the
// following format: XXX-XXX-XXX
function generateCode() {
  let code = '';
  for (let i = 0; i < 9; i++) {
    code += Math.floor(Math.random() * 10);
    if (i === 2 || i === 5) {
      code += '-';
    }
  }
  return code;
}

async function generateVerification() {
  const saltRounds = 10;

  // This code is to be given to
  // the user at the moment of creation
  const code = generateCode();

  // This hashed code is to be stored on the database
  // for later authentication (sorta)
  const hashedCode = await new Promise((resolve, reject) => {
    bcrypt.hash(code, saltRounds, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });

  return [code, hashedCode];
}

async function verifyCode(verificationHash, verificationCode) {
  const verified = await new Promise((resolve, reject) => {
    bcrypt.compare(verificationCode, verificationHash, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
  return verified;
}

exports.generateVerification = generateVerification;
exports.verifyCode = verifyCode;

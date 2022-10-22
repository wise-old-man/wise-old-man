import { compare, hash } from 'bcrypt';

/**
 * Generates a random numeric code with the following format: XXX-XXX-XXX
 */
function generateCode(): string {
  let code = '';

  for (let i = 0; i < 9; i++) {
    code += Math.floor(Math.random() * 10);
    if (i === 2 || i === 5) code += '-';
  }

  return code;
}

/**
 * Generates a code/hash pair.
 */
async function generateVerification(): Promise<[string, string]> {
  const saltRounds = 10;

  // This code is to be given to
  // the user at the moment of creation
  const code = generateCode();

  // This hashed code is to be stored on the database
  // for later authentication (sorta)
  const hashedCode: string = await new Promise((resolve, reject) => {
    hash(code, saltRounds, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });

  return [code, hashedCode];
}

/**
 * Checks if a given hash matches a given code.
 */
async function verifyCode(hash: string, code: string): Promise<boolean> {
  const verified = await new Promise((resolve, reject) => {
    compare(code, hash, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });

  return !!verified;
}

export { generateVerification, verifyCode };

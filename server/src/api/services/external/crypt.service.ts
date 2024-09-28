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
export async function generateVerification(): Promise<[string, string]> {
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
export async function verifyCode(hash: string, code: string): Promise<boolean> {
  const trimmedCode = code.trim();

  const verified = await new Promise((resolve, reject) => {
    compare(trimmedCode, hash, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });

  if (verified) {
    return true;
  }

  /**
   * Sometimes users might input the code without the dashes,
   * this double checks by re-inserting the dashes and trying again.
   */
  if (trimmedCode.length === 9) {
    return verifyCode(
      hash,
      trimmedCode.slice(0, 3) + '-' + trimmedCode.slice(3, 6) + '-' + trimmedCode.slice(6, 9)
    );
  }

  return false;
}

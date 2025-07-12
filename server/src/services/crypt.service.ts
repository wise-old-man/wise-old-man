import { AsyncResult, complete, errored, fromPromise, isComplete, isErrored } from '@attio/fetchable';
import { compare, hash } from 'bcrypt';

/**
 * Generates a random numeric code with the following format: XXX-XXX-XXX
 */
function generateVerificationCode() {
  let code = '';

  for (let i = 0; i < 9; i++) {
    code += Math.floor(Math.random() * 10);
    if (i === 2 || i === 5) code += '-';
  }

  return code;
}

export async function generateVerification(): AsyncResult<
  { code: string; hash: string },
  { code: 'FAILED_TO_HASH'; subError: unknown }
> {
  const saltRounds = 10;

  const code = generateVerificationCode();

  const hashResult = await fromPromise(
    new Promise((resolve, reject) => {
      hash(code, saltRounds, (err, hash) => {
        if (err) reject(err);
        resolve(hash);
      });
    })
  );

  if (isErrored(hashResult)) {
    return errored({
      code: 'FAILED_TO_HASH',
      subError: hashResult.error
    });
  }

  return complete({
    code,
    hash: hashResult.value as string
  });
}

export async function verifyCode(
  hash: string,
  code: string
): AsyncResult<true, { code: 'CODE_DOES_NOT_MATCH' }> {
  const trimmedCode = code.trim();

  const verificationResult = await fromPromise(
    new Promise((resolve, reject) => {
      compare(trimmedCode, hash, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    })
  );

  if (isComplete(verificationResult) && verificationResult.value === true) {
    return complete(true);
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

  return errored({ code: 'CODE_DOES_NOT_MATCH' });
}

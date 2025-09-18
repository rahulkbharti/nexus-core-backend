function generateStrongPassword(length: number) {
  // 1. Set a minimum length for security.
  if (length < 8) {
    return "Error: Password length must be at least 8 characters.";
  }
  // 2. Define all possible characters to be used in the password.
  const allChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let password = "";
  // 3. Loop 'length' times, each time picking a random character from the pool.
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars[randomIndex];
  }

  // 4. Return the final generated password.
  return password;
}

export default generateStrongPassword;

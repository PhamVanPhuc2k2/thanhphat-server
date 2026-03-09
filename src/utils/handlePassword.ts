import bcryptjs from "bcryptjs";

export const hashPassword = (password: string) => {
  const salt = bcryptjs.genSaltSync(10);
  const hashed = bcryptjs.hashSync(password, salt);
  return hashed;
};

export const comparePassword = (password: string, hashedPassword: string) => {
  const compare = bcryptjs.compareSync(password, hashedPassword);
  return compare;
};

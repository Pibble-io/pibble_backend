import bcrypt from 'bcrypt-nodejs';

export const generateHash = (str) => {
    return bcrypt.hashSync(str, bcrypt.genSaltSync(8));
};

export const validateHash = (str, hash) => {
    return bcrypt.compareSync(str, hash);
};

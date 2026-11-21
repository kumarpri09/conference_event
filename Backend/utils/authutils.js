

import jwt from 'jsonwebtoken';

export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      resolve(decoded);
    } catch (err) {
      reject(err);
    }
  });
};
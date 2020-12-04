const rateLimit = require('express-rate-limit');

export const withdrawLimit = rateLimit({
    windowMs: 1000 * process.env.WITHDRAW_RATE_LIMIT_WINDOW, // milliseconds
    max: 1, // limit each IP to 1 requests per windowMs
    message: { 'message': `Too many requests, please try after ${process.env.WITHDRAW_RATE_LIMIT_WINDOW} seconds.` }
});

export const doubleRequestGuard = rateLimit({
    windowMs: 1000 * 3, // milliseconds
    max: 1, // limit each IP to 1 requests per windowMs
    message: { 'message': 'Too many requests, please try after 3 seconds.' }
});

import config from './index';

module.exports = {
    key: config.AWS_KEY,
    secret: config.AWS_SECRET,
    bucket: 'pibble-staging'
};

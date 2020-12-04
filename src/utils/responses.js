import { pick } from 'lodash';

export const customResponse = (response, statusCode, payload) => {
    response.status(statusCode).send(payload);
    return false;
};

export const successResponse = (response, payload) => customResponse(response, 200, payload);

export const errorResponse = (response, error, errorCode = 500) => {
    // Format sequelize validation errors
    console.log(error);
    if (error.name &&
        (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError')) {
        error = error.errors.map(error => {
            if (error.path &&
                (
                    error.path === 'internal_transactions_composite_index' ||
                    error.path === 'exchange_transactions_composite_index' ||
                    error.path === 'external_transactions_composite_index	'
                )
            ) {
                error = {
                    message: global.i18n.__('Sorry, we can not process your request. Please, wait 2 minutes.')
                }
            }
            return pick(error, ['message', 'path', 'value', 'type', 'validatorKey']);
        });
        errorCode = 422;
    }
    else if (error.name === 'LocalizationError') {
        error = {
            message: global.i18n.__(...error.message)
        }
    }
    else {
        error = {
            ...error,
            message: error.message || undefined,
            stack: error.stack && error.stack.split('\n')
        };
    }
    return customResponse(response, errorCode, error);
};
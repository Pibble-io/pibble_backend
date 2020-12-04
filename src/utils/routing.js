import { errorResponse } from "./responses";

export const asyncRoute = route =>
    async (request, response, next) => {
        try {
            await route(request, response, next);
        } catch ( error ) {
            // Log critical errors
            const statusCode = errorResponse(response, error).statusCode;
            if ( statusCode !== 200 && statusCode !== 422 && statusCode !== 401 ) {
                console.log(error);
            }

        }
    };

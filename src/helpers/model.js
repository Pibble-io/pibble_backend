import uuidv4 from "uuid/v4";

export const getUnusedUuid = async Model => {
    let found = false;

    while (!found) {
        const uuid = uuidv4();

        const exists = await Model.count({
            where: {
                uuid,
            }
        }) > 0;

        if (!exists) {
            return uuid;
        }

        found = false
    }
};
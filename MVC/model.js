const db = require('../db/connection');

class Model {

    async fetchAllTopics() {
        const { rows:topics } = await db.query(`SELECT * FROM topics`);
        return topics;
    }
}

module.exports = Model;
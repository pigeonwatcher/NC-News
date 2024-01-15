const fs = require("fs/promises");

class Model {

    #db;
    static #endpointsPath = './endpoints.json';

    constructor(db) {
        this.#db = db;

        // Binding functionss here allow them to be more easily deconstructed in the controller :)
        // Otherwise deconstruction will cause the function to loose its relationship with the Model object.
        this.fetchAllTopics = this.fetchAllTopics.bind(this);
        this.fetchAllEndpoints = this.fetchAllEndpoints.bind(this);
    }

    async fetchAllTopics() {
        const { rows:topics } = await this.#db.query(`SELECT * FROM topics`);
        return topics;
    }

    async fetchAllEndpoints() {
        return JSON.parse(await fs.readFile(Model.#endpointsPath, 'utf8'));
    }
}

module.exports = Model;
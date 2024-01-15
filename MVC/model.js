const fs = require('fs/promises');
const format = require('pg-format');

class Model {

    #db;
    static #endpointsPath = './endpoints.json';

    constructor(db) {
        this.#db = db;

        // Binding functionss here allow them to be more easily deconstructed in the controller :)
        // Otherwise deconstruction will cause the function to loose its relationship with the Model object.
        this.fetchAllTopics = this.fetchAllTopics.bind(this);
        this.fetchAllEndpoints = this.fetchAllEndpoints.bind(this);
        this.fetchArticleByID = this.fetchArticleByID.bind(this);
    }

    async fetchAllTopics() {
        const { rows:topics } = await this.#db.query(`SELECT * FROM topics`);
        return topics;
    }

    async fetchAllEndpoints() {
        return JSON.parse(await fs.readFile(Model.#endpointsPath, 'utf8'));
    }

    async fetchArticleByID(id) {

        try {
            const { rows:article } = await this.#db.query(`SELECT * FROM articles WHERE article_id=$1`, [id]);
            if(article.length === 0) {
                return Promise.reject({status: '404', msg: `No article was found with the id ${id}`})
            }
    
            return article[0];

        } catch(err) {
            return Promise.reject(err);
        }

    }
}

module.exports = Model;
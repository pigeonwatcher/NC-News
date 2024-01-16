const fs = require('fs/promises');
const format = require('pg-format');

class Model {

    #db;
    #validArticleColumns;
    static #endpointsPath = './endpoints.json';
    static #validOrders = ['asc', 'desc'];

    constructor(db) {
        this.#db = db;

        // Binding functionss here allow them to be more easily deconstructed in the controller :)
        // Otherwise deconstruction will cause the function to loose its relationship with the Model object.
        this.init = this.init.bind(this);
        this.fetchAllTopics = this.fetchAllTopics.bind(this);
        this.fetchAllEndpoints = this.fetchAllEndpoints.bind(this);
        this.fetchArticleByID = this.fetchArticleByID.bind(this);
        this.fetchAllArticles = this.fetchAllArticles.bind(this);
        this.fetchCommentsByArticleID = this.fetchCommentsByArticleID.bind(this);
    }

    async init() {
        this.#validArticleColumns = await this.#getArticlesColumns(); // For future use.
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
                return Promise.reject({status: 404, msg: `No article was found with the id ${id}`})
            }
    
            return article[0];

        } catch(err) {
            return Promise.reject(err);
        }
    }

    async fetchAllArticles(sortBy = 'created_at', order = 'desc') {

        try {

            if(!Model.#validOrders.includes(order.toLowerCase())) {
                // In case order is not valid, go to default order (desc).
                order = 'desc';
            }

            const { rows:articles } = await this.#db.query(
            `SELECT article_id, title, topic, author, created_at, votes, article_img_url,
            (SELECT COUNT(*) FROM comments WHERE articles.article_id=comments.article_id) as comment_count
            FROM articles
            ORDER BY ${sortBy} ${order}`);
            return articles;
        } catch(err) {
            return Promise.reject(err);
        }
    }

    async fetchCommentsByArticleID(id, sortBy = 'created_at', order = 'asc') {

        try {
            if(!Model.#validOrders.includes(order.toLowerCase())) {
                order = 'asc';
            }
            // Check if article exists.
            const { rows:article } = await this.#db.query(`SELECT * FROM articles WHERE article_id=$1`, [id]);
            if(article.length === 0) {
                return Promise.reject({status: 404, msg: `No article was found with the id ${id}`});
            }

            const { rows:comments } = await this.#db.query(`SELECT * FROM comments WHERE comments.article_id=$1 ORDER BY ${sortBy} ${order}`, [id]);
            return comments;

        } catch(err) {
            return Promise.reject(err);
        }
    }

    async #getArticlesColumns() {
        const { rows:columnNames } = await this.#db.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='articles'`);
        return columnNames.map((column) => { return column.column_name })
    }
}

module.exports = Model;
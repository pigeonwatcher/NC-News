const fs = require('fs/promises');
const format = require('pg-format');

class Model {

    #db;
    #validArticleColumns;
    static #endpointsPath = './endpoints.json';
    static #validOrders = ['asc', 'desc'];
    static #validComment = { username: 'string', body: 'string' }
    static #validVote = { inc_votes: 'number' }

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
        this.addCommentToArticle = this.addCommentToArticle.bind(this);
        this.incrementArticleVotes = this.incrementArticleVotes.bind(this);
        this.removeCommentByCommentID = this.removeCommentByCommentID.bind(this);
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
            const article = await this.#checkValidArticleID(id);
            if(!article) {
                return Promise.reject(this.#errorArticleIDNotFound(id))
            }
    
            return article;

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
            if(!await this.#checkValidArticleID(id)) {
                return Promise.reject(this.#errorArticleIDNotFound(id));
            }

            const { rows:comments } = await this.#db.query(`SELECT * FROM comments WHERE comments.article_id=$1 ORDER BY ${sortBy} ${order}`, [id]);
            return comments;

        } catch(err) {
            return Promise.reject(err);
        }
    }

    async addCommentToArticle(id, commentReq) {

        try {

            if(!this.#checkIfValidObject(Model.#validComment, commentReq)) {
                return Promise.reject({ status: 400 });
            }

            if(!await this.#checkValidArticleID(id)) {
                return Promise.reject(this.#errorArticleIDNotFound(id));
            }

            const { rows:comment } = await this.#db.query(
            `INSERT INTO comments
            (article_id, author, body)
            VALUES
            ($1, $2, $3)
            RETURNING *
            `, [id, commentReq.username, commentReq.body]);

            return comment[0];

        } catch(err) {
            return Promise.reject(err);
        }
    }

    async incrementArticleVotes(id, increment) {

        if(!this.#checkIfValidObject(Model.#validVote, increment)) {
            return Promise.reject({ status: 400 });
        }

        if(!await this.#checkValidArticleID(id)) {
            return Promise.reject(this.#errorArticleIDNotFound(id));
        }

        const { rows:article } = await this.#db.query(
        `UPDATE articles
        SET votes = votes + $1
        WHERE article_id=$2
        RETURNING *
        `, [increment.inc_votes, id])

        return article[0];
    }

    async removeCommentByCommentID(id) {

        try {

            const { rows:removedComment } = await this.#db.query(`DELETE FROM comments WHERE comment_id=$1 RETURNING *`, [id]);
            if(removedComment.length === 0) {
                return Promise.reject({ status: 404, msg: `No comment with the id ${id} was found` })
            }
            return removedComment[0];
        } catch(err) {
            return Promise.reject(err);
        }
    }

    async #getArticlesColumns() {
        const { rows:columnNames } = await this.#db.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='articles'`);
        return columnNames.map((column) => { return column.column_name })
    }

    async #checkValidArticleID(id) {
        const { rows:article } = await this.#db.query(`SELECT * FROM articles WHERE article_id=$1`, [id]);
        if(article.length === 0) {
            return null;
        }

        return article[0];
    }

    #errorArticleIDNotFound(id) {
        return {status: 404, msg: `No article was found with the id ${id}`};
    }

    #checkIfValidObject(validObj, testObj) {

        if(Object.keys(testObj).length !== Object.keys(validObj).length) {
            return false;
        }

        for(const key in testObj) {
        
            if(!validObj[key]) {
                return false;
            }
            else if(((typeof testObj[key]) !== validObj[key])) {
                return false; // This is handled by the query throwing an error. Although maybe more efficient?
            }
        }
    
        return true;
    }
}

module.exports = Model;
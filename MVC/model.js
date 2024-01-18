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
    }

    init = async () => {
        this.#validArticleColumns = await this.#getArticlesColumns(); 
    }

    fetchAllTopics = async () => {
        const { rows:topics } = await this.#db.query(`SELECT * FROM topics`);
        return topics;
    }

    fetchAllEndpoints = async () => {
        return JSON.parse(await fs.readFile(Model.#endpointsPath, 'utf8'));
    }

    fetchArticleByID = async (id) => {

        const { rows:article } = await this.#db.query(`SELECT *, (SELECT COUNT(*) FROM comments WHERE $1=comments.article_id) as comment_count FROM articles WHERE article_id=$1`, [id]);
        if(article.length === 0) {
            return Promise.reject(this.#errorArticleIDNotFound(id))
        }
    
        return article[0];
    }

    fetchAllArticles = async (topic = undefined, sortBy = 'created_at', order = 'desc') => {

        if(!this.#validArticleColumns.includes(sortBy) || sortBy === 'body') {
            return Promise.reject({ status: 400 });
        }

        if(!Model.#validOrders.includes(order.toLowerCase())) {
            return Promise.reject({ status: 400 });
        }

        let query = `SELECT article_id, title, topic, author, created_at, votes, article_img_url,
        (SELECT COUNT(*) FROM comments WHERE articles.article_id=comments.article_id) as comment_count
        FROM articles`;
        const params = []

        if(topic != undefined) {
            query += ` ` + `WHERE topic LIKE $1`;
            params.push(topic)
        }

        query += ` ` + `ORDER BY ${sortBy} ${order}`;

        const { rows:articles } = await this.#db.query(query, params);
        return articles;
    }

    fetchCommentsByArticleID = async (id, sortBy = 'created_at', order = 'asc') => {

        if(!Model.#validOrders.includes(order.toLowerCase())) {
            order = 'asc';
        }
        // Check if article exists.
        if(!await this.#checkValidArticleID(id)) {
            return Promise.reject(this.#errorArticleIDNotFound(id));
        }

        const { rows:comments } = await this.#db.query(`SELECT * FROM comments WHERE comments.article_id=$1 ORDER BY ${sortBy} ${order}`, [id]);
        return comments;
    }

    addCommentToArticle = async (id, commentReq) => {

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
    }

    incrementArticleVotes = async (id, increment) => {

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

    removeCommentByCommentID = async (id) => {

        const { rows:removedComment } = await this.#db.query(`DELETE FROM comments WHERE comment_id=$1 RETURNING *`, [id]);
        if(removedComment.length === 0) {
        return Promise.reject({ status: 404, msg: `No comment with the id ${id} was found` })
        }
        return removedComment[0];
    }

    fetchAllUsers = async () => {
        const { rows:users } = await this.#db.query(`SELECT * FROM users`);
        return users;
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
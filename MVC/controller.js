class Controller {

    constructor(model) {
        this.model = model;
    }

    getTopics = async (req, res, next) => {
        try {
            const { fetchAllTopics } = this.model;
            const topics = await fetchAllTopics();
            res.status(200).send({ topics });

        } catch(err) {
            next(err);
        }
    }

    getEndpoints = async (req, res, next) => {

        try {
            const { fetchAllEndpoints } = this.model;
            const endpoints = await fetchAllEndpoints();
            res.status(200).send({ endpoints });

        } catch(err) {
            next(err);
        }
    }

    getArticle = async (req, res, next) => {

        try {
            const { article_id:id } = req.params;
            const { fetchArticleByID } = this.model;
            const article = await fetchArticleByID(id);
            res.status(200).send({ article });

        } catch(err) {
            next(err);
        }
    }

    getArticles = async (req, res, next) => {

        try {
            const { fetchAllArticles } = this.model;
            const { topic, sort_by:sortBy, order } = req.query;
            const articles = await fetchAllArticles(topic, sortBy, order);
            res.status(200).send({ articles });
        } catch(err) {
            next(err);
        }
    }

    getArticleComments = async (req, res, next) => {

        try {
            const { article_id:id } = req.params;
            const { sort_by:sortBy, order } = req.query;
            const { fetchCommentsByArticleID } = this.model;
            const comments = await fetchCommentsByArticleID(id, sortBy, order);
            res.status(200).send({ comments });
        } catch(err) {
            next(err);
        }
    }

    postComment = async (req, res, next) => {
        try {
            const { article_id:id } = req.params;
            const commentReq = req.body;
            const { addCommentToArticle } = this.model;
            const comment = await addCommentToArticle(id, commentReq);
            res.status(201).send({ comment });
        } catch(err) {
            next(err);
        }
    }

    patchArticleVotes = async (req, res, next) => {
        try {
            const { article_id:id } = req.params;
            const body = req.body;
            const { incrementArticleVotes } = this.model;
            const article = await incrementArticleVotes(id, body);
            res.status(200).send({ article });
        } catch(err) {
            next(err);
        }
    }

    deleteComment = async (req, res, next) => {
        try {
            const { comment_id:id } = req.params;
            const { removeCommentByCommentID } = this.model;
            const comment = await removeCommentByCommentID(id);
            res.status(204).send({ comment });
        } catch(err) {
            next(err);
        }
    }

    patchCommentVotes = async (req, res, next) => {
        try {
            const { comment_id:id } = req.params;
            const body = req.body;
            const { incrementCommentVotes } = this.model;
            const comment = await incrementCommentVotes(id, body);
            res.status(200).send({ comment });
        } catch(err) {
            next(err);
        }
    }

    getUsers = async (req, res, next) => {
     
        try {
            const { fetchAllUsers } = this.model;
            const users = await fetchAllUsers();
            res.status(200).send({ users });
        } catch(err) {
            next(err);
        }
    }

    getUser = async (req, res, next) => {
     
        try {
            const { username } = req.params;
            const { fetchUserByUsername } = this.model;
            const user = await fetchUserByUsername(username);
            res.status(200).send({ user });
        } catch(err) {
            next(err);
        }
    }

    postArticle = async (req, res, next) => {
        try {
            const articleReq = req.body;
            const { addArticle } = this.model;
            const article = await addArticle(articleReq);
            res.status(201).send({ article });
        } catch(err) {
            next(err);
        }
    }
}

module.exports = Controller;
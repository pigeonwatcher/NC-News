const express = require('express');
const Model = require('./MVC/model');
const Controller = require('./MVC/controller');
const ErrorHandler = require('./error-handler');
const db = require('./db/connection');

class Server {

    app;

    #model;
    #controller;

    #apiRouter;
    #topicsRouter;
    #articlesRouter;
    #commentsRouter;
    #usersRouter;

    constructor() {
        this.app = express();
        this.#model = new Model(db);
        this.#controller = new Controller(this.#model);

        this.setRouters();
        this.setEndpoints();
        this.setErrorHandling();
        this.start();
    }

    setRouters() {
        // Setup Routers.
        this.#apiRouter = express.Router();
        this.#topicsRouter = express.Router();
        this.#articlesRouter = express.Router();
        this.#commentsRouter = express.Router();
        this.#usersRouter = express.Router();

        // Set Router Logic.
        this.app.use(express.json());
        this.app.use('/api', this.#apiRouter);
        this.#apiRouter.use('/topics', this.#topicsRouter);
        this.#apiRouter.use('/articles', this.#articlesRouter);
        this.#apiRouter.use('/comments', this.#commentsRouter);
        this.#apiRouter.use('/users', this.#usersRouter);
    }

    setEndpoints() {
        this.#apiRouter.get('/', this.#controller.getEndpoints);
        this.#topicsRouter.get('/', this.#controller.getTopics);
        this.#articlesRouter.get('/', this.#controller.getArticles);
        this.#articlesRouter.get('/:article_id/', this.#controller.getArticle);
        this.#articlesRouter.get('/:article_id/comments', this.#controller.getArticleComments);
        this.#usersRouter.get('/', this.#controller.getUsers)
        this.#usersRouter.get('/:username', this.#controller.getUser)

        this.#articlesRouter.post('/:article_id/comments', this.#controller.postComment);
        this.#articlesRouter.post('/', this.#controller.postArticle);

        this.#articlesRouter.patch('/:article_id', this.#controller.patchArticleVotes);
        this.#commentsRouter.patch('/:comment_id', this.#controller.patchCommentVotes);

        this.#commentsRouter.delete('/:comment_id', this.#controller.deleteComment)
    }

    setErrorHandling() {
        new ErrorHandler(this.app);
    }

    async start() {
        this.#model.init();
    }
}

const server = new Server();

module.exports = server.app;
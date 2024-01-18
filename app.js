const express = require('express');
const Model = require('./MVC/model');
const Controller = require('./MVC/controller');
const ErrorHandler = require('./error-handler');
const db = require('./db/connection');

// Setup MVC.
const model = new Model(db);
(async() => { await model.init(); })();
const controller = new Controller(model);

// Setup Routers.
const app = express();
const apiRouter = express.Router();
const topicsRouter = express.Router();
const articlesRouter = express.Router();
const commentsRouter = express.Router();
const usersRouter = express.Router();

// Set Router Logic.
app.use(express.json());
app.use('/api', apiRouter);
apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/users', usersRouter);

const errorHandler = new ErrorHandler(app);

// Set Endpoints.
apiRouter.get('/', async(req, res, next) => controller.getEndpoints(req, res, next));
topicsRouter.get('/', async(req, res, next) => await controller.getTopics(req, res, next));
articlesRouter.get('/', async(req, res, next) => await controller.getArticles(req, res, next));
articlesRouter.get('/:article_id/', async(req, res, next) => await controller.getArticle(req, res, next));
articlesRouter.get('/:article_id/comments', async(req, res, next) => await controller.getArticleComments(req, res, next));
usersRouter.get('/', async(req, res, next) => controller.getUsers(req, res, next))

articlesRouter.post('/:article_id/comments', async(req, res, next) => await controller.postComment(req, res, next));

articlesRouter.patch('/:article_id', async(req, res, next) => await controller.patchArticleVotes(req, res, next));

commentsRouter.delete('/:comment_id', async(req, res, next) => await controller.deleteComment(req, res, next))

// Error handling.


module.exports = app;
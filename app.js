const express = require('express');
const db = require('./db/connection');
const Model = require('./MVC/model');
const Controller = require('./MVC/controller');

const app = express();
const apiRouter = express.Router();
const topicsRouter = express.Router();
const articlesRouter = express.Router();
const commentsRouter = express.Router();
const usersRouter = express.Router();

const model = new Model(db);
(async() => { await model.init(); })();
const controller = new Controller(model);

app.use(express.json());
app.use('/api', apiRouter);
apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/users', usersRouter);

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
app.use((err, req, res, next) => {
    if (err.code === '22P02' || err.code === '42703'  || err.code === '23502' || err.status === 400) {
        res.status(400).send({msg: 'Bad Request'})
    }
    next(err)
})

app.use((err, req, res, next) => {
    if (err.status === 404) {
        res.status(404).send({msg: err.msg})
    }
    next(err)
})

app.use((err, req, res, next) => {
    if (err.status === 413) {
        res.status(413).send({msg: 'Payload Too Large'})
    }
    next(err)
})

app.use((err, req, res, next) => {
    if (err.code === '42P01') {
        console.log(err);
        res.status(500).send(err)
    }
    next(err)
})

module.exports = app;
const express = require('express');
const db = require('./db/connection');
const Model = require('./MVC/model');
const Controller = require('./MVC/controller');

const app = express();
const apiRouter = express.Router();
const topicsRouter = express.Router();
const articlesRouter = express.Router();

const model = new Model(db);
const controller = new Controller(model);

app.use(express.json());
app.use('/api', apiRouter);
apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);

apiRouter.get('/', async (req, res, next) => controller.getEndpoints(req, res, next));
topicsRouter.get('/', async(req, res, next) => await controller.getTopics(req, res, next));
articlesRouter.get('/:article_id', async(req, res, next) => await controller.getArticle(req, res, next))

// Error handling.
app.use((err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({msg: 'Bad Request'})
    }
    next(err)
})

app.use((err, req, res, next) => {
    if (err.status === '404') {
        res.status(404).send({msg: err.msg})
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
class ErrorHandler {

    #app;
    static #_400 = ['22P02', '42703', '23502', 400];
    static #_404 = [404];
    static #_500 = ['42P01'];

    constructor(app) {
        this.#app = app;

        app.use(this.handle400Error);
        app.use(this.handle404Error);
        app.use(this.handle500Error);
    }

    handle400Error = (err, req, res, next) => {

        if(ErrorHandler.#_400.includes(err.code) || ErrorHandler.#_400.includes(err.status)) {
            res.status(400).send({msg: 'Bad Request'})
        }
        next(err);
    }
    
    handle404Error = (err, req, res, next) => {
        if (ErrorHandler.#_404.includes(err.status)) {
            res.status(404).send({msg: err.msg})
        }
        next(err)
    }

    handle500Error = (err, req, res, next) => {
        if(ErrorHandler.#_500.includes(err.code)) {
            console.log(err);
            res.status(500).send(err)
        }
        next(err)
    }
}

module.exports = ErrorHandler;
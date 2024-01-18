const app = require('./app');

// if production enviroment, run the server.
if(!process.env.production) {
    const { PORT = 9090 } = process.env;
    app.listen(PORT, () => console.log(`Listening on ${PORT}...`));
}

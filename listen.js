/*
    For purposes of hosting the API.
*/
const app = require('./app');
const db = require('./db/connection');

if(!process.env.production) {
    const { PORT = 9090 } = process.env;
    app.listen(PORT, () => console.log(`Listening on ${PORT}...`));
}

# Northcoders News API

A JavaScript backend API project which aims to mimic a real-world backend service (e.g. Reddit).

Site: https://nc-news-th0a.onrender.com

## Setup
### Install Dependencies

* [postgreSQL](https://www.postgresql.org/)
* [Node.js](https://nodejs.org/)

Once Node.js is installed, install the following packages:

* [dotenv](https://www.npmjs.com/package/dotenv)

`npm install dotenv`

* [express](https://www.npmjs.com/package/express)

`npm install express`

* [node-postgres](https://www.npmjs.com/package/pg)

`npm install pg`

* [pg-format](https://www.npmjs.com/package/pg-format)

`npm install pg-format`

### Create Databases

Create a '.env.development' and '.env.test' and file then add the following:

`PGDATABASE=nc_news`

`PGDATABASE=nc_news_test`

Run `npm run setup-dbs` to create a 'nc_news_test' and 'nc_news' database. 
You can then run `npm run seed` to seed the development database.

## Testing

The following packages were used to test the API:

* [jest](https://www.npmjs.com/package/jest)

`npm install -D jest`

* [jest-sorted](https://www.npmjs.com/package/jest-sorted)

`npm install -D jest-sorted`

* [supertest](https://www.npmjs.com/package/supertest)

`npm install -D supertest`

Run `npm run test` to run the tests which will automatically use the test database in '.env.test'.

## Endpoints

A detailed explanation of each endpoint can be found in the [endpoints.json](./endpoints.json).

Although, some key endpoints are...

* /api
* /api/topics
* /api/articles
* /api/comments
* /api/users

## Special Thanks

Massive thanks to my mentors Pippa and John at Northcoders for their valuable feedback throughout this project! :)
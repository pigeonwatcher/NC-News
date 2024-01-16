const request = require("supertest");
const app = require('../app.js');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const { articleData, commentData, topicData, userData } = require("../db/data/test-data/index.js");
const fs = require("fs/promises");
require('jest-sorted');


beforeEach(() => seed({ topicData, userData, articleData, commentData }));
afterAll(() => db.end());

describe('/GET', () => {
    describe('Topics', () => {
        test('GET: 200 Return an array containing all topics', async () => {
            const { status, body: { topics } } = await request(app).get('/api/topics');

            expect(status).toBe(200);
            expect(Array.isArray(topics)).toBe(true);
            topics.forEach((topic) => {
                expect(typeof topic.description).toBe('string');
                expect(typeof topic.slug).toBe('string');
            })
        }) 
    })
    describe('Endpoints', () => {
        test('GET: 200 Return an object describing all the avaliable endpoints', async () => {
            const { status, body: { endpoints } } = await request(app).get('/api');

            const endpointsRef = JSON.parse(await fs.readFile('./endpoints.json', 'utf8'));

            expect(status).toBe(200);
            expect(typeof endpoints).toBe('object');
            expect(Object.keys(endpoints).length).toBe(Object.keys(endpointsRef).length);
            for(const key in endpoints) {
                expect(endpoints[key]).toEqual(endpointsRef[key]);
            }
        })
    })
    describe('Articles', () => {
        test('GET: 200 Return an object of the article with the matching article ID', async () => {
            const { status, body: { article } } = await request(app).get('/api/articles/1');

            expect(status).toBe(200);
            expect(article).toMatchObject({
                article_id: 1,
                title: expect.any(String),
                topic: expect.any(String),
                author: expect.any(String),
                body: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                article_img_url: expect.any(String)
            })
        })
        test('GET: 400 Return an error if given an invalid article ID', async () => {
            const { status, body } = await request(app).get('/api/articles/abc');

            expect(status).toBe(400);
            expect(body).toEqual({msg: 'Bad Request'});
        })
        test('GET: 404 Return an error if given a non-existent article ID', async () => {
            const { status, body } = await request(app).get('/api/articles/99999');

            expect(status).toBe(404);
            expect(body).toEqual({msg: `No article was found with the id 99999`});
        })
        test('GET: 200 Return an array containing all articles (excluding body property) and sorted by date in descending order)', async  () => {
            const { status, body: { articles } } = await request(app).get('/api/articles');

            expect(status).toBe(200);
            expect(Array.isArray(articles)).toBe(true);
            expect(articles.length).not.toBe(0);
            expect(articles).toBeSortedBy('created_at', { descending: true })
            articles.forEach((article) => {
                expect(article).toMatchObject({
                    article_id: expect.any(Number),
                    title: expect.any(String),
                    topic: expect.any(String),
                    author: expect.any(String),
                    created_at: expect.any(String),
                    votes: expect.any(Number),
                    article_img_url: expect.any(String),
                    comment_count: expect.any(String)
                });
            })
        })
    })
    describe("Comments", () => {

        test('GET: 200 Return an array of comments with the matching article ID', async () => {
            const { status, body: { comments } } = await request(app).get('/api/articles/1/comments');

            expect(status).toBe(200);

            expect(comments).toBeSortedBy('created_at', { ascending: true })
            expect(comments.length).not.toBe(0);

            comments.forEach((comment) => {
                expect(comment).toMatchObject({
                    comment_id: expect.any(Number),
                    votes: expect.any(Number),
                    created_at: expect.any(String),
                    author: expect.any(String),
                    body: expect.any(String),
                    article_id: 1,
                });
            })
        })
        test('GET: 200 Return an empty array if given a valid article ID with no comments', async () => {
            const { status, body: { comments } } = await request(app).get('/api/articles/8/comments');

            expect(status).toBe(200);
            expect(comments.length).toBe(0);
        })
        test('GET: 400 Return an error if given an invalid article id', async () => {
            const { status, body } = await request(app).get('/api/articles/abc/comments');

            expect(status).toBe(400);
            expect(body).toEqual({msg: 'Bad Request'});
        })
        test('GET: 404 Return an error if given a non-existent article id', async () => {
            const { status, body } = await request(app).get('/api/articles/99999/comments');

            expect(status).toBe(404);
            expect(body).toEqual({msg: `No article was found with the id 99999`});
        })
    })
})

describe('/POST', () => {
    describe('Comments', () => {
        test('POST: 201 Adds a comment to the database and returns the posted comment', async () => {

            const commentToPost = {
                username: 'butter_bridge',
                body: 'Hello World!'
            }

            const { status, body: { comment } } = await request(app).post('/api/articles/1/comments').send(commentToPost);

            expect(status).toBe(201);
            expect(comment).toMatchObject({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                created_at: expect.any(String),
                author: commentToPost.username,
                body: commentToPost.body,
                article_id: 1,
            });
        })
        test('POST: 400 Return an error if given an invalid comment format', async () => {
            const commentToPost = {
                user: 'butter_bridge',
                text: 'Hello World!'
            }

            const { status, body } = await request(app).post('/api/articles/1/comments').send(commentToPost);

            expect(status).toBe(400);
            expect(body).toEqual({msg: 'Bad Request'});
        })
        test('POST: 400 Returns an error if post body has correct keys but incorrect values', async () => {
            const commentToPost = {
                username: 123,
                body: NaN,
            }

            const { status, body } = await request(app).post('/api/articles/1/comments').send(commentToPost);

            expect(status).toBe(400);
            expect(body).toEqual({msg: 'Bad Request'})
        })
        test('POST: 400 Return an error if given an invalid article id', async () => {
            const commentToPost = {
                username: 'butter_bridge',
                body: 'Hello World!'
            }

            const { status, body } = await request(app).post('/api/articles/abc/comments').send(commentToPost);

            expect(status).toBe(400);
            expect(body).toEqual({msg: 'Bad Request'});
        })
        test('POST: 404 Return an error if given a non-existent article id', async () => {
            const commentToPost = {
                username: 'butter_bridge',
                body: 'Hello World!'
            }

            const { status, body } = await request(app).post('/api/articles/99999/comments').send(commentToPost);

            expect(status).toBe(404);
            expect(body).toEqual({msg: `No article was found with the id 99999`});
        })
    })
})

describe('/PATCH', () => {
    describe('Articles', () => {
        test('PATCH: 201 Increment the votes of an article and return the article with the updated vote count', async () => {
            const newVotes = {
                inc_votes: 3,
            }

            const { body: { article: { votes:originalVoteCount } } } = await request(app).get('/api/articles/1');
    
            const { status, body: { article } } = await request(app).patch('/api/articles/1').send(newVotes);

            expect(status).toBe(200);
            expect(article).toMatchObject({
                article_id: 1,
                title: expect.any(String),
                topic: expect.any(String),
                author: expect.any(String),
                body: expect.any(String),
                created_at: expect.any(String),
                votes: originalVoteCount + newVotes.inc_votes,
                article_img_url: expect.any(String)
            })
        })
        test('PATCH: 400 Return an error if given an invalid vote format', async () => {
            const newVotes = {
                adjust_votes: 5,
            }
    
            const { status, body } = await request(app).patch('/api/articles/1').send(newVotes);

            expect(status).toBe(400);
            expect(body).toEqual({msg: 'Bad Request'});
        })
        test('PATCH: 400 Returns an error if patch body has correct keys but incorrect values', async () => {
            const newVotes = {
                inc_votes: 'three',
            }
    
            const { status, body } = await request(app).patch('/api/articles/1').send(newVotes);

            expect(status).toBe(400);
            expect(body).toEqual({msg: 'Bad Request'})
        })
        test('PATCH: 400 Return an error if given an invalid article id', async () => {
            const newVotes = {
                inc_votes: 3,
            }
    
            const { status, body } = await request(app).patch('/api/articles/abc').send(newVotes);

            expect(status).toBe(400);
            expect(body).toEqual({msg: 'Bad Request'});
        })
        test('PATCH: 404 Return an error if given a non-existent article id', async () => {
            const newVotes = {
                inc_votes: 3,
            }
    
            const { status, body } = await request(app).patch('/api/articles/99999').send(newVotes);

            expect(status).toBe(404);
            expect(body).toEqual({msg: `No article was found with the id 99999`});
        })
    })
})
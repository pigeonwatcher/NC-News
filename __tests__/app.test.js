const request = require("supertest");
const app = require('../app.js');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const { articleData, commentData, topicData, userData } = require("../db/data/test-data/index.js");
const fs = require("fs/promises");
const { DESTRUCTION } = require("dns");
require('jest-sorted');


beforeEach(() => seed({ topicData, userData, articleData, commentData }));
afterAll(() => db.end());

describe('/GET', () => {
    describe('Topics', () => {
        test('GET: 200 Return an array containing all topics', async () => {
            const { status, body: { topics } } = await request(app).get('/api/topics');

            expect(status).toBe(200);
            expect(Array.isArray(topics)).toBe(true);
            expect(topics.length).not.toBe(0);
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
                article_img_url: expect.any(String),
                comment_count: expect.any(String)
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
        test('GET: 200 Return an array containing articles filtered by topic', async () => {

            const { status, body: { articles } } = await request(app).get('/api/articles?topic=mitch');

            expect(status).toBe(200);
            expect(Array.isArray(articles)).toBe(true);
            expect(articles.length).not.toBe(0);
            articles.forEach((article) => {
                expect(article.topic).toBe("mitch");
            });
        })
        test('GET: 200 Returns an empty array if filtered topic does not exist', async () => {

            const { status, body: { articles } } = await request(app).get('/api/articles?topic=eggs');

            expect(status).toBe(200);
            expect(Array.isArray(articles)).toBe(true);
            expect(articles.length).toBe(0);
        })
        test('GET: 200 Return an array containing articles sorted by title in ascending order', async () => {

            const { status, body: { articles } } = await request(app).get('/api/articles?sort_by=title&order=asc');

            expect(status).toBe(200);
            expect(Array.isArray(articles)).toBe(true);
            expect(articles.length).not.toBe(0);
            expect(articles).toBeSortedBy('title', { ascending: true });
        })
        test('GET: 400 Return an error if given an invalid sort by or order', async () => {

            const { status:status1, body:body1 } = await request(app).get('/api/articles?sort_by=region&order=ascendingorder');
            expect(status1).toBe(400);
            expect(body1).toEqual({ msg: 'Bad Request' })

            const { status:status2, body:body2 } = await request(app).get('/api/articles?sort_by=body&order=asc');
            expect(status2).toBe(400);
            expect(body2).toEqual({ msg: 'Bad Request' })

            const { status:status3, body:body3 } = await request(app).get('/api/articles?sort_by=author&order=ascendingorder');
            expect(status3).toBe(400);
            expect(body3).toEqual({ msg: 'Bad Request' })
        })
    })
    describe("Comments", () => {

        test('GET: 200 Return an array of comments with the matching article ID', async () => {
            const { status, body: { comments } } = await request(app).get('/api/articles/1/comments');

            expect(status).toBe(200);

            expect(comments).toBeSortedBy('created_at', { descending: true })
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
        test('GET: 200 Return an array of comments with the matching article ID in descending order', async () => {
            const { status, body: { comments } } = await request(app).get('/api/articles/1/comments?sort_by=votes&order=asc');

            expect(status).toBe(200);

            expect(comments).toBeSortedBy('votes', { ascending: true })
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
    describe('Users', () => {
        test('GET: 200 Return an array of all users', async () => {
            const { status, body: { users } } = await request(app).get('/api/users');

            expect(status).toBe(200);
            expect(Array.isArray(users)).toBe(true);
            expect(users.length).not.toBe(0);
            users.forEach((user) => {
                expect(user).toMatchObject({
                    username: expect.any(String),
                    name: expect.any(String),
                    avatar_url: expect.any(String)
                });
            })
        }) 
        test('GET: 200 Return an object of a user with a matching username', async () => {
            const { status, body: { user } } = await request(app).get('/api/users/butter_bridge');

            expect(status).toBe(200);
            expect(user).toMatchObject({
                username: 'butter_bridge',
                name: 'jonny',
                avatar_url: 'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg'
            });
        }) 
        test('GET: 404 Return an error if given a non-existent username', async () => {
            const { status, body } = await request(app).get('/api/users/margarine_bridge');

            expect(status).toBe(404);
            expect(body).toEqual({msg: `No user was found with the username margarine_bridge`});
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
    describe('Articles', () => {
        test('POST: 201 Adds an article to the database and returns the posted article', async () => {

            const articleToPost = {
                author: 'butter_bridge',
                title: 'Is it really not butter?',
                body: `I can't believe its not butter and neither should you! ...`,
                topic: 'milk',
                article_img_url: 'https://'
            }

            const { status, body: { article } } = await request(app).post('/api/articles').send(articleToPost);

            expect(status).toBe(201);
            expect(article).toMatchObject({
                article_id: expect.any(Number),
                votes: 0,
                created_at: expect.any(String),
                comment_count: '0',
            });
        })
        test('POST: 400 Return an error if given an invalid article format', async () => {
            const articleToPost = {
                author: 'butter_bridge',
                title: 'Is it really not butter?',
                main: `I can't believe its not butter and neither should you! ...`,
                topic: 'milk',
                article_img_url: 'https://'
            }

            const { status, body } = await request(app).post('/api/articles').send(articleToPost);

            expect(status).toBe(400);
            expect(body).toEqual({msg: 'Bad Request'});
        })
        test('POST: 400 Returns an error if post body has correct keys but incorrect values', async () => {
            const articleToPost = {
                author: 123,
                title: 'Is it really not butter?',
                body: `I can't believe its not butter and neither should you! ...`,
                topic: 'milk',
                article_img_url: 'https://'
            }

            const { status, body } = await request(app).post('/api/articles').send(articleToPost);

            expect(status).toBe(400);
            expect(body).toEqual({msg: 'Bad Request'})
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
    describe('Comments', () => {
        test('PATCH: 201 Increment the votes of a comment and return the comment with the updated vote count', async () => {
            const newVotes = {
                inc_votes: 1,
            }
    
            const { status, body: { comment } } = await request(app).patch('/api/comments/1').send(newVotes);

            expect(status).toBe(200);
            expect(comment).toMatchObject({
                comment_id: 1,
                author: expect.any(String),
                body: expect.any(String),
                created_at: expect.any(String),
                votes: 17,
                article_id: expect.any(Number)
            })
        })
        test('PATCH: 400 Return an error if given an invalid vote format', async () => {
            const newVotes = {
                adjust_votes: 1,
            }
    
            const { status, body } = await request(app).patch('/api/comments/1').send(newVotes);

            expect(status).toBe(400);
            expect(body).toEqual({msg: 'Bad Request'});
        })
        test('PATCH: 400 Returns an error if patch body has correct keys but incorrect values', async () => {
            const newVotes = {
                inc_votes: 'one',
            }
    
            const { status, body } = await request(app).patch('/api/comments/1').send(newVotes);

            expect(status).toBe(400);
            expect(body).toEqual({msg: 'Bad Request'})
        })
        test('PATCH: 400 Return an error if given an invalid comment id', async () => {
            const newVotes = {
                inc_votes: 1,
            }
    
            const { status, body } = await request(app).patch('/api/comments/abc').send(newVotes);

            expect(status).toBe(400);
            expect(body).toEqual({msg: 'Bad Request'});
        })
        test('PATCH: 404 Return an error if given a non-existent comment id', async () => {
            const newVotes = {
                inc_votes: 1,
            }
    
            const { status, body } = await request(app).patch('/api/comments/99999').send(newVotes);

            expect(status).toBe(404);
            expect(body).toEqual({msg: `No comment was found with the id 99999`});
        })
    })
})

describe('/DELETE', () => {
    describe('Comments', () => {
        test('DELETE: 204 Remove a comment using the comment ID', async () => {

            const { status, res: { statusMessage } } = await request(app).delete('/api/comments/1');
            expect(status).toBe(204);   
            expect(statusMessage).toBe(`No Content`)         
        })
        test('DELETE: 400 Returns an error if given an invalid comment ID', async () => {

            const { status, res: { statusMessage } } = await request(app).delete('/api/comments/abc');
            expect(status).toBe(400);   
            expect(statusMessage).toBe(`Bad Request`) 
        })
        test('DELETE: 404 Returns an error if no comment with the comment ID was found', async () => {
 
            await request(app).delete('/api/comments/1');

            const response = await request(app).delete('/api/comments/1');
            expect(response.status).toBe(404);   
        })
    })
})
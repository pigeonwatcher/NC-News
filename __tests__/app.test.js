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
            const response = await request(app).get('/api/topics');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            
            response.body.forEach((obj) => {
                expect(typeof obj.description).toBe('string');
                expect(typeof obj.slug).toBe('string');
            })
        }) 
    })
    describe('Endpoints', () => {
        test('GET: 200 Return an object describing all the avaliable endpoints', async () => {
            const response = await request(app).get('/api');

            const endpoints = JSON.parse(await fs.readFile('./endpoints.json', 'utf8'));

            expect(response.status).toBe(200);
            expect(typeof response.body).toBe('object');
            expect(Object.keys(response.body).length).toBe(Object.keys(endpoints).length);

            for(const key in response.body) {
                expect(response.body[key]).toEqual(endpoints[key]);
            }
        })
    })
    describe('Articles', () => {
        test('GET: 200 Return an object of the article with the matching article id', async () => {
            const response = await request(app).get('/api/articles/1');
            console.log(response.body);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                article_id: expect.any(Number),
                title: expect.any(String),
                topic: expect.any(String),
                author: expect.any(String),
                body: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                article_img_url: expect.any(String)
            })
        })
        test('GET: 400 Return an error if given an invalid article id', async () => {
            const response = await request(app).get('/api/articles/abc');

            expect(response.status).toBe(400);
            expect(response.body).toEqual({msg: 'Bad Request'});
        })
        test('GET: 404 Return an error if given a non-existent article id', async () => {
            const response = await request(app).get('/api/articles/99999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({msg: `No article was found with the id 99999`});
        })
    })
})
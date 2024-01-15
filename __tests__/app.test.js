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

            // This means the endpoints will always require a description!
            for(const key in response.body) {
                expect(typeof response.body[key].description).toBe('string');
            }
        })
    })
})
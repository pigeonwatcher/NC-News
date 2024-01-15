const request = require("supertest");
const app = require('../app.js');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const { articleData, commentData, topicData, userData } = require("../db/data/test-data/index.js")
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
})
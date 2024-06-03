const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const should = chai.should();
const BlueBird = require('bluebird');
const sinon = require('sinon');
const Analytics = require('../models/analytics');

chai.use(chaiHttp);

const setup = (...sets) => {
    return BlueBird.mapSeries(sets, data => {
        return chai.request(server)
            .post('/analytics')
            .send(data)
            .then(response => {
                return response.body;
            })
    })
}

describe('analytics_api_medium', () => {
    const event_set_1 = [
        {
            "user": 1,
            "eventType": "click"
        },
        {
            "user": 2,
            "eventType": "click"
        },
        {
            "user": 1,
            "eventType": "pageView"
        }
    ]

    const event_set_2 = [
        {
            "user": 2,
            "eventType": "pageView"
        },
        {
            "user": 1,
            "eventType": "pageView"
        },
        {
            "user": 1,
            "eventType": "pageView"
        },
        {
            "user": 2,
            "eventType": "click"
        },
        {
            "user": 2,
            "eventType": "pageView"
        }
    ]

    const event_set_3 = [
        {
            "user": 1,
            "eventType": "click"
        },
        {
            "user": 2,
            "eventType": "pageView"
        },
        {
            "user": 1,
            "eventType": "pageView"
        }
    ]


    let clock;

    beforeEach(async () => {
        clock = sinon.useFakeTimers(new Date().getTime());
        await Analytics.sync();
    })

    afterEach(async () => {
        clock.restore();
        await Analytics.drop();
    })

    it('should ingest all the data correctly', async () => {
        const response = await chai.request(server).post('/analytics').send(event_set_1)
        response.should.have.status(201);
        response.body.ingested.should.eql(3)
    });

    it('should avoid duplicated and return all the ingested events correctly', async () => {
        await setup(event_set_2);
        const response = await chai.request(server).get('/analytics')
        response.body.length.should.eql(3);
    })

    it('should ingest click events only once per user every 3 seconds', async () => {
        await setup(event_set_3);
        const response1 = await chai.request(server).post('/analytics').send(event_set_1)
        response1.body.ingested.should.eql(1)
        clock.tick(3010);
        const response2 = await chai.request(server).post('/analytics').send(event_set_1)
        response2.body.ingested.should.eql(2)
    })

    it('should ingest pageView events only once per user every 5 seconds', async () => {
        await setup(event_set_3);
        const response1 = await chai.request(server).post('/analytics').send(event_set_1)
        response1.body.ingested.should.eql(1)
        clock.tick(5010);
        const response2 = await chai.request(server).post('/analytics').send(event_set_1)
        response2.body.ingested.should.eql(3);
    })

    it('should return the ingested events count correctly after few iterations', async () => {
        await setup(event_set_3, event_set_1);
        const response1 = await chai.request(server).get('/analytics')
        response1.body.length.should.eql(4)
        clock.tick(3010);
        await setup(event_set_3);
        const response2 = await chai.request(server).get('/analytics')
        response2.body.length.should.eql(5);
        clock.tick(1010);
        await setup(event_set_2)
        const response3 = await chai.request(server).get('/analytics')
        response3.body.length.should.eql(6);
        clock.tick(5010);
        await setup(event_set_2)
        const response4 = await chai.request(server).get('/analytics')
        response4.body.length.should.eql(9);
    })

    it('should get 405 for a put request to /analytics/:id', async () => {
        const [event] = await setup(event_set_1);
        const response = await chai.request(server).put(`/analytics/1`).send(event_set_1[0])
        response.should.have.status(405);
    })

    it('should get 405 for a delete request to /analytics/:id', async () => {
        const [event] = await setup(event_set_1);
        const response = await chai.request(server).delete(`/analytics/1`)
        response.should.have.status(405);
    })

    it('should get 405 for a patch request to /products/:id', async () => {
        const [event] = await setup(event_set_1);
        const response = await chai.request(server).patch(`/analytics/1`).send(event_set_1[0])
        response.should.have.status(405);
    })
});

import request from 'supertest';
import app from '../src/app';

describe('Rate Limiter Service', () => {
    afterAll(async () => {
        app.close();
    })

    it('Allows requests within the standard tier limit', async () => {
        const promises: any[] = [];
        for (let i = 0; i < 8; i++) {
            promises.push(request(app).post('/api/request').send({ userId: 'user1', userTier: 'standard' }))
        }
        await Promise.all(promises);
        const res = await request(app).post('/api/request').send({ userId: 'user1', userTier: 'standard' });
        expect(res.status).toBe(200);
    });

    it('Blocks requests exceeding standrad tier limit', async () => {
        const promises: any[] = [];
        for (let i = 0; i < 10; i++) { // only 10 requests allowed
            promises.push(request(app).post('/api/request').send({ userId: 'user2', userTier: 'standard' }))
        }
        await Promise.all(promises);
        const res = await request(app).post('/api/request').send({ userId: 'user2', userTier: 'standard' });
        expect(res.status).toBe(429);
    });

    it('Allows requests within the high tier limit', async () => {
        const promises: any[] = [];
        for (let i = 0; i < 20; i++) {
            promises.push(request(app).post('/api/request').send({ userId: 'user3', userTier: 'high' }))
        }
        await Promise.all(promises);
        const res = await request(app).post('/api/request').send({ userId: 'user3', userTier: 'high' });
        expect(res.status).toBe(200);
    });

    it('Blocks requests exceeding high tier limit', async () => {
        const promises: any[] = [];
        for (let i = 0; i < 50; i++) {
            promises.push(request(app).post('/api/request').send({ userId: 'user4', userTier: 'high' }))
        }
        await Promise.all(promises);
        const res = await request(app).post('/api/request').send({ userId: 'user4', userTier: 'high' });
        expect(res.status).toBe(429);
    });

    it('Blocks requests with missing fields', async () => {
        const res = await request(app).post('/api/request').send({ userId: 'user5' }); // missing userTier
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Missing userId or userTier');
    });

    it('Blocks requests with invalid user tier', async () => {
        const res = await request(app).post('/api/request').send({ userId: 'user5', userTier: 'premium' });
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Invalid user tier');
    });

    it('Allows requests exactly at standard tier limit', async () => {
        const promises: any[] = [];
        for (let i = 0; i < 10; i++) {
            promises.push(request(app).post('/api/request').send({ userId: 'user5', userTier: 'standard' }));
        }
        const responses = await Promise.all(promises);
        responses.forEach(res => expect(res.status).toBe(200));
    });

    it('Test concurrency requests', async () => {
        const promises: any[] = [];
        for (let i = 0; i < 11; i++) { // one more than allowed
            promises.push(request(app).post('/api/request').send({ userId: 'user6', userTier: 'standard' }));
        }
        const responses = await Promise.all(promises);
        // only 10 requests allowrd then 1 should be rejected
        expect(responses.filter(res => res.status === 200)).toHaveLength(10);
        expect(responses.filter(res => res.status === 429)).toHaveLength(1);
    });

    it('Resets after window period', async () => {
        for (let i = 0; i < 10; i++) {
            await request(app).post('/api/request').send({ userId: 'user7', userTier: 'standard' });
        }
    
        // next one should be blocked
        const blockedResponse = await request(app).post('/api/request').send({ userId: 'user7', userTier: 'standard' });
        expect(blockedResponse.status).toBe(429);
    
        // wait 5 sec (window time)
        await new Promise(resolve => setTimeout(resolve, 5000));
    
        // now the request should be allowed
        const allowedResponse = await request(app).post('/api/request').send({ userId: 'user5', userTier: 'standard' });
        expect(allowedResponse.status).toBe(200);
    }, 10000); // changing the default 5 sec jest timeout

    it('Resets after window period of sequantial requests', async () => {
        for (let i = 0; i < 10; i++) {
            await request(app).post('/api/request').send({ userId: 'user7', userTier: 'standard' });
            // wait 400 ms
            await new Promise(resolve => setTimeout(resolve, 400));
        }
        // at this point it reached the limit of 10 requests within 5 sec after 4 sec
    
        // next one should be blocked
        const blockedResponse = await request(app).post('/api/request').send({ userId: 'user7', userTier: 'standard' });
        expect(blockedResponse.status).toBe(429);
    
        // wait 1 sec 
        await new Promise(resolve => setTimeout(resolve, 1000));
    
        // now the request should be allowed
        const allowedResponse = await request(app).post('/api/request').send({ userId: 'user5', userTier: 'standard' });
        expect(allowedResponse.status).toBe(200);
    }, 10000); // changing the default 5 sec jest timeout
});

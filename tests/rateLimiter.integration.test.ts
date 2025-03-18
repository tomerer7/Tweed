import request from 'supertest';
import app from '../src/app';
import config from '../src/config';


describe('Rate Limiter Service', () => {
    afterAll(async () => {
        app.close();
    })

    it('Allows requests within the standard tier limit', async () => {
        const promises: any[] = [];
        for (let i = 0; i < 3; i++) {
            promises.push(request(app).post('/api/request').send({ userId: 'user1', userTier: 'standard' }))
        }
        await Promise.all(promises);
        const res = await request(app).post('/api/request').send({ userId: 'user1', userTier: 'standard' });
        expect(res.status).toBe(200);
    });

    it('Blocks requests exceeding standrad tier limit', async () => {
        const promises: any[] = [];
        for (let i = 0; i < 16; i++) {
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
        for (let i = 0; i < 31; i++) {
            promises.push(request(app).post('/api/request').send({ userId: 'user4', userTier: 'high' }))
        }
        await Promise.all(promises);
        const res = await request(app).post('/api/request').send({ userId: 'user4', userTier: 'high' });
        expect(res.status).toBe(429);
    });

    it('Blocks requests with missing fields', async () => {
        const res = await request(app).post('/api/request').send({ userId: 'user4' }); // missing userTier
        expect(res.status).toBe(400);
    });
});

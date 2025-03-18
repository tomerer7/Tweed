import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import someRoutes from './routes/some.route';
import config from './config';
import { rateLimiter } from './middlewares/rateLimiter.middleware';

const app = express();
const port = config.server.port; // process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.use(rateLimiter);

app.use('/api/request', someRoutes);

app.use((err: any, req: any, res: any, next: any) => {
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default server;

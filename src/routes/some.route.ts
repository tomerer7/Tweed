import express from 'express';
import { createSomething } from '../controllers/some.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

router.post('/', asyncHandler(createSomething));

export default router;

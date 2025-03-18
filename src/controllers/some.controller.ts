import { Request, Response } from 'express';
import { someService } from '../services/some.service';

export const createSomething = async (req: Request, res: Response) => {
    await someService.createSomething();
    res.status(200).json({ message: "success" });
};

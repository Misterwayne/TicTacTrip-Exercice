import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { justifyText } from './srcs/JustifyLine';
import { rateLimitMiddleware, authenticateToken } from './srcs/Middleware';

const app = express();
app.use(bodyParser.text());
app.use(bodyParser.json());

// Load environment variables from .env file
dotenv.config();

export const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export interface TokenPayload {
	email: string;
	date: number;
}

export interface WordCount {
		[token: string]:{count: number, date:number} 
	}
	
export const wordCounts: WordCount = {};

declare global {
	namespace Express {
		interface Request {
			user?: TokenPayload;
		}
	}
}

app.post('/api/token', (req: Request, res: Response) => {
	if (req.headers['content-type'] !== 'application/json') {
		return res.status(400).json({ error: 'Invalid Content-Type. Expected application/json' });
	}
	const { email } = req.body;
	const date = new Date();

	if (!email) {
		return res.status(400).json({ error: 'Email is required' });
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  	if (!emailRegex.test(email)) {
    	return res.status(400).json({ error: 'Invalid email format' });
  	}

	const token = jwt.sign({ email }, SECRET_KEY);
	wordCounts[token] = {count: 0, date : date.getDate()};
  	console.log("date : ", wordCounts[token].date);

	res.json({ token });
});

app.post('/api/justify', authenticateToken, rateLimitMiddleware,(req: Request, res: Response) => {
	const contentType = req.headers['content-type'];

	if (contentType !== 'text/plain') {
			return res.status(400).json({ error: 'Invalid Content-Type. Expected text/plain' });
	}
	
	const text = req.body;

	if (!text) {
		return res.status(400).json({ error: 'Text is required' });
	}

	const justifiedText = justifyText(text, 80);

	console.log(justifiedText);

	res.send({justifiedText});
});


const port = 3000;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

export default app;
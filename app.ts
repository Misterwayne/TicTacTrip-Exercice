import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { justifyText } from './srcs/JustifyLine';

const app = express();
app.use(bodyParser.text());
app.use(bodyParser.json());

// Load environment variables from .env file
dotenv.config();

export const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export interface TokenPayload {
	email: string;
}

export interface WordCount {
		[token: string]: number;
}

export interface DateTracking {
		[token: string]: number;
}
	
let wordCounts: WordCount = {};

let dates: DateTracking = {};

declare global {
	namespace Express {
		interface Request {
			user?: TokenPayload;
		}
	}
}

export function countWords(text: string): number {

    if (typeof text !== 'string') {
            text = String(text);
    }
    // Remove leading and trailing whitespaces
    text = text.trim();

    // Split the text into an array of words
    const words: string[] = text.split(/\s+/);
    // Return the length of the words array
    return words.length;
}

const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const wordCount = wordCounts[token] || 0;

    const text = req.body;
    const newWordCount = countWords(text);

    if (wordCount + newWordCount > 80000) {
        return res.status(402).json({ error: 'Payment Required' });
    }
    wordCounts[token] = wordCount + newWordCount;

    next();
};

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    
    const token = req.headers.authorization;
    const Currentdate = new Date();
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    // try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY) as TokenPayload;
        req.user = decoded;
		let date = dates[token] || Currentdate.getDate();
        if (date !== Currentdate.getDate()){
            //check if the token was made today
            console.log("word count reseted");
            wordCounts[token] = 0;
			dates[token] = Currentdate.getDate();
        }
        next();
    // } catch (error) {
    //     return res.status(403).json({ error: 'Invalid token' });
    // }
};

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
	wordCounts[token] = 0;
	dates[token] = date.getDate();
  	console.log("date : ", dates[token]);

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


const port = 3002;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

export default app;
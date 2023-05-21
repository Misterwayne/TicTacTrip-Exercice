import { Request, Response, NextFunction } from 'express';
import { wordCounts, SECRET_KEY, TokenPayload} from '../app';
import jwt from 'jsonwebtoken';

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

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const wordCount = wordCounts[token].count || 0;

    const text = req.body;
    const newWordCount = countWords(text);

    if (wordCount + newWordCount > 80000) {
        return res.status(402).json({ error: 'Payment Required' });
    }
    wordCounts[token].count = wordCount + newWordCount;

    next();
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    
    const token = req.headers.authorization;
    const Currentdate = new Date();
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY) as TokenPayload;
        req.user = decoded;
        if (wordCounts[token].date !== Currentdate.getDate()){
            //check if the token was made today
            console.log("word count reseted");
            wordCounts[token].count = 0;
            wordCounts[token].date = Currentdate.getDate();
        }
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};
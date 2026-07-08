import { Hono } from 'hono';
import type { Variables } from '../../types';
import { handlePrompt, handleSubmit } from './controller';

const router = new Hono<{ Variables: Variables }>();

router.get('/prompt', handlePrompt);
router.post('/submit', handleSubmit);

export default router;

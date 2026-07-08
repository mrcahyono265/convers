import { Hono } from 'hono';
import type { Variables } from '../../types';
import { handleMessage } from './controller';

const router = new Hono<{ Variables: Variables }>();

router.post('/message', handleMessage);

export default router;

import { Hono } from 'hono';
import type { Variables } from '../../types';
import { handleMetrics, handleSaveProgress } from './controller';

const router = new Hono<{ Variables: Variables }>();

router.get('/metrics', handleMetrics);
router.post('/progress/minutes', handleSaveProgress);

export default router;

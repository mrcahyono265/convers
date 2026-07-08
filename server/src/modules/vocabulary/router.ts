import { Hono } from 'hono';
import type { Variables } from '../../types';
import { handleList, handlePractice, handleRecite } from './controller';

const router = new Hono<{ Variables: Variables }>();

router.get('/', handleList);
router.post('/:id/practice', handlePractice);
router.post('/:id/recite', handleRecite);

export default router;

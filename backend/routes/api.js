import express from 'express';
import {
  getThinkingQuestions,
  getJudgeEvaluation,
  getImprovedIdea,
  getPitch
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/thinking', getThinkingQuestions);
router.post('/judge', getJudgeEvaluation);
router.post('/improve', getImprovedIdea);
router.post('/pitch', getPitch);

export default router;

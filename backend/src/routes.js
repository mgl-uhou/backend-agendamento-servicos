import { Router } from "express";
import agendamentoController from "./app/controllers/agendamentoController.js";
import userController from "./app/controllers/userController.js";
import servicoController from "./app/controllers/servicoController.js";
import authMiddleware from "./app/middlewares/authMiddleware.js";

const router = Router();

router.get('/user', authMiddleware, userController.index.bind(userController));
router.get('/profile', authMiddleware, userController.getProfile.bind(userController));
router.post('/cadastro', userController.store.bind(userController));
router.post('/login', userController.login.bind(userController));
router.get('/user/:id', userController.show.bind(userController));
router.put('/user/:id', authMiddleware, userController.update.bind(userController));
router.delete('/user', authMiddleware, userController.delete.bind(userController));

router.get('/agendamentos', authMiddleware, agendamentoController.index.bind(agendamentoController));
router.get('/agendamentos/user_id', authMiddleware, agendamentoController.showByUserID.bind(agendamentoController));
router.get('/agendamentos/horas', agendamentoController.showHour.bind(agendamentoController));
router.post('/agendamentos', authMiddleware, agendamentoController.store.bind(agendamentoController));
router.put('/agendamentos/:id', authMiddleware, agendamentoController.update.bind(agendamentoController));
router.delete('/agendamentos/:id', authMiddleware, agendamentoController.delete.bind(agendamentoController));

router.get('/servicos', servicoController.index.bind(servicoController));
router.get('/servicos/:id', servicoController.show.bind(servicoController));
router.post('/servicos', authMiddleware, servicoController.store.bind(servicoController));
router.put('/servicos/:id', authMiddleware, servicoController.update.bind(servicoController));
router.delete('/servicos/:id', authMiddleware, servicoController.delete.bind(servicoController));

export default router;
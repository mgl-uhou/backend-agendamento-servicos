import jwt from "jsonwebtoken";
import repository from "../repositories/repository.js";
import userController from "../controllers/userController.js";

async function authMiddleware(req, res, next) {
	try {
		const { authorization } = req.headers;
		if (!authorization) throw new Error("Não autorizado.");

		const token = authorization.split(" ")[1];

		const { id } = jwt.verify(token, process.env.jwt_pass);
		const user = await repository.findUser(
			userController.getNomeTabela(),
			id,
			"id"
		);
		if (user.length !== 1) throw new Error("Não autorizado.");

		const { senha: _, ...loggedUser } = user[0];

		req.user = loggedUser;

		next();
	} catch (error) {
		res.status(401).send(error.message);
	}
}

export default authMiddleware;

/* 
O middleware eu uso em qualquer rota segura, 
no frontend eu guardo as informações do usuário 
com o login/cadastro e com isso, fico enviando o 
token a cada requisição do front no header 
*/

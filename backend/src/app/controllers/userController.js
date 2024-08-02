import repository from "../repositories/repository.js";
import Controller from "./controller.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

class UserController extends Controller {
	constructor(nomeTabela, atributoId, atributos) {
		super(nomeTabela, atributoId, atributos);
	}

	async store(req, res) {
		/* {
			"nome": "Teste2",
			"sobrenome": "dos Santos2",
			"email": "ts15@aluno.ifal.edu.br",
			"senha": "testeSenhaSegura2"
		} */
		const { nome, sobrenome, email, senha } = req.body;

		try {
			if(senha.length < 8) throw new Error('Senha inválida.');

			const userExists = await repository.findUser(
				this.getNomeTabela(),
				email,
				"email"
			);
			if (userExists.length !== 0) throw new Error("Usuário já existe.");

			const hashPassword = await bcrypt.hash(senha, 10);

			const newUser = await repository.addRow(
				this.getNomeTabela(),
				this.getAtributos().join(", "),
				[nome, sobrenome, email, hashPassword]
			);
			// const { senha: _, ...user } = newUser;
			res.status(201).json(newUser);
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	}

	async login(req, res) {
		const { email, senha } = req.body;

		try {
			const user = await repository.findUser(
				this.getNomeTabela(),
				email,
				"email"
			);
			if (user.length !== 1) throw new Error("E-mail ou senha inválido.");

			const verifyPass = await bcrypt.compare(senha, user[0].senha);
			if (!verifyPass) throw new Error("E-mail ou senha inválido.");

			const token = jwt.sign({ id: user[0].id, admin: user[0].administrador }, process.env.jwt_pass, {
				expiresIn: "1h",
			});

			const { senha: _, ...userLogin } = user[0];
			res.status(200).json({
				user: userLogin,
				token,
			});
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	}

	async getProfile(req, res) {
		return res.status(200).json(req.user);
	}

	async delete(req, res) {
		const result = await repository.deleteById(
			this.getNomeTabela(),
			this.getAtributoId(),
			[req.user.id]
		);
		res.json(result);
	}

	async update(req, res) {
		const id = req.user.id;
		const variables = Object.values(req.body); // Desestruturo o objeto e transformo em um array.
		const result = await repository.updateById(
			this.getNomeTabela(),
			this.getAtributos().join(", "),
			this.getAtributoId(),
			[...variables, id] // aqui o id é passada como último elemento do array.
		); // ...array desestrutura o array dentro de outro array na ordem em que estão.
		res.json(result);
	}
}

const userController = new UserController("usuarios", "id", [
	"nome",
	"sobrenome",
	"email",
	"senha",
]);

export default userController;

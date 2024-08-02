import Controller from "./controller.js";
import repository from "../repositories/repository.js";

class AgendamentoController extends Controller{
	constructor(nomeTabela, atributoId, atributos){
		super(nomeTabela, atributoId, atributos);
	}

	async index(request, response) {
		if(!request.user.id || !request.user.administrador) return res.status(401).send("Não autorizado.")
		let result = await repository.getAllOrderByDate(this.getNomeTabela());
		response.json(result);
	}

	async store(req, res) {
		let variables = Object.values(req.body); // Object.values() cria um array com os valores das chaves de um objeto na ordem em que elas estão.
		variables.unshift(req.user.id);
		let servico = req.body.servico;
		let validaServico = ['manicure', 'pedicure', 'geral'].some(elemento => elemento === servico);
		if(servico && !validaServico) return res.json({ error: "Serviço não existente." });
		const result = await repository.addRow(
			this.getNomeTabela(),
			this.getAtributos().join(", "),
			variables
		);
		res.json(result);
	}

	async showByUserID(req, res){
		const id = req.user.id;
		const result = await repository.getByUserID(this.getNomeTabela(), id);
		res.json(result);
	}

	async update(req, res) {
		const id = req.params.id;
		const variables = Object.values(req.body); // Desestruturo o objeto e transformo em um array.
		variables.unshift(req.user.id)
		const result = await repository.updateById(
			this.getNomeTabela(),
			this.getAtributos().join(", "),
			this.getAtributoId(),
			[...variables, id] // aqui o id é passada como último elemento do array.
		); // ...array desestrutura o array dentro de outro array na ordem em que estão.
		res.json(result);
	}

	async showHour(req, res){
		const result = await repository.getHour(this.getNomeTabela(), req.query.data);
		res.json(result);
	}
}

const agendamentoController = new AgendamentoController('agendamentos', "id", ['user_id', 'servico_id', 'data_hora', 'status'])

export default agendamentoController;

"use strict";

import Controller from "./controller.js";
import repository from "../repositories/repository.js";

class ServicoController extends Controller{
	constructor(nomeTabela, atributoId, atributos){
		super(nomeTabela, atributoId, atributos);
	}
	
	// método que mostra todos os elementos da tabela.
	async index(_req, res) {
		let result = await repository.getAll(this.getNomeTabela());
		res.json(result);
	}
}

const servicoController = new ServicoController('servicos', 'id', ['nome', 'valor']);
export default servicoController;
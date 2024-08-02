"use strict";

import repository from "../repositories/repository.js";

class Controller { 
	/**
	 *
	 * @param {string} nomeTabela Nome da tabela à qual o objeto referencia
	 * @param {string || Array} atributoId Nome do seu atributo identificador.
	 * @param {Array} atributos Array contendo o nome de todos os outros atributos como string
	 */
	constructor(nomeTabela, atributoId, atributos) {
		this._nomeTabela = nomeTabela;
		this._atributoId = atributoId;
		this._atributos = atributos;
	}
	getNomeTabela = () => this._nomeTabela;
	getAtributoId = () => this._atributoId;
	getAtributos = () => this._atributos;

	// método que mostra todos os elementos da tabela.
	async index(request, response) {
		if(!request.user.id || !request.user.administrador) return res.status(401).send("Não autorizado.")
		let result = await repository.getAll(this.getNomeTabela());
		response.json(result);
	}

	// método que adiciona um elemento à tabela.
	async store(request, response) {
		let variables = Object.values(request.body); // Object.values() cria um array com os valores das chaves de um objeto na ordem em que elas estão.
		let servico = request.body.servico;
		let validaServico = ['manicure', 'pedicure', 'geral'].some(elemento => elemento === servico);
		if(servico && !validaServico) return response.json({ error: "Serviço não existente." });
		const result = await repository.addRow(
			this.getNomeTabela(),
			this.getAtributos().join(", "),
			variables
		);
		response.json(result);
	}

	// método que mostra elementos com base em seu id
	async show(request, response) {
		const id = request.params.id;
		const result = await repository.getById(
			this.getNomeTabela(),
			this.getAtributoId(),
			id
		);
		// Abaixo, formato de modo simples o resultado da response.
		response.json(result);
	}

	// método que atualiza um elemento
	async update(request, response) {
		const id = request.params.id;
		const variables = Object.values(request.body); // Desestruturo o objeto e transformo em um array.
		const result = await repository.updateById(
			this.getNomeTabela(),
			this.getAtributos().join(", "),
			this.getAtributoId(),
			[...variables, id] // aqui o id é passada como último elemento do array.
		); // ...array desestrutura o array dentro de outro array na ordem em que estão.
		response.json(result);
	}
	
	// método que deleta um elemento da tabela
	async delete(request, response) {
		const result = await repository.deleteById(
			this.getNomeTabela(),
			this.getAtributoId(),
			[request.params.id]
		);
		response.json(result);
	}
}

export default Controller;

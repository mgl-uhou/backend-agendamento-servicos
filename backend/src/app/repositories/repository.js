import pool from "../database/pool.js";

class Repository{
	/**
	 *
	 * @param {string} sql Instrução sql.
	 * @param {array} values Array de valores á ser passado para a pool.
	 * @param {string} errorMessage Mensagem de erro à ser passada para a pool.
	 * @returns
	 */
	async exception(sql, values = [], errorMessage) {
		try {
			const result = await pool.connection(sql, values, errorMessage);
			return result;
		} catch (error) {
			console.error(
				"Não foi possível realizar a consulta. Error:",
				error
			);
			return error.message;
		}
	}

	/**
	 *
	 * @param {string} nomeTabela Nome da tabela
	 * @returns Resultado da consulta em JSON
	 */
	getAll(nomeTabela) {
		const sql = `select * from ${nomeTabela} order by id;`; // Aqui eu formato a query;
		return this.exception(
			sql,
			[],
			"Não foi possível mostrar os resultados solicitados."
		);
	}

	getAllOrderByDate(nomeTabela) {
		const sql = `select * from ${nomeTabela} where year(data_hora) = year(current_date()) and month(data_hora) = month(current_date()) order by data_hora;`; // Aqui eu formato a query;
		return this.exception(
			sql,
			[],
			"Não foi possível mostrar os resultados solicitados."
		);
	}

	getHour(nomeTabela, data){
		const sql = `select hour(data_hora) as hora from ${nomeTabela} where date(data_hora) = ?;`
		return this.exception(sql, [ data ], "Não foi possível buscar os horários buscados.");
	}

	/**
	 *
	 * @param {string} nomeTabela Nome da tabela que será usada para a inserção de dados.
	 * @param {string} nomeAtributos Nome dos atributos separados por vírgula.
	 * @param {array} values Array de valores para as propriedades.
	 * @returns Retorna o resultado da inserção.
	 */
	addRow(nomeTabela, nomeAtributos, values) {
		const arrayNomes = nomeAtributos.split(","); // Transformo a string em um array de nomes.
		const interrogacoes = arrayNomes.map(() => "?").join(", "); // Uso o array de nomes como base para definir o Prepared Statement. 
		const sql = `insert into ${nomeTabela} (${nomeAtributos}) values (${interrogacoes})`; // Aqui eu formato a query;
		return this.exception(
			sql,
			values,
			"Não foi possível fazer a inserção dos dados. Verifique-os e garanta que estão todos preenchidos corretamente."
		);
	}

	/**
	 *
	 * @param {string} nomeTabela Nome da tabela.
	 * @param {string} atributoId Nome do atributo identificador da tabela.
	 * @param {number} id Valor do id do elemento.
	 * @returns Retorna em JSON o elemento procurado, nada ou uma mensagem de erro.
	 */
	getById(nomeTabela, atributoId, id) {
		const sql = `select * from ${nomeTabela} where ${atributoId} = ?;`; // Aqui eu formato a query;
		return this.exception(
			sql,
			[id],
			"Não foi possível encontrar o que foi solicitado. Certifique-se de ser algo existente na base de dados."
		);
	}

	/**
	 * 
	 * @param {string} nomeTabela Nome da Tabela
	 * @param {string | Number} atributo Valor do atributo.
	 * @param {string} nomeAtributo Nome do atributo na tabela.
	 * @returns 
	 */
	findUser(nomeTabela, atributo, nomeAtributo){
		const sql = `select * from ${nomeTabela} where ${nomeAtributo} = ?;`;
		return this.exception(sql, [ atributo ], "Erro ao pesquisar usuário.");
	}

	/**
	 * 
	 * @param {string} nomeTabela Nome da tabela. 
	 * @param {number} id Valor da foreign key
	 * @returns 
	 */
	getByUserID(nomeTabela, id){
		const sql = `select * from ${nomeTabela} where user_id = ? order by data_hora;`; // Aqui eu formato a query;
		return this.exception(
			sql,
			[id],
			"Não foi possível encontrar o que foi solicitado. Certifique-se de ser algo existente na base de dados."
		);
	}

	/**
	 *
	 * @param {string} nomeTabela Nome da tabela.
	 * @param {string} propriedades Nome das propriedades da tabela separados por vírgula..
	 * @param {string} atributoId Nome do atributo identificador da tabela.
	 * @param {array} values Array de valores à serem passados na query
	 * @returns Retorna o resultado da consulta.
	 */
	updateById(nomeTabela, propriedades, atributoId, values) {
		// Na linha abaixo eu separo a string e transformo ela em um array, depois eu adiciono "= ?" em cada elemento do array e por fim, junto tudo numa string
		const propriedadeValor = propriedades.split(",").map((p) => `${p} = ?`).join(", ");
		const sql = `update ${nomeTabela} set ${propriedadeValor} where ${atributoId} = ?;`; // Aqui eu formato a query;
		return this.exception(
			sql,
			values,
			"Não foi possível atualizar. Certifique-se de usar os valores corretor e de que o elemento existe na base de dados."
		);
	}
	
	/**
	 *
	 * @param {string} nomeTabela Nome da tabela.
	 * @param {string} atributoId Nome do atributo identificador da tabela.
	 * @param {number || array} id Número do atributo identificador do elemento que será deletado.
	 * @returns  Retorna o resultado da consulta.
	 */
	deleteById(nomeTabela, atributoId, id) {
		const sql = `delete from ${nomeTabela} where ${atributoId} = ?;`; // Aqui eu formato a query;
		return this.exception(
			sql,
			id,
			"Não foi possível fazer a deleção. Certifique-se de que o elemento existe na base de dados."
		);
	}
}

const repository = new Repository();

export default repository;
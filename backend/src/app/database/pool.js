"use strict";

import axios from "axios";
import mysql2 from "mysql2";
import dotenv from "dotenv";
import repository from "../repositories/repository.js";
dotenv.config();

class Pool {
	constructor(
		host = process.env.mysql_host || 'localhost',
		port = process.env.mysql_port || 3306,
		user = process.env.mysql_user || "root",
		password = process.env.mysql_pass || "",
		database = process.env.mysql_db || "cuide_se",
		waitForConnections = true,
		connectionLimit = 10,
		maxIdle = 10,
		idleTimeout = 60000,
		queueLimit = 0,
		enableKeepAlive = true,
		keepAliveInitialDelay = 0
	) {
		this.host = host;
		this.port = port;
		this.user = user;
		this.password = password;
		this.database = database;
		this.waitForConnections = waitForConnections;
		this.connectionLimit = connectionLimit;
		this.maxIdle = maxIdle;
		this.idleTimeout = idleTimeout;
		this.queueLimit = queueLimit;
		this.enableKeepAlive = enableKeepAlive;
		this.keepAliveInitialDelay = keepAliveInitialDelay;

		this._pool = mysql2.createPool({
			host,
			port,
			user,
			password,
			waitForConnections,
			connectionLimit,
			maxIdle,
			idleTimeout,
			queueLimit,
			enableKeepAlive,
			keepAliveInitialDelay,
		});

		this.initializeDatabase(database);
	}

	async initializeDatabase(database) {
		try {
			await this.createDataBaseIfNotExists(database);

			// Sobrescrevendo a pool de conexões.
			this._pool = mysql2.createPool({
				host: this.host,
				port: this.port,
				user: this.user,
				password: this.password,
				database,
				waitForConnections: this.waitForConnections,
				connectionLimit: this.connectionLimit,
				maxIdle: this.maxIdle,
				idleTimeout: this.idleTimeout,
				queueLimit: this.queueLimit,
				enableKeepAlive: this.enableKeepAlive,
				keepAliveInitialDelay: this.keepAliveInitialDelay,
			});

			await this.createTablesIfNotExists();
			await this.createUserAdminIfNotExists();
			
			console.log("Banco de dados inicializado com sucesso.");
		} catch (error) {
			console.error("Erro durante a inicialização do banco de dados:", error.message);
			process.exit(1); // Encerra o processo se não for possível conectar ao banco de dados
		}
	}

	async createDataBaseIfNotExists(database) {
		let conn;
		try {
			conn = await this.getPool().promise().getConnection();
			if (!conn)
				throw new Error("Não foi possível estabelecer a conexão.");

			await conn.query(
				`CREATE DATABASE IF NOT EXISTS ${database}
				DEFAULT CHARSET utf8mb4
				DEFAULT COLLATE utf8mb4_unicode_ci;`
			);
		} catch (error) {
			console.error("Erro ao criar a base de dados:", error.message);
			throw error;
		} finally {
			if (conn) conn.release();
		}
	}

	async createTablesIfNotExists() {
		try {
			await this.connection(
				`CREATE TABLE IF NOT EXISTS servicos(
					id INT AUTO_INCREMENT PRIMARY KEY,
					nome VARCHAR(50) NOT NULL,
					valor DECIMAL(6, 2) NOT NULL
				);`,
				[],
				"Não foi possível criar a tabela servicos."
			);

			await this.connection(
				`CREATE TABLE IF NOT EXISTS usuarios (
					id INT AUTO_INCREMENT PRIMARY KEY,
					nome VARCHAR(50) NOT NULL,
					sobrenome VARCHAR(100) NOT NULL,
					email VARCHAR(190) UNIQUE NOT NULL,
					senha VARCHAR(190) NOT NULL,
					administrador BOOLEAN DEFAULT FALSE
				);`,
				[],
				"Não foi possível criar a tabela usuarios."
			);

			await this.connection(
				`CREATE TABLE IF NOT EXISTS agendamentos (
					id INT AUTO_INCREMENT PRIMARY KEY,
					user_id INT NOT NULL,
					servico_id INT NOT NULL,
					data_hora DATETIME NOT NULL UNIQUE,
					status VARCHAR(50) CHECK(status IN ("pendente", "concluído")) DEFAULT "pendente",
					FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
					FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE CASCADE
				);`,
				[],
				"Não foi possível criar a tabela agendamentos."
			);
		} catch (error) {
			console.error("Erro durante a criação das tabelas:", error.message);
			throw error;
		}
	}

	async createUserAdminIfNotExists(){
		try {
			const userExists = await repository.findUser(
				'usuarios',
				process.env.email_adm || 'admin@gmail.com',
				"email"
			);
			if (userExists.length !== 0) return;

			const response = await axios.post(`http://${process.env.mysql_host}:${process.env.port}/cadastro`, {
				nome: process.env.nome_adm || 'Admin',
				sobrenome: process.env.sobrenome_adm || 'Adm',
				email: process.env.email_adm || 'admin@gmail.com',
				senha: process.env.senha_adm || '1234abcd',
			});
			
			if (response.status !== 200 && response.status !== 201) throw new Error("Cadastro do administrador falhou.");
	
			await this.connection(`
				UPDATE usuarios SET administrador = 1 WHERE email = "${process.env.email_adm || 'admin@gmail.com'}";
			`, [], 'Erro ao criar usuário administrador.');
+
			console.log("Administrador criado com sucesso.");
		} catch (error) {
			console.error("Erro ao criar usuário administrador:", error.message);
		}
	}

	getPool = () => this._pool;

	/**
	 * 
	 * @param {string} sql Comando SQL que será executado no banco de dados. 
	 * @param {Array} valores Array com os valores que serão passados para o banco de dados.
	 * @param {string} errorMessage Mensagem de erro que será mostrada caso a execução do comando falhe.
	 * @returns Resultado da consulta.
	 */
	async connection(sql, valores, errorMessage) {
		let conn;
		try {
			conn = await this.getPool().promise().getConnection();
			if (!conn)
				throw new Error("Não foi possível estabelecer uma conexão.");

			const [rows, _fields] = await conn.execute(sql, valores);
			return rows;
		} catch (error) {
			console.error("Erro durante a execução da consulta:", error.message);
			throw new Error(errorMessage);
		} finally {
			if (conn) conn.release();
		}
	}
}

const pool = new Pool();

export default pool;

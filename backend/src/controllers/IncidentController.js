const connection = require('../database/connection');

module.exports = {
	async index(request, response) {
		const { page = 1 } = request.query;
		
		const limit = 5;

		const incidents = await connection('incidents')
			.join('ongs', 'ongs.id', '=', 'incidents.ong_id')
			.limit(limit)
			.offset((page - 1) * limit)
			.select([
				'incidents.*',
				'ongs.name',
				'ongs.email',
				'ongs.whatsapp',
				'ongs.city',
				'ongs.uf'
			]);

		const [count] = await connection('incidents').count();

		response.header('X-Total-Count', count['count(*)']);
		response.json(incidents);
	},

	async create(request, response) {
		const { title, description, value } = request.body;
		const ong_id = request.headers.authorization;

		const [id] = await connection('incidents').insert({
			title,
			description,
			value,
			ong_id
		});
	
		response.json({ id });
	},

	async delete(request, response) {
		const { id } = request.params;
		const ong_id = request.headers.authorization;

		const incident = await connection('incidents')
			.where('id', id)
			.select('ong_id')
			.first();

		console.log(incident)

		if (!incident) {
			return response.status(404).json({ error: 'Not found.' });
		}

		if (incident.ong_id != ong_id) {
			return response.status(403).json({ error: 'Operation not permitted.' })
		}

		await connection('incidents').where('id', id).delete();

		response.sendStatus(204);
	}
};
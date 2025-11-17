import axios from 'axios';

const api = axios.create({
	baseURL: '/api',
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true // Para enviar cookies
});

export default api;

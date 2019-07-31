import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://backend.gaea.cf/',
  timeout: 1000
});

export default instance;
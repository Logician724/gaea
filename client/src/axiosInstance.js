import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://backend.gaea.cf/',
  timeout: 1000
});

export default instance;
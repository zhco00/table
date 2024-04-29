import axios from 'axios';

export const instance = axios.create({
  baseURL: '???',
  timeout: 1000,
  headers: { access_token: '???' },
});

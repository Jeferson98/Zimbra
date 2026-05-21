import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

export async function getHTTP(path: string, query: any = {}) {
  try {
    const response = await api.get(path, { params: query });
    return response.data;
  } catch (error) {
    manejarError(error);
  }
}

export async function postHTTP(path: string, data: any = {}) {
  try {
    const response = await api.post(path, data);
    return response.data;
  } catch (error) {
    manejarError(error);
  }
}

export async function putHTTP(path: string, data: any = {}) {
  try {
    const response = await api.put(path, data);
    return response.data;
  } catch (error) {
    manejarError(error);
  }
}

export async function deleteHTTP(path: string) {
  try {
    const response = await api.delete(path);
    return response.data;
  } catch (error) {
    manejarError(error);
  }
}

function manejarError(error: any) {
  if (error.response) {
    console.log('Status:', error.response.status);

    if (error.response.status === 500) {
      console.log('Error servidor ❌');
    }

    console.log(error.response.data);
  } else {
    console.log('Error de conexión 🌐');
  }

  throw error;
}
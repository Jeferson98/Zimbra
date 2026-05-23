/*import axios from "axios"

const API_URL = "http://localhost:3000/api/UsuariosMaestro"

export const login = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, {
    username,
    password
  })

  return response.data
}*/

type LoginResponse = {
  token: string;
  user: {
    id: number;
    nombre: string;
    email: string;
    rol_id: number;
  };
};

const MOCK_AUTH_ENABLED = true;

export async function login(username: string, password: string): Promise<LoginResponse> {
  if (!MOCK_AUTH_ENABLED) {
    throw new Error("Backend desactivado temporalmente");
  }

  if (!username || !password) {
    throw new Error("Debes completar usuario y contraseña");
  }

  return {
    token: "mock-token-zimbra",
    user: {
      id: 1,
      nombre: "Admin Demo",
      email: "admin@zimbra.com",
      rol_id: 1,
    },
  };
}
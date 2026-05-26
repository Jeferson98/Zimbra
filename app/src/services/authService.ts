import api from "./api";

type LoginResponse = {
  token: string;
  user: {
    id: number;
    nombre: string;
    email: string;
    rol_id: number;
  };
};

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {

  const response = await api.post(
    "/api/Usuarios/login",
    {
      email,
      password,
    }
  );

  return response.data;
}
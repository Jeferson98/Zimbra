import type { Archivo } from "../types";
import api from "./api";

export const obtenerArchivos = async (): Promise<Archivo[]> => {
    const response = await api.get("/api/archivos");
    return response.data;
};


export const crearArchivo = async (
    archivo: {
        usuario_id: number;
        nombre: string;
        ruta: string;
    }
) => {

    const response = await api.post(
        "/api/archivos",
        archivo
    );

    return response.data;
};


export const eliminarArchivo = async (
    id: number
) => {

    const response = await api.delete(
        `/api/archivos/${id}`
    );

    return response.data;
};
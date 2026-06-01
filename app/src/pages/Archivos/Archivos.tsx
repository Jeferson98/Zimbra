import { useEffect, useState } from "react";
import {
    crearArchivo,
    eliminarArchivo,
    obtenerArchivos
} from "../../services/archivoService";

function Archivos() {

    const [archivos, setArchivos] = useState<any[]>([]);
    const [nombre, setNombre] = useState("");

    const cargarArchivos = async () => {
        const data = await obtenerArchivos();
        setArchivos(data);
    };

    useEffect(() => {
        cargarArchivos();
    }, []);

    const guardarArchivo = async () => {

        const user = JSON.parse(
            localStorage.getItem("user") || "{}"
        );

        await crearArchivo({
            usuario_id: user.id,
            nombre,
            ruta: nombre
        });

        setNombre("");

        cargarArchivos();
    };

    const borrarArchivo = async (id:number) => {

        await eliminarArchivo(id);

        cargarArchivos();
    };

return (

    <div className="module-container">

        <h2>Archivos</h2>

        <div className="card">

            <input
                type="text"
                placeholder="Nombre archivo"
                value={nombre}
                onChange={(e)=>setNombre(e.target.value)}
            />

            <button onClick={guardarArchivo}>
                Guardar
            </button>

        </div>

        <table>

            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Usuario</th>
                    <th>Fecha</th>
                    <th></th>
                </tr>
            </thead>

            <tbody>

                {
                    archivos.map((archivo)=>(
                        <tr key={archivo.id}>

                            <td>{archivo.id}</td>

                            <td>{archivo.nombre}</td>

                            <td>{archivo.usuario}</td>

                            <td>{archivo.fecha_subida}</td>

                            <td>

                                <button
                                    onClick={() =>
                                        borrarArchivo(archivo.id)
                                    }
                                >
                                    Eliminar
                                </button>

                            </td>

                        </tr>
                    ))
                }

            </tbody>

        </table>

    </div>
);
}

export default Archivos;
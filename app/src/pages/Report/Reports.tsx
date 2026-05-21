type ReportsProps = {
    openMenu: boolean;
    setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
};
function Reports({ openMenu, setOpenMenu }: ReportsProps){
    return (
        <div className={`page-container ${openMenu ? "open" : ""}`} 
        onClick={() => {setOpenMenu(false)}}
    >
            <div className="login-blob login-blob--1" />
            <div className="login-blob login-blob--2" />
            <div className="login-blob login-blob--3" />
            <div className="sites-wrapper" onClick={(e) => e.stopPropagation()}>
                <div className="sites-header">
                <header>
                    <h1>Portal Web de Contenido Aleatorio</h1>
                    <p>Ejemplo de documento HTML largo con múltiples secciones</p>
                </header>

                <nav>
                    <a href="#inicio">Inicio</a>
                    <a href="#articulos">Artículos</a>
                    <a href="#galeria">Galería</a>
                    <a href="#tabla">Tabla</a>
                    <a href="#formulario">Formulario</a>
                </nav>

                <section id="inicio">
                    <h2>Inicio</h2>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse potenti. Curabitur non magna nec urna tincidunt posuere.</p>
                    <p>Integer malesuada, nisl in bibendum fermentum, augue erat tincidunt urna, a convallis libero magna a justo.</p>
                    <p>Aliquam erat volutpat. Fusce quis ligula nec justo dignissim pretium non ut velit.</p>
                </section>

                <section id="articulos">
                    <h2>Artículos Destacados</h2>

                    <article>
                        <h3>Artículo 1</h3>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque feugiat leo non magna facilisis, nec posuere odio tempor.</p>
                    </article>

                    <article>
                        <h3>Artículo 2</h3>
                        <p>Donec finibus, nulla at fermentum tempus, justo lorem dignissim magna, at interdum risus nulla non nunc.</p>
                    </article>

                    <article>
                        <h3>Artículo 3</h3>
                        <p>Vivamus non lacus et urna tincidunt tincidunt. Morbi id dui vitae urna commodo tincidunt.</p>
                    </article>

                    <div className="grid">
                        <div className="card">
                            <h4>Tarjeta 1</h4>
                            <p>Contenido aleatorio en tarjeta uno.</p>
                        </div>
                        <div className="card">
                            <h4>Tarjeta 2</h4>
                            <p>Contenido aleatorio en tarjeta dos.</p>
                        </div>
                        <div className="card">
                            <h4>Tarjeta 3</h4>
                            <p>Contenido aleatorio en tarjeta tres.</p>
                        </div>
                    </div>
                </section>

                <section id="galeria">
                    <h2>Galería de Imágenes</h2>
                    <img src="https://via.placeholder.com/300x200" alt="Imagen 1"/>
                    <img src="https://via.placeholder.com/300x200" alt="Imagen 2"/>
                    <img src="https://via.placeholder.com/300x200" alt="Imagen 3"/>
                </section>

                <section id="tabla">
                    <h2>Tabla de Datos Aleatorios</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Elemento A</td>
                                <td>123</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Elemento B</td>
                                <td>456</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Elemento C</td>
                                <td>789</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section id="formulario">
                    <h2>Formulario de Contacto</h2>
                    <form>
                        <label>Nombre:</label>
                        <input type="text" name="nombre"/>

                        <label>Email:</label>
                        <input type="email" name="email"/>

                        <label>Mensaje:</label>
                        <textarea name="mensaje" rows={5}></textarea>

                        <label>País:</label>
                        <select>
                            <option>Argentina</option>
                            <option>España</option>
                            <option>México</option>
                            <option>Chile</option>
                        </select>

                        <input type="submit" value="Enviar"/>
                        <button>asd</button>
                    </form>
                </section>

                <section>
                    <h2>Contenido Extendido</h2>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
                    <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.</p>
                    <p>Nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur?</p>
                    <p>Vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
                    <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque.</p>
                    <p>Et harum quidem rerum facilis est et expedita distinctio.</p>
                </section>

                <footer>
                    <p>&copy; 2026 Portal Web de Ejemplo - Todos los derechos reservados</p>
                </footer>
            </div>
        </div>
    </div>
        )
    
}


export default Reports;
// notificaciones.js

const lista = document.getElementById("listaNotificaciones");

const tabs = document.querySelectorAll(".tab");

let notificaciones = [

    {
        id:1,
        tipo:"mensajes",
        icono:"fa-envelope",
        mensaje:"Nuevo mensaje de un inversionista.",
        fecha:"Hace 2 minutos",
        leida:false
    },

    {
        id:2,
        tipo:"noticias",
        icono:"fa-newspaper",
        mensaje:"Nueva noticia sobre startups tecnológicas.",
        fecha:"Hace 15 minutos",
        leida:false
    },

    {
        id:3,
        tipo:"amistad",
        icono:"fa-user-plus",
        mensaje:"Carlos quiere conectar contigo.",
        fecha:"Hace 1 hora",
        leida:false
    }

];

function renderizar(filtro="todas"){

    lista.innerHTML = "";

    let filtradas = notificaciones.filter(n => {

        if(filtro === "todas"){
            return true;
        }

        return n.tipo === filtro;

    });

    filtradas.forEach(n => {

        const div = document.createElement("div");

        div.className = `
            notificacion
            ${!n.leida ? "no-leida" : ""}
        `;

        let botones = "";

        if(n.tipo === "amistad"){

            botones = `
                <button class="btn aceptar">
                    Aceptar
                </button>

                <button class="btn rechazar">
                    Rechazar
                </button>
            `;

        }else{

            botones = `
                <button class="btn leer">
                    Marcar leída
                </button>
            `;
        }

        div.innerHTML = `

            <div class="info">

                <div class="icono">
                    <i class="fa-solid ${n.icono}"></i>
                </div>

                <div class="textos">

                    <span class="tipo">
                        ${n.tipo.toUpperCase()}
                    </span>

                    <span class="mensaje">
                        ${n.mensaje}
                    </span>

                    <span class="fecha">
                        ${n.fecha}
                    </span>

                </div>

            </div>

            <div class="botones">
                ${botones}
            </div>
        `;

        const btnLeer = div.querySelector(".leer");

        if(btnLeer){

            btnLeer.addEventListener("click", ()=>{

                n.leida = true;

                renderizar(filtro);

            });

        }

        const btnAceptar = div.querySelector(".aceptar");

        if(btnAceptar){

            btnAceptar.addEventListener("click", ()=>{

                n.leida = true;

                n.mensaje = "Conexión aceptada.";

                renderizar(filtro);

            });

        }

        const btnRechazar = div.querySelector(".rechazar");

        if(btnRechazar){

            btnRechazar.addEventListener("click", ()=>{

                notificaciones = notificaciones.filter(
                    item => item.id !== n.id
                );

                renderizar(filtro);

            });

        }

        lista.appendChild(div);

    });

}

tabs.forEach(tab => {

    tab.addEventListener("click", ()=>{

        tabs.forEach(t => t.classList.remove("active"));

        tab.classList.add("active");

        renderizar(tab.dataset.tab);

    });

});

renderizar();
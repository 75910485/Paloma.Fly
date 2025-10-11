document.addEventListener("DOMContentLoaded", () => {
    const precioPorAsiento = 39;
    const asientosPiso1 = [
        "01", "04", "", "07", "10",
        "02", "05", "", "08", "11",
        "03", "06", "", "09", "12"
    ];

    const asientosPiso2 = [
        "13", "16", "", "19", "22",
        "14", "17", "", "20", "23",
        "15", "18", "", "21", "24"
    ];


    function renderizarMapa(mapaContenedor, asientosBase, asientosSeleccionados) {
        mapaContenedor.innerHTML = '';
        let seatIndex = 0;

        // Bucle para construir la estructura del mapa
        for (let i = 0; i < asientosBase.length; i++) {
            const num = asientosBase[i];

            if (num === "") {
                // Espacio de pasillo
                const pasillo = document.createElement("div");
                pasillo.classList.add("pasillo-espacio");
                mapaContenedor.appendChild(pasillo);
            } else {
                // Asiento
                const asiento = document.createElement("div");
                asiento.classList.add("asiento");
                asiento.setAttribute("data-num", num);
                asiento.textContent = num;

                if (asientosSeleccionados.includes(num)) {
                    asiento.classList.add("seleccionado");
                }

                if (num === "06" || num === "18") {
                    asiento.classList.add("ocupado");
                }

                mapaContenedor.appendChild(asiento);
                seatIndex++;
            }
        }

        if (asientosBase === asientosPiso1) {
            const conductor = document.createElement("div");
            conductor.classList.add("simbolo-bus");
            conductor.setAttribute("title", "Asiento Conductor");
            conductor.innerHTML = '<i class="fa-solid fa-person"></i>';
            mapaContenedor.appendChild(conductor);

            const bano = document.createElement("div");
            bano.classList.add("simbolo-bus");
            bano.setAttribute("title", "Baño");
            bano.innerHTML = '<i class="fa-solid fa-toilet"></i>';
            mapaContenedor.appendChild(bano);
        }
    }
    function getCardState(card) {
        if (!card.state) {
            card.state = {
                pisoActual: '1',
                piso1: [], 
                piso2: [] 
            };
        }
        return card.state;
    }

    function actualizarResumen(card) {
        const state = getCardState(card);
        const seleccionadosTotal = [...state.piso1, ...state.piso2];

        const ladoDerecho = card.querySelector(".lado-der");
        const lista = ladoDerecho.querySelector(".seleccionados");
        const total = ladoDerecho.querySelector(".precio-total");
        const cantidadAsientos = ladoDerecho.querySelector(".asientos-texto");

        lista.innerHTML = ""; 

        if (seleccionadosTotal.length === 0) {
            lista.textContent = "Ninguno";
            total.textContent = "S/0.00";
            cantidadAsientos.textContent = "*0 asientos";
            return;
        }

        seleccionadosTotal.sort((a, b) => parseInt(a) - parseInt(b)).forEach(num => {
            const asientoNum = document.createElement("div");
            asientoNum.classList.add("asiento-num");
            asientoNum.textContent = num;
            lista.appendChild(asientoNum);
        });

        const precioFinal = seleccionadosTotal.length * precioPorAsiento;
        total.textContent = `S/${precioFinal.toFixed(2)}`;
        cantidadAsientos.textContent = `*${seleccionadosTotal.length} asientos`;

        card.compraInfo = {
            origen: "Lima(Atocongo)",
            destino: "Arequipa",
            fecha: document.querySelector('.busqueda input[type="text"][value="11-Sep-25"]').value, // Usar el valor del input de la búsqueda
            hora: card.querySelector('.info-viaje .izquierda span').textContent.split("→")[0].trim(),
            asientos: seleccionadosTotal.join(", "),
            precioTotal: precioFinal.toFixed(2)
        };
    }

    document.querySelectorAll(".card").forEach(card => {
        const pagarBoton = card.querySelector(".pagar");

        if (pagarBoton) {
            pagarBoton.addEventListener("click", () => {
                const state = getCardState(card);
                const seleccionadosTotal = [...state.piso1, ...state.piso2];

                if (seleccionadosTotal.length > 0) {
                    // Guardar la información de la compra en localStorage
                    localStorage.setItem('compraPalomasFly', JSON.stringify(card.compraInfo));
                    
                    // Redirigir a la página de pago
                    window.location.href = "pago.html"; 
                } else {
                    alert("Por favor, selecciona al menos un asiento para continuar con la compra.");
                }
            });
        }
    });

    document.querySelectorAll(".ver-asientos").forEach(boton => {
        boton.addEventListener("click", () => {
            const card = boton.closest(".card");
            const seccion = card.querySelector(".asientos");
            const mapaContenedor = card.querySelector(".mapa-asientos");
            const state = getCardState(card);

            const isOculto = seccion.classList.toggle("oculto");

            boton.textContent = isOculto ? "Ver asientos" : "Cerrar";

            if (!isOculto) {
                const piso1Btn = card.querySelector('.piso-btn[data-piso="1"]');
                if (piso1Btn && !piso1Btn.classList.contains("active")) {
                    piso1Btn.click();
                } else {
                    renderizarMapa(mapaContenedor, asientosPiso1, state.piso1);
                    actualizarResumen(card);
                }
            }
        });
    });

    // --- Lógica de selección de asientos ---
    document.querySelectorAll(".card").forEach(card => {
        const mapa = card.querySelector(".mapa-asientos");
        if (mapa) {
            mapa.addEventListener("click", e => {
                if (e.target.classList.contains("asiento") && !e.target.classList.contains("ocupado")) {
                    e.target.classList.toggle("seleccionado");
                    const state = getCardState(card);
                    const num = e.target.dataset.num;

                    // Actualizar el estado del asiento en el piso actual
                    const currentPisoList = state[`piso${state.pisoActual}`];
                    const index = currentPisoList.indexOf(num);

                    if (index > -1) {
                        currentPisoList.splice(index, 1);
                    } else {
                        currentPisoList.push(num);
                    }

                    actualizarResumen(card);
                }
            });
        }
    });

    // --- Lógica de cambio de piso ---
    document.querySelectorAll(".card").forEach(card => {
        const pisoBtns = card.querySelectorAll(".piso-btn");
        const mapaContenedor = card.querySelector(".mapa-asientos");

        pisoBtns.forEach(btn => {
            btn.addEventListener("click", e => {
                const nuevoPiso = e.target.dataset.piso;
                const state = getCardState(card);

                pisoBtns.forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");

                state.pisoActual = nuevoPiso;

                const asientosBase = (nuevoPiso === '1') ? asientosPiso1 : asientosPiso2;

                const asientosSeleccionados = state[`piso${nuevoPiso}`];

                renderizarMapa(mapaContenedor, asientosBase, asientosSeleccionados);

            });
        });

        if (mapaContenedor) {
            renderizarMapa(mapaContenedor, asientosPiso1, getCardState(card).piso1);
        }
    });

    const firstCard = document.querySelector('.resultados .card:first-child');
    const firstCardButton = firstCard ? firstCard.querySelector('.ver-asientos') : null;

    if (firstCard && firstCardButton && firstCardButton.textContent === "Cerrar") {
        const state = getCardState(firstCard);
        state.piso1 = ["07", "08", "10"];
        
        const mapaContenedor = firstCard.querySelector(".mapa-asientos");
        renderizarMapa(mapaContenedor, asientosPiso1, state.piso1);
        
        actualizarResumen(firstCard);
    }
});
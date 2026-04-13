// ─── Crossfade hover ─────────────────────────────────────────────────────────
document.querySelectorAll('.card__img-wrapper').forEach(function(wrapper) {
    var img = wrapper.querySelector('.card__img');
    if (!img) return;

    var src      = img.getAttribute('src');
    var dotIndex = src.lastIndexOf('.');
    var hoverSrc = src.slice(0, dotIndex) + '-m' + src.slice(dotIndex);

    var imgHover = document.createElement('img');
    imgHover.setAttribute('src', hoverSrc);
    imgHover.setAttribute('alt', img.getAttribute('alt'));
    imgHover.className = 'card__img-hover';
    wrapper.appendChild(imgHover);
});


// ─── Estado global ────────────────────────────────────────────────────────────
var categoriaActiva  = null;
var catalogoAbierto  = false;

var buscador    = document.getElementById('buscador');
var sugerencias = document.getElementById('sugerencias');
var navLinks    = document.querySelectorAll('.navbar__link[data-categoria]');
var logoLink    = document.getElementById('logo-link');
var btnExplorar = document.getElementById('btn-explorar');
var secciones   = document.querySelectorAll('section.productos');

// Recolectar todos los productos una sola vez
var todosLosProductos = [];
document.querySelectorAll('.card').forEach(function(card) {
    var nombre = card.querySelector('.card__nombre');
    if (!nombre) return;
    todosLosProductos.push({
        card:      card,
        nombre:    nombre.textContent.trim(),
        categoria: card.getAttribute('data-categoria')
    });
});


// ─── Abrir / cerrar catálogo ─────────────────────────────────────────────────
function abrirCatalogo() {
    document.body.classList.add('catalogo-abierto');
    catalogoAbierto = true;
    if (btnExplorar) {
        btnExplorar.textContent = 'Volver a la página principal';
    }
}

function cerrarCatalogo() {
    document.body.classList.remove('catalogo-abierto');
    catalogoAbierto = false;
    categoriaActiva = null;
    if (btnExplorar) {
        btnExplorar.textContent = 'Explorar colección';
    }
}

function scrollConOffset(elemento, offset) {
    var top = elemento.getBoundingClientRect().top + window.scrollY - (offset || 80);
    window.scrollTo({ top: top, behavior: 'smooth' });
}


// ─── Botón EXPLORAR COLECCIÓN / VER MENOS ────────────────────────────────────
if (btnExplorar) {
    btnExplorar.addEventListener('click', function(e) {
        e.preventDefault();
        if (catalogoAbierto) {
            cerrarCatalogo();
            aplicarFiltros();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            abrirCatalogo();
            setTimeout(function() {
                var primera = document.querySelector('section.productos:not(.productos--oculta)');
                if (primera) scrollConOffset(primera, 80);
            }, 50);
        }
    });
}


// ─── Filtro combinado (categoría + búsqueda) ──────────────────────────────────
function aplicarFiltros() {
    var query = buscador.value.trim().toLowerCase();

    todosLosProductos.forEach(function(item) {
        var pasaCategoria = !categoriaActiva || item.categoria === categoriaActiva;
        var pasaBusqueda  = !query || item.nombre.toLowerCase().includes(query);

        if (pasaCategoria && pasaBusqueda) {
            item.card.classList.remove('card--oculta');
        } else {
            item.card.classList.add('card--oculta');
        }
    });

    // Ocultar secciones de productos sin tarjetas visibles
    secciones.forEach(function(seccion) {
        var visibles = seccion.querySelectorAll('.card:not(.card--oculta)');
        if (visibles.length === 0) {
            seccion.classList.add('productos--oculta');
        } else {
            seccion.classList.remove('productos--oculta');
        }
    });

    // Favoritos: visible solo cuando no hay categoría activa
    var secFavoritos = document.getElementById('favoritos');
    if (secFavoritos) {
        if (categoriaActiva || query) {
            secFavoritos.classList.add('favoritos--oculta');
        } else {
            var favVisibles = secFavoritos.querySelectorAll('.card:not(.card--oculta)');
            if (favVisibles.length === 0) {
                secFavoritos.classList.add('favoritos--oculta');
            } else {
                secFavoritos.classList.remove('favoritos--oculta');
            }
        }
    }
}


// ─── Marcar link activo en navbar ────────────────────────────────────────────
function marcarActivo(categoriaSeleccionada) {
    navLinks.forEach(function(link) {
        if (link.getAttribute('data-categoria') === categoriaSeleccionada) {
            link.classList.add('navbar__link--activo');
        } else {
            link.classList.remove('navbar__link--activo');
        }
    });
}


// ─── Click en links del navbar (Aros / Collares / Pulseras) ──────────────────
navLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        var cat = this.getAttribute('data-categoria');

        categoriaActiva = cat;
        buscador.value  = '';
        sugerencias.classList.remove('sugerencias--visible');

        marcarActivo(cat);
        abrirCatalogo();
        aplicarFiltros();

        setTimeout(function() {
            var seccion = document.getElementById(cat);
            if (seccion) scrollConOffset(seccion, 80);
        }, 50);
    });
});


// ─── Click en logo → resetear todo y cerrar catálogo ─────────────────────────
logoLink.addEventListener('click', function(e) {
    e.preventDefault();
    categoriaActiva = null;
    buscador.value  = '';
    sugerencias.classList.remove('sugerencias--visible');
    marcarActivo(null);
    cerrarCatalogo();
    aplicarFiltros();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// ─── Buscador con sugerencias ─────────────────────────────────────────────────
function mostrarSugerencias(query) {
    sugerencias.innerHTML = '';

    if (!query) {
        sugerencias.classList.remove('sugerencias--visible');
        return;
    }

    var coincidencias = todosLosProductos.filter(function(item) {
        var pasaCategoria = !categoriaActiva || item.categoria === categoriaActiva;
        return pasaCategoria && item.nombre.toLowerCase().includes(query.toLowerCase());
    });

    if (coincidencias.length === 0) {
        sugerencias.classList.remove('sugerencias--visible');
        return;
    }

    coincidencias.forEach(function(item) {
        var li = document.createElement('li');
        li.className   = 'sugerencias__item';
        li.textContent = item.nombre;

        li.addEventListener('click', function() {
            buscador.value = item.nombre;
            sugerencias.classList.remove('sugerencias--visible');
            abrirCatalogo();
            aplicarFiltros();
            setTimeout(function() {
                item.card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
        });

        sugerencias.appendChild(li);
    });

    sugerencias.classList.add('sugerencias--visible');
}

buscador.addEventListener('input', function() {
    var query = this.value.trim();
    if (query) {
        categoriaActiva = null;
        marcarActivo(null);
        abrirCatalogo();
    } else {
        cerrarCatalogo();
    }
    aplicarFiltros();
    mostrarSugerencias(query);

});

// Cerrar sugerencias al hacer clic fuera
document.addEventListener('click', function(e) {
    if (!e.target.closest('.busqueda-wrapper')) {
        sugerencias.classList.remove('sugerencias--visible');
    }
});


// ─── CARRITO ──────────────────────────────────────────────────────────────────
var carrito = JSON.parse(localStorage.getItem('franchus-carrito') || '[]');

var carritoBtn     = document.getElementById('carrito-btn');
var carritoPanel   = document.getElementById('carrito-panel');
var carritoCerrar  = document.getElementById('carrito-cerrar');
var carritoOverlay = document.getElementById('carrito-overlay');
var carritoItems   = document.getElementById('carrito-items');
var carritoFooter  = document.getElementById('carrito-footer');
var carritoVacio   = document.getElementById('carrito-vacio');
var carritoBadge   = document.getElementById('carrito-badge');
var carritoTotal   = document.getElementById('carrito-total');

function parsearPrecio(str) {
    return parseInt(str.replace(/[$\.,]/g, '')) || 0;
}

function formatearPrecio(num) {
    return '$' + num.toLocaleString('es-AR');
}

function guardarCarrito() {
    localStorage.setItem('franchus-carrito', JSON.stringify(carrito));
}

function actualizarBadge() {
    var total = carrito.reduce(function(acc, item) { return acc + item.cantidad; }, 0);
    carritoBadge.textContent = total;
}

function renderizarCarrito() {
    carritoItems.innerHTML = '';
    var totalNum = 0;

    if (carrito.length === 0) {
        carritoFooter.style.display = 'none';
        carritoVacio.style.display  = 'flex';
        carritoTotal.textContent    = '$0';
        actualizarBadge();
        return;
    }

    carritoFooter.style.display = 'block';
    carritoVacio.style.display  = 'none';

    carrito.forEach(function(item) {
        totalNum += item.precio * item.cantidad;

        var div = document.createElement('div');
        div.className = 'carrito-item';
        div.innerHTML =
            '<img class="carrito-item__img" src="' + item.img + '" alt="' + item.nombre + '">' +
            '<div class="carrito-item__info">' +
                '<p class="carrito-item__nombre">' + item.nombre + '</p>' +
                '<p class="carrito-item__precio">' + formatearPrecio(item.precio) + '</p>' +
                '<div class="carrito-item__controles">' +
                    '<button class="carrito-item__cantidad-btn" data-id="' + item.id + '" data-accion="restar">−</button>' +
                    '<span class="carrito-item__cantidad">' + item.cantidad + '</span>' +
                    '<button class="carrito-item__cantidad-btn" data-id="' + item.id + '" data-accion="sumar">+</button>' +
                '</div>' +
            '</div>' +
            '<button class="carrito-item__eliminar" data-id="' + item.id + '" aria-label="Eliminar">×</button>';

        carritoItems.appendChild(div);
    });

    carritoTotal.textContent = formatearPrecio(totalNum);
    actualizarBadge();

    // Eventos de cantidad y eliminar
    carritoItems.querySelectorAll('.carrito-item__cantidad-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id     = this.getAttribute('data-id');
            var accion = this.getAttribute('data-accion');
            var idx    = carrito.findIndex(function(i) { return i.id === id; });
            if (idx === -1) return;
            if (accion === 'sumar') {
                carrito[idx].cantidad++;
            } else {
                carrito[idx].cantidad--;
                if (carrito[idx].cantidad <= 0) carrito.splice(idx, 1);
            }
            guardarCarrito();
            renderizarCarrito();
        });
    });

    carritoItems.querySelectorAll('.carrito-item__eliminar').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id  = this.getAttribute('data-id');
            carrito = carrito.filter(function(i) { return i.id !== id; });
            guardarCarrito();
            renderizarCarrito();
        });
    });
}

function abrirCarrito() {
    carritoPanel.classList.add('abierto');
    carritoOverlay.classList.add('visible');
}

function cerrarCarrito() {
    carritoPanel.classList.remove('abierto');
    carritoOverlay.classList.remove('visible');
}

carritoBtn.addEventListener('click', abrirCarrito);
carritoCerrar.addEventListener('click', cerrarCarrito);
carritoOverlay.addEventListener('click', cerrarCarrito);

// Agregar botón "Agregar al carrito" a cada tarjeta via JS
document.querySelectorAll('.card').forEach(function(card) {
    var nombre = card.querySelector('.card__nombre');
    var precio = card.querySelector('.card__precio');
    var img    = card.querySelector('.card__img');
    if (!nombre || !precio || !img) return;

    var btn = document.createElement('button');
    btn.className   = 'card__agregar';
    btn.textContent = 'Agregar al carrito';
    card.querySelector('.card__info').appendChild(btn);

    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id     = nombre.textContent.trim();
        var existe = carrito.find(function(i) { return i.id === id; });
        if (existe) {
            existe.cantidad++;
        } else {
            carrito.push({
                id:       id,
                nombre:   nombre.textContent.trim(),
                precio:   parsearPrecio(precio.textContent),
                img:      img.getAttribute('src'),
                cantidad: 1
            });
        }
        guardarCarrito();
        renderizarCarrito();
        abrirCarrito();
    });
});

renderizarCarrito();


// ─── Novedades footer ─────────────────────────────────────────────────────────
var novedadesEnviar  = document.getElementById('novedades-enviar');
var novedadesEmail   = document.getElementById('novedades-email');
var novedadesForm    = document.getElementById('novedades-form');
var novedadesGracias = document.getElementById('novedades-gracias');
var novedadesTimer;

novedadesEnviar.addEventListener('click', function() {
    novedadesForm.style.display    = 'none';
    novedadesGracias.style.display = 'block';
    novedadesEmail.value = '';
    clearTimeout(novedadesTimer);
    novedadesTimer = setTimeout(function() {
        novedadesGracias.style.display = 'none';
        novedadesForm.style.display    = 'flex';
    }, 3000);
});


// ─── MODAL DETALLE DE PRODUCTO ────────────────────────────────────────────────
var modalOverlay     = document.getElementById('modal-overlay');
var modalProducto    = document.getElementById('modal-producto');
var modalCerrar      = document.getElementById('modal-cerrar');
var modalImg         = document.getElementById('modal-img');
var modalImgHover    = document.getElementById('modal-img-hover');
var modalNombre      = document.getElementById('modal-nombre');
var modalCategoria   = document.getElementById('modal-categoria');
var modalPrecio      = document.getElementById('modal-precio');
var modalDescripcion = document.getElementById('modal-descripcion');
var modalAgregar     = document.getElementById('modal-agregar');

var descripciones = {
    'Aro Honguito':    'Aros en forma de honguito con acabado dorado y brillo delicado. Cierre mariposa de seguridad. Livianos y perfectos para el día a día.',
    'Aro Brillis':     'Aros con terminación brillante que captura la luz desde todos los ángulos. Un clásico sofisticado para cualquier look.',
    'Aro Rayito':      'Aros delicados en forma de rayito. Minimalistas y elegantes, ideales para combinar con cualquier outfit.',
    'Aro Flower':      'Aros florales con diseño artesanal inspirado en la naturaleza. Perfectos para looks románticos y femeninos.',
    'Aro Diamond':     'Aros con piedra central que simula un diamante. Atemporales y sofisticados, ideales para ocasiones especiales.',
    'Aro Cora':        'Aros de diseño único inspirado en formas orgánicas. Femeninos y versátiles para el día y la noche.',
    'Collar Cora':     'Collar con dije de diseño orgánico bañado en oro 18k. Una pieza minimalista que eleva cualquier look.',
    'Collar Diamond':  'Collar con dije de circón que imita un diamante. Elegante, atemporal y perfecto como regalo.',
    'Pulsera Estrella':'Pulsera ajustable con dije estrella. Un básico imprescindible que se puede usar solo o en conjunto con otras pulseras.',
    'Pulsera Ojitos':  'Pulsera con dijes de ojitos turcos para atraer buena energía. Delicada, significativa y muy versátil.'
};

var categoriaLabels = {
    'aros':     'Aros',
    'collares': 'Collares',
    'pulseras': 'Pulseras'
};

var cardActualModal = null;

function abrirModal(card) {
    var nombre     = card.querySelector('.card__nombre').textContent.trim();
    var precioEl   = card.querySelector('.card__precio');
    var imgEl      = card.querySelector('.card__img');
    var imgHoverEl = card.querySelector('.card__img-hover');
    var categoria  = card.getAttribute('data-categoria');

    modalNombre.textContent      = nombre;
    modalPrecio.textContent      = precioEl ? precioEl.textContent.trim() : '';
    modalCategoria.textContent   = categoriaLabels[categoria] || categoria;
    modalDescripcion.textContent = descripciones[nombre] || 'Pieza de acero inoxidable bañado en oro 18k. Diseño exclusivo Franchus.';
    modalImg.setAttribute('src', imgEl.getAttribute('src'));
    modalImg.setAttribute('alt', nombre);

    if (imgHoverEl && imgHoverEl.getAttribute('src')) {
        modalImgHover.setAttribute('src', imgHoverEl.getAttribute('src'));
        modalImgHover.setAttribute('alt', nombre);
        modalImgHover.style.display = '';
    } else {
        modalImgHover.style.display = 'none';
    }

    cardActualModal = card;
    modalOverlay.classList.add('visible');
    modalProducto.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function cerrarModal() {
    modalOverlay.classList.remove('visible');
    modalProducto.classList.remove('visible');
    cardActualModal = null;
    document.body.style.overflow = '';
}

modalCerrar.addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', cerrarModal);

// Cerrar modal con Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (modalProducto.classList.contains('visible')) cerrarModal();
        if (checkoutModal.classList.contains('visible')) cerrarCheckout();
    }
});

// Agregar al carrito desde el modal
modalAgregar.addEventListener('click', function() {
    if (!cardActualModal) return;
    var nombre = cardActualModal.querySelector('.card__nombre').textContent.trim();
    var precio = cardActualModal.querySelector('.card__precio');
    var img    = cardActualModal.querySelector('.card__img');
    var existe = carrito.find(function(i) { return i.id === nombre; });
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({
            id:       nombre,
            nombre:   nombre,
            precio:   parsearPrecio(precio.textContent),
            img:      img.getAttribute('src'),
            cantidad: 1
        });
    }
    guardarCarrito();
    renderizarCarrito();
    cerrarModal();
    abrirCarrito();
});

// Click en card → abrir modal (excepto en el botón "Agregar al carrito")
document.querySelectorAll('.card').forEach(function(card) {
    card.addEventListener('click', function(e) {
        if (e.target.closest('.card__agregar')) return;
        abrirModal(card);
    });
});


// ─── CHECKOUT ────────────────────────────────────────────────────────────────
var checkoutOverlay = document.getElementById('checkout-overlay');
var checkoutModal   = document.getElementById('checkout-modal');
var checkoutCerrar  = document.getElementById('checkout-cerrar');
var checkoutStep1   = document.getElementById('checkout-step-1');
var checkoutStep2   = document.getElementById('checkout-step-2');
var checkoutStep3   = document.getElementById('checkout-step-3');
var checkoutPasos   = document.querySelectorAll('.checkout-paso');

function abrirCheckout() {
    cerrarCarrito();
    irAPaso(1);
    checkoutOverlay.classList.add('visible');
    checkoutModal.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function cerrarCheckout() {
    checkoutOverlay.classList.remove('visible');
    checkoutModal.classList.remove('visible');
    document.body.style.overflow = '';
}

function irAPaso(num) {
    [checkoutStep1, checkoutStep2, checkoutStep3].forEach(function(step, idx) {
        step.classList.toggle('activo', idx + 1 === num);
    });

    checkoutPasos.forEach(function(paso) {
        var p = parseInt(paso.getAttribute('data-paso'));
        paso.classList.remove('checkout-paso--activo', 'checkout-paso--hecho');
        if (p === num) paso.classList.add('checkout-paso--activo');
        if (p < num)  paso.classList.add('checkout-paso--hecho');
    });

    if (num === 2) actualizarTotalCheckout();
    if (num === 3) mostrarConfirmacion();
}

function calcularTotal() {
    var base   = carrito.reduce(function(acc, item) { return acc + item.precio * item.cantidad; }, 0);
    var metodo = document.querySelector('input[name="pago"]:checked').value;
    return metodo === 'transferencia' ? Math.round(base * 0.8) : base;
}

function actualizarTotalCheckout() {
    var metodo = document.querySelector('input[name="pago"]:checked').value;
    var label  = metodo === 'transferencia' ? 'Total (con 20% OFF)' : 'Total';
    document.getElementById('checkout-total-label').textContent = label;
    document.getElementById('checkout-total-val').textContent   = formatearPrecio(calcularTotal());
}

function mostrarConfirmacion() {
    var email  = document.getElementById('ch-email').value || 'tu email';
    var metodo = document.querySelector('input[name="pago"]:checked').value;
    var total  = calcularTotal();

    document.getElementById('checkout-email-conf').textContent = email;

    var resumen = document.getElementById('checkout-resumen');
    resumen.innerHTML = '';

    carrito.forEach(function(item) {
        var div = document.createElement('div');
        div.className = 'checkout-resumen__item';
        div.innerHTML = '<span>' + item.nombre + ' &times; ' + item.cantidad + '</span>' +
                        '<span>' + formatearPrecio(item.precio * item.cantidad) + '</span>';
        resumen.appendChild(div);
    });

    var totalDiv = document.createElement('div');
    totalDiv.className = 'checkout-resumen__item checkout-resumen__total';
    var totalLabel = metodo === 'transferencia' ? 'Total (con 20% OFF)' : 'Total';
    totalDiv.innerHTML = '<span>' + totalLabel + '</span><span>' + formatearPrecio(total) + '</span>';
    resumen.appendChild(totalDiv);
}

checkoutCerrar.addEventListener('click', cerrarCheckout);
checkoutOverlay.addEventListener('click', cerrarCheckout);

document.getElementById('checkout-paso1-sig').addEventListener('click', function() {
    var nombre    = document.getElementById('ch-nombre');
    var email     = document.getElementById('ch-email');
    var direccion = document.getElementById('ch-direccion');
    var errorEl   = document.getElementById('checkout-error-1');
    var valido    = true;

    [nombre, email, direccion].forEach(function(el) {
        if (!el.value.trim()) {
            el.classList.add('error');
            valido = false;
        } else {
            el.classList.remove('error');
        }
    });

    if (!valido) {
        errorEl.textContent = 'Por favor completá los campos obligatorios (*)';
        return;
    }
    errorEl.textContent = '';
    irAPaso(2);
});

document.getElementById('checkout-paso2-ant').addEventListener('click', function() {
    irAPaso(1);
});

document.getElementById('checkout-paso2-sig').addEventListener('click', function() {
    irAPaso(3);
});

document.querySelectorAll('input[name="pago"]').forEach(function(radio) {
    radio.addEventListener('change', actualizarTotalCheckout);
});

document.getElementById('checkout-finalizar').addEventListener('click', function() {
    carrito = [];
    guardarCarrito();
    renderizarCarrito();
    cerrarCheckout();
    // Limpiar formulario
    ['ch-nombre','ch-apellido','ch-email','ch-telefono','ch-direccion','ch-ciudad','ch-provincia','ch-cp'].forEach(function(id) {
        document.getElementById(id).value = '';
        document.getElementById(id).classList.remove('error');
    });
    document.getElementById('checkout-error-1').textContent = '';
});

// Conectar botón "Finalizar compra" del panel del carrito con el checkout
document.querySelector('.carrito-panel__checkout').addEventListener('click', function() {
    if (carrito.length === 0) return;
    abrirCheckout();
});

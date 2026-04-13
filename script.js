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

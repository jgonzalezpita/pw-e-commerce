// Crossfade hover: agrega imagen de modelo a cada tarjeta
document.querySelectorAll('.card__img-wrapper').forEach(function(wrapper) {
    var img = wrapper.querySelector('.card__img');
    if (!img) return;

    var src = img.getAttribute('src');
    var dotIndex = src.lastIndexOf('.');
    var hoverSrc = src.slice(0, dotIndex) + '-m' + src.slice(dotIndex);

    var imgHover = document.createElement('img');
    imgHover.setAttribute('src', hoverSrc);
    imgHover.setAttribute('alt', img.getAttribute('alt'));
    imgHover.className = 'card__img-hover';

    wrapper.appendChild(imgHover);
});


// Búsqueda con sugerencias y filtrado por sección
var buscador    = document.getElementById('buscador');
var sugerencias = document.getElementById('sugerencias');

// Recolectar todos los productos
var todosLosProductos = [];
document.querySelectorAll('.card').forEach(function(card) {
    var nombre = card.querySelector('.card__nombre');
    if (!nombre) return;
    todosLosProductos.push({
        card: card,
        nombre: nombre.textContent.trim()
    });
});

// Filtrar tarjetas y ocultar secciones vacías
function filtrar(query) {
    var q = query.toLowerCase();

    todosLosProductos.forEach(function(item) {
        if (q === '' || item.nombre.toLowerCase().includes(q)) {
            item.card.classList.remove('card--oculta');
        } else {
            item.card.classList.add('card--oculta');
        }
    });

    // Ocultar secciones donde no hay ninguna tarjeta visible
    document.querySelectorAll('section.productos').forEach(function(seccion) {
        var visibles = seccion.querySelectorAll('.card:not(.card--oculta)');
        if (q !== '' && visibles.length === 0) {
            seccion.classList.add('productos--oculta');
        } else {
            seccion.classList.remove('productos--oculta');
        }
    });
}

// Mostrar lista de sugerencias
function mostrarSugerencias(query) {
    sugerencias.innerHTML = '';

    if (query === '') {
        sugerencias.classList.remove('sugerencias--visible');
        return;
    }

    var coincidencias = todosLosProductos.filter(function(item) {
        return item.nombre.toLowerCase().includes(query.toLowerCase());
    });

    if (coincidencias.length === 0) {
        sugerencias.classList.remove('sugerencias--visible');
        return;
    }

    coincidencias.forEach(function(item) {
        var li = document.createElement('li');
        li.className = 'sugerencias__item';
        li.textContent = item.nombre;

        li.addEventListener('click', function() {
            buscador.value = item.nombre;
            filtrar(item.nombre);
            sugerencias.classList.remove('sugerencias--visible');
            // Hacer scroll suave hasta la tarjeta elegida
            item.card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        sugerencias.appendChild(li);
    });

    sugerencias.classList.add('sugerencias--visible');
}

// Eventos del input
buscador.addEventListener('input', function() {
    var query = this.value.trim();
    filtrar(query);
    mostrarSugerencias(query);
});

// Cerrar sugerencias al hacer clic fuera
document.addEventListener('click', function(e) {
    if (!e.target.closest('.busqueda-wrapper')) {
        sugerencias.classList.remove('sugerencias--visible');
    }
});

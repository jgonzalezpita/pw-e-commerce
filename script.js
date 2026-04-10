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

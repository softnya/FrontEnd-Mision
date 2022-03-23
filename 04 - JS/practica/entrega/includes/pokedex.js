const itemsPerPage = 12;
const maxPage = 94;
const navigationRange = 4;
let currentOffset = 0;
// https://home.pokemon.com/assets/img/screens/es/p06_01.jpg

const getPokemon = (name, onDone) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${name}`;
    fetch (url).then((res) => {
        if (res.status == 200) {
            return res.json();
        } else {
            //mostrar un valor de error
            console.log('error', res);
        }
    }).then((data) => {
        if (typeof onDone == 'function') onDone(data);
    });
};

const findPokemon = () => {
    const pokedex = $('[data-pokedex]');
    const btn = $('[data-search-btn]');
    const input = $('[data-search-input]');
    if (input.val() == '') return;
    const current = '<img src="images/pokeball.png" data-pokeball class="" />';//pokedex.html();
    pokedex.html('<img src="images/pokeball.png" data-pokeball class="rotate-center" />');
    getPokemon(input.val(), (_pokemon) => {
        if (typeof _pokemon == 'undefined') {//hay error
            pokedex.html(current);
            UIkit.notification({
                message: 'Pokemon not found',
                status: 'warning',
                pos: 'bottom-center',
                timeout: 5000
            });
        } else {//lo encuentra
            drawPokemon(_pokemon);
        }
    });
};

const fillPokemon = (index) => {
    const pokemon = $(`[data-index="${index}"]`);
    const pokedex = $('[data-pokedex]');
    pokedex.html('<img src="images/pokeball.png" data-pokeball class="rotate-center" />');
    getPokemon(pokemon.data('name'), (_pokemon) => {
        drawPokemon(_pokemon);
    });
};

const drawPokemon = (_pokemon) => {
    const pokedex = $('[data-pokedex]');
    const _index = zfill(_pokemon.order, 3);
    pokedex.html(`
    <div>
        <a href="#modal-media-image" uk-toggle>
            <img src="${_pokemon.sprites.other.home.front_default}" class="uk-width-1-1 bounce-in-top" />
        </a>
    </div>
    <div class="uk-child-width-1-1 uk-grid-collapse uk-text-center rounded" uk-grid>
        <div><button class="uk-button uk-button-secondary cursor-default uk-text-truncate uk-width-1-1"> N° ${_index}</button></div>
        <div><button class="uk-button uk-text-truncate cursor-default uk-width-1-1">${_pokemon.name}</button></div>
        <div><button uk-toggle="target: #moreinfo" class="uk-button uk-button-primary uk-text-truncate uk-width-1-1">More info</button></div>
    </div>
    <div id="modal-media-image" class="uk-flex-top" uk-modal>
        <div class="uk-modal-dialog uk-width-auto uk-margin-auto-vertical">
            <button class="uk-modal-close-outside" type="button" uk-close></button>
            <img src="${_pokemon.sprites.other.home.front_default}" alt="">
        </div>
    </div>
    `);
    //modal
    const name = $('#moreinfo [data-name]');
    const info = $('#moreinfo [data-info]');
    name.text(_pokemon.name);
    let stats = [];
    _pokemon.stats.forEach(stat => {
        let name = stat.stat.name;
        switch (stat.stat.name) {
            case 'attack': name = 'ATK';break;
            case 'defense': name = 'DEF';break;
            case 'special-attack': name = 'SATK';break;
            case 'special-defense': name = 'SDEF';break;
            case 'speed': name = 'SPD';break;
            case 'hp': name = 'HP';break;
        }
        const _stat = zfill(stat.base_stat, 3);
        stats.push(`
        <tr>
            <td class="uk-table-shrink uk-text-bold uk-text-right uk-text-uppercase">${name}</td>
            <td class="uk-table-shrink">${_stat}</td>
            <td class="uk-table-expand"><progress class="uk-progress" value="${stat.base_stat/2}" max="100"></progress></td>
        </tr>
        `);
    });
    let abil = [];
    _pokemon.abilities.forEach(ability => {
        abil.push(`<li><span uk-icon="bolt"></span> <b class="uk-text-capitalize">${ability.ability.name}:</b> ${ability.slot} slots</li>`);
    });
    let types = [];
    _pokemon.types.forEach(type => {
        types.push(`<span class="uk-badge">${type.type.name}</span>`);
    });
    info.html(`
    <div style="display: flow-root;">
        <img src="${_pokemon.sprites.other.home.front_default}" class="uk-width-1-5 uk-float-left uk-margin-right swirl-in-fwd" />
        <b>N° ${_index}</b><br>
        <b>Height: </b>${_pokemon.height / 10} m<br>
        <b>Weight: </b>${_pokemon.weight} lbs<br>
        <b>Type: </b>${types.join(' ')}
    </div>
    <div class="uk-child-width-1-2@m" uk-grid>
        <div>
            <b>Stats:</b><br>
            <table class="uk-table uk-table-small">
                <tbody>
                ` + stats.join('') + `
                </tbody>
            </table>
        </div>
        <div>
            <b>Abilities:</b><br>
            <ul class="uk-list">
                ` + abil.join('') + `
            </ul>
        </div>
    </div>
    `);
    //console.log(_pokemon);
}

const nextTablePokedex = () => {
    const btn = $('[data-next]');
    if (btn.data('url') == '') return;
    if (currentOffset / itemsPerPage >= maxPage) return;
    currentOffset += itemsPerPage;
    fillTablePokedex(currentOffset, itemsPerPage);
}

const prevTablePokedex = () => {
    const btn = $('[data-prev]');
    if (btn.data('url') == '') return;
    if (currentOffset / itemsPerPage <= 0) return;
    currentOffset -= itemsPerPage;
    fillTablePokedex(currentOffset, itemsPerPage);
};

const setTablePokedex = (page) => {
    currentOffset = (page - 1) * itemsPerPage;
    fillTablePokedex(currentOffset, itemsPerPage);
};

const fillTablePokedex = (offset = 0, limit = 12) => {
    const pag = $('[data-pagination]');
    const container = $('[data-container]');
    const prevbtn = $('[data-prev]');
    const nextbtn = $('[data-next]');
    //vaciar informacion
    container.html('<div><img src="images/pokeball.png" data-pokeball class="rotate-center" /></div>');
    prevbtn.removeClass('uk-button-primary').addClass('uk-button-secondary').data('url', '');
    nextbtn.removeClass('uk-button-primary').addClass('uk-button-secondary').data('url', '');

    const currentPage = parseInt(offset / limit) + 1;
    pag.html('Page ' + currentPage);
    let _pags = [];
    if (currentPage - navigationRange > 0) {
        _pags.push(`<li><a href="javascript:void(0);" onclick="setTablePokedex(1)">1</a></li><li class="uk-disabled"><span>...</span></li>`);
    }
    for(let i = currentPage - navigationRange; i < (currentPage + navigationRange <= maxPage ? currentPage + navigationRange - 1 : maxPage); i++) {
        if (i >= 0) {
            if (i + 1 == currentPage)
                _pags.push(`<li class="uk-active"><span>${i + 1}</span></li>`);
            else
                _pags.push(`<li><a href="javascript:void(0);" onclick="setTablePokedex(${i + 1})">${i + 1}</a></li>`);
        }
    }
    if (currentPage + navigationRange < maxPage) {
        _pags.push(`<li class="uk-disabled"><span>...</span></li><li><a href="javascript:void(0);" onclick="setTablePokedex(${maxPage})">${maxPage}</a></li>`);
    }
    let _pages = `
    <ul class="uk-pagination uk-flex-center">
        <li><a href="javascript:void(0);" onclick="prevTablePokedex()"><span uk-pagination-previous></span></a></li>
        ${_pags.join('')}
        <li><a href="javascript:void(0);" onclick="nextTablePokedex()"><span uk-pagination-next></span></a></li>
    </ul>`;
    pag.html(_pages);
    const url = `https://pokeapi.co/api/v2/pokemon/?limit=${limit}&offset=${offset}`;
    fetch (url).then((res) => {
        if (res.status == 200) {
            return res.json();
        } else {
            //mostrar un valor de error
            console.log('error', res);
        }
    }).then((data) => {
        container.html('');
        if (data.results.length > 0) {
            data.results.forEach((pokemon, index) => {
                container.append(`
                <div>
                    <div class="uk-card uk-card-default uk-text-center pointer" onclick="fillPokemon(${index})" data-index="${index}" data-name="${pokemon.name}" data-url="${pokemon.url}">
                        <img src="images/pokeball.png" data-pokeball class="rotate-center" />
                    </div>
                </div>
                `);
                wait(() => {
                    getPokemon(pokemon.name, (_pokemon) => {
                        const _index = zfill(_pokemon.order, 3);
                        const item = container.find(`[data-name="${pokemon.name}"`);
                        item.html(`
                        <!--<h4 class="uk-text-uppercase uk-text-truncate">${_pokemon.name}</h4>-->
                        <img src="${_pokemon.sprites.other.home.front_default}" uk-tooltip="title: N° ${_index} - ${_pokemon.name.toUpperCase()};pos: top-left;" class="uk-width-1-1 swirl-in-fwd" />
                        `);
                    });
                });
            });
        }
        if (data.previous == null) {
            prevbtn.removeClass('uk-button-primary').addClass('uk-button-secondary').data('url', '');
        } else {
            prevbtn.removeClass('uk-button-secondary').addClass('uk-button-primary').data('url', data.previous);
        }
        if (data.next == null) {
            nextbtn.removeClass('uk-button-primary').addClass('uk-button-secondary').data('url', '');
        } else {
            nextbtn.removeClass('uk-button-secondary').addClass('uk-button-primary').data('url', data.next);
        }
    });
};

fillTablePokedex(currentOffset, itemsPerPage);




const wait = (callback, ms) => {
    if(typeof callback == 'undefined') return;
    let context = this, args = typeof arguments != 'undefined' ? arguments : [];
    setTimeout(function() {
      callback(context, args);
    }, ms || 500);;
}

const zfill = (number, width) => {
    var numberOutput = Math.abs(number); /* Valor absoluto del número */
    var length = number.toString().length; /* Largo del número */ 
    var zero = "0"; /* String de cero */  
    
    if (width <= length) {
        if (number < 0) {
             return ("-" + numberOutput.toString()); 
        } else {
             return numberOutput.toString(); 
        }
    } else {
        if (number < 0) {
            return ("-" + (zero.repeat(width - length)) + numberOutput.toString()); 
        } else {
            return ((zero.repeat(width - length)) + numberOutput.toString()); 
        }
    }
}
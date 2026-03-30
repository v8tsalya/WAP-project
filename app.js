const pokeGrid = document.getElementById('pokemonGrid');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const modal = document.getElementById('modal');
const modalDetails = document.getElementById('modalDetails');
const closeModal = document.getElementById('closeModal');

let allPokemon = [];

const typeColors = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
    steel: '#B7B7CE', fairy: '#D685AD'
};

async function init() {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
    const data = await res.json();
    
    const detailedPromises = data.results.map(p => fetch(p.url).then(res => res.json()));
    allPokemon = await Promise.all(detailedPromises);
    
    populateTypeDropdown();
    renderPokemon(allPokemon);
}

function renderPokemon(pokemonList) {
    pokeGrid.innerHTML = pokemonList.map(p => {
        const types = p.types.map(t => t.type.name);
        const pixelArt = p.sprites.front_default;
        
        return `
            <div class="card" onclick="openModal(${p.id})">
                <img src="${pixelArt}" alt="${p.name}">
                <p>#${p.id}</p>
                <h3>${p.name}</h3>
                <div class="types">
                    ${types.map(t => `<span style="background-color: ${typeColors[t]}">${t}</span>`).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function populateTypeDropdown() {
    const types = Object.keys(typeColors);
    types.sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        typeFilter.appendChild(option);
    });
}

function filterPokemon() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;
    
    const filtered = allPokemon.filter(p => {
        const matchesName = p.name.toLowerCase().includes(searchTerm) || p.id.toString() === searchTerm;
        const matchesType = selectedType === 'all' || p.types.some(t => t.type.name === selectedType);
        return matchesName && matchesType;
    });
    
    renderPokemon(filtered);
}

async function openModal(id) {
    const p = allPokemon.find(poke => poke.id === id);
    const mainType = p.types.type.name;
    const color = typeColors[mainType];
    
    modalDetails.innerHTML = `<div class="modal-body">Loading description...</div>`;
    modal.classList.remove('hidden');

    const speciesRes = await fetch(p.species.url);
    const speciesData = await speciesRes.json();
    const descEntry = speciesData.flavor_text_entries.find(e => e.language.name === 'en');
    const desc = descEntry ? descEntry.flavor_text.replace(/[\n\f]/g, ' ') : "No description available.";

    modalDetails.innerHTML = `
        <div class="modal-header" style="background-color: ${color}">
            <h2>${p.name}</h2>
            <img src="${p.sprites.front_default}" class="sprite-large">
        </div>
        <div class="modal-body">
            <p class="description">"${desc}"</p>
            <div class="stats">
                ${p.stats.map(s => `<p><span>${s.stat.name.toUpperCase()}</span> <span>${s.base_stat}</span></p>`).join('')}
            </div>
        </div>
    `;
}

searchInput.addEventListener('input', filterPokemon);
typeFilter.addEventListener('change', filterPokemon);
closeModal.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

init();
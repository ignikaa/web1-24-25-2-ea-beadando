// Adatok tárolása
let adatok = [
    { id: 1, nev: "Kovács János", email: "kovacs@example.com", telefon: "06-30-123-4567", varos: "Budapest" },
    { id: 2, nev: "Nagy Éva", email: "nagy.eva@example.com", telefon: "06-20-234-5678", varos: "Debrecen" },
    { id: 3, nev: "Szabó Péter", email: "szabo.peter@example.com", telefon: "06-70-345-6789", varos: "Szeged" },
    { id: 4, nev: "Kiss Katalin", email: "kiss.katalin@example.com", telefon: "06-30-456-7890", varos: "Pécs" }
];

// Aktuális szerkesztés alatt álló elem azonosítója
let szerkesztesId = null;

// Rendezési állapot
let rendezesOszlop = 'id';
let rendezesIrany = 1; // 1: növekvő, -1: csökkenő

// Oldal betöltésekor
document.addEventListener('DOMContentLoaded', function() {
    // Táblázat feltöltése
    tablazatFrissites();
    
    // Űrlap eseménykezelő
    document.getElementById('crudForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validalas()) {
            adatMentes();
        }
    });
    
    // Új gomb eseménykezelő
    document.getElementById('resetBtn').addEventListener('click', function() {
        urlapReset();
    });
    
    // Keresés eseménykezelő
    document.getElementById('searchInput').addEventListener('keyup', function() {
        tablazatSzures();
    });
    
    // Táblázat fejléc rendezés eseménykezelő
    document.querySelectorAll('#dataTable th[data-sort]').forEach(th => {
        th.addEventListener('click', function() {
            const sortField = this.getAttribute('data-sort');
            tablazatRendezes(sortField);
        });
    });
});

// Táblázat frissítése
function tablazatFrissites() {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    
    adatok.forEach(adat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${adat.id}</td>
            <td>${adat.nev}</td>
            <td>${adat.email}</td>
            <td>${adat.telefon}</td>
            <td>${adat.varos}</td>
            <td>
                <button class="edit-btn" onclick="szerkesztes(${adat.id})">Szerkesztés</button>
                <button class="delete-btn" onclick="torles(${adat.id})">Törlés</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Rendezési állapot jelzése a fejlécben
    document.querySelectorAll('#dataTable th[data-sort]').forEach(th => {
        const sortField = th.getAttribute('data-sort');
        th.classList.remove('sort-asc', 'sort-desc');
        
        if (sortField === rendezesOszlop) {
            th.classList.add(rendezesIrany === 1 ? 'sort-asc' : 'sort-desc');
        }
    });
}

// Űrlap validálás
function validalas() {
    let ervenyes = true;
    
    // Név validálás
    const nev = document.getElementById('nev');
    const nevError = document.getElementById('nevError');
    if (nev.value.trim() === '' || nev.value.length < 3 || nev.value.length > 30) {
        nevError.style.display = 'block';
        ervenyes = false;
    } else {
        nevError.style.display = 'none';
    }
    
    // Email validálás
    const email = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    if (email.value.trim() === '' || email.value.length < 5 || email.value.length > 30 || !validateEmail(email.value)) {
        emailError.style.display = 'block';
        ervenyes = false;
    } else {
        emailError.style.display = 'none';
    }
    
    // Telefon validálás
    const telefon = document.getElementById('telefon');
    const telefonError = document.getElementById('telefonError');
    if (telefon.value.trim() === '' || telefon.value.length < 7 || telefon.value.length > 15) {
        telefonError.style.display = 'block';
        ervenyes = false;
    } else {
        telefonError.style.display = 'none';
    }
    
    // Város validálás
    const varos = document.getElementById('varos');
    const varosError = document.getElementById('varosError');
    if (varos.value.trim() === '' || varos.value.length < 2 || varos.value.length > 30) {
        varosError.style.display = 'block';
        ervenyes = false;
    } else {
        varosError.style.display = 'none';
    }
    
    return ervenyes;
}

// Email formátum validálása
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Adatok mentése (létrehozás vagy frissítés)
function adatMentes() {
    const nev = document.getElementById('nev').value;
    const email = document.getElementById('email').value;
    const telefon = document.getElementById('telefon').value;
    const varos = document.getElementById('varos').value;
    
    if (szerkesztesId === null) {
        // Új rekord létrehozása - automatikus ID generálás
        const ujId = adatok.length > 0 ? Math.max(...adatok.map(a => a.id)) + 1 : 1;
        adatok.push({
            id: ujId,
            nev: nev,
            email: email,
            telefon: telefon,
            varos: varos
        });
    } else {
        // Meglévő rekord frissítése
        const index = adatok.findIndex(a => a.id === szerkesztesId);
        if (index !== -1) {
            adatok[index] = {
                id: szerkesztesId,
                nev: nev,
                email: email,
                telefon: telefon,
                varos: varos
            };
        }
    }
    
    tablazatFrissites();
    urlapReset();
}

// Űrlap alaphelyzetbe állítása
function urlapReset() {
    document.getElementById('nev').value = '';
    document.getElementById('email').value = '';
    document.getElementById('telefon').value = '';
    document.getElementById('varos').value = '';
    
    // Hibaüzenetek elrejtése
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
    });
    
    szerkesztesId = null;
}

// Rekord szerkesztése
function szerkesztes(id) {
    const adat = adatok.find(a => a.id === id);
    if (adat) {
        document.getElementById('nev').value = adat.nev;
        document.getElementById('email').value = adat.email;
        document.getElementById('telefon').value = adat.telefon;
        document.getElementById('varos').value = adat.varos;
        
        szerkesztesId = id;
    }
}

// Rekord törlése
function torles(id) {
    if (confirm('Biztosan törölni szeretné ezt a rekordot?')) {
        adatok = adatok.filter(a => a.id !== id);
        tablazatFrissites();
        
        if (szerkesztesId === id) {
            urlapReset();
        }
    }
}

// Táblázat szűrése
function tablazatSzures() {
    const keresett = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#dataTable tbody tr');
    
    rows.forEach(row => {
        let talalat = false;
        const cellak = row.querySelectorAll('td');
        
        // Az utolsó cellát (műveletek) kihagyjuk a keresésből
        for (let i = 0; i < cellak.length - 1; i++) {
            if (cellak[i].textContent.toLowerCase().includes(keresett)) {
                talalat = true;
                break;
            }
        }
        
        row.style.display = talalat ? '' : 'none';
    });
}

// Táblázat rendezése
function tablazatRendezes(mezo) {
    // Ha ugyanarra az oszlopra kattintunk, megfordítjuk a rendezés irányát
    if (rendezesOszlop === mezo) {
        rendezesIrany *= -1;
    } else {
        rendezesOszlop = mezo;
        rendezesIrany = 1;
    }
    
    // Rendezés a kiválasztott oszlop és irány szerint
    adatok.sort((a, b) => {
        let ertek1 = a[mezo];
        let ertek2 = b[mezo];
        
        // Szövegként kezeljük a rendezést
        if (typeof ertek1 === 'string') {
            ertek1 = ertek1.toLowerCase();
        }
        if (typeof ertek2 === 'string') {
            ertek2 = ertek2.toLowerCase();
        }
        
        if (ertek1 < ertek2) return -1 * rendezesIrany;
        if (ertek1 > ertek2) return 1 * rendezesIrany;
        return 0;
    });
    
    tablazatFrissites();
}

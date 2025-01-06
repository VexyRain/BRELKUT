const liczbaKolumn = 5;
const liczbaWierszy = 3;

const grid = document.querySelector('.grid');
const wynikWyswietlony = document.querySelector('#wynik');

let szerokoscPlansza = window.innerWidth * 0.9;
let wysokoscPlansza = window.innerHeight * 0.7;
let wysokoscBlok = (wysokoscPlansza / 4) / (liczbaWierszy + 1);
let odstepPionowy = wysokoscBlok / (liczbaWierszy);
let odstepPoziomy = odstepPionowy * 2;
let szerokoscBlok = (szerokoscPlansza - ((liczbaKolumn + 1) * (odstepPoziomy))) / (liczbaKolumn);

let promienKuli = szerokoscBlok / 15;
let predkoscPalety = (szerokoscPlansza * 2) / szerokoscBlok;

let wynik = 0;
let mnoznikOdbic = 1;
let timer;

let ruchx = 0.2;
let ruchy = -wysokoscBlok / liczbaKolumn;

const boom = new Audio("res/boom.mp3");
const oop = new Audio("res/oop.mp3");
const ff = new Audio("res/ff.mp3");
const przegrana = new Audio("res/waterphone.mp3");

const startPaleta = [(szerokoscPlansza / 2) - szerokoscBlok / 2, odstepPionowy];
let pozycjaPaleta = [...startPaleta];

const kulaStart = [szerokoscPlansza / 2, wysokoscPlansza / 3];
let pozycjaKula = [...kulaStart];

// Dodaje gracza
const gracz = document.createElement('div');
gracz.classList.add('gracz');
grid.appendChild(gracz);
rysujPalete();

// Dodaje kule
const kula = document.createElement('div');
kula.classList.add('kula');
grid.appendChild(kula);
rysujKule();

// Blok - klasa
class Blok {
    constructor(x, y) {
        this.dolneLewo = [x, y];
        this.dolnePrawo = [x + szerokoscBlok, y];
        this.gorneLewo = [x, y + wysokoscBlok];
        this.gornePrawo = [x + szerokoscBlok, y + wysokoscBlok];
    }
}

const bloki = [];

// Tworzenie bloków
for (let wiersz = 0; wiersz < liczbaWierszy; wiersz++) {
    for (let kolumna = 0; kolumna < liczbaKolumn; kolumna++) {
        const x = odstepPoziomy + kolumna * (szerokoscBlok + odstepPoziomy);
        const y = wysokoscPlansza - (wiersz + 1) * (wysokoscBlok + odstepPionowy);
        const blok = new Blok(x, y);
        bloki.push(blok);
    }
}
rysujBloki();

function rysujPalete() {
    gracz.style.left = pozycjaPaleta[0] + 'px';
    gracz.style.bottom = pozycjaPaleta[1] + 'px';
    gracz.style.width = szerokoscBlok + 'px';
    gracz.style.height = wysokoscBlok + 'px';
}

function rysujKule() {
    kula.style.left = pozycjaKula[0] - promienKuli + 'px';
    kula.style.bottom = pozycjaKula[1] - promienKuli + 'px';
    kula.style.width = promienKuli * 2 + 'px';
    kula.style.height = promienKuli * 2 + 'px';
}

function rysujBloki() {
    const kolory = ['#cc99ff', '#66ccff', '#99ffcc', '#ccff99', '#ffcc99'];
    bloki.forEach(blok => {
        const blockElement = document.createElement('div');
        blockElement.classList.add('blok');
        blockElement.style.backgroundColor = kolory[Math.floor(Math.random() * kolory.length)];
        blockElement.style.left = blok.dolneLewo[0] + 'px';
        blockElement.style.bottom = blok.dolneLewo[1] + 'px';
        blockElement.style.width = szerokoscBlok + 'px';
        blockElement.style.height = wysokoscBlok + 'px';
        grid.appendChild(blockElement);
    });
}

// Zmienna do kontroli przycisków
let lewyPrzycisk = false;
let prawyPrzycisk = false;

function ruszajPaleta(e) {
    if (e === 'left') lewyPrzycisk = true;
    if (e === 'right') prawyPrzycisk = true;
}

function zatrzymajRuchPalety(e) {
    if (e === 'left') lewyPrzycisk = false;
    if (e === 'right') prawyPrzycisk = false;
}

function ruchPalety() {
    if (lewyPrzycisk && pozycjaPaleta[0] > predkoscPalety) {
        pozycjaPaleta[0] -= predkoscPalety;
    } else if (prawyPrzycisk && (pozycjaPaleta[0] + szerokoscBlok + predkoscPalety) < szerokoscPlansza) {
        pozycjaPaleta[0] += predkoscPalety;
    }
    rysujPalete();
    requestAnimationFrame(ruchPalety);
}

ruchPalety();

// Obsługuje wciśnięcia klawiszy
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        lewyPrzycisk = true;
        prawyPrzycisk = false;
    }
    if (e.key === 'ArrowRight') {
        prawyPrzycisk = true;
        lewyPrzycisk = false;
    }
});

// Obsługuje zwolnienia klawiszy
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') lewyPrzycisk = false;
    if (e.key === 'ArrowRight') prawyPrzycisk = false;
});

const lewy = document.getElementById('lewy');
const prawy = document.getElementById('prawy');

lewy.addEventListener('mousedown', () => ruszajPaleta('left'));
lewy.addEventListener('mouseup', () => zatrzymajRuchPalety('left'));

prawy.addEventListener('mousedown', () => ruszajPaleta('right'));
prawy.addEventListener('mouseup', () => zatrzymajRuchPalety('right'));

function ruszajKula() {
    pozycjaKula[0] += ruchx;
    pozycjaKula[1] += ruchy;
    rysujKule();
    sprawdzKolizje();
}

timer = setInterval(ruszajKula, 30);

function sprawdzKolizje() {
    const poprzedniaPozycjaKula = [...pozycjaKula];
    pozycjaKula[0] += ruchx;
    pozycjaKula[1] += ruchy;

    bloki.forEach((blok, i) => {
        if (
            pozycjaKula[0] + promienKuli > blok.dolneLewo[0] &&
            pozycjaKula[0] - promienKuli < blok.dolnePrawo[0] &&
            pozycjaKula[1] + promienKuli > blok.dolneLewo[1] &&
            pozycjaKula[1] - promienKuli < blok.gorneLewo[1]
        ) {
            document.querySelectorAll('.blok')[i].remove();
            bloki.splice(i, 1);
            wynik += 1000 * (1 / mnoznikOdbic);
            boom.play();
            wynikWyswietlony.innerHTML = parseInt(wynik);

            const nadRogiem = pozycjaKula[1] - promienKuli <= blok.gorneLewo[1] &&
                pozycjaKula[1] - promienKuli >= blok.dolneLewo[1];
            const obokRogu = pozycjaKula[0] - promienKuli <= blok.dolnePrawo[0] &&
                pozycjaKula[0] - promienKuli >= blok.dolneLewo[0];

            if (!nadRogiem) ruchy = -ruchy;
            if (!obokRogu) ruchx = -ruchx;

            if (bloki.length === 0) {
                wynikWyswietlony.innerHTML = '⋆˙⟡ ' + parseInt(wynik) + ' ⟡˙⋆';
                clearInterval(timer);
                koniecGry();
                aktywujEfektTekstu();
                ff.play();
            }
            return;
        }
    });

    // Kolizje ze ścianami
    if (pozycjaKula[0] >= szerokoscPlansza - promienKuli || pozycjaKula[0] <= promienKuli) {
        ruchx = -ruchx;
        pozycjaKula[0] = Math.max(promienKuli, Math.min(szerokoscPlansza - promienKuli, pozycjaKula[0]));
    }

    if (pozycjaKula[1] >= wysokoscPlansza - promienKuli) {
        ruchy = -ruchy;
        pozycjaKula[1] = wysokoscPlansza - promienKuli;
    }

    // Kolizja z paletą
    if (
        pozycjaKula[0] + promienKuli > pozycjaPaleta[0] &&
        pozycjaKula[0] - promienKuli < pozycjaPaleta[0] + szerokoscBlok &&
        pozycjaKula[1] - promienKuli <= pozycjaPaleta[1] + wysokoscBlok &&
        pozycjaKula[1] > pozycjaPaleta[1]
    ) {
        const odbiciePoziom = (pozycjaKula[0] - (pozycjaPaleta[0] + szerokoscBlok / 2)) / (szerokoscBlok / 2);
        ruchx = odbiciePoziom * 7;
        ruchy = Math.abs(ruchy);
        mnoznikOdbic++;
        oop.play();
    }

    if (pozycjaKula[1] <= promienKuli) {
        clearInterval(timer);
        wynikWyswietlony.innerHTML = ':(';
        koniecGry();
        przegrana.play();
    }
}

function aktywujEfektTekstu() {
    const tekst = wynikWyswietlony.innerText;
    wynikWyswietlony.innerHTML = '';

    tekst.split('').forEach((znak, index) => {
        const span = document.createElement('span');
        span.innerText = znak === ' ' ? '\u00A0' : znak;
        span.style.display = 'inline-block';
        wynikWyswietlony.appendChild(span);
    });

    let hue = 0;
    let offset = 0;

    function animujTekst() {
        const litery = wynikWyswietlony.querySelectorAll('span');
        litery.forEach((litera, index) => {
            const kolor = `hsl(${(hue + index * 20) % 360}, 70%, 80%)`;
            litera.style.color = kolor;
            const przesuniecie = Math.sin((offset + index * 0.7)) * 4;
            litera.style.transform = `translateY(${przesuniecie}px)`;
        });

        hue += 2;
        offset += 0.1;
        requestAnimationFrame(animujTekst);
    }

    animujTekst();
}

window.addEventListener('resize', function() {
    szerokoscPlansza = window.innerWidth * 0.9;
    wysokoscPlansza = window.innerHeight * 0.7;
    wysokoscBlok = (wysokoscPlansza / 4) / (liczbaWierszy + 1);
    odstepPionowy = wysokoscBlok / liczbaWierszy;
    odstepPoziomy = odstepPionowy * 2;
    szerokoscBlok = (szerokoscPlansza - ((liczbaKolumn + 1) * odstepPoziomy)) / liczbaKolumn;

    promienKuli = szerokoscBlok / 15;
    predkoscPalety = (szerokoscPlansza + odstepPoziomy) / szerokoscBlok;

    rysujPalete();
    rysujKule();
    rysujBloki();
});

function koniecGry() {
    document.removeEventListener('keydown', ruszajPaleta);
    lewy.removeEventListener('mousedown', () => ruszajPaleta('left'));
    prawy.removeEventListener('mousedown', () => ruszajPaleta('right'));
}

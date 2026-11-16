let backgroundColor = '#163B5C';
let data;
let selectedRiverId;
// Ingrandimento del glifo rispetto alla visione di insieme
let scala = 3;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Futura, sans-serif");

  data = await loadTable("assets/rivers.csv", ",", "header");

  let params = getURLParams();
  selectedRiverId = params.river;

  // Aggiungo il pulsante per tornare alla visione di insieme
  let bottone = createButton("← Torna alla visione di insieme");
  bottone.position(20, 20);
  bottone.style("font-family", "Futura, sans-serif");
  bottone.style("color", "#FFFFFF");
  bottone.style("background-color", "rgba(255, 255, 255, 0.12)");
  bottone.style("border", "1px solid rgba(255, 255, 255, 0.7)");
  bottone.style("border-radius", "4px");
  bottone.style("padding", "8px 12px");
  bottone.style("cursor", "pointer");
  bottone.mousePressed(tornaIndietro);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function tornaIndietro() {
  // Torno alla pagina di insieme
  window.location.href = "index.html";
}

function draw() {
  // se i dati non sono ancora caricati non disegno
  if (data === undefined) {
    background(backgroundColor);
    return;
  }

  // Cerco nel dataset il fiume selezionato
  let riverRow = data.findRow(selectedRiverId, "id");

  if (riverRow) {
    // Leggo i valori del fiume dalla riga del CSV
    let nome = riverRow.get("name");
    let continente = riverRow.get("continent");
    let paesi = riverRow.get("countries");
    let foce = riverRow.get("outflow");
    let lunghezza = float(riverRow.get("length"));
    let area = float(riverRow.get("area"));
    let portata = float(riverRow.get("discharge"));
    let affluenti = float(riverRow.get("tributaries"));
    let temperatura = float(riverRow.get("avg_temp"));

    background(ottieniColoreTemperatura(temperatura));

    // Disegno il titolo e le informazioni del fiume
    fill(255);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(26);
    textStyle(BOLD);
    text(nome, 40, 70, width - 80);

    textSize(13);
    textStyle(NORMAL);
    fill(220);
    text(continente.toUpperCase(), 40, 120);

    // Calcolo la posizione e l'altezza del glifo usando la lunghezza del fiume
    let baseY = height - 80;
    let plotHeight = height - 280;
    let glifoX = width * 0.25;
    let h = map(lunghezza, 70, 7000, 10, plotHeight);

    // Disegno la linea di base del glifo
    stroke(255, 150);
    strokeWeight(1.2);
    line(glifoX - 100, baseY, glifoX + 100, baseY);

    disegnaGlifo(glifoX, baseY, h, area, portata, affluenti);

    // Chiamo la funzione della legenda passando i valori del fiume
    disegnaLegenda(width * 0.5, 170, lunghezza, area, portata, affluenti);

    // Mostro i paesi attraversati e il punto in cui sfocia
    let infoX = width * 0.5;
    let infoY = 450;
    let infoW = min(450, width - infoX - 40);
    fill(255);
    noStroke();
    textStyle(BOLD);
    textSize(13);
    text("PAESI ATTRAVERSATI", infoX, infoY);
    text("SFOCIA IN", infoX, infoY + 90);
    textStyle(NORMAL);
    fill(235);
    text(paesi, infoX, infoY + 18, infoW, 60);
    text(foce, infoX, infoY + 108, infoW, 30);
  } else {
    background(backgroundColor);
    fill(255);
    noStroke();
    textSize(20);
    text("Fiume non trovato", 40, 70);
  }
}

function ottieniColoreTemperatura(temperatura) {
  // Associo la temperatura a un colore tra blu e rosso
  let tNorm = constrain(map(temperatura, -8, 28, 0, 1), 0, 1);
  return lerpColor(color("#163B5C"), color("#8C2D24"), tNorm);
}

// Disegno il glifo del fiume
function disegnaGlifo(x, y, h, area, portata, affluenti) {
  push();
  translate(x, y);

  // Disegno lo stelo con spessore proporzionale alla portata
  stroke(255);
  let spessore = map(sqrt(portata), 0, sqrt(210000), 1.2, 4.8) * scala;
  strokeWeight(spessore);
  line(0, 0, 0, -h);

  // Disegno i rami in base al numero di affluenti
  strokeWeight(0.9 * scala);
  let rami = int(map(sqrt(affluenti), 0, sqrt(1100), 2, 12));
  let passo = h / (rami + 1);
  for (let k = 1; k <= rami; k++) {
    let yr = -k * passo;
    let dir = (k % 2 === 0) ? 4 * scala : -4 * scala;
    line(0, yr, dir, yr - 3 * scala);
  }

  // Disegno l'anello con dimensione proporzionale al bacino
  noFill();
  stroke(255);
  strokeWeight(0.85 * scala);
  let diametro = map(sqrt(area), 0, sqrt(7050000), 4, 18) * scala;
  circle(0, -h, diametro);
  pop();
}

// Disegno la legenda con la codifica e i valori del fiume
function disegnaLegenda(x, y, lunghezza, area, portata, affluenti) {
  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  textSize(16);
  textStyle(BOLD);
  text("LEGENDA DEL GLIFO", x, y);

  textSize(14);
  textStyle(NORMAL);
  fill(235);
  disegnaVoceLegenda("ALTEZZA", "lunghezza: " + lunghezza + " km", x, y + 35);
  disegnaVoceLegenda("SPESSORE", "portata media: " + portata + " m³/s", x, y + 62);
  disegnaVoceLegenda("RAMI", "affluenti principali: " + affluenti, x, y + 89);
  disegnaVoceLegenda("ANELLO", "superficie del bacino: " + area + " km²", x, y + 116);
}

function disegnaVoceLegenda(parametro, descrizione, x, y) {
  textStyle(BOLD);
  let prefisso = parametro + " = ";
  text(prefisso, x, y);
  textStyle(NORMAL);
  text(descrizione, x + textWidth(prefisso) + 6, y);
}
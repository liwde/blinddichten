import AbstractFlavor from './AbstractFlavor';
import { chooseOne } from './rand';

const wordA = [
  "Die Suche", "Die Weite", "Das Schweigen", "Zeit",
  "Weg", "Das Lächeln", "Die Reise", "Die Nähe",
  "Das Wunder", "Das Leuchten", "Ein Licht", "Mein Weg",
  "Kein Ort", "Liebe", "Zuversicht", "Das Fenster",
  "Eine Straße", "Die Nacht", "Das Rauschen", "Stille",
  "Gewitter", "Ein Abend", "Unsere Liebe", "Ein Tag",
  "Das Bild", "Das Gesicht", "Das Blau", "Der Schlüssel",
  "Die Rose", "Die Melodie", "Der Schatten"];
const wordB = [
  "des Glücks", "des Meers", "im Wind", "der Träume",
  "der Sterne", "unseres Lebens", "des Himmels", "des Augenblicks",
  "der Stille", "in der Nacht", "zu Dir", "ohne Dich",
  "der Sehnsucht", "ohne Ende", "mit Umwegen", "des Regens",
  "der Weite", "voller Hoffnung", "der Ferne", "des Horizonts",
  "des Mondes", "der Sonne", "der Zuversicht", "ohne Furcht",
  "ohne Zweifel", "der Einsamkeit", "des Vergessens"];

export default class SparkinatorFlavor extends AbstractFlavor {
  generateTitle() {
    return chooseOne(wordA) + ' ' + chooseOne(wordB);
  }
}

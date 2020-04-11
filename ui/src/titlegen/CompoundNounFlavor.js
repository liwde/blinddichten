import AbstractFlavor from './AbstractFlavor';
import { chooseOne } from './rand';

const part1 = ['Morgen', 'Mittags', 'Abend', 'Nacht' , 'Frühlings', 'Sommer', 'Herbst', 'Winter', 'Götter'];
const part2 = [['Die', 'pause'], ['Die', 'zeit'], ['Das', 'erwachen'], ['Die', 'dämmerung']];

export default class CompoundNounFlavor extends AbstractFlavor {
  generateTitle() {
    const [article, suffix] = chooseOne(part2)
    return article + ' ' + chooseOne(part1) + suffix;
  }
}

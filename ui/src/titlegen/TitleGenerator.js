import { chooseOne } from './rand';

export default class TitleGenerator {
  constructor(flavors) {
    this.flavors = flavors;
  }

  generateTitle() {
    if (this.flavors.length === 0) {
      return '';
    }
    return chooseOne(this.flavors).generateTitle();
  }
}

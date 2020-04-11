import TitleGenerator from './TitleGenerator';
import SparkinatorFlavor from './SparkinatorFlavor';
import CompoundNounFlavor from './CompoundNounFlavor';

const titleGenerator = new TitleGenerator([
  new SparkinatorFlavor(),
  new CompoundNounFlavor()
]);

export default titleGenerator;

import { CardanoUtxo } from './types';

export class UtxoManager<utxoType> {
  protected index: number;
  protected utxos: utxoType[];
  protected deserializeUtxo: (serializedUtxo: utxoType) => CardanoUtxo;

  constructor(
    utxos: utxoType[],
    utxoDeserializer: (serializedUtxo: utxoType) => CardanoUtxo
  ) {
    this.index = 0;
    this.utxos = utxos;
    this.deserializeUtxo = utxoDeserializer;
  }

  /**
   * add new utxos to list
   * @param utxos
   */
  extend = (utxos: utxoType[]): void => {
    this.utxos = this.utxos.concat(utxos);
  };

  /**
   * returns next utxo on list
   */
  next = async (): Promise<CardanoUtxo | undefined> => {
    if (this.index >= this.utxos.length) return undefined;
    this.index++;
    return this.deserializeUtxo(this.utxos[this.index - 1]);
  };
}

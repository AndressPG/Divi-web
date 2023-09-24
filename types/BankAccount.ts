import {ExchangeHouse} from "./ExchangeHouse";
import {Bank} from "./Bank";

export enum TypeAccount {
  Corriente = 'C',
 Ahorros = 'A',
 Otra = 'O'
}

export enum Currency {
    Soles = 'S',
    Dolars = 'D',
}

export type BankAccount = {
    id_cuenta: number;
    id_casa_cambio: number | ExchangeHouse;
    id_banco: number | Bank;
    tipo_cuenta: TypeAccount;
    moneda: Currency;
    numero_cuenta: string;
    cci: string;
};

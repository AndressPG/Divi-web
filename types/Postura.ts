import {Exchange} from "./Exchange";
import {Bank} from "./Bank";
import {ExchangeHouse} from "./ExchangeHouse";
import {BankAccount} from "./BankAccount";

export enum PosturaStatus {
    Active = 'ACT',
    StandBy = 'SBY',
    Closed = 'CER',
    Canceled = 'CAN',
    Expired = 'CAD',
}

export type Postura = {
    acepta_parciales: boolean;
    date_created: string;
    date_updated: string;
    desactiva_x_precio: boolean;
    desde: number;
    hora_expiracion: string;
    id_banco: number | Bank;
    id_casa_cambio_maker: number | ExchangeHouse;
    id_postura: string;
    incrementos: number;
    monto_usd: number;
    porcentaje_completado: number;
    precio_desactivacion: number;
    status: PosturaStatus;
    tipo: string;
    user_created: string;
    user_updated: string;
    intercambios?: Exchange[];
    bankAccount?: BankAccount;
    monto_pendiente: number;
};

export type PossiblePostura = Postura & {
  allBudget: boolean;
  pendingAmount: number;
};

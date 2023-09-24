import {BankAccount} from "./BankAccount";

export type PosturaExchange = {
    id_postura_intercambio: number;
    id_postura: string;
    id_intercambio: number;
    sub_monto_usd: number;
    fecha_deposito_maker?: Date;
    fecha_deposito_taker?: Date;
    comision_PEN: number;
    comision_maker_pagada?: boolean;
    comision_taker_pagada?: boolean;
    comision_maker_pagada_fecha?: Date;
    comision_taker_pagada_fecha?: Date;
};

export enum ExchangeStatus {
    Active = 'ACT',
    StandBy = 'STB',
    Expired = 'EXP',
    Done = 'DON',
}

export type Exchange = {
    id_intercambio: number;
    id_casa_cambio_taker: number;
    precio_midmarket: number;
    fecha_creacion: string;
    monto_usd: number;
    casa_cambio: any;
    postura_intercambio: PosturaExchange;
    status: ExchangeStatus;
    bankAccount?: BankAccount;
};

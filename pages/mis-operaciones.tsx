import {ResponsivePage} from "../components/ResponsivePage";
import {Col, Row, Tabs, TabsProps, Typography, Layout} from "antd";
import {withIronSessionSsr} from "iron-session/next";
import {directus} from "../utils/constants";
import {sessionOptions} from "../lib/session";
import {Postura, PosturaStatus} from "../types/Postura";
import {Exchange} from "../types/Exchange";
import React from "react";
import {format} from "date-fns";
import {currencyFormatter} from "../utils/formatter";

const { Title, Text } = Typography;
const { Content } = Layout;

const MisOperaciones = ({ exchanges, posturas }: { posturas: Postura[]; exchanges: Exchange[] }) => {
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: `Posturas`,
            children: <Posturas posturas={posturas} />,
        },
        {
            key: '2',
            label: `Mis Intercambios`,
            children: <Exchanges exchanges={exchanges} />,
        },
    ];

    return (
        <ResponsivePage>
            <Row justify='center'>
                <Col>
                    <Title>Mis Operaciones</Title>
                </Col>
            </Row>
            <Row justify='center'>
                <Col>
                    <Tabs defaultActiveKey="1" items={items} centered />
                </Col>
            </Row>
        </ResponsivePage>
    );
};

const Posturas = ({ posturas }: {posturas: Postura[]}) => {
    return (
        <Content>
            {posturas.length > 0 && posturas.map((postura, index) => (
                <Row key={`postura-${postura.id_postura}`}>
                    <Col>
                        <Row>
                            <Col>
                                <b>Postura{index + 1} - {postura.tipo === 'C' ? 'Compra' : 'Venta'}</b>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <b>Monto: {currencyFormatter(postura.monto_usd)} USD</b>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                {postura.tipo === 'C' ? 'Comprados' : 'Vendidos'}: {currencyFormatter(postura.monto_usd - postura.monto_pendiente)} USD
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                Creada: {format(new Date(postura.date_created), 'hh:mmaaa dd/MM/yyyy')}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            ))}
        </Content>
    );
};

const Exchanges = ({ exchanges }: {exchanges: Exchange[]}) => {
    console.log(exchanges);
    return (
        <Content>
            {exchanges.length > 0 && exchanges.map((exchange, index) => (
                <Row key={`postura-${exchange.id_intercambio}`}>
                    <Col>
                        <Row>
                            <Col>
                                {/* @ts-ignore */}
                                <b>Intercambio{index+1} - {exchange.postura_intercambio.id_postura[0].POSTURA_id_postura.tipo === 'C' ? 'Compra' : 'Venta'}</b>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                {/* @ts-ignore */}
                                <b>{exchange.postura_intercambio.id_postura[0].POSTURA_id_postura.tipo === 'C' ? 'Comprados' : 'Vendidos'}: {currencyFormatter(exchange.monto_usd)} USD</b>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                Precio: S/. {currencyFormatter(exchange.precio_midmarket)}
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                Creada: {format(new Date(exchange.fecha_creacion), 'hh:mmaaa dd/MM/yyyy')}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            ))}
        </Content>
    );
};

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
        // @ts-ignore
        const user = req.session?.user;
        const { data: posturas } = await directus.items('POSTURA').readByQuery({
            limit: -1,
            fields: ['*.*'],
            filter: {
                // @ts-ignore
                id_casa_cambio_maker: user.id_casa_cambio,
            },
            // @ts-ignore
            sort: ['-date_created'],
        });

        const { data: exchanges } = await directus.items('INTERCAMBIO').readByQuery({
            limit: -1,
            fields: ['*.*'],
            filter: {
                // @ts-ignore
                id_casa_cambio_taker: user.id_casa_cambio,
                status: {
                    _neq: "CAN",
                },
            },
            // @ts-ignore
            sort: ['-fecha_creacion'],
        });

        const intercambios = await Promise.all(
            exchanges.map(async intercambio => {
                const {data: posturaIntercambio} = await directus.items('POSTURA_INTERCAMBIO').readByQuery({
                    fields: ['*.*', 'id_postura.POSTURA_id_postura.*'],
                    filter: {
                        id_intercambio: {
                            // @ts-ignore
                            INTERCAMBIO_id_intercambio: intercambio.id_intercambio,
                        },
                    },
                });

                return {...intercambio, postura_intercambio: posturaIntercambio[0]};
            })
        );

        return { props: { posturas, exchanges: intercambios } };
    }, sessionOptions);

export default MisOperaciones;

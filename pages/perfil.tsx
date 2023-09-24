import {ResponsivePage} from "../components/ResponsivePage";
import {Col, Row, Typography} from "antd";
import {directus} from "../utils/constants";
import {withIronSessionSsr} from "iron-session/next";
import {sessionOptions} from "../lib/session";
import {ExchangeHouse} from "../types/ExchangeHouse";
import {BankAccount, Currency, TypeAccount} from "../types/BankAccount";
import {format} from "date-fns";

const { Title, Text } = Typography;

const Perfil = ({ exchangeHouse, bankAccounts }: { exchangeHouse: ExchangeHouse; bankAccounts: BankAccount[] }) => {
    return (
        <ResponsivePage>
            <Row>
                <Col span={24}>
                    <Title>Mi Perfil</Title>
                </Col>
            </Row>

            <Row>
                <Col span={24}>
                    <Title level={2}>Casa Cambio</Title>
                </Col>
                <Col span={24}>
                    <Text>Nombre Comercial: </Text>
                    <Text>{exchangeHouse.nombre_comercial}</Text>
                </Col>
                <Col span={24}>
                    <Text>RUC: </Text>
                    <Text>{exchangeHouse.ruc}</Text>
                </Col>
                <Col span={24}>
                    <Text>Razon Social: </Text>
                    <Text>{exchangeHouse.razon_social}</Text>
                </Col>
                <Col span={24}>
                    <Text>Año registro SBS: </Text>
                    <Text>{format(new Date(exchangeHouse.anho_registro_sbs), 'dd/MM/yyyy')}</Text>
                </Col>
                <Col span={24}>
                    <Title level={2}>Cuentas</Title>
                </Col>
                {bankAccounts.length > 0 && bankAccounts.map(bankAccount => (
                    <>
                        <Col span={24}>
                            <Title level={3}>{bankAccount.moneda === Currency.Soles ? 'Soles' : 'Dólares'}</Title>
                        </Col>
                        <Col span={24}>
                            <Text>Tipo de Cuenta: </Text>
                            <Text>{bankAccount.tipo_cuenta === TypeAccount.Ahorros ? 'Ahorros' : 'Corriente'}</Text>
                        </Col>
                        <Col span={24}>
                            <Text>Banco: </Text>
                            <Text>{bankAccount.id_banco['nombre_banco']}</Text>
                        </Col>
                        <Col span={24}>
                            <Text>Cuenta: </Text>
                            <Text>{bankAccount.numero_cuenta}</Text>
                        </Col>
                        <Col span={24}>
                            <Text>CCI: </Text>
                            <Text>{bankAccount.cci}</Text>
                        </Col>
                    </>
                ))}
            </Row>
        </ResponsivePage>
    );
};

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
        // @ts-ignore
        const user = req.session?.user;
        const exchangeHouse = await directus.items('CASA_CAMBIO').readOne(user.id_casa_cambio);
        const { data } = await directus.items('CUENTA').readByQuery({
            limit: -1,
            fields: ['*', 'id_banco.*'],
            filter: {
                // @ts-ignore
                id_casa_cambio: exchangeHouse.id_casa_cambio,
            }
        });

        return { props: { exchangeHouse, bankAccounts: data } };
}, sessionOptions);

export default Perfil;

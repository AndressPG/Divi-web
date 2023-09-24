import { firefox } from 'playwright';
import { Directus } from '@directus/sdk';
import { differenceInMinutes } from 'date-fns';

const directus = new Directus('http://d548-40-121-108-93.ngrok.io/');

export const scrapper = async () => {
    await directus.auth.static('websocket_token');

    const { data: midMarketPrice } = await directus.items('MID_MARKET_PRICE').readByQuery({
        limit: -1,
    });
    let priceId = null;

    // @ts-ignore
    const  { fecha_price: fechaPrice, price, id } = midMarketPrice[0];
    const date = new Date(fechaPrice);
    const currentDate = new Date();
    const diff = differenceInMinutes(currentDate, date);

    if (diff <= 5) {
        return { price };
    }

    priceId = id;


    const browser = await firefox.launch(/**{ headless: false, slowMo: 500 }**/);
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setExtraHTTPHeaders({referrer: 'https://news.ycombinator.com/'});
    await page.goto('https://datadivisas.com/');
    await page.getByLabel('Usuario').fill('20601932653');
    await page.getByLabel('Clave').fill('20601932653');
    await page.click('button');
    await page.waitForURL('**/indicadores.php');

    const compra = await page.locator('.indicadoresCompraUsd').textContent();
    const venta = await page.locator('.indicadoresVentaUsd').textContent();
    await browser.close();

    const parsedCompra = isNaN(parseFloat(compra)) ? 0 : parseFloat(compra);
    const parsedVenta = isNaN(parseFloat(venta)) ? 0 : parseFloat(venta);

    const newPrice = (parsedCompra + parsedVenta) / 2;

    if (newPrice) {
        await directus.items('MID_MARKET_PRICE').updateOne(priceId, { fecha_price: new Date(), price: newPrice, fuente: 'datadivi' });
        return { price: newPrice };
    }

    return { price };
};

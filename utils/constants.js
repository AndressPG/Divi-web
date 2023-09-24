import { Directus } from '@directus/sdk';

export const directus = new Directus('http://d548-40-121-108-93.ngrok.io/', {
    auth: {
        mode: 'cookie',
        autoRefresh: true,
        msRefreshBeforeExpires: 30000,
        staticToken: '',
    },
    storage: {
        prefix: '',
        mode: 'LocalStorage',
    }
});

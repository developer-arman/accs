/*! Copyright 2026 Adobe
All Rights Reserved. */
import { Initializer as a } from '@dropins/tools/lib.js';
import { FetchGraphQL as r } from '@dropins/tools/fetch-graphql.js';
import { i as o, g as Q, s as F } from './chunks/algoliaApi.js';

const t = new a({ init: async (e) => { const i = {}; e != null && e.algoliaConfig && o(e.algoliaConfig), t.config.setConfig({ ...i, ...e }); }, listeners: () => [] }); const h = t.config; const {
  setEndpoint: g, setFetchGraphQlHeader: p, removeFetchGraphQlHeader: f, setFetchGraphQlHeaders: c, fetchGraphQl: m, getConfig: d,
} = new r().getMethods(); export {
  h as config, m as fetchGraphQl, Q as getAlgoliaConfig, d as getConfig, t as initialize, o as initializeAlgolia, f as removeFetchGraphQlHeader, F as searchProducts, g as setEndpoint, p as setFetchGraphQlHeader, c as setFetchGraphQlHeaders,
};
// # sourceMappingURL=api.js.map

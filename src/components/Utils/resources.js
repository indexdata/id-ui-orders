import {
  CHECKIN_API,
  CONFIG_API,
  FUND_API,
  IDENTIFIER_TYPES_API,
  ITEMS_API,
  LINE_DETAIL_API,
  LOCATIONS_API,
  MATERIAL_TYPES_API,
  ORDER_DETAIL_API,
  ORDER_PIECES_API,
  RECEIVE_API,
  RECEIVING_API,
  USERS_API,
  VENDORS_API,
} from './api';
import {
  CONFIG_ADDRESSES,
  CONFIG_CLOSING_REASONS,
  CONFIG_CREATE_INVENTORY,
  CONFIG_LINES_LIMIT,
  CONFIG_ORDER_NUMBER,
  CONFIG_PREFIXES,
  CONFIG_SUFFIXES,
  CONFIG_ORDER_TEMPLATES,
  LIMIT_MAX,
  MODULE_ORDERS,
  MODULE_TENANT,
} from './const';

const BASE_RESOURCE = {
  perRequest: LIMIT_MAX,
  throwErrors: false,
  type: 'okapi',
};

export const RECEIVING_HISTORY = {
  fetch: false,
  accumulate: true,
  type: 'okapi',
  path: RECEIVING_API,
  records: 'receivingHistory',
  throwErrors: false,
};

export const LOCATIONS = {
  ...BASE_RESOURCE,
  path: LOCATIONS_API,
  records: 'locations',
  throwErrors: false,
};

export const ORDER = {
  type: 'okapi',
  path: ORDER_DETAIL_API,
  throwErrors: false,
};

export const RECEIVE = {
  clientGeneratePk: false,
  fetch: false,
  path: RECEIVE_API,
  records: 'toBeReceived',
  throwErrors: false,
  type: 'okapi',
};

export const ITEMS = {
  ...BASE_RESOURCE,
  fetch: false,
  accumulate: true,
  path: ITEMS_API,
  records: 'items',
  throwErrors: false,
};

export const CHECKIN = {
  ...BASE_RESOURCE,
  clientGeneratePk: false,
  fetch: false,
  path: CHECKIN_API,
  records: 'toBeReceived',
  throwErrors: false,
};

export const ORDER_PIECES = {
  ...BASE_RESOURCE,
  accumulate: true,
  clientGeneratePk: false,
  fetch: false,
  path: ORDER_PIECES_API,
  records: 'checkInItems',
};

export const LINE = {
  type: 'okapi',
  path: LINE_DETAIL_API,
  throwErrors: false,
};

export const IDENTIFIER_TYPES = {
  ...BASE_RESOURCE,
  path: IDENTIFIER_TYPES_API,
  records: 'identifierTypes',
};

export const MATERIAL_TYPES = {
  ...BASE_RESOURCE,
  path: MATERIAL_TYPES_API,
  records: 'mtypes',
};

export const VENDORS = {
  ...BASE_RESOURCE,
  path: VENDORS_API,
  GET: {
    params: {
      query: 'cql.allRecords=1 sortby name',
    },
  },
  records: 'organizations',
};

export const CLOSING_REASONS = {
  ...BASE_RESOURCE,
  path: CONFIG_API,
  records: 'configs',
  GET: {
    params: {
      query: `(module=${MODULE_ORDERS} and configName=${CONFIG_CLOSING_REASONS})`,
    },
  },
};

export const LINES_LIMIT = {
  ...BASE_RESOURCE,
  records: 'configs',
  path: CONFIG_API,
  GET: {
    params: {
      query: `(module=${MODULE_ORDERS} and configName=${CONFIG_LINES_LIMIT})`,
    },
  },
};

export const ADDRESSES = {
  ...BASE_RESOURCE,
  records: 'configs',
  path: CONFIG_API,
  GET: {
    params: {
      query: `(module=${MODULE_TENANT} and configName=${CONFIG_ADDRESSES})`,
    },
  },
};

export const FUND = {
  ...BASE_RESOURCE,
  path: FUND_API,
  records: 'funds',
};

export const USERS = {
  ...BASE_RESOURCE,
  path: USERS_API,
  records: 'users',
};

export const CREATE_INVENTORY = {
  ...BASE_RESOURCE,
  path: CONFIG_API,
  records: 'configs',
  GET: {
    params: {
      query: `(module=${MODULE_ORDERS} and configName=${CONFIG_CREATE_INVENTORY})`,
    },
  },
};

export const ORDER_NUMBER_SETTING = {
  ...BASE_RESOURCE,
  path: CONFIG_API,
  records: 'configs',
  GET: {
    params: {
      query: `(module=${MODULE_ORDERS} and configName=${CONFIG_ORDER_NUMBER})`,
    },
  },
};

export const PREFIXES_SETTING = {
  ...BASE_RESOURCE,
  path: CONFIG_API,
  records: 'configs',
  GET: {
    params: {
      query: `(module=${MODULE_ORDERS} and configName=${CONFIG_PREFIXES})`,
    },
  },
};

export const SUFFIXES_SETTING = {
  ...BASE_RESOURCE,
  path: CONFIG_API,
  records: 'configs',
  GET: {
    params: {
      query: `(module=${MODULE_ORDERS} and configName=${CONFIG_SUFFIXES})`,
    },
  },
};

export const ORDER_TEMPLATES = {
  ...BASE_RESOURCE,
  path: CONFIG_API,
  records: 'configs',
  GET: {
    params: {
      query: `(module=${MODULE_ORDERS} and configName=${CONFIG_ORDER_TEMPLATES})`,
    },
  },
};

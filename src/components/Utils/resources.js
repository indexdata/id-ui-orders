import {
  LOCATIONS_API,
  ORDER_DETAIL_API,
  RECEIVE_API,
  RECEIVING_API,
} from './api';
import { LIMIT_MAX } from './const';

export const RECEIVING_HISTORY = {
  fetch: false,
  accumulate: true,
  type: 'okapi',
  path: RECEIVING_API,
  records: 'receiving_history',
  throwErrors: false,
};

export const LOCATIONS = {
  path: LOCATIONS_API,
  perRequest: LIMIT_MAX,
  records: 'locations',
  throwErrors: false,
  type: 'okapi',
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
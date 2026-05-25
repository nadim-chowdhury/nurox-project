import { AccountType } from './entities/account.entity';

export interface CoATemplateItem {
  code: string;
  name: string;
  type: AccountType;
  children?: CoATemplateItem[];
}

export const US_COA: CoATemplateItem[] = [
  {
    code: '1000',
    name: 'ASSETS',
    type: AccountType.ASSET,
    children: [
      {
        code: '1100',
        name: 'Current Assets',
        type: AccountType.ASSET,
        children: [
          { code: '1110', name: 'Cash and Bank', type: AccountType.ASSET },
          {
            code: '1120',
            name: 'Accounts Receivable',
            type: AccountType.ASSET,
          },
          { code: '1130', name: 'Inventory', type: AccountType.ASSET },
          { code: '1140', name: 'Prepaid Expenses', type: AccountType.ASSET },
        ],
      },
      {
        code: '1500',
        name: 'Fixed Assets',
        type: AccountType.ASSET,
        children: [
          { code: '1510', name: 'Land', type: AccountType.ASSET },
          { code: '1520', name: 'Buildings', type: AccountType.ASSET },
          { code: '1530', name: 'Equipment', type: AccountType.ASSET },
          {
            code: '1540',
            name: 'Accumulated Depreciation',
            type: AccountType.ASSET,
          },
        ],
      },
    ],
  },
  {
    code: '2000',
    name: 'LIABILITIES',
    type: AccountType.LIABILITY,
    children: [
      {
        code: '2100',
        name: 'Current Liabilities',
        type: AccountType.LIABILITY,
        children: [
          {
            code: '2110',
            name: 'Accounts Payable',
            type: AccountType.LIABILITY,
          },
          {
            code: '2120',
            name: 'Accrued Liabilities',
            type: AccountType.LIABILITY,
          },
          { code: '2130', name: 'Taxes Payable', type: AccountType.LIABILITY },
        ],
      },
      {
        code: '2500',
        name: 'Long-term Liabilities',
        type: AccountType.LIABILITY,
        children: [
          {
            code: '2510',
            name: 'Long-term Loans',
            type: AccountType.LIABILITY,
          },
        ],
      },
    ],
  },
  {
    code: '3000',
    name: 'EQUITY',
    type: AccountType.EQUITY,
    children: [
      { code: '3100', name: 'Common Stock', type: AccountType.EQUITY },
      { code: '3200', name: 'Retained Earnings', type: AccountType.EQUITY },
    ],
  },
  {
    code: '4000',
    name: 'REVENUE',
    type: AccountType.REVENUE,
    children: [
      { code: '4100', name: 'Sales Revenue', type: AccountType.REVENUE },
      { code: '4200', name: 'Service Revenue', type: AccountType.REVENUE },
      { code: '4300', name: 'Interest Income', type: AccountType.REVENUE },
    ],
  },
  {
    code: '5000',
    name: 'EXPENSES',
    type: AccountType.EXPENSE,
    children: [
      { code: '5100', name: 'Cost of Goods Sold', type: AccountType.EXPENSE },
      {
        code: '5200',
        name: 'Operating Expenses',
        type: AccountType.EXPENSE,
        children: [
          {
            code: '5210',
            name: 'Salaries and Wages',
            type: AccountType.EXPENSE,
          },
          { code: '5220', name: 'Rent Expense', type: AccountType.EXPENSE },
          { code: '5230', name: 'Utilities', type: AccountType.EXPENSE },
          {
            code: '5240',
            name: 'Insurance Expense',
            type: AccountType.EXPENSE,
          },
          {
            code: '5250',
            name: 'Marketing Expense',
            type: AccountType.EXPENSE,
          },
        ],
      },
    ],
  },
];

export const BD_COA: CoATemplateItem[] = [
  ...US_COA,
  {
    code: '2131',
    name: 'VAT Current Account',
    type: AccountType.LIABILITY,
  },
  {
    code: '2132',
    name: 'TDS Payable',
    type: AccountType.LIABILITY,
  },
];

export const IN_COA: CoATemplateItem[] = [
  ...US_COA,
  {
    code: '2131',
    name: 'Input CGST',
    type: AccountType.ASSET,
  },
  {
    code: '2132',
    name: 'Input SGST',
    type: AccountType.ASSET,
  },
  {
    code: '2133',
    name: 'Input IGST',
    type: AccountType.ASSET,
  },
  {
    code: '2134',
    name: 'Output CGST',
    type: AccountType.LIABILITY,
  },
  {
    code: '2135',
    name: 'Output SGST',
    type: AccountType.LIABILITY,
  },
  {
    code: '2136',
    name: 'Output IGST',
    type: AccountType.LIABILITY,
  },
];

export const UK_COA: CoATemplateItem[] = [
  ...US_COA,
  {
    code: '2131',
    name: 'VAT Control Account',
    type: AccountType.LIABILITY,
  },
];

export const GET_COA_BY_COUNTRY = (country: string): CoATemplateItem[] => {
  switch (country.toUpperCase()) {
    case 'BD':
      return BD_COA;
    case 'IN':
      return IN_COA;
    case 'UK':
    case 'GB':
      return UK_COA;
    case 'US':
    default:
      return US_COA;
  }
};

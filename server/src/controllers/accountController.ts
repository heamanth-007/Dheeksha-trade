import type { Request, Response, NextFunction } from 'express';
import { AccountLedger } from '../models/AccountLedger';

const DEFAULT_ACCOUNT_DETAILS = [
  {
    customerName: 'R A TRADERS 2025',
    date: '04-11-2024',
    companyName: 'R A TRADERS BALANCE AMOUNT',
    debit: '0.00',
    credit: '5,575,085.00',
    balance: '5,575,085.00',
    type: 'CREDIT',
  },
  {
    customerName: 'R A TRADERS 2025',
    date: '04-11-2024',
    companyName: 'LAKSHMI PAKAGING',
    debit: '172,799.00',
    credit: '0.00',
    balance: '-5,402,286.00',
    type: 'BILL',
  },
  {
    customerName: 'R A TRADERS 2025',
    date: '04-11-2024',
    companyName: 'GUNASEKARAN',
    debit: '32,000.00',
    credit: '0.00',
    balance: '-5,370,286.00',
    type: 'BILL',
  },
  {
    customerName: 'R A TRADERS 2025',
    date: '05-11-2024',
    companyName: 'NAGARAJ COMPANY',
    debit: '0.00',
    credit: '30,000.00',
    balance: '-5,400,286.00',
    type: 'CREDIT',
  },
  {
    customerName: 'R A TRADERS 2025',
    date: '06-11-2024',
    companyName: 'VIGNESH PRABHU FW',
    debit: '0.00',
    credit: '55,000.00',
    balance: '-5,455,286.00',
    type: 'CREDIT',
  },
  {
    customerName: 'R A TRADERS 2025',
    date: '06-11-2024',
    companyName: 'VIGNESH PRABHU FW',
    debit: '0.00',
    credit: '37,000.00',
    balance: '-5,492,286.00',
    type: 'CREDIT',
  },
  {
    customerName: 'R A TRADERS 2025',
    date: '06-11-2024',
    companyName: 'VIGNESH PRABHU FW',
    debit: '0.00',
    credit: '300,000.00',
    balance: '-5,792,286.00',
    type: 'CREDIT',
  },
  {
    customerName: 'R A TRADERS 2025',
    date: '06-11-2024',
    companyName: 'VIGNESH PRABHU FW',
    debit: '0.00',
    credit: '49,000.00',
    balance: '-5,841,286.00',
    type: 'CREDIT',
  },
  {
    customerName: 'R A TRADERS 2025',
    date: '06-11-2024',
    companyName: 'VIGNESH PRABHU FW',
    debit: '0.00',
    credit: '45,000.00',
    balance: '-5,886,286.00',
    type: 'CREDIT',
  },
];

export const getAccountDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerName } = req.query;
    const filter = customerName ? { customerName: String(customerName) } : {};

    let accounts = await AccountLedger.find(filter).sort({ createdAt: 1 });
    if (accounts.length === 0 && !customerName) {
      await AccountLedger.insertMany(DEFAULT_ACCOUNT_DETAILS);
      accounts = await AccountLedger.find().sort({ createdAt: 1 });
    }
    res.status(200).json({ success: true, count: accounts.length, data: accounts });
  } catch (error) {
    next(error);
  }
};

export const addCredit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerName, companyName, creditAmount, date } = req.body;

    // Calculate current running balance
    const lastEntry = await AccountLedger.findOne({ customerName }).sort({ createdAt: -1 });
    const currentBalance = lastEntry ? parseFloat(lastEntry.balance.replace(/,/g, '')) : 0;
    const addedCredit = parseFloat(creditAmount) || 0;
    const newBalance = (currentBalance + addedCredit).toFixed(2);

    const creditEntry = await AccountLedger.create({
      customerName,
      companyName,
      date: date || new Date().toISOString().split('T')[0],
      debit: '0.00',
      credit: addedCredit.toFixed(2),
      balance: newBalance,
      type: 'CREDIT',
    });

    res.status(201).json({ success: true, data: creditEntry });
  } catch (error) {
    next(error);
  }
};

export const deleteAccountEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const entry = await AccountLedger.findByIdAndDelete(req.params.id);
    if (!entry) {
      res.status(404).json({ success: false, error: 'Account ledger entry not found' });
      return;
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

import type { Request, Response, NextFunction } from 'express';
import { Particular } from '../models/Particular';
import { AccountLedger } from '../models/AccountLedger';

const DEFAULT_PARTICULAR_DETAILS = [
  {
    billNo: '0602',
    companyName: 'LAKSHMI PAKAGING',
    date: '04-11-2024',
    amount: '172799.00',
    transport: 'THIRUPATHI ROADWAYS',
    customerName: 'R A TRADERS 2025',
  },
  {
    billNo: 'R A TRADERS',
    companyName: 'GUNASEKARAN',
    date: '04-11-2024',
    amount: '32000.00',
    transport: 'TRASNPORT',
    customerName: 'R A TRADERS 2025',
  },
  {
    billNo: 'WITH OUT',
    companyName: 'LAKSHMI PAKAGING',
    date: '06-11-2024',
    amount: '40000.00',
    transport: 'THIRUPATHI ROADWAYS',
    customerName: 'R A TRADERS 2025',
  },
  {
    billNo: '335',
    companyName: 'SIMBA FW',
    date: '14-11-2024',
    amount: '111895.92',
    transport: 'SRI AMARNATH TRANSPORT',
    customerName: 'R A TRADERS 2025',
  },
  {
    billNo: '0613',
    companyName: 'LAKSHMI PAKAGING',
    date: '16-11-2024',
    amount: '267549.00',
    transport: 'SRI AMARNATH TRANSPORT',
    customerName: 'R A TRADERS 2025',
  },
  {
    billNo: '160 EXTRA BILL',
    companyName: 'BIRILIENT FW',
    date: '16-11-2024',
    amount: '18819.00',
    transport: 'SRI AMARNATH TRANSPORT',
    customerName: 'R A TRADERS 2025',
  },
  {
    billNo: '528',
    companyName: 'FATHERS',
    date: '16-11-2024',
    amount: '215410.00',
    transport: 'SRI AMARNATH TRANSPORT',
    customerName: 'R A TRADERS 2025',
  },
  {
    billNo: '129',
    companyName: 'JAYA DURGA CAP',
    date: '22-11-2024',
    amount: '107200.00',
    transport: 'VARMA TRANSPORT',
    customerName: 'R A TRADERS 2025',
  },
  {
    billNo: '0627',
    companyName: 'LAKSHMI PAKAGING',
    date: '23-11-2024',
    amount: '320400.00',
    transport: 'SRI AMARNATH TRANSPORT',
    customerName: 'R A TRADERS 2025',
  },
];

export const getParticulars = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerName } = req.query;
    const filter = customerName ? { customerName: String(customerName) } : {};

    let particulars = await Particular.find(filter).sort({ createdAt: -1 });
    if (particulars.length === 0 && !customerName) {
      await Particular.insertMany(DEFAULT_PARTICULAR_DETAILS);
      particulars = await Particular.find().sort({ createdAt: -1 });
    }
    res.status(200).json({ success: true, count: particulars.length, data: particulars });
  } catch (error) {
    next(error);
  }
};

export const getParticularById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const particular = await Particular.findById(req.params.id);
    if (!particular) {
      res.status(404).json({ success: false, error: 'Particular bill not found' });
      return;
    }
    res.status(200).json({ success: true, data: particular });
  } catch (error) {
    next(error);
  }
};

export const createParticular = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const particular = await Particular.create(req.body);

    // Also automatically log to Account Ledger
    if (particular.amount && Number(particular.amount) > 0) {
      await AccountLedger.create({
        customerName: particular.customerName,
        date: particular.date,
        companyName: particular.companyName,
        debit: particular.amount,
        credit: '0.00',
        balance: `-${particular.amount}`,
        type: 'BILL',
      });
    }

    res.status(201).json({ success: true, data: particular });
  } catch (error) {
    next(error);
  }
};

export const deleteParticular = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const particular = await Particular.findByIdAndDelete(req.params.id);
    if (!particular) {
      res.status(404).json({ success: false, error: 'Particular bill not found' });
      return;
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

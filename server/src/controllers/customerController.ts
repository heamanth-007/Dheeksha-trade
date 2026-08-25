import type { Request, Response, NextFunction } from 'express';
import { Customer } from '../models/Customer';

// Seed default customers if empty
const DEFAULT_CUSTOMERS = [
  {
    idCode: '#1042',
    name: 'Acme Corp',
    avatarLetter: 'A',
    avatarBg: '#D4DEFD',
    avatarColor: '#1E293B',
    address: '123 Industrial Pkwy, Bldg 4',
    mobile: '+1 (555) 019-2834',
    gst: '29ABCDE1234F1Z5',
  },
  {
    idCode: '#1043',
    name: 'Global Logistics Inc',
    avatarLetter: 'G',
    avatarBg: '#BADAF9',
    avatarColor: '#1E293B',
    address: '450 Portside Ave, Ste 200',
    mobile: '+1 (555) 837-1029',
    gst: '29XYZAB5678C1Z9',
  },
  {
    idCode: '#1044',
    name: 'Summit Supplies',
    avatarLetter: 'S',
    avatarBg: '#F8C4B4',
    avatarColor: '#1E293B',
    address: '88 Ridge Rd, Warehouse B',
    mobile: '+1 (555) 443-9912',
    gst: '29LMNOP9012Q1Z3',
  },
];

export const getCustomers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let customers = await Customer.find().sort({ createdAt: -1 });
    if (customers.length === 0) {
      await Customer.insertMany(DEFAULT_CUSTOMERS);
      customers = await Customer.find().sort({ createdAt: -1 });
    }
    res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

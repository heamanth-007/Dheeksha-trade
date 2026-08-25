import type { Request, Response, NextFunction } from 'express';
import { Company } from '../models/Company';

const DEFAULT_COMPANIES = [
  {
    slNo: '01',
    name: 'Acme Logistics Pvt Ltd',
    avatarLetter: 'A',
    avatarBg: '#DBEAFE',
    avatarColor: '#0B4DB7',
    address: '124 Industrial Area, Phase 1, Mumbai, Maharashtra 400001',
    gstin: '27AADCA2230M1Z2',
  },
  {
    slNo: '02',
    name: 'Global Traders LLC',
    avatarLetter: 'G',
    avatarBg: '#DBEAFE',
    avatarColor: '#0B4DB7',
    address: 'Unit 4B, Tech Park, Whitefield, Bangalore, Karnataka 560066',
    gstin: '29BBBPG1234N1Z5',
  },
  {
    slNo: '03',
    name: 'Nexus Manufacturing',
    avatarLetter: 'N',
    avatarBg: '#DBEAFE',
    avatarColor: '#0B4DB7',
    address: 'Plot 88, Sector 15, Gurgaon, Haryana 122015',
    gstin: '06AAACN4321P2Z9',
  },
  {
    slNo: '04',
    name: 'Stellar Enterprises',
    avatarLetter: 'S',
    avatarBg: '#DBEAFE',
    avatarColor: '#0B4DB7',
    address: '45/A, Anna Salai, Chennai, Tamil Nadu 600002',
    gstin: '33AADCS5678Q1Z4',
  },
];

export const getCompanies = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let companies = await Company.find().sort({ createdAt: -1 });
    if (companies.length === 0) {
      await Company.insertMany(DEFAULT_COMPANIES);
      companies = await Company.find().sort({ createdAt: -1 });
    }
    res.status(200).json({ success: true, count: companies.length, data: companies });
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404).json({ success: false, error: 'Company not found' });
      return;
    }
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!company) {
      res.status(404).json({ success: false, error: 'Company not found' });
      return;
    }
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      res.status(404).json({ success: false, error: 'Company not found' });
      return;
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

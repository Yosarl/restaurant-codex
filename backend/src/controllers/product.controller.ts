import { Request, Response } from 'express';
import ProductModel from '../models/Product';
import InventoryBatchModel from '../models/InventoryBatch';
import { getPagination } from '../utils/pagination';

export async function listProducts(req: Request, res: Response): Promise<void> {
  const { page, limit, skip } = getPagination(req);
  const filter: Record<string, unknown> = {};

  if (req.query.outlet) filter.outletId = req.query.outlet;
  if (req.query.category) filter.categoryId = req.query.category;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { sku: { $regex: req.query.search, $options: 'i' } },
      { barcode: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  if (req.query.lowStock === 'true') {
    filter.$expr = { $lte: ['$reorderLevel', '$sellPrice'] };
  }

  const [items, total] = await Promise.all([
    ProductModel.find(filter).skip(skip).limit(limit).lean(),
    ProductModel.countDocuments(filter)
  ]);

  res.json({ items, meta: { page, limit, total } });
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  const product = await ProductModel.create({ ...req.body, images: req.body.images || [] });
  res.status(201).json(product);
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const product = await ProductModel.findById(req.params.id).lean();
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  res.json(product);
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const product = await ProductModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  res.json(product);
}

export async function removeProduct(req: Request, res: Response): Promise<void> {
  const product = await ProductModel.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  res.status(204).send();
}

export async function getProductStock(req: Request, res: Response): Promise<void> {
  const product = await ProductModel.findById(req.params.id).lean();
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  const batches = await InventoryBatchModel.find({ productId: product._id }).sort({ createdAt: 1 }).lean();
  const currentStock = batches.reduce((sum, b) => sum + b.remainingQty, 0);

  res.json({ productId: product._id, currentStock, batches });
}

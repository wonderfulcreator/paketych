export type Product = {
  id: string;
  slug: string;
  title: string;
  sku: string;
  category: string;
  categoryLabel: string;
  collection: string;
  theme: string[];
  size: string;
  material: string;
  color: string;
  dimensions: string;
  grammage: number;
  handleType: string;
  pcsPerBox: number;
  basePrice: number;
  salePrice: number | null;
  isAvailable: boolean;
  isNew: boolean;
  isHit: boolean;
  isSale: boolean;
  images: string[];
};

export type User = {
  email: string;
  name: string;
  company: string;
  phone: string;
};

export type RequestItem = {
  productId: string;
  sku: string;
  title: string;
  boxes: number;
  basePrice: number;
};

export type RequestStatus =
  | "new"
  | "processing"
  | "quoted"
  | "done"
  | "cancelled";

export type ClientRequest = {
  id: string;
  createdAt: string;
  items: RequestItem[];
  comment: string;
  status: RequestStatus;
  user: User;
};

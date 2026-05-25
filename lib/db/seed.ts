import type { Customer, CustomerGroup, Product } from "../types";

export const seedProducts: Product[] = [
  {
    id: "hgvpin216",
    title: "High Garden Pinot Noir 2021",
    sku: "HGVPIN216",
    brand: "High Garden",
    subCategory: "Wine",
    segment: "Red",
    basePrice: 279.06,
  },
  {
    id: "koybrunv6",
    title: "Koyama Methode Brut Nature NV",
    sku: "KOYBRUNV6",
    brand: "Koyama Wines",
    subCategory: "Wine",
    segment: "Sparkling",
    basePrice: 120.0,
  },
  {
    id: "koynr1837",
    title: "Koyama Riesling 2018",
    sku: "KOYNR1837",
    brand: "Koyama Wines",
    subCategory: "Wine",
    segment: "Port/Dessert",
    basePrice: 215.04,
  },
  {
    id: "koyrie19",
    title: "Koyama Tussock Riesling 2019",
    sku: "KOYRIE19",
    brand: "Koyama Wines",
    subCategory: "Wine",
    segment: "White",
    basePrice: 215.04,
  },
  {
    id: "lacbnatnv6",
    title: "Lacourte-Godbillon Brut Cru NV",
    sku: "LACBNATNV6",
    brand: "Lacourte-Godbillon",
    subCategory: "Wine",
    segment: "Sparkling",
    basePrice: 409.32,
  },
];

export const seedCustomerGroups: CustomerGroup[] = [
  { id: "independent-retailers", name: "Independent Retailers" },
  { id: "vip", name: "VIP" },
];

export const seedCustomers: Customer[] = [
  {
    id: "bondi-cellars",
    name: "Bondi Cellars",
    groupIds: ["independent-retailers", "vip"],
  },
];

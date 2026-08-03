export interface Garment {
  id: string;
  name: string;
  imageUrl: string;
  category: "upper_body" | "lower_body" | "full_body" | "auto";
  occasionTags: string[];
}

export const GARMENT_CATALOGUE: Garment[] = [
  {
    id: "garment-001",
    name: "Casual White Tee",
    // Verified working in your previous test
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
    category: "upper_body",
    occasionTags: ["casual", "daily"],
  },
  {
    id: "garment-002",
    name: "Elegant Evening Gown",
    // A full body dress image
    imageUrl:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80",
    category: "full_body",
    occasionTags: ["formal", "party", "date_night"],
  },
  {
    id: "garment-003",
    name: "Professional Blazer",
    // A blazer/jacket image
    imageUrl:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80",
    category: "upper_body",
    occasionTags: ["work", "formal"],
  },
  {
    id: "garment-004",
    name: "Summer Floral Dress",
    // A casual full body dress
    imageUrl:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80",
    category: "full_body",
    occasionTags: ["vacation", "casual"],
  },
];

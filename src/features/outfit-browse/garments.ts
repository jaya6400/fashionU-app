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
    name: "Working women office formal",
    imageUrl:
      "https://jpgrytcivdbjskxsvzua.supabase.co/storage/v1/object/public/user-photos/Business-Professional-1-scaled.webp",
    category: "full_body",
    occasionTags: ["formal", "work"],
  },
  {
    id: "garment-002",
    name: "Elegant Evening Gown",
    // A full body dress image
    imageUrl:
      "https://jpgrytcivdbjskxsvzua.supabase.co/storage/v1/object/public/user-photos/floral-dress.jfif",
    category: "full_body",
    occasionTags: ["formal", "party", "date_night"],
  },
  {
    id: "garment-003",
    name: "Professional men office formal",
    // A blazer/jacket image
    imageUrl:
      "https://jpgrytcivdbjskxsvzua.supabase.co/storage/v1/object/public/user-photos/menformal1.webp",
    category: "full_body",
    occasionTags: ["work", "formal"],
  },
  {
    id: "garment-004",
    name: "Summer Floral Dress",
    // A casual knee length dress
    imageUrl:
      "https://jpgrytcivdbjskxsvzua.supabase.co/storage/v1/object/public/user-photos/front-half-frok.jfif",
    category: "full_body",
    occasionTags: ["vacation", "casual"],
  },
  {
    id: "garment-005",
    name: "Women formal professional dress",
    // A casual/professional full body dress
    imageUrl:
      "https://jpgrytcivdbjskxsvzua.supabase.co/storage/v1/object/public/user-photos/womwnfor2.webp",
    category: "full_body",
    occasionTags: ["vacation", "casual", "formal"],
  },
  {
    id: "garment-006",
    name: "Casual men oversized shirt with trousers",
    // A model with oversized shirt with trousers
    imageUrl:
      "https://jpgrytcivdbjskxsvzua.supabase.co/storage/v1/object/public/user-photos/menformal2.webp",
    category: "full_body",
    occasionTags: ["date_night", "casual", "party"],
  },
];

export interface Garment {
  id: string;
  name: string;
  imageUrl: string; // must be a publicly reachable URL — YouCam fetches this server-side
  category: "upper_body" | "lower_body" | "full_body" | "auto";
  occasionTags: string[];
}

// ⚠️ Only garment-001's imageUrl is confirmed reachable (used in the
// successful YouCam test run on Aug 2). Replace 002-004 with real,
// publicly hosted garment photos before relying on them — ideally
// uploaded to your own Supabase `user-photos`-style bucket rather
// than hotlinked from Unsplash.
export const GARMENT_CATALOGUE: Garment[] = [
  {
    id: "garment-001",
    name: "Casual Top",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    category: "upper_body",
    occasionTags: ["casual"],
  },
  {
    id: "garment-002",
    name: "Formal Dress",
    imageUrl: "REPLACE_WITH_REAL_HOSTED_URL",
    category: "full_body",
    occasionTags: ["formal", "party", "date_night"],
  },
  {
    id: "garment-003",
    name: "Work Blazer",
    imageUrl: "REPLACE_WITH_REAL_HOSTED_URL",
    category: "upper_body",
    occasionTags: ["work"],
  },
  {
    id: "garment-004",
    name: "Vacation Set",
    imageUrl: "REPLACE_WITH_REAL_HOSTED_URL",
    category: "auto",
    occasionTags: ["vacation"],
  },
];

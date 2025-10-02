import { Event } from "@/app/events/page";

export const demoArtists = [
  { id: "a1", name: "OLIØ", role: "Producer", img: "https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?q=80&w=800&auto=format&fit=crop" },
  { id: "a2", name: "Nyx", role: "Singer", img: "https://images.unsplash.com/photo-1536082550872-7b66c2f16adf?q=80&w=800&auto=format&fit=crop" },
  { id: "a3", name: "Zito", role: "Rapper", img: "https://images.unsplash.com/photo-1512100254544-47340ba90abc?q=80&w=800&auto=format&fit=crop" },
  { id: "a4", name: "Kaya", role: "Songwriter", img: "https://images.unsplash.com/photo-1518186233392-c232efbf2373?q=80&w=800&auto=format&fit=crop" },
];

interface MerchItem {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
}

export const merchItems: MerchItem[] =[
  {
    id: 1,
    name: "Signature Sneakers",
    price: "ZMW 120",
    image: "/assets/merch/sneaker-01.jpg", // Sneakers with transparent background
    category: "Sneakers",
  },
  {
    id: 6,
    name: "Shoe",
    price: "ZMW 160",
    image: "/assets/merch/shoe-01.jpg", // Sneakers with transparent background
    category: "Sneakers",
  },
  {
    id: 2,
    name: "Classic T-Shirt",
    price: "ZMW 40",
    image: "/assets/merch/tshirt-bg.jpg", // T-shirt transparent
    category: "T-Shirts",
  },
  {
    id: 3,
    name: "Logo Cap",
    price: "ZMW 25",
    image: "/assets/merch/cap-01.jpg", // Cap transparent
    category: "Caps",
  },
  {
    id: 4,
    name: "Limited Edition Hoodie",
    price: "ZMW 75",
    image: "/assets/merch/hoodie-01.png", // Hoodie transparent
    category: "Hoodies",
  },
  {
    id: 5,
    name: "Open Hoodie",
    price: "ZMW 10",
    image: "/assets/merch/hoodie-02.png", // Wristband transparent
    category: "Hoodies",
  },
];

export const eventsData: Event[] = [
  {
    id: 1,
    title: "The Boss Is Back Experience",
    date: "2025-09-05",
    location: "Lusaka, Zambia",
    category: "Festival",
    priceRange: "100-200 ZMW",
    description: "A night of unforgettable experience featuring top industry artists.",
    bannerImage: "/assets/images/bizzy08.jpg",
  },
  {
    id: 2,
    title: "Album Release Party",
    date: "2025-09-10",
    location: "London, United Kingdom",
    category: "Launch",
    priceRange: "150-300 ZMW",
    description: "Celebrate the launch of our highly anticipated new release.",
    bannerImage: "/assets/images/bizzy01.jpg",
  },
  {
    id: 3,
    title: "Live Studio Session",
    date: "2025-10-03",
    location: "Cape Town, South Africa",
    category: "Exclusive",
    priceRange: "50-100 ZMW",
    description: "Exclusive behind-the-scenes live recording experience.",
    bannerImage: "/assets/images/bizzy02.jpg",
  },
];

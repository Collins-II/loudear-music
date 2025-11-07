import {
  Music,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  User,
  Loader2,
  Mic2,
  Headphones,
  Star,
  Bell,
  Heart,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CreditCard,
  Banknote,
} from "lucide-react";

import { SiTiktok, SiSoundcloud, SiGoogle } from "react-icons/si";

export const Icons = {
  // 🎧 Core / App Icons
  logo: Music,
  user: User,
  mic: Mic2,
  headphones: Headphones,
  star: Star,
  bell: Bell,
  heart: Heart,
  plus: Plus,
  minus: Minus,
  left: ChevronLeft,
  right: ChevronRight,
  menu: Menu,
  close: X,
  creditCard: CreditCard,
  mobileMoney: Banknote,

  // 🧭 Auth / Providers
  google: SiGoogle,
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: SiTiktok,
  soundcloud: SiSoundcloud,

  // 🌍 Generic
  website: Globe,

  // ⏳ State
  spinner: Loader2,
};

export type IconKeys = keyof typeof Icons;

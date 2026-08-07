export const siteConfig = {
  name: "BETTER FOODS CO., LTD",
  shortName: "Better Foods",
  description:
    "Premium wholesale beef, pork, and poultry from Thailand — HALAL-capable bulk supply with cold-chain logistics.",
  url: "https://betterfoodcoltd.com",
  email: "sales@betterfoodcoltd.com",
  phone: "+66 2 098 1091",
  phoneHref: "tel:+6620981091",
  address:
    "4/2 Moo 7 Soi Sukhaphiban 2 Phutthamonthon Sai 5 Rd. Om Noi, Krathum Baen, Samut Sakhon 74130, Thailand",
  locale: "en_US",
} as const;

export const navItems = [
  { label: "Shop", href: "/shop/" },
  {
    label: "Beef",
    href: "/product-category/beef-products/",
  },
  {
    label: "Pork",
    href: "/product-category/pork-products/",
  },
  {
    label: "Poultry",
    href: "/product-category/poultry-products/",
  },
  { label: "About", href: "/about-us/" },
  { label: "Contact", href: "/contact-us/" },
] as const;

export const whyChooseUs = [
  {
    title: "Global Network",
    body: "We connect with suppliers and customers worldwide to deliver the freshest meat to your doorstep.",
  },
  {
    title: "Logistics",
    body: "Our logistics ensure timely and fresh delivery. We guarantee products reach you in perfect condition.",
  },
  {
    title: "Warehouses",
    body: "Our facilities are equipped with the latest technology to maintain the highest standards in storage.",
  },
  {
    title: "Temperature Monitoring",
    body: "We use state-of-the-art temperature control systems to keep every shipment at the right temperature.",
  },
  {
    title: "Certification",
    body: "We work with certified professionals to ensure top quality meat, from harvest to delivery.",
  },
  {
    title: "Test Kitchens",
    body: "Our test kitchens ensure every product meets high standards before reaching your table.",
  },
] as const;

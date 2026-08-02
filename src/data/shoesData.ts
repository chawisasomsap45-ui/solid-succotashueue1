import { Shoe } from '../types';

export const INITIAL_SHOES: Shoe[] = [
  {
    id: 'shoe-converse-70s',
    name: "Converse Chuck Taylor All Star '70s Hi",
    brand: 'Converse (มือสองสภาพดี 8.5/10)',
    retailPrice: 2900,
    rentalPrices: {
      fourDays: 299,
      tenDays: 490,
      monthly: 890
    },
    gender: 'Unisex',
    category: 'Sneakers',
    availableSizesEu: [38, 39, 40, 41, 42, 43],
    availableSizesUs: [5.5, 6.5, 7.5, 8.5, 9.5, 10.5],
    images: {
      main: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1000&q=80',
      side: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
      sole: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80',
      wear: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80'
    },
    conditionGrade: 'Great (8.5/10 สภาพสวย มีรอยใช้งานทั่วไป)',
    availabilityStatus: 'Available Now',
    rating: 4.9,
    reviewCount: 64,
    description: 'รองเท้าผ้าใบระดับวินเทจคลาสสิก Converse 1970s ผ้าแคนวาสหนาพิเศษ ทรงสวย สวมใส่ง่าย เข้ากับทุกสไตล์การแต่งตัว รายวัน สภาพมือสองคัดเกรด A ซักทำความสะอาดฆ่าเชื้อแล้ว 100%',
    sizingAdvice: 'Converse 70s ตรงไซส์ หรือสวมใส่พอดีเท้า หากเท้ากว้างแนะนำ +0.5 ไซส์',
    securityDeposit: 500,
    tags: ['มือสอง', 'Converse', 'Vintage', 'Everyday', 'ราคาประหยัด', '฿299']
  },
  {
    id: 'shoe-vans-oldskool',
    name: 'Vans Old Skool Core Classics Black/White',
    brand: 'Vans (มือสองสภาพสวย 8/10)',
    retailPrice: 2600,
    rentalPrices: {
      fourDays: 299,
      tenDays: 490,
      monthly: 850
    },
    gender: 'Unisex',
    category: 'Sneakers',
    availableSizesEu: [37, 38, 39, 40, 41, 42, 43],
    availableSizesUs: [5, 6, 7, 8, 9, 10, 11],
    images: {
      main: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80',
      side: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80',
      sole: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1000&q=80',
      wear: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=1000&q=80'
    },
    conditionGrade: 'Good (8/10 สภาพสเก็ตสตรีทแท้)',
    availabilityStatus: 'Available Now',
    rating: 4.8,
    reviewCount: 52,
    description: 'รองเท้าสตรีทสเก็ตช็อปในตำนาน Vans Old Skool แถบ Sidestripe สีขาว ตัดกับผ้าแคนวาสสีดำ สภาพมือสองแท้ คัดเกรดสะอาด ผ่านการฆ่าเชื้อ UV-C พร้อมลุยทุกทริป',
    sizingAdvice: 'ใส่ตรงไซส์ (True to Size)',
    securityDeposit: 500,
    tags: ['มือสอง', 'Vans', 'Skate', 'Streetwear', '฿299']
  },
  {
    id: 'shoe-nike-af1',
    name: "Nike Air Force 1 '07 Low White",
    brand: 'Nike (มือสองสภาพดีมาก 8.5/10)',
    retailPrice: 3700,
    rentalPrices: {
      fourDays: 399,
      tenDays: 690,
      monthly: 1200
    },
    gender: 'Unisex',
    category: 'Sneakers',
    availableSizesEu: [38, 39, 40, 41, 42, 43, 44],
    availableSizesUs: [6, 7, 8, 9, 10, 11, 12],
    images: {
      main: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
      side: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80',
      sole: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1000&q=80',
      wear: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80'
    },
    conditionGrade: 'Great (8.5/10 หนังขาวสะอาด ทรงยังเป๊ะ)',
    availabilityStatus: 'Available Now',
    rating: 4.9,
    reviewCount: 88,
    description: 'รองเท้าสามัญประจำบ้าน Nike Air Force 1 All White สภาพมือสองคัดเกรดพรีเมียม หนังแท้ทำความสะอาดลงเคลือบเงาเรียบร้อย แมตช์ได้กับชุดแต่งกายทุกแบบ',
    sizingAdvice: 'แนะนำลดไซส์ 0.5 EU (AF1 ทรงหลวมเล็กน้อย)',
    securityDeposit: 700,
    tags: ['Nike', 'Air Force 1', 'มือสอง', 'All White', 'Streetstyle']
  },
  {
    id: 'shoe-adidas-samba',
    name: 'Adidas Samba OG White Black Suede',
    brand: 'Adidas (มือสองสภาพนางฟ้า 9/10)',
    retailPrice: 3800,
    rentalPrices: {
      fourDays: 399,
      tenDays: 690,
      monthly: 1250
    },
    gender: 'Unisex',
    category: 'Sneakers',
    availableSizesEu: [38, 39, 40, 41, 42, 43],
    availableSizesUs: [6, 7, 8, 9, 10, 11],
    images: {
      main: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80',
      side: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80',
      sole: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1000&q=80',
      wear: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=1000&q=80'
    },
    conditionGrade: 'Pristine (9/10 สภาพเหมือนใหม่)',
    availabilityStatus: 'Available Now',
    rating: 5.0,
    reviewCount: 71,
    description: 'Adidas Samba OG ยอดฮิตอันดับหนึ่งของสายแฟชั่นวินเทจ หนังสีขาวคาดแถบดำ 3-Stripes พื้นยาง Gum sole สภาพคัดเกรดเหมือนใหม่แท้ 100%',
    sizingAdvice: 'แนะนำเผื่อไซส์ 0.5 EU หน้าเท้าเรียวเล็กน้อย',
    securityDeposit: 800,
    tags: ['Adidas', 'Samba', 'มือสอง', 'Vintage', 'ฮิตติดเทรนด์']
  },
  {
    id: 'shoe-nb-530',
    name: 'New Balance 530 White Silver Metallic',
    brand: 'New Balance (มือสองสภาพแท้ 8.5/10)',
    retailPrice: 3900,
    rentalPrices: {
      fourDays: 450,
      tenDays: 790,
      monthly: 1400
    },
    gender: 'Unisex',
    category: 'Performance',
    availableSizesEu: [37, 38, 39, 40, 41, 42],
    availableSizesUs: [5, 6, 7, 8, 9, 10],
    images: {
      main: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80',
      side: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=1000&q=80',
      sole: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1000&q=80',
      wear: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1000&q=80'
    },
    conditionGrade: 'Great (8.5/10 สวมใส่นุ่มสบายมาก)',
    availabilityStatus: 'Available Now',
    rating: 4.9,
    reviewCount: 65,
    description: 'รองเท้าวิ่งสไตล์ Retro Dad Shoe พื้น ABZORB ซัพพอร์ตเท้าดีเยี่ยม เดินเที่ยวต่างประเทศหรือแมตช์ลุคแคชชวลก็ดูดี สภาพมือสองคัดพิเศษ',
    sizingAdvice: 'ใส่ตรงไซส์ (True to Size)',
    securityDeposit: 900,
    tags: ['New Balance', 'มือสอง', 'Dad Shoes', 'Comfortable']
  },
  {
    id: 'shoe-1',
    name: 'Air Jordan 1 Retro High OG "Travis Scott"',
    brand: 'Jordan x Travis Scott',
    retailPrice: 62000,
    rentalPrices: {
      fourDays: 2900,
      tenDays: 5200,
      monthly: 8900
    },
    gender: 'Unisex',
    category: 'Sneakers',
    availableSizesEu: [40, 41, 42, 43, 44, 45],
    availableSizesUs: [7, 8, 9, 10, 11, 12],
    images: {
      main: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80',
      side: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80',
      sole: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1000&q=80',
      wear: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80'
    },
    conditionGrade: 'Pristine (Like New)',
    availabilityStatus: 'Available Now',
    rating: 4.9,
    reviewCount: 42,
    description: 'Iconic coffee-brown sneakers featuring the signature backwards Swoosh, premium Mocha suede, white leather panels, and a hidden ankle stash pocket.',
    sizingAdvice: 'Air Jordan 1 fits true to size (TTS). If you have wider feet, consider going up 0.5 EU size.',
    securityDeposit: 8000,
    tags: ['Streetwear', 'Limited Edition', 'Travis Scott', 'Mocha', 'Hype']
  },
  {
    id: 'shoe-2',
    name: 'Kate 100 Black Patent Leather Heels',
    brand: 'Christian Louboutin',
    retailPrice: 28000,
    rentalPrices: {
      fourDays: 1800,
      tenDays: 3200,
      monthly: 5900
    },
    gender: 'Women',
    category: 'Heels',
    availableSizesEu: [36, 37, 38, 39, 40],
    availableSizesUs: [5.5, 6.5, 7.5, 8.5, 9.5],
    images: {
      main: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80',
      side: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=1000&q=80',
      sole: 'https://images.unsplash.com/photo-1596568359553-a56de6970068?auto=format&fit=crop&w=1000&q=80',
      wear: 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=1000&q=80'
    },
    conditionGrade: 'Pristine (Like New)',
    availabilityStatus: 'Available Now',
    rating: 4.8,
    reviewCount: 38,
    description: 'World-famous red sole stiletto crafted in Italian black patent leather. Features a classic 100mm heel that elongates the leg contour effortlessly.',
    sizingAdvice: 'Christian Louboutin runs narrow across the toe box. We recommend sizing up by 0.5 to 1 size.',
    securityDeposit: 5000,
    tags: ['Red Sole', 'Luxury Heels', 'Evening Gown', 'Wedding', 'Red Carpet']
  },
  {
    id: 'shoe-3',
    name: 'Triple S Clear Sole Chunky Sneakers',
    brand: 'Balenciaga',
    retailPrice: 39500,
    rentalPrices: {
      fourDays: 2200,
      tenDays: 3900,
      monthly: 6900
    },
    gender: 'Unisex',
    category: 'Sneakers',
    availableSizesEu: [38, 39, 40, 41, 42, 43],
    availableSizesUs: [6, 7, 8, 9, 10, 11],
    images: {
      main: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=1000&q=80',
      side: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80',
      sole: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=1000&q=80',
      wear: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80'
    },
    conditionGrade: 'Great (Minor sole wear)',
    availabilityStatus: 'Available Now',
    rating: 4.7,
    reviewCount: 29,
    description: 'The pioneer of chunky sneakers featuring a 3-layer complex rubber outsole with a transparent clear sole unit and embroidered size number at the toe.',
    sizingAdvice: 'Balenciaga Triple S runs oversized. Consider going down 1 full size for a snug fit.',
    securityDeposit: 6500,
    tags: ['Balenciaga', 'Oversized', 'High Fashion', 'Streetstyle']
  },
  {
    id: 'shoe-4',
    name: 'Yeezy Boost 350 V2 "Zebra"',
    brand: 'Adidas x Yeezy',
    retailPrice: 14500,
    rentalPrices: {
      fourDays: 1200,
      tenDays: 2200,
      monthly: 3900
    },
    gender: 'Unisex',
    category: 'Sneakers',
    availableSizesEu: [39, 40, 41, 42, 43, 44],
    availableSizesUs: [6.5, 7.5, 8.5, 9.5, 10.5, 11.5],
    images: {
      main: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80',
      side: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80',
      sole: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1000&q=80',
      wear: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1000&q=80'
    },
    conditionGrade: 'Pristine (Like New)',
    availabilityStatus: 'Available Now',
    rating: 4.9,
    reviewCount: 56,
    description: 'Striking black and white Zebra pattern in re-engineered Primeknit upper, cushioned with a full-length Boost midsole unit.',
    sizingAdvice: 'Yeezy 350 V2 fits snug due to Primeknit upper. We advise going up 0.5 size.',
    securityDeposit: 3000,
    tags: ['Yeezy', 'Comfortable', 'Boost', 'Zebra']
  },
  {
    id: 'shoe-5',
    name: 'Aveline 100 Asymmetric Bow Sandals',
    brand: 'Jimmy Choo',
    retailPrice: 36000,
    rentalPrices: {
      fourDays: 2100,
      tenDays: 3800,
      monthly: 6500
    },
    gender: 'Women',
    category: 'Heels',
    availableSizesEu: [36, 37, 38, 39, 40],
    availableSizesUs: [6, 7, 8, 9, 10],
    images: {
      main: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=1000&q=80',
      side: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80',
      sole: 'https://images.unsplash.com/photo-1596568359553-a56de6970068?auto=format&fit=crop&w=1000&q=80',
      wear: 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=1000&q=80'
    },
    conditionGrade: 'Pristine (Like New)',
    availabilityStatus: 'Available Now',
    rating: 5.0,
    reviewCount: 19,
    description: 'Haute couture sandals embellished with dramatic asymmetric oversized mesh fascinator bows. Perfect for bridal events and red carpets.',
    sizingAdvice: 'Fits true to size with an adjustable ankle buckle strap.',
    securityDeposit: 6000,
    tags: ['Bridal', 'Wedding', 'Jimmy Choo', 'Red Carpet']
  },
  {
    id: 'shoe-6',
    name: 'Ace Embroidered Leather Tuxedo Oxfords',
    brand: 'Gucci',
    retailPrice: 31000,
    rentalPrices: {
      fourDays: 1900,
      tenDays: 3400,
      monthly: 5800
    },
    gender: 'Men',
    category: 'Formal',
    availableSizesEu: [40, 41, 42, 43, 44, 45],
    availableSizesUs: [7, 8, 9, 10, 11, 12],
    images: {
      main: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=80',
      side: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=80',
      sole: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=1000&q=80',
      wear: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1000&q=80'
    },
    conditionGrade: 'Pristine (Like New)',
    availabilityStatus: 'Available Now',
    rating: 4.8,
    reviewCount: 31,
    description: 'Polished Italian leather formal Oxford shoes tailored for tuxedos and black-tie events, delivering refined sophistication.',
    sizingAdvice: 'Gucci formal shoes run slightly larger. We advise sizing down 0.5 to 1 full size.',
    securityDeposit: 5000,
    tags: ['Formal', 'Tuxedo', 'Black Tie', 'Gucci', 'Oxfords']
  }
];

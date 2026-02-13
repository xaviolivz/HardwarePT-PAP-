const CONFIG = {
  API_URL: window.location.hostname === "localhost" 
    ? "http://localhost:3000"
    : "/api",
  
  CURRENCY: "€",
  LOCALE: "pt-PT",
  PRODUCTS_PER_PAGE: 12,
  
  CATEGORIAS: [
    { id: 1, slug: "processadores", nome: "Processadores", icone: "🖥️" },
    { id: 2, slug: "placas-graficas", nome: "Placas Gráficas", icone: "🎮" },
    { id: 3, slug: "memoria-ram", nome: "Memória RAM", icone: "💾" },
    { id: 4, slug: "armazenamento", nome: "Armazenamento", icone: "💿" },
    { id: 5, slug: "motherboards", nome: "Motherboards", icone: "🔧" },
    { id: 6, slug: "fontes", nome: "Fontes", icone: "⚡" },
    { id: 7, slug: "caixas", nome: "Caixas PC", icone: "🖥️" },
    { id: 8, slug: "coolers", nome: "Coolers", icone: "❄️" },
    { id: 9, slug: "acessorios", nome: "Acessórios", icone: "📦" },
  ],
};

const API_BASE_URL = CONFIG.API_URL;

const CATEGORIA_MAP = {
  1: "processadores",
  2: "placas-graficas", 
  3: "memoria-ram",
  4: "armazenamento",
  5: "motherboards",
  6: "fontes",
  7: "caixas",
  8: "coolers",
  9: "acessorios",
};

const PRODUTOS_EXEMPLO = [
  {
    id: 2,
    categoria_id: 1,
    nome: "Intel Core i7-14700K",
    slug: "intel-core-i7-14700k",
    categoria: "Processadores",
    categoria_slug: "processadores",
    especificacoes: "20 Cores (8P+12E) | 28 Threads | 5.6GHz Turbo | LGA1700",
    preco: 419.99,
    preco_promocional: null,
    stock: 20,
    imagem: "imagens/i714700k.jpeg",
    destaque: true,
    ativo: true,
    caracteristicas: [
      "20 núcleos e 28 threads",
      "Frequência até 5.6GHz",
      "Cache Intel Smart de 33MB",
      "Suporte DDR5 e DDR4"
    ]
},
{
  id: 3,
  categoria_id: 1,
  nome: "Intel Core i5-14600K",
  slug: "intel-core-i5-14600k",
  categoria: "Processadores",
  categoria_slug: "processadores",
  especificacoes: "14 Cores (6P+8E) | 20 Threads | 5.3GHz Turbo | LGA1700",
  preco: 319.99,
  preco_promocional: null,
  stock: 25,
  imagem: "imagens/i514600k.jpeg",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "14 núcleos e 20 threads",
    "Até 5.3GHz em Turbo",
    "Ótimo custo-benefício",
    "Compatível com DDR4 e DDR5"
  ]
},
{
  id: 4,
  categoria_id: 1,
  nome: "AMD Ryzen 9 7950X",
  slug: "amd-ryzen-9-7950x",
  categoria: "Processadores",
  categoria_slug: "processadores",
  especificacoes: "16 Cores | 32 Threads | 5.7GHz Boost | AM5",
  preco: 549.99,
  preco_promocional: null,
  stock: 10,
  imagem: "imagens/ryzen97950x.webp",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "16 núcleos e 32 threads",
    "Arquitetura Zen 4",
    "Excelente para renderização",
    "Suporte DDR5 e PCIe 5.0"
  ]
},
{
  id: 5,
  categoria_id: 1,
  nome: "AMD Ryzen 7 7800X3D",
  slug: "amd-ryzen-7-7800x3d",
  categoria: "Processadores",
  categoria_slug: "processadores",
  especificacoes: "8 Cores | 16 Threads | 5.0GHz Boost | AM5",
  preco: 449.99,
  preco_promocional: null,
  stock: 18,
  imagem: "imagens/ryzen77800x3d.jpg",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "Tecnologia 3D V-Cache",
    "Desempenho gaming topo",
    "Baixa latência",
    "Socket AM5"
  ]
},
{
  id: 6,
  categoria_id: 1,
  nome: "AMD Ryzen 5 7600X",
  slug: "amd-ryzen-5-7600x",
  categoria: "Processadores",
  categoria_slug: "processadores",
  especificacoes: "6 Cores | 12 Threads | 5.3GHz Boost | AM5",
  preco: 249.99,
  preco_promocional: null,
  stock: 30,
  imagem: "imagens/ryzen57600x.jpg",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Arquitetura Zen 4",
    "Excelente eficiência energética",
    "Ideal para setups gaming",
    "Suporte DDR5"
  ]
},
{
  id: 7,
  categoria_id: 2,
  nome: "NVIDIA GeForce RTX 4090",
  slug: "nvidia-geforce-rtx-4090",
  categoria: "Placas Gráficas",
  categoria_slug: "placas-graficas",
  especificacoes: "24GB GDDR6X | Ray Tracing | DLSS 3",
  preco: 1899.99,
  preco_promocional: null,
  stock: 5,
  imagem: "imagens/rtx4090.webp",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "Desempenho extremo",
    "Ray Tracing avançado",
    "DLSS 3 com IA",
    "Ideal para 4K e 8K"
  ]
},
{
  id: 8,
  categoria_id: 2,
  nome: "NVIDIA GeForce RTX 4080 SUPER",
  slug: "nvidia-geforce-rtx-4080-super",
  categoria: "Placas Gráficas",
  categoria_slug: "placas-graficas",
  especificacoes: "16GB GDDR6X | Ray Tracing | DLSS 3",
  preco: 1099.99,
  preco_promocional: null,
  stock: 8,
  imagem: "imagens/4080super.avif",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "Excelente para 4K",
    "Baixo consumo relativo",
    "Ray Tracing avançado",
    "DLSS 3"
  ]
},
{
  id: 9,
  categoria_id: 2,
  nome: "NVIDIA GeForce RTX 4070 Ti SUPER",
  slug: "nvidia-geforce-rtx-4070-ti-super",
  categoria: "Placas Gráficas",
  categoria_slug: "placas-graficas",
  especificacoes: "16GB GDDR6X | Ray Tracing | DLSS 3",
  preco: 849.99,
  preco_promocional: null,
  stock: 12,
  imagem: "imagens/4070tisuper.webp",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Excelente custo-performance",
    "Ray Tracing",
    "DLSS 3",
    "Ideal para 1440p e 4K"
  ]
},
{
  id: 10,
  categoria_id: 2,
  nome: "NVIDIA GeForce RTX 4070 SUPER",
  slug: "nvidia-geforce-rtx-4070-super",
  categoria: "Placas Gráficas",
  categoria_slug: "placas-graficas",
  especificacoes: "12GB GDDR6X | Ray Tracing | DLSS 3",
  preco: 629.99,
  preco_promocional: null,
  stock: 15,
  imagem: "imagens/rtx4070super.webp",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Ótima eficiência",
    "Ray Tracing",
    "DLSS 3",
    "Ideal para 1440p"
  ]
},
{
  id: 11,
  categoria_id: 2,
  nome: "AMD Radeon RX 7900 XTX",
  slug: "amd-radeon-rx-7900-xtx",
  categoria: "Placas Gráficas",
  categoria_slug: "placas-graficas",
  especificacoes: "24GB GDDR6 | RDNA 3 | Ray Tracing",
  preco: 999.99,
  preco_promocional: null,
  stock: 7,
  imagem: "imagens/amdradeon7900.webp",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "24GB de VRAM",
    "Excelente rasterização",
    "Ray Tracing melhorado",
    "Ideal para 4K"
  ]
},
{
  id: 12,
  categoria_id: 2,
  nome: "AMD Radeon RX 7800 XT",
  slug: "amd-radeon-rx-7800-xt",
  categoria: "Placas Gráficas",
  categoria_slug: "placas-graficas",
  especificacoes: "16GB GDDR6 | RDNA 3",
  preco: 549.99,
  preco_promocional: null,
  stock: 14,
  imagem: "imagens/amdradeon.jpg",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Excelente para 1440p",
    "16GB VRAM",
    "Boa eficiência",
    "RDNA 3"
  ]
},
{
  id: 13,
  categoria_id: 3,
  nome: "Corsair Dominator Platinum RGB 32GB DDR5",
  slug: "corsair-dominator-platinum-rgb-32gb-ddr5",
  categoria: "Memórias RAM",
  categoria_slug: "memorias-ram",
  especificacoes: "32GB (2x16GB) | DDR5 | 6000MHz",
  preco: 189.99,
  preco_promocional: null,
  stock: 20,
  imagem: "imagens/dominator.avif",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "Iluminação RGB Capellix",
    "Alta frequência DDR5",
    "Excelente estabilidade",
    "Design premium em alumínio"
  ]
},
{
  id: 14,
  categoria_id: 3,
  nome: "G.Skill Trident Z5 RGB 32GB DDR5",
  slug: "gskill-trident-z5-rgb-32gb-ddr5",
  categoria: "Memórias RAM",
  categoria_slug: "memorias-ram",
  especificacoes: "32GB (2x16GB) | DDR5 | 6400MHz",
  preco: 199.99,
  preco_promocional: null,
  stock: 18,
  imagem: "imagens/tridentddr5.webp",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "RGB personalizável",
    "Alta frequência",
    "Ideal para overclock",
    "Compatível com Intel XMP"
  ]
},
{
  id: 15,
  categoria_id: 3,
  nome: "Kingston Fury Beast 32GB DDR5",
  slug: "kingston-fury-beast-32gb-ddr5",
  categoria: "Memórias RAM",
  categoria_slug: "memorias-ram",
  especificacoes: "32GB (2x16GB) | DDR5 | 5600MHz",
  preco: 129.99,
  preco_promocional: null,
  stock: 30,
  imagem: "imagens/FURYDDR5.jpg",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Excelente custo-benefício",
    "DDR5 eficiente",
    "Compatível com Intel e AMD",
    "Design discreto"
  ]
},
{
  id: 16,
  categoria_id: 3,
  nome: "Corsair Vengeance RGB 32GB DDR4",
  slug: "corsair-vengeance-rgb-32gb-ddr4",
  categoria: "Memórias RAM",
  categoria_slug: "memorias-ram",
  especificacoes: "32GB (2x16GB) | DDR4 | 3600MHz",
  preco: 89.99,
  preco_promocional: null,
  stock: 25,
  imagem: "imagens/vengeance32gb.avif",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "RGB sincronizável",
    "Boa performance DDR4",
    "Ideal para gaming",
    "Excelente compatibilidade"
  ]
},
{
  id: 17,
  categoria_id: 3,
  nome: "G.Skill Trident Z Neo 64GB DDR4",
  slug: "gskill-trident-z-neo-64gb-ddr4",
  categoria: "Memórias RAM",
  categoria_slug: "memorias-ram",
  especificacoes: "64GB (2x32GB) | DDR4 | 3600MHz",
  preco: 169.99,
  preco_promocional: null,
  stock: 12,
  imagem: "imagens/tridentddr4.avif",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "Alta capacidade",
    "Optimizada para Ryzen",
    "RGB premium",
    "Excelente estabilidade"
  ]
},
{
  id: 18,
  categoria_id: 4,
  nome: "Samsung 990 PRO 2TB NVMe",
  slug: "samsung-990-pro-2tb-nvme",
  categoria: "Armazenamento",
  categoria_slug: "armazenamento",
  especificacoes: "2TB | NVMe PCIe 4.0 | até 7450MB/s",
  preco: 189.99,
  preco_promocional: null,
  stock: 20,
  imagem: "imagens/ssdsamsung2tb.avif",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "Velocidades muito altas",
    "Excelente para gaming e criação",
    "Alta durabilidade",
    "Marca premium"
  ]
},
{
  id: 19,
  categoria_id: 4,
  nome: "WD Black SN850X 2TB",
  slug: "wd-black-sn850x-2tb",
  categoria: "Armazenamento",
  categoria_slug: "armazenamento",
  especificacoes: "2TB | NVMe PCIe 4.0 | até 7300MB/s",
  preco: 179.99,
  preco_promocional: null,
  stock: 18,
  imagem: "imagens/wdblack2tb.avif",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Ótimo para gaming",
    "Baixa latência",
    "Alta fiabilidade",
    "Compatível com PS5"
  ]
},
{
  id: 20,
  categoria_id: 4,
  nome: "Crucial T700 2TB",
  slug: "crucial-t700-2tb",
  categoria: "Armazenamento",
  categoria_slug: "armazenamento",
  especificacoes: "2TB | NVMe PCIe 5.0 | até 12400MB/s",
  preco: 299.99,
  preco_promocional: null,
  stock: 6,
  imagem: "imagens/crucial2tb.webp",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "PCIe 5.0",
    "Velocidades extremas",
    "Ideal para entusiastas",
    "Tecnologia de ponta"
  ]
},
{
  id: 21,
  categoria_id: 4,
  nome: "Samsung 870 EVO 1TB SATA",
  slug: "samsung-870-evo-1tb-sata",
  categoria: "Armazenamento",
  categoria_slug: "armazenamento",
  especificacoes: "1TB | SATA III | até 560MB/s",
  preco: 89.99,
  preco_promocional: null,
  stock: 22,
  imagem: "imagens/ssdsamsung1tb.avif",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Alta fiabilidade",
    "Excelente para upgrades",
    "Baixo consumo",
    "Marca reconhecida"
  ]
},
{
  id: 22,
  categoria_id: 4,
  nome: "Seagate Barracuda 4TB HDD",
  slug: "seagate-barracuda-4tb-hdd",
  categoria: "Armazenamento",
  categoria_slug: "armazenamento",
  especificacoes: "4TB | HDD | 5400RPM",
  preco: 89.99,
  preco_promocional: null,
  stock: 16,
  imagem: "imagens/barracuda4tb.avif",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Grande capacidade",
    "Ideal para backups",
    "Boa durabilidade",
    "Excelente custo por GB"
  ]
},
{
  id: 23,
  categoria_id: 5,
  nome: "ASUS ROG Maximus Z790 Hero",
  slug: "asus-rog-maximus-z790-hero",
  categoria: "Motherboards",
  categoria_slug: "motherboards",
  especificacoes: "Z790 | LGA1700 | DDR5 | PCIe 5.0",
  preco: 629.99,
  preco_promocional: null,
  stock: 8,
  imagem: "imagens/z790.avif",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "Construção premium",
    "Excelente para overclock",
    "Wi-Fi 6E",
    "RGB avançado"
  ]
},
{
  id: 25,
  categoria_id: 5,
  nome: "ASUS ROG Crosshair X670E Hero",
  slug: "asus-rog-crosshair-x670e-hero",
  categoria: "Motherboards",
  categoria_slug: "motherboards",
  especificacoes: "X670E | AM5 | DDR5 | PCIe 5.0",
  preco: 699.99,
  preco_promocional: null,
  stock: 6,
  imagem: "imagens/x670e.png",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "Ideal para Ryzen topo",
    "PCIe 5.0",
    "Excelente VRM",
    "Wi-Fi 6E"
  ]
},
{
  id: 26,
  categoria_id: 5,
  nome: "Gigabyte B650 AORUS Elite AX",
  slug: "gigabyte-b650-aorus-elite-ax",
  categoria: "Motherboards",
  categoria_slug: "motherboards",
  especificacoes: "B650 | AM5 | DDR5 | PCIe 4.0",
  preco: 229.99,
  preco_promocional: null,
  stock: 14,
  imagem: "imagens/b650aorus.png",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Excelente custo-benefício",
    "Wi-Fi integrado",
    "Boa qualidade de construção",
    "Ideal para gaming"
  ]
},
{
  id: 71,
  categoria_id: 7,
  nome: "Lian Li PC-O11 Dynamic",
  slug: "lian-li-pc-o11-dynamic",
  categoria: "Caixas de PC",
  categoria_slug: "caixas-pc",
  especificacoes: "Mid Tower | ATX | Vidro Temperado | Suporte Water Cooling",
  preco: 149.99,
  preco_promocional: null,
  stock: 12,
  imagem: "imagens/lianli011.jpg",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "Design de dupla câmara",
    "Vidro temperado frontal e lateral",
    "Excelente airflow",
    "Ideal para water cooling"
  ]
},
{
  id: 72,
  categoria_id: 7,
  nome: "NZXT H9 Flow",
  slug: "nzxt-h9-flow",
  categoria: "Caixas de PC",
  categoria_slug: "caixas-pc",
  especificacoes: "Mid Tower | ATX | Vidro Temperado | Airflow Otimizado",
  preco: 189.99,
  preco_promocional: null,
  stock: 10,
  imagem: "imagens/nzxth9.avif",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "Excelente gestão de cabos",
    "Painéis em vidro temperado",
    "Ótimo fluxo de ar",
    "Design limpo e moderno"
  ]
},
{
  id: 73,
  categoria_id: 7,
  nome: "NZXT H5 Elite",
  slug: "nzxt-h5-elite",
  categoria: "Caixas de PC",
  categoria_slug: "caixas-pc",
  especificacoes: "Mid Tower | ATX | Vidro Temperado | RGB",
  preco: 139.99,
  preco_promocional: null,
  stock: 15,
  imagem: "imagens/h5elite.webp",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Iluminação RGB incluída",
    "Design compacto",
    "Boa refrigeração",
    "Vidro temperado frontal"
  ]
},
{
  id: 74,
  categoria_id: 7,
  nome: "Corsair 4000D Airflow",
  slug: "corsair-4000d-airflow",
  categoria: "Caixas de PC",
  categoria_slug: "caixas-pc",
  especificacoes: "Mid Tower | ATX | Airflow | Vidro Temperado",
  preco: 99.99,
  preco_promocional: null,
  stock: 20,
  imagem: "imagens/corsair4000.jpg",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Painel frontal perfurado",
    "Excelente airflow",
    "Fácil montagem",
    "Ótima gestão de cabos"
  ]
},
{
  id: 75,
  categoria_id: 8,
  nome: "Arctic Liquid Freezer III 360",
  slug: "arctic-liquid-freezer-iii-360",
  categoria: "Coolers",
  categoria_slug: "coolers",
  especificacoes: "Water Cooler | Radiador 360mm | Intel e AMD",
  preco: 139.99,
  preco_promocional: null,
  stock: 14,
  imagem: "imagens/arctic-cooler.png",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "Radiador de 360mm",
    "Bomba otimizada Arctic",
    "Excelente custo-benefício",
    "Funcionamento silencioso"
  ]
},
{
  id: 76,
  categoria_id: 8,
  nome: "Arctic Liquid Freezer II 280",
  slug: "arctic-liquid-freezer-ii-280",
  categoria: "Coolers",
  categoria_slug: "coolers",
  especificacoes: "Water Cooler | Radiador 280mm | Intel e AMD",
  preco: 109.99,
  preco_promocional: null,
  stock: 16,
  imagem: "imagens/arcticii.webp",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Radiador de 280mm",
    "Muito silencioso",
    "Excelente desempenho térmico",
    "Alta fiabilidade"
  ]
},
{
  id: 77,
  categoria_id: 8,
  nome: "Corsair iCUE H150i Elite",
  slug: "corsair-h150i-elite",
  categoria: "Coolers",
  categoria_slug: "coolers",
  especificacoes: "Water Cooler | Radiador 360mm | RGB | Intel e AMD",
  preco: 189.99,
  preco_promocional: null,
  stock: 10,
  imagem: "imagens/corsairh150elite.avif",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "Iluminação RGB personalizável",
    "Integração com Corsair iCUE",
    "Radiador de 360mm",
    "Alta performance térmica"
  ]
},
{
  id: 78,
  categoria_id: 8,
  nome: "NZXT Kraken X63",
  slug: "nzxt-kraken-x63",
  categoria: "Coolers",
  categoria_slug: "coolers",
  especificacoes: "Water Cooler | Radiador 280mm | Intel e AMD",
  preco: 159.99,
  preco_promocional: null,
  stock: 12,
  imagem: "imagens/krakenx63.avif",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "Design premium NZXT",
    "Radiador de 280mm",
    "Bomba silenciosa",
    "Ótimo desempenho térmico"
  ]
},
{
  id: 34  ,
  categoria_id: 8,
  nome: "Noctua NH-D15 Chromax black",
  slug: "noctua-nh-d15 chromax black",
  categoria: "Coolers",
  categoria_slug: "coolers",
  especificacoes: "Air Cooler | Dual Tower | Intel e AMD",
  preco: 99.99,
  preco_promocional: null,
  stock: 18,
  imagem: "imagens/noctuanhd15.jpg",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Desempenho comparável a water cooling",
    "Extremamente silencioso",
    "Construção premium Noctua",
    "Alta compatibilidade de sockets"
  ]
},
{
  id: 80,
  categoria_id: 9,
  nome: "Arctic MX-6 Thermal Paste",
  slug: "arctic-mx-6-thermal-paste",
  categoria: "Acessórios",
  categoria_slug: "acessórios",
  especificacoes: "Condutividade térmica elevada | Não condutiva | Longa durabilidade",
  preco: 9.99,
  preco_promocional: null,
  stock: 50,
  imagem: "imagens/pastatermicaarctic.jpg",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Excelente transferência térmica",
    "Não condutiva eletricamente",
    "Fácil aplicação",
    "Alta durabilidade sem secar"
  ]
},
{
  id: 40,
  categoria_id: 6,
  nome: "be quiet! Pure Power 12 M 650W",
  slug: "be-quiet-pure-power-12m-650w",
  categoria: "Fontes de Alimentação",
  categoria_slug: "fontes-alimentacao",
  especificacoes: "650W | 80+ Gold | Modular | ATX 3.0",
  preco: 119.99,
  preco_promocional: null,
  stock: 18,
  imagem: "imagens/bequiet650w.webp",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Certificação 80+ Gold",
    "Funcionamento muito silencioso",
    "Cabling modular",
    "Alta eficiência energética"
  ]
},
{
  id: 38,
  categoria_id: 6,
  nome: "EVGA SuperNOVA 750 G5",
  slug: "evga-supernova-750-g5",
  categoria: "Fontes de Alimentação",
  categoria_slug: "fontes-alimentacao",
  especificacoes: "750W | 80+ Gold | Modular",
  preco: 129.99,
  preco_promocional: null,
  stock: 15,
  imagem: "imagens/evga750w.png",
  destaque: false,
  ativo: true,
  caracteristicas: [
    "Excelente estabilidade",
    "Totalmente modular",
    "Certificação Gold",
    "Ideal para GPUs potentes"
  ]
},
{
  id: 27,
  categoria_id: 6,
  nome: "Corsair RM1000x",
  slug: "corsair-rm1000x",
  categoria: "Fontes de Alimentação",
  categoria_slug: "fontes-alimentacao",
  especificacoes: "1000W | 80+ Gold | Modular",
  preco: 189.99,
  preco_promocional: null,
  stock: 12,
  imagem: "imagens/corsair1000w.avif",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "Excelente eficiência",
    "Muito silenciosa",
    "Alta qualidade de componentes",
    "Ideal para PCs high-end"
  ]
},
{
  id: 39,
  categoria_id: 6,
  nome: "Corsair HXi 1500W",
  slug: "corsair-hxi-1500w",
  categoria: "Fontes de Alimentação",
  categoria_slug: "fontes-alimentacao",
  especificacoes: "1500W | 80+ Platinum | Modular",
  preco: 399.99,
  preco_promocional: null,
  stock: 6,
  imagem: "imagens/corsairhvi1500w.jpg",
  destaque: true,
  ativo: true,
  caracteristicas: [
    "Certificação 80+ Platinum",
    "Potência extrema",
    "Qualidade premium",
    "Ideal para múltiplas GPUs"
  ]
}

];

function obterProdutoPorId(id) {
  return PRODUTOS_EXEMPLO.find(p => p.id === parseInt(id));
}

function obterProdutoPorSlug(slug) {
  return PRODUTOS_EXEMPLO.find(p => p.slug === slug);
}

function obterProdutosPorCategoria(categoriaSlug) {
  return PRODUTOS_EXEMPLO.filter(p => p.categoria_slug === categoriaSlug);
}

function obterProdutosPorCategoriaId(categoriaId) {
  return PRODUTOS_EXEMPLO.filter(p => p.categoria_id === parseInt(categoriaId));
}

function obterProdutosDestaque() {
  return PRODUTOS_EXEMPLO.filter(p => p.destaque && p.ativo);
}

function obterProdutosPromocao() {
  return PRODUTOS_EXEMPLO.filter(p => p.preco_promocional && p.ativo);
}

function obterProdutosAtivos() {
  return PRODUTOS_EXEMPLO.filter(p => p.ativo);
}
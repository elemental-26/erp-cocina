// Datos iniciales extraidos de Estandarizacion_ cocina _v_01.xlsx.
// El modulo conserva los cambios del usuario en localStorage y no reimporta encima.
export const DEFAULT_STD_DATA = {
  "source": "Estandarizacion_ cocina _v_01.xlsx",
  "familias": [
    {
      "id": "secos",
      "nombre": "Secos",
      "prefijo": "SEC"
    },
    {
      "id": "lacteos",
      "nombre": "Lacteos",
      "prefijo": "LAC"
    },
    {
      "id": "carnes-frias",
      "nombre": "Carnes Frias",
      "prefijo": "CAF"
    },
    {
      "id": "fruver",
      "nombre": "Fruver",
      "prefijo": "FRV"
    },
    {
      "id": "especias",
      "nombre": "Especias",
      "prefijo": "ESP"
    },
    {
      "id": "carne-de-res",
      "nombre": "Carne De Res",
      "prefijo": "CAR"
    },
    {
      "id": "carne-de-cerdo",
      "nombre": "Carne De Cerdo",
      "prefijo": "CAC"
    },
    {
      "id": "pollo",
      "nombre": "Pollo",
      "prefijo": "CAP"
    },
    {
      "id": "pescados-y-mariscos",
      "nombre": "Pescados Y Mariscos",
      "prefijo": "PYM"
    },
    {
      "id": "subrecetas",
      "nombre": "Subrecetas",
      "prefijo": "SUB"
    },
    {
      "id": "adicionales",
      "nombre": "Adicionales",
      "prefijo": "ADC"
    }
  ],
  "insumos": [
    {
      "id": "ADC001",
      "originalId": "ADC001",
      "nombre": "Agua",
      "familia": "Adicionales",
      "unidad": "ml",
      "costoUnitario": 0.5,
      "mermaPct": 0.0,
      "costoReal": 0.5,
      "presentacion": 20000.0,
      "valorCompra": 10000.0,
      "activo": true
    },
    {
      "id": "ADC002",
      "originalId": "ADC002",
      "nombre": "Polvo para hornear",
      "familia": "Adicionales",
      "unidad": "g",
      "costoUnitario": 200.0,
      "mermaPct": 0.0,
      "costoReal": 200.0,
      "presentacion": 10.0,
      "valorCompra": 2000.0,
      "activo": true
    },
    {
      "id": "CAR001",
      "originalId": "CAR001",
      "nombre": "Muchacho",
      "familia": "Carne De Res",
      "unidad": "g",
      "costoUnitario": 45.0,
      "mermaPct": 0.35,
      "costoReal": 69.2308,
      "presentacion": 1000.0,
      "valorCompra": 45000.0,
      "activo": false
    },
    {
      "id": "ESP001",
      "originalId": "ESP001",
      "nombre": "Esencia de vainilla",
      "familia": "Especias",
      "unidad": "ml",
      "costoUnitario": 10.0,
      "mermaPct": 0.0,
      "costoReal": 10.0,
      "presentacion": 500.0,
      "valorCompra": 5000.0,
      "activo": true
    },
    {
      "id": "ESP002",
      "originalId": "ESP002",
      "nombre": "Canela en astillas",
      "familia": "Especias",
      "unidad": "g",
      "costoUnitario": 10.0,
      "mermaPct": 0.0,
      "costoReal": 10.0,
      "presentacion": 1000.0,
      "valorCompra": 10000.0,
      "activo": true
    },
    {
      "id": "ESP003",
      "originalId": "ESP003",
      "nombre": "Ajo en polvo",
      "familia": "Especias",
      "unidad": "g",
      "costoUnitario": 1.0,
      "mermaPct": 0.0,
      "costoReal": 1.0,
      "presentacion": 1000.0,
      "valorCompra": 1000.0,
      "activo": true
    },
    {
      "id": "ESP004",
      "originalId": "ESP003",
      "nombre": "Oregano seco",
      "familia": "Especias",
      "unidad": "g",
      "costoUnitario": 67.0,
      "mermaPct": 0.0,
      "costoReal": 67.0,
      "presentacion": 1000.0,
      "valorCompra": 67000.0,
      "activo": true
    },
    {
      "id": "ESP005",
      "originalId": "ESP004",
      "nombre": "Pimienta negra",
      "familia": "Especias",
      "unidad": "g",
      "costoUnitario": 77.888,
      "mermaPct": 0.0,
      "costoReal": 77.888,
      "presentacion": 250.0,
      "valorCompra": 19472.0,
      "activo": true
    },
    {
      "id": "ESP006",
      "originalId": "ESP005",
      "nombre": "Aji seco",
      "familia": "Especias",
      "unidad": "g",
      "costoUnitario": 85.0,
      "mermaPct": 0.0,
      "costoReal": 85.0,
      "presentacion": 1000.0,
      "valorCompra": 85000.0,
      "activo": true
    },
    {
      "id": "ESP007",
      "originalId": "ESP006",
      "nombre": "Tomillo",
      "familia": "Especias",
      "unidad": "g",
      "costoUnitario": 67.0,
      "mermaPct": 0.0,
      "costoReal": 67.0,
      "presentacion": 1000.0,
      "valorCompra": 67000.0,
      "activo": true
    },
    {
      "id": "FRV001",
      "originalId": "FRV001",
      "nombre": "Limon tahiti",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 4.5,
      "mermaPct": 0.0,
      "costoReal": 4.5,
      "presentacion": 1000.0,
      "valorCompra": 4500.0,
      "activo": true
    },
    {
      "id": "FRV002",
      "originalId": "FRV002",
      "nombre": "Perejil",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 12.0,
      "mermaPct": 0.3,
      "costoReal": 17.1429,
      "presentacion": 1000.0,
      "valorCompra": 12000.0,
      "activo": true
    },
    {
      "id": "FRV003",
      "originalId": "FRV003",
      "nombre": "Cilantro",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 8.5,
      "mermaPct": 0.25,
      "costoReal": 11.3333,
      "presentacion": 1000.0,
      "valorCompra": 8500.0,
      "activo": true
    },
    {
      "id": "FRV004",
      "originalId": "FRV004",
      "nombre": "Ajo fresco",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 10.0,
      "mermaPct": 0.1,
      "costoReal": 11.1111,
      "presentacion": 1000.0,
      "valorCompra": 10000.0,
      "activo": true
    },
    {
      "id": "FRV005",
      "originalId": "FRV005",
      "nombre": "Cebolla blanca",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 2.2,
      "mermaPct": 0.15,
      "costoReal": 2.5882,
      "presentacion": 1000.0,
      "valorCompra": 2200.0,
      "activo": true
    },
    {
      "id": "FRV006",
      "originalId": "FRV006",
      "nombre": "Pimenton",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 6.0,
      "mermaPct": 0.2,
      "costoReal": 7.5,
      "presentacion": 1000.0,
      "valorCompra": 6000.0,
      "activo": true
    },
    {
      "id": "FRV007",
      "originalId": "FRV007",
      "nombre": "Papa negra",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 0.85,
      "mermaPct": 0.25,
      "costoReal": 1.1333,
      "presentacion": 1000.0,
      "valorCompra": 850.0,
      "activo": true
    },
    {
      "id": "FRV008",
      "originalId": "FRV008",
      "nombre": "Yuca",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 1.5,
      "mermaPct": 0.22,
      "costoReal": 1.9231,
      "presentacion": 1000.0,
      "valorCompra": 1500.0,
      "activo": true
    },
    {
      "id": "FRV009",
      "originalId": "FRV009",
      "nombre": "platano verde",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 2.5,
      "mermaPct": 0.25,
      "costoReal": 3.3333,
      "presentacion": 1000.0,
      "valorCompra": 2500.0,
      "activo": true
    },
    {
      "id": "FRV010",
      "originalId": "FRV010",
      "nombre": "Arracacha",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 1.95,
      "mermaPct": 0.15,
      "costoReal": 2.2941,
      "presentacion": 1000.0,
      "valorCompra": 1950.0,
      "activo": true
    },
    {
      "id": "LAC001",
      "originalId": "LAC001",
      "nombre": "leche entera",
      "familia": "Lacteos",
      "unidad": "ml",
      "costoUnitario": 3.6667,
      "mermaPct": 0.0,
      "costoReal": 3.6667,
      "presentacion": 900.0,
      "valorCompra": 3300.0,
      "activo": true
    },
    {
      "id": "LAC002",
      "originalId": "LAC002",
      "nombre": "Crema de leche",
      "familia": "Lacteos",
      "unidad": "ml",
      "costoUnitario": 12.2222,
      "mermaPct": 0.0,
      "costoReal": 12.2222,
      "presentacion": 900.0,
      "valorCompra": 11000.0,
      "activo": true
    },
    {
      "id": "LAC003",
      "originalId": "LAC003",
      "nombre": "Yogurt",
      "familia": "Lacteos",
      "unidad": "ml",
      "costoUnitario": 12.0,
      "mermaPct": 0.0,
      "costoReal": 12.0,
      "presentacion": 1000.0,
      "valorCompra": 12000.0,
      "activo": true
    },
    {
      "id": "SEC001",
      "originalId": "SEC001",
      "nombre": "Arroz",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 3.8,
      "mermaPct": 0.0,
      "costoReal": 3.8,
      "presentacion": 1000.0,
      "valorCompra": 3800.0,
      "activo": true
    },
    {
      "id": "SEC002",
      "originalId": "SEC002",
      "nombre": "Leche condensada",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 10.8,
      "mermaPct": 0.0,
      "costoReal": 10.8,
      "presentacion": 2500.0,
      "valorCompra": 27000.0,
      "activo": true
    },
    {
      "id": "SEC003",
      "originalId": "SEC003",
      "nombre": "Azúcar blanca",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 2.4,
      "mermaPct": 0.0,
      "costoReal": 2.4,
      "presentacion": 500.0,
      "valorCompra": 1200.0,
      "activo": true
    },
    {
      "id": "SEC004",
      "originalId": "SEC004",
      "nombre": "Sal fina",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 1.5,
      "mermaPct": 0.0,
      "costoReal": 1.5,
      "presentacion": 1000.0,
      "valorCompra": 1500.0,
      "activo": true
    },
    {
      "id": "SEC005",
      "originalId": "SEC005",
      "nombre": "Sal marina",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 5.705,
      "mermaPct": 0.0,
      "costoReal": 5.705,
      "presentacion": 1000.0,
      "valorCompra": 5705.0,
      "activo": true
    },
    {
      "id": "SEC006",
      "originalId": "SEC006",
      "nombre": "Aceite",
      "familia": "Secos",
      "unidad": "ml",
      "costoUnitario": 5.705,
      "mermaPct": 0.0,
      "costoReal": 5.705,
      "presentacion": 1000.0,
      "valorCompra": 5705.0,
      "activo": true
    },
    {
      "id": "SEC007",
      "originalId": "SEC007",
      "nombre": "Harina de trigo",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 2.891,
      "mermaPct": 0.0,
      "costoReal": 2.891,
      "presentacion": 1000.0,
      "valorCompra": 2891.0,
      "activo": true
    },
    {
      "id": "SEC008",
      "originalId": "SEC008",
      "nombre": "Levadura seca",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 72.8,
      "mermaPct": 0.0,
      "costoReal": 72.8,
      "presentacion": 500.0,
      "valorCompra": 36400.0,
      "activo": true
    },
    {
      "id": "SEC009",
      "originalId": "SEC009",
      "nombre": "Aceite de oliva",
      "familia": "Secos",
      "unidad": "ml",
      "costoUnitario": 68.067,
      "mermaPct": 0.0,
      "costoReal": 68.067,
      "presentacion": 1000.0,
      "valorCompra": 68067.0,
      "activo": true
    },
    {
      "id": "SEC010",
      "originalId": "SEC010",
      "nombre": "Salvado de trigo",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 7.45,
      "mermaPct": 0.0,
      "costoReal": 7.45,
      "presentacion": 1000.0,
      "valorCompra": 7450.0,
      "activo": true
    },
    {
      "id": "SEC011",
      "originalId": "SEC011",
      "nombre": "Miel",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 15.344,
      "mermaPct": 0.0,
      "costoReal": 15.344,
      "presentacion": 1000.0,
      "valorCompra": 15344.0,
      "activo": true
    },
    {
      "id": "SEC012",
      "originalId": "SEC012",
      "nombre": "Huevo AA",
      "familia": "Secos",
      "unidad": "u",
      "costoUnitario": 350.0,
      "mermaPct": 0.0,
      "costoReal": 350.0,
      "presentacion": 1.0,
      "valorCompra": 350.0,
      "activo": true
    },
    {
      "id": "SEC013",
      "originalId": "SEC013",
      "nombre": "Mantequilla",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 3.972,
      "mermaPct": 0.0,
      "costoReal": 3.972,
      "presentacion": 1000.0,
      "valorCompra": 3972.0,
      "activo": true
    },
    {
      "id": "SEC014",
      "originalId": "SEC014",
      "nombre": "Mayonesa",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 20.325,
      "mermaPct": 0.0,
      "costoReal": 20.325,
      "presentacion": 4000.0,
      "valorCompra": 81300.0,
      "activo": true
    },
    {
      "id": "SEC015",
      "originalId": "SEC015",
      "nombre": "Salsa de tomate",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 2.244,
      "mermaPct": 0.0,
      "costoReal": 2.244,
      "presentacion": 4000.0,
      "valorCompra": 8976.0,
      "activo": true
    },
    {
      "id": "SEC016",
      "originalId": "SEC016",
      "nombre": "Mostaza",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 6.875,
      "mermaPct": 0.0,
      "costoReal": 6.875,
      "presentacion": 4000.0,
      "valorCompra": 27500.0,
      "activo": true
    },
    {
      "id": "SEC017",
      "originalId": "SEC017",
      "nombre": "Pepinillos",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 75.032,
      "mermaPct": 0.05,
      "costoReal": 78.9811,
      "presentacion": 250.0,
      "valorCompra": 18758.0,
      "activo": true
    },
    {
      "id": "SEC018",
      "originalId": "SEC018",
      "nombre": "Salsa de ají",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 27.0833,
      "mermaPct": 0.0,
      "costoReal": 27.0833,
      "presentacion": 120.0,
      "valorCompra": 3250.0,
      "activo": true
    },
    {
      "id": "SEC019",
      "originalId": "SEC019",
      "nombre": "Vinagre",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 2.352,
      "mermaPct": 0.0,
      "costoReal": 2.352,
      "presentacion": 1000.0,
      "valorCompra": 2352.0,
      "activo": true
    },
    {
      "id": "SEC020",
      "originalId": "SEC020",
      "nombre": "Cebolla roja",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 3.5,
      "mermaPct": 0.15,
      "costoReal": 4.1176,
      "presentacion": 1000.0,
      "valorCompra": 3500.0,
      "activo": true
    },
    {
      "id": "SEC021",
      "originalId": "SEC021",
      "nombre": "Pepino cohombro",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 4.2,
      "mermaPct": 0.0,
      "costoReal": 4.2,
      "presentacion": 1000.0,
      "valorCompra": 4200.0,
      "activo": true
    },
    {
      "id": "SEC022",
      "originalId": "SEC022",
      "nombre": "Azúcar morena",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 4.39,
      "mermaPct": 0.0,
      "costoReal": 4.39,
      "presentacion": 1000.0,
      "valorCompra": 4390.0,
      "activo": true
    },
    {
      "id": "SEC023",
      "originalId": "SEC023",
      "nombre": "Panela",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 7.025,
      "mermaPct": 0.0,
      "costoReal": 7.025,
      "presentacion": 1000.0,
      "valorCompra": 7025.0,
      "activo": true
    },
    {
      "id": "SEC024",
      "originalId": "SEC024",
      "nombre": "Salsa de soya",
      "familia": "Secos",
      "unidad": "ml",
      "costoUnitario": 6.0,
      "mermaPct": 0.0,
      "costoReal": 6.0,
      "presentacion": 1000.0,
      "valorCompra": 6000.0,
      "activo": true
    },
    {
      "id": "SEC025",
      "originalId": "SEC025",
      "nombre": "Salsa negra",
      "familia": "Secos",
      "unidad": "ml",
      "costoUnitario": 12.0,
      "mermaPct": 0.0,
      "costoReal": 12.0,
      "presentacion": 1000.0,
      "valorCompra": 12000.0,
      "activo": true
    },
    {
      "id": "SEC026",
      "originalId": "SEC026",
      "nombre": "Caramelo",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 17.582,
      "mermaPct": 0.0,
      "costoReal": 17.582,
      "presentacion": 1000.0,
      "valorCompra": 17582.0,
      "activo": true
    },
    {
      "id": "SEC027",
      "originalId": "SEC027",
      "nombre": "Cocoa",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 25.0,
      "mermaPct": 0.0,
      "costoReal": 25.0,
      "presentacion": 1000.0,
      "valorCompra": 25000.0,
      "activo": true
    },
    {
      "id": "SUB001",
      "originalId": "SUB001",
      "nombre": "Pan base multiuso",
      "familia": "Subrecetas",
      "unidad": "g",
      "costoUnitario": 2.26,
      "mermaPct": 0.05,
      "costoReal": 2.3789,
      "presentacion": 100.0,
      "valorCompra": 226.0,
      "activo": true
    },
    {
      "id": "FRV011",
      "originalId": "FRV011",
      "nombre": "Cebolla junca",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 3.5,
      "mermaPct": 0.0,
      "costoReal": 3.5,
      "presentacion": 1000.0,
      "valorCompra": 3500.0,
      "activo": true
    },
    {
      "id": "FRV012",
      "originalId": "FRV012",
      "nombre": "Cilantro cimarron",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 10.0,
      "mermaPct": 0.0,
      "costoReal": 10.0,
      "presentacion": 1000.0,
      "valorCompra": 10000.0,
      "activo": true
    },
    {
      "id": "FRV013",
      "originalId": "FRV013",
      "nombre": "Cubios",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 3.8,
      "mermaPct": 0.0,
      "costoReal": 3.8,
      "presentacion": 1000.0,
      "valorCompra": 3800.0,
      "activo": true
    },
    {
      "id": "FRV014",
      "originalId": "FRV014",
      "nombre": "Chuguas",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 5.0,
      "mermaPct": 0.0,
      "costoReal": 5.0,
      "presentacion": 1000.0,
      "valorCompra": 5000.0,
      "activo": true
    },
    {
      "id": "FRV015",
      "originalId": "FRV015",
      "nombre": "Habas",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 5.0,
      "mermaPct": 0.0,
      "costoReal": 5.0,
      "presentacion": 1000.0,
      "valorCompra": 5000.0,
      "activo": true
    },
    {
      "id": "FRV016",
      "originalId": "FRV016",
      "nombre": "Arveja verde fresca",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 1.5,
      "mermaPct": 0.0,
      "costoReal": 1.5,
      "presentacion": 1000.0,
      "valorCompra": 1500.0,
      "activo": true
    },
    {
      "id": "FRV017",
      "originalId": "FRV017",
      "nombre": "Mazorca tusa",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 1.5,
      "mermaPct": 0.0,
      "costoReal": 1.5,
      "presentacion": 1000.0,
      "valorCompra": 1500.0,
      "activo": true
    },
    {
      "id": "FRV018",
      "originalId": "FRV018",
      "nombre": "Papa criolla baby",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 1.5,
      "mermaPct": 0.0,
      "costoReal": 1.5,
      "presentacion": 1000.0,
      "valorCompra": 1500.0,
      "activo": true
    },
    {
      "id": "FRV019",
      "originalId": "FRV019",
      "nombre": "Papa sabanera",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 1.5,
      "mermaPct": 0.0,
      "costoReal": 1.5,
      "presentacion": 1000.0,
      "valorCompra": 1500.0,
      "activo": true
    },
    {
      "id": "LAC004",
      "originalId": "LAC004",
      "nombre": "Queso criollo",
      "familia": "Lacteos",
      "unidad": "g",
      "costoUnitario": 22.0,
      "mermaPct": 0.0,
      "costoReal": 22.0,
      "presentacion": 1000.0,
      "valorCompra": 22000.0,
      "activo": true
    },
    {
      "id": "FRV020",
      "originalId": "FRV020",
      "nombre": "Tomate",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 1.5,
      "mermaPct": 0.0,
      "costoReal": 1.5,
      "presentacion": 1000.0,
      "valorCompra": 1500.0,
      "activo": true
    },
    {
      "id": "CAC001",
      "originalId": "CAC001",
      "nombre": "Pierna de cerdo",
      "familia": "Carne De Cerdo",
      "unidad": "g",
      "costoUnitario": 18.0,
      "mermaPct": 0.0,
      "costoReal": 18.0,
      "presentacion": 1000.0,
      "valorCompra": 18000.0,
      "activo": true
    },
    {
      "id": "CAR002",
      "originalId": "CAR002",
      "nombre": "Chata de res",
      "familia": "Carne De Res",
      "unidad": "g",
      "costoUnitario": 35.0,
      "mermaPct": 0.0,
      "costoReal": 35.0,
      "presentacion": 1000.0,
      "valorCompra": 35000.0,
      "activo": true
    },
    {
      "id": "CAP001",
      "originalId": "CAP001",
      "nombre": "Pollo semicriollo",
      "familia": "Pollo",
      "unidad": "g",
      "costoUnitario": 17.5,
      "mermaPct": 0.0,
      "costoReal": 17.5,
      "presentacion": 1000.0,
      "valorCompra": 17500.0,
      "activo": true
    },
    {
      "id": "CAF001",
      "originalId": "CAF001",
      "nombre": "Chorizo zenú",
      "familia": "Carnes Frias",
      "unidad": "u",
      "costoUnitario": 1100.0,
      "mermaPct": 0.0,
      "costoReal": 1100.0,
      "presentacion": 20.0,
      "valorCompra": 22000.0,
      "activo": true
    },
    {
      "id": "SEC028",
      "originalId": "SEC028",
      "nombre": "Colorey",
      "familia": "Secos",
      "unidad": "g",
      "costoUnitario": 11.6,
      "mermaPct": 0.0,
      "costoReal": 11.6,
      "presentacion": 500.0,
      "valorCompra": 5800.0,
      "activo": true
    },
    {
      "id": "PYM001",
      "originalId": "PYM001",
      "nombre": "Bagre seco",
      "familia": "Pescados Y Mariscos",
      "unidad": "g",
      "costoUnitario": 25.0,
      "mermaPct": 0.0,
      "costoReal": 25.0,
      "presentacion": 1000.0,
      "valorCompra": 25000.0,
      "activo": true
    },
    {
      "id": "FRV021",
      "originalId": "FRV021",
      "nombre": "Zanahoria",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 20.0,
      "mermaPct": 0.0,
      "costoReal": 20.0,
      "presentacion": 1000.0,
      "valorCompra": 20000.0,
      "activo": true
    },
    {
      "id": "FRV022",
      "originalId": "FRV022",
      "nombre": "Arveja verde congelada",
      "familia": "Fruver",
      "unidad": "g",
      "costoUnitario": 23.0,
      "mermaPct": 0.0,
      "costoReal": 23.0,
      "presentacion": 1000.0,
      "valorCompra": 23000.0,
      "activo": true
    }
  ],
  "recetas": [
    {
      "id": "REC001",
      "nombre": "Arroz con leche",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": 20,
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec001-1",
          "insumoId": "SEC001",
          "insumo": "Arroz",
          "cantidad": 500.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec001-2",
          "insumoId": "LAC001",
          "insumo": "leche entera",
          "cantidad": 1000.0,
          "unidad": "ml"
        },
        {
          "id": "ing-rec001-3",
          "insumoId": "LAC002",
          "insumo": "Crema de leche",
          "cantidad": 500.0,
          "unidad": "ml"
        },
        {
          "id": "ing-rec001-4",
          "insumoId": "SEC002",
          "insumo": "Leche condensada",
          "cantidad": 250.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec001-5",
          "insumoId": "SEC003",
          "insumo": "Azúcar blanca",
          "cantidad": 100.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec001-6",
          "insumoId": "ADC001",
          "insumo": "Agua",
          "cantidad": 1500.0,
          "unidad": "ml"
        },
        {
          "id": "ing-rec001-7",
          "insumoId": "ESP001",
          "insumo": "Esencia de vainilla",
          "cantidad": 1.0,
          "unidad": "ml"
        },
        {
          "id": "ing-rec001-8",
          "insumoId": "ESP002",
          "insumo": "Canela en astillas",
          "cantidad": 1.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec001-9",
          "insumoId": "SEC004",
          "insumo": "Sal fina",
          "cantidad": 1.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec001-10",
          "insumoId": "FRV001",
          "insumo": "Limon tahiti",
          "cantidad": 1.0,
          "unidad": "g"
        }
      ],
      "procedimiento": [
        {
          "paso": "1.0",
          "descripcion": "Lavar el arroz para retirar el exceso de almidon",
          "tiempoMin": 5.0,
          "temperatura": "n/a",
          "equipo": "taza",
          "observaciones": "Un enjuague rapido para retirar impurezas"
        },
        {
          "paso": "2.0",
          "descripcion": "Llevar el agua a fuego medio",
          "tiempoMin": 5.0,
          "temperatura": "50ºC",
          "equipo": "Olla alta",
          "observaciones": "Solo dejar calentar"
        },
        {
          "paso": "3.0",
          "descripcion": "Agregar especias y la mitad del azúcar",
          "tiempoMin": 0.0,
          "temperatura": "0.0",
          "equipo": "Olla alta",
          "observaciones": "Limón, canela (van en sachet para retirar despues)"
        },
        {
          "paso": "4.0",
          "descripcion": "Cocinar a fuego medio",
          "tiempoMin": 70.0,
          "temperatura": "90ºC",
          "equipo": "Olla alta",
          "observaciones": "Mezclar cada 15 minutos hasta que el arroz empiece a suavizar"
        },
        {
          "paso": "5.0",
          "descripcion": "Añadir leche",
          "tiempoMin": 40.0,
          "temperatura": "85ºC",
          "equipo": "Espatula",
          "observaciones": "mezclar suave y verificar que los granos esten suaves"
        },
        {
          "paso": "6.0",
          "descripcion": "Agregar resto de ingredientes",
          "tiempoMin": 0.0,
          "temperatura": "0.0",
          "equipo": "Espatula",
          "observaciones": "Leche, leche condensada, crema, sal y vainilla"
        },
        {
          "paso": "7.0",
          "descripcion": "Retirar Sachet de especias",
          "tiempoMin": 0.0,
          "temperatura": "0.0",
          "equipo": "Pinza",
          "observaciones": ""
        },
        {
          "paso": "8.0",
          "descripcion": "Rectificar sabores",
          "tiempoMin": 15.0,
          "temperatura": "85ºc",
          "equipo": "Espatula",
          "observaciones": "terminar de cocinar, rectificar sabores y bajar del fuego"
        },
        {
          "paso": "9.0",
          "descripcion": "Refrigerar",
          "tiempoMin": 360.0,
          "temperatura": "4ºC",
          "equipo": "",
          "observaciones": "Enfriar a Tº ambiente antes de llevar a refrigeración"
        },
        {
          "paso": "10.0",
          "descripcion": "Servir",
          "tiempoMin": 0.0,
          "temperatura": "10ºC",
          "equipo": "Taza",
          "observaciones": "Servir en recipientes, decorar con toppings al gusto"
        }
      ],
      "calidad": {
        "color": "Blanco crema uniforme",
        "textura": "Cremosa, grano suave, no pastosa",
        "sabor": "Dulce equilibrado con notas lácteas",
        "aroma": "Fresco, canela y vainilla",
        "temperaturaCoccion": "75 - 95ºc",
        "temperaturaConservacion": "4ºC o menos",
        "presentacion": "Sin grumos, superficie lisa",
        "rangos": "60-65ºc / 0-4ºC",
        "tolerancias": "Ligeros cambios en color por uso de panela o caramelo",
        "criteriosRechazo": "Grano duro, textura pesada, acidez elevada",
        "codigoFicha": "FT-P0-001",
        "complejidad": "MEDIA",
        "servicio": "POSTRE / CENA"
      },
      "observacionesGenerales": "Del limon se agrega solo la parte verde de la cascara, la parte blanca aporta amargor. Una vez empiece a secar se revuelve cada 5 minutos para evitar grumos o que se pegue. No superar en 15 g cada topping (coco, uvas pasas, queso, bocadillo), ó 1 g para canela molida. La durabilidad del arroz dependera de su conservacion en frio, (max 2 dias)"
    },
    {
      "id": "REC002",
      "nombre": "Pan base multiuso",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": 20,
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec002-1",
          "insumoId": "SEC007",
          "insumo": "Harina de trigo",
          "cantidad": 1000.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec002-2",
          "insumoId": "ADC001",
          "insumo": "Agua",
          "cantidad": 600.0,
          "unidad": "ml"
        },
        {
          "id": "ing-rec002-3",
          "insumoId": "SEC003",
          "insumo": "Azúcar blanca",
          "cantidad": 40.0,
          "unidad": "ml"
        },
        {
          "id": "ing-rec002-4",
          "insumoId": "SEC004",
          "insumo": "Sal fina",
          "cantidad": 20.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec002-5",
          "insumoId": "SEC008",
          "insumo": "Levadura seca",
          "cantidad": 12.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec002-6",
          "insumoId": "SEC006",
          "insumo": "Aceite",
          "cantidad": 60.0,
          "unidad": "g"
        }
      ],
      "procedimiento": [
        {
          "paso": "1.0",
          "descripcion": "Integrar harina, agua (90%), sal y aceite",
          "tiempoMin": 15.0,
          "temperatura": "0.0",
          "equipo": "Amasadora",
          "observaciones": "Llevar a la maquina hasta lograr una masa suave y un poco elastica"
        },
        {
          "paso": "2.0",
          "descripcion": "Mezclar agua tibia (50 grs) con azúcar y levadura",
          "tiempoMin": 5.0,
          "temperatura": "35°C",
          "equipo": "Bowl",
          "observaciones": "Mezclar bien y dejar reposar pára activar la levadura"
        },
        {
          "paso": "3.0",
          "descripcion": "Agregar la levadura y amasar",
          "tiempoMin": 10.0,
          "temperatura": "0.0",
          "equipo": "Amasadora",
          "observaciones": "debe quedar una masa suave y algo elastica."
        },
        {
          "paso": "4.0",
          "descripcion": "Fermentar la masa",
          "tiempoMin": 60.0,
          "temperatura": "T° A.",
          "equipo": "Bowl",
          "observaciones": "Cubrir con un paño y dejar en un lugar fresco hasta que doble tamaño."
        },
        {
          "paso": "5.0",
          "descripcion": "Desgasificar la masa, dividir y bolear",
          "tiempoMin": 15.0,
          "temperatura": "T° A.",
          "equipo": "Gramera",
          "observaciones": "Con cuidado retirar el gas de la masa, dando un par de vueltas sencillas, dividir en porciones de entre 95 y 110 grs, bolear y dar forma"
        },
        {
          "paso": "6.0",
          "descripcion": "Fermentar panes",
          "tiempoMin": 40.0,
          "temperatura": "T° A.",
          "equipo": "Bandeja",
          "observaciones": "Llevar a reposo en un lugar fresco y calido hasta doblar tamaño"
        },
        {
          "paso": "7.0",
          "descripcion": "Hornear",
          "tiempoMin": 20.0,
          "temperatura": "190°C",
          "equipo": "Horno",
          "observaciones": "mantener temperatura media, los panes deben tomar una coloración dorada y pareja que debe aparecer despues de 15 min. mantener el calor hasta que al sacarlos del horno no se aplasten y se sientan suaves, livianos y crocantes al tacto"
        }
      ],
      "calidad": {
        "color": "Caramelo claro",
        "textura": "Crocante por fuera, miga suave y liviana por dentro",
        "sabor": "Equilibrado entre sal y dulce, no debe sentirse acido en boca",
        "aroma": "trigo tostado, notas dulces",
        "temperaturaCoccion": "75 - 95ºc",
        "temperaturaConservacion": "T° Ambiente",
        "presentacion": "Superficie lisa, color uniforme, aroma fresco, textura interna suave y liviana",
        "rangos": "T° Ambiente",
        "tolerancias": "Ligeros cambios de color por horneado, formas irregulares por armado.",
        "criteriosRechazo": "Masa pesada y dura, color oscuro o demasiado blanco, textura gomosa y pesada en boca, aroma fuerte,",
        "codigoFicha": "",
        "complejidad": "",
        "servicio": ""
      },
      "observacionesGenerales": "Para evitar quemar la levadura en el amasado, se recomienda amasar primero la harina junto al agua hasta suavizar un poco, luego se adiciona la levadura y se termina de amasar antes de dejar en reposo."
    },
    {
      "id": "REC003",
      "nombre": "Pan de orégano",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": "",
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec003-1",
          "insumoId": "SUB001",
          "insumo": "Pan base multiuso",
          "cantidad": "",
          "unidad": "ml"
        },
        {
          "id": "ing-rec003-2",
          "insumoId": "ESP004",
          "insumo": "Oregano seco",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec003-3",
          "insumoId": "ESP003",
          "insumo": "Ajo en polvo",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec003-4",
          "insumoId": "SEC009",
          "insumo": "Aceite de oliva",
          "cantidad": "",
          "unidad": "g"
        }
      ],
      "procedimiento": [],
      "calidad": {},
      "observacionesGenerales": ""
    },
    {
      "id": "REC004",
      "nombre": "Pan semi-integral",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": "",
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec004-1",
          "insumoId": "SEC007",
          "insumo": "Harina de trigo",
          "cantidad": "",
          "unidad": "ml"
        },
        {
          "id": "ing-rec004-2",
          "insumoId": "SEC010",
          "insumo": "Salvado de trigo",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec004-3",
          "insumoId": "ADC001",
          "insumo": "Agua",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec004-4",
          "insumoId": "SEC003",
          "insumo": "Azúcar blanca",
          "cantidad": "",
          "unidad": "ml"
        },
        {
          "id": "ing-rec004-5",
          "insumoId": "SEC011",
          "insumo": "Miel",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec004-6",
          "insumoId": "SEC004",
          "insumo": "Sal fina",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec004-7",
          "insumoId": "SEC008",
          "insumo": "Levadura seca",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec004-8",
          "insumoId": "SEC006",
          "insumo": "Aceite",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec004-9",
          "insumoId": "SEC026",
          "insumo": "Caramelo",
          "cantidad": "",
          "unidad": "ml"
        }
      ],
      "procedimiento": [],
      "calidad": {},
      "observacionesGenerales": ""
    },
    {
      "id": "REC005",
      "nombre": "Pan Brioche",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": "",
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec005-1",
          "insumoId": "SEC007",
          "insumo": "Harina de trigo",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec005-2",
          "insumoId": "SEC012",
          "insumo": "Huevo AA",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec005-3",
          "insumoId": "LAC001",
          "insumo": "leche entera",
          "cantidad": "",
          "unidad": "u"
        },
        {
          "id": "ing-rec005-4",
          "insumoId": "SEC003",
          "insumo": "Azúcar blanca",
          "cantidad": "",
          "unidad": "ml"
        },
        {
          "id": "ing-rec005-5",
          "insumoId": "SEC004",
          "insumo": "Sal fina",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec005-6",
          "insumoId": "SEC008",
          "insumo": "Levadura seca",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec005-7",
          "insumoId": "SEC013",
          "insumo": "Mantequilla",
          "cantidad": "",
          "unidad": "g"
        }
      ],
      "procedimiento": [],
      "calidad": {},
      "observacionesGenerales": ""
    },
    {
      "id": "REC006",
      "nombre": "Pan árabe",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": "",
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec006-1",
          "insumoId": "SEC007",
          "insumo": "Harina de trigo",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec006-2",
          "insumoId": "ADC001",
          "insumo": "Agua",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec006-3",
          "insumoId": "SEC004",
          "insumo": "Sal fina",
          "cantidad": "",
          "unidad": "ml"
        },
        {
          "id": "ing-rec006-4",
          "insumoId": "SEC003",
          "insumo": "Azúcar blanca",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec006-5",
          "insumoId": "SEC008",
          "insumo": "Levadura seca",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec006-6",
          "insumoId": "SEC006",
          "insumo": "Aceite",
          "cantidad": "",
          "unidad": "g"
        }
      ],
      "procedimiento": [],
      "calidad": {},
      "observacionesGenerales": ""
    },
    {
      "id": "REC007",
      "nombre": "Focaccia",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": "",
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec007-1",
          "insumoId": "SEC007",
          "insumo": "Harina de trigo",
          "cantidad": "",
          "unidad": "ml"
        },
        {
          "id": "ing-rec007-2",
          "insumoId": "ADC001",
          "insumo": "Agua",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec007-3",
          "insumoId": "SEC004",
          "insumo": "Sal fina",
          "cantidad": "",
          "unidad": "ml"
        },
        {
          "id": "ing-rec007-4",
          "insumoId": "SEC008",
          "insumo": "Levadura seca",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec007-5",
          "insumoId": "SEC009",
          "insumo": "Aceite de oliva",
          "cantidad": "",
          "unidad": "g"
        }
      ],
      "procedimiento": [],
      "calidad": {},
      "observacionesGenerales": ""
    },
    {
      "id": "REC008",
      "nombre": "Salsa de ajo",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": "",
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec008-1",
          "insumoId": "SEC014",
          "insumo": "Mayonesa",
          "cantidad": "",
          "unidad": "ml"
        },
        {
          "id": "ing-rec008-2",
          "insumoId": "FRV004",
          "insumo": "Ajo fresco",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec008-3",
          "insumoId": "FRV001",
          "insumo": "Limon tahiti",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec008-4",
          "insumoId": "LAC001",
          "insumo": "leche entera",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec008-5",
          "insumoId": "FRV002",
          "insumo": "Perejil",
          "cantidad": "",
          "unidad": "ml"
        },
        {
          "id": "ing-rec008-6",
          "insumoId": "SEC004",
          "insumo": "Sal fina",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec008-7",
          "insumoId": "ESP005",
          "insumo": "Pimienta negra",
          "cantidad": "",
          "unidad": "g"
        }
      ],
      "procedimiento": [],
      "calidad": {},
      "observacionesGenerales": ""
    },
    {
      "id": "REC009",
      "nombre": "Salsa rosada o golf",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": "",
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec009-1",
          "insumoId": "SEC014",
          "insumo": "Mayonesa",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec009-2",
          "insumoId": "SEC015",
          "insumo": "Salsa de tomate",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec009-3",
          "insumoId": "SEC016",
          "insumo": "Mostaza",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec009-4",
          "insumoId": "FRV001",
          "insumo": "Limon tahiti",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec009-5",
          "insumoId": "SEC018",
          "insumo": "Salsa de ají",
          "cantidad": "",
          "unidad": "g"
        }
      ],
      "procedimiento": [],
      "calidad": {},
      "observacionesGenerales": ""
    },
    {
      "id": "REC010",
      "nombre": "Salsa tártara clásica",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": "",
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec010-1",
          "insumoId": "SEC014",
          "insumo": "Mayonesa",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec010-2",
          "insumoId": "SEC017",
          "insumo": "Pepinillos",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec010-3",
          "insumoId": "FRV005",
          "insumo": "Cebolla blanca",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec010-4",
          "insumoId": "FRV002",
          "insumo": "Perejil",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec010-5",
          "insumoId": "SEC016",
          "insumo": "Mostaza",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec010-6",
          "insumoId": "FRV001",
          "insumo": "Limon tahiti",
          "cantidad": "",
          "unidad": "g"
        }
      ],
      "procedimiento": [],
      "calidad": {},
      "observacionesGenerales": ""
    },
    {
      "id": "REC011",
      "nombre": "chimichurri básico",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": "",
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec011-1",
          "insumoId": "FRV002",
          "insumo": "Perejil",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec011-2",
          "insumoId": "FRV004",
          "insumo": "Ajo fresco",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec011-3",
          "insumoId": "ESP004",
          "insumo": "Oregano seco",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec011-4",
          "insumoId": "ESP006",
          "insumo": "Aji seco",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec011-5",
          "insumoId": "SEC019",
          "insumo": "Vinagre",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec011-6",
          "insumoId": "SEC006",
          "insumo": "Aceite",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec011-7",
          "insumoId": "SEC004",
          "insumo": "Sal fina",
          "cantidad": "",
          "unidad": "ml"
        }
      ],
      "procedimiento": [],
      "calidad": {},
      "observacionesGenerales": ""
    },
    {
      "id": "REC012",
      "nombre": "cebolla roja encurtida",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": "",
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec012-1",
          "insumoId": "SEC020",
          "insumo": "Cebolla roja",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec012-2",
          "insumoId": "SEC019",
          "insumo": "Vinagre",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec012-3",
          "insumoId": "ADC001",
          "insumo": "Agua",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec012-4",
          "insumoId": "SEC003",
          "insumo": "Azúcar blanca",
          "cantidad": "",
          "unidad": "ml"
        },
        {
          "id": "ing-rec012-5",
          "insumoId": "SEC004",
          "insumo": "Sal fina",
          "cantidad": "",
          "unidad": "g"
        }
      ],
      "procedimiento": [],
      "calidad": {},
      "observacionesGenerales": ""
    },
    {
      "id": "REC013",
      "nombre": "Pepino encurtido",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": "",
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec013-1",
          "insumoId": "SEC021",
          "insumo": "Pepino cohombro",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec013-2",
          "insumoId": "SEC019",
          "insumo": "Vinagre",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec013-3",
          "insumoId": "ADC001",
          "insumo": "Agua",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec013-4",
          "insumoId": "SEC004",
          "insumo": "Sal fina",
          "cantidad": "",
          "unidad": "ml"
        },
        {
          "id": "ing-rec013-5",
          "insumoId": "SEC003",
          "insumo": "Azúcar blanca",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec013-6",
          "insumoId": "FRV004",
          "insumo": "Ajo fresco",
          "cantidad": "",
          "unidad": "g"
        }
      ],
      "procedimiento": [],
      "calidad": {},
      "observacionesGenerales": ""
    },
    {
      "id": "REC014",
      "nombre": "Cebolla caramelizada",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": 2,
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec014-1",
          "insumoId": "FRV005",
          "insumo": "Cebolla blanca",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec014-2",
          "insumoId": "SEC013",
          "insumo": "Mantequilla",
          "cantidad": 25.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec014-3",
          "insumoId": "SEC022",
          "insumo": "Azúcar morena",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec014-4",
          "insumoId": "SEC004",
          "insumo": "Sal fina",
          "cantidad": "",
          "unidad": "g"
        }
      ],
      "procedimiento": [],
      "calidad": {},
      "observacionesGenerales": ""
    },
    {
      "id": "REC015",
      "nombre": "Cebolla confitada",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": "",
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec015-1",
          "insumoId": "FRV005",
          "insumo": "Cebolla blanca",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec015-2",
          "insumoId": "SEC009",
          "insumo": "Aceite de oliva",
          "cantidad": "",
          "unidad": "g"
        },
        {
          "id": "ing-rec015-3",
          "insumoId": "SEC004",
          "insumo": "Sal fina",
          "cantidad": "",
          "unidad": "ml"
        },
        {
          "id": "ing-rec015-4",
          "insumoId": "ESP005",
          "insumo": "Pimienta negra",
          "cantidad": "",
          "unidad": "g"
        }
      ],
      "procedimiento": [],
      "calidad": {},
      "observacionesGenerales": ""
    },
    {
      "id": "REC016",
      "nombre": "Sopa de platano",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": 1,
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec016-1",
          "insumoId": "FRV007",
          "insumo": "Papa negra",
          "cantidad": 30.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec016-2",
          "insumoId": "FRV009",
          "insumo": "platano verde",
          "cantidad": 110.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec016-3",
          "insumoId": "FRV010",
          "insumo": "Arracacha",
          "cantidad": 80.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec016-4",
          "insumoId": "FRV008",
          "insumo": "Yuca",
          "cantidad": 50.0,
          "unidad": "g"
        }
      ],
      "procedimiento": [],
      "calidad": {},
      "observacionesGenerales": ""
    },
    {
      "id": "REC017",
      "nombre": "Mantecada cebra",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": 20,
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec017-1",
          "insumoId": "SEC007",
          "insumo": "harina de trigo",
          "cantidad": 500.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec017-2",
          "insumoId": "ADC002",
          "insumo": "polvo para hornear",
          "cantidad": 20.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec017-3",
          "insumoId": "SEC004",
          "insumo": "Sal fina",
          "cantidad": 5.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec017-4",
          "insumoId": "SEC003",
          "insumo": "Azúcar blanca",
          "cantidad": 450.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec017-5",
          "insumoId": "SEC012",
          "insumo": "huevo AA",
          "cantidad": 6.0,
          "unidad": "u"
        },
        {
          "id": "ing-rec017-6",
          "insumoId": "LAC001",
          "insumo": "leche entera",
          "cantidad": 300.0,
          "unidad": "ml"
        },
        {
          "id": "ing-rec017-7",
          "insumoId": "SEC006",
          "insumo": "aceite",
          "cantidad": 250.0,
          "unidad": "ml"
        },
        {
          "id": "ing-rec017-8",
          "insumoId": "SEC013",
          "insumo": "Mantequilla",
          "cantidad": 120.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec017-9",
          "insumoId": "ESP001",
          "insumo": "Esencia de vainilla",
          "cantidad": 15.0,
          "unidad": "ml"
        },
        {
          "id": "ing-rec017-10",
          "insumoId": "LAC003",
          "insumo": "Yogurt",
          "cantidad": 120.0,
          "unidad": "ml"
        },
        {
          "id": "ing-rec017-11",
          "insumoId": "SEC027",
          "insumo": "Cocoa",
          "cantidad": 35.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec017-12",
          "insumoId": "LAC001",
          "insumo": "leche entera",
          "cantidad": 40.0,
          "unidad": "ml"
        }
      ],
      "procedimiento": [
        {
          "paso": "1.0",
          "descripcion": "preparar el molde, engrasar y precalentar el horno",
          "tiempoMin": 5.0,
          "temperatura": "170 ºC",
          "equipo": "Molde, horno",
          "observaciones": "engrasar y enharinar solo la base del molde, no los laterales"
        },
        {
          "paso": "2.0",
          "descripcion": "Mezcla seca",
          "tiempoMin": 5.0,
          "temperatura": "T° A.",
          "equipo": "bolw, gramera, tamiz",
          "observaciones": "tamizar juntos, harina de trigo, polvo para hornear, sal"
        },
        {
          "paso": "3.0",
          "descripcion": "Batido Principal",
          "tiempoMin": 10.0,
          "temperatura": "T° A.",
          "equipo": "Batidora, gramera",
          "observaciones": "Bate huevos y azúcar hasta lograr una mezcla aireada y esponjosa, agrega en forma de hilo vainilla, aceite, mantequilla derretida, yogurt y leche, incorpora suavemente todo"
        },
        {
          "paso": "4.0",
          "descripcion": "Integrar secos",
          "tiempoMin": 5.0,
          "temperatura": "T° A.",
          "equipo": "Bowl, espatula",
          "observaciones": "Agregar los ingredientes secos tamizados en tandas, no sobrebatir, solo integrar"
        },
        {
          "paso": "5.0",
          "descripcion": "Dividir la mezcla",
          "tiempoMin": 5.0,
          "temperatura": "T° A.",
          "equipo": "Bowl, espatula, gramera",
          "observaciones": "dividir la mezcla en dos partes iguales, una dejarla tal cual, la otra agregar la cocoa y la leche caliente, mezclar para que quede uniforme"
        },
        {
          "paso": "6.0",
          "descripcion": "Llevar al molde (efecto cebra)",
          "tiempoMin": 5.0,
          "temperatura": "T° A.",
          "equipo": "molde engrasado, cuchara",
          "observaciones": "En el centro del molde colocar 3 cucharadas de mezcla vainilla, encima (en el centro) 3 cucharadas de mezcla chocolate, seguir alternando hasta llenar 2/3 de molde, golpear (suave) un poco contra la mesa para eliminar aire"
        },
        {
          "paso": "7.0",
          "descripcion": "Hornear",
          "tiempoMin": 55.0,
          "temperatura": "170ºC",
          "equipo": "horno",
          "observaciones": "Llevar al horno entre 40 y 55 minutos o hasta que el introducir un palillo salga seco, no abrir antes de 20 minutos"
        }
      ],
      "calidad": {
        "color": "Dorado suave",
        "textura": "esponjosa y liviana",
        "sabor": "equilibrio entre vainilla y cacao",
        "aroma": "fresco, cacao y vainilla",
        "temperaturaCoccion": "170ºC",
        "temperaturaConservacion": "T° Ambiente",
        "presentacion": "Superficie lisa, color uniforme, aroma fresco, textura interna suave y liviana",
        "rangos": "T° Ambiente",
        "tolerancias": "Ligeros cambios de color por horneado",
        "criteriosRechazo": "Textura pastosa y muy humeda, centro masudo y pegajoso, color muy palido o muy oscuro",
        "codigoFicha": "",
        "complejidad": "",
        "servicio": ""
      },
      "observacionesGenerales": "Pesar muy bien los ingredientes, al momento de engrasar el molde la cantidad de grasa debe ser minima para evitar que se frite la masa en el horno, no olvidar no sobrebatir la mezcla para no liberar el gluten, no abrir el horno antes de 20 minutos, para que la mezcla no se aplaste"
    },
    {
      "id": "REC018",
      "nombre": "Cocido boyacense",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": 1,
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec018-1",
          "insumoId": "FRV011",
          "insumo": "cebolla junca",
          "cantidad": 15.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-2",
          "insumoId": "FRV012",
          "insumo": "cilantro cimarron",
          "cantidad": 5.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-3",
          "insumoId": "SEC006",
          "insumo": "aceite",
          "cantidad": 15.0,
          "unidad": "ml"
        },
        {
          "id": "ing-rec018-4",
          "insumoId": "FRV014",
          "insumo": "chuguas",
          "cantidad": 40.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-5",
          "insumoId": "FRV013",
          "insumo": "cubios",
          "cantidad": 40.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-6",
          "insumoId": "FRV018",
          "insumo": "papa criolla baby",
          "cantidad": 40.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-7",
          "insumoId": "FRV019",
          "insumo": "papa sabanera",
          "cantidad": 50.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-8",
          "insumoId": "FRV007",
          "insumo": "papa negra",
          "cantidad": 100.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-9",
          "insumoId": "FRV017",
          "insumo": "mazorca tusa",
          "cantidad": 100.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-10",
          "insumoId": "CAC001",
          "insumo": "pierna de cerdo",
          "cantidad": 80.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-11",
          "insumoId": "CAR002",
          "insumo": "chata de res",
          "cantidad": 80.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-12",
          "insumoId": "CAF001",
          "insumo": "chorizo zenú",
          "cantidad": 0.5,
          "unidad": "u"
        },
        {
          "id": "ing-rec018-13",
          "insumoId": "CAP001",
          "insumo": "pollo semicriollo",
          "cantidad": 80.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-14",
          "insumoId": "FRV020",
          "insumo": "tomate",
          "cantidad": 15.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-15",
          "insumoId": "FRV015",
          "insumo": "habas",
          "cantidad": 50.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-16",
          "insumoId": "FRV016",
          "insumo": "arveja verde fresca",
          "cantidad": 30.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-17",
          "insumoId": "ADC001",
          "insumo": "agua",
          "cantidad": 250.0,
          "unidad": "ml"
        },
        {
          "id": "ing-rec018-18",
          "insumoId": "FRV004",
          "insumo": "ajo fresco",
          "cantidad": 4.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-19",
          "insumoId": "SEC028",
          "insumo": "colorey",
          "cantidad": 1.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-20",
          "insumoId": "SEC004",
          "insumo": "sal fina",
          "cantidad": 2.5,
          "unidad": "g"
        },
        {
          "id": "ing-rec018-21",
          "insumoId": "LAC004",
          "insumo": "queso criollo",
          "cantidad": 10.0,
          "unidad": "g"
        }
      ],
      "procedimiento": [
        {
          "paso": "1.0",
          "descripcion": "Prealistar insumos",
          "tiempoMin": 30.0,
          "temperatura": "T° A.",
          "equipo": "Bowl, tabla, cuchillo",
          "observaciones": "Lavar, limpiar y desinfectar materias primas, trocear carnes."
        },
        {
          "paso": "2.0",
          "descripcion": "Rehogar el guiso",
          "tiempoMin": 15.0,
          "temperatura": "90°c",
          "equipo": "Basculante o sarten, cucharon",
          "observaciones": "Adiciona el aceite deja calentar, agrega la cebolla y sofríe por un minuto mas, adiciona el tomate, ajo y cilantron, rehoga por 10 minutos y retira del sarten."
        },
        {
          "paso": "3.0",
          "descripcion": "Sofreir carnes",
          "tiempoMin": 30.0,
          "temperatura": "180°C",
          "equipo": "Basculante o sarten, cucharon",
          "observaciones": "En el aceite resultante del rehogado, calentar a fuego alto y adicionar la carne de res, la carne de cerdo y el pollo, dorar por 10 minutos."
        },
        {
          "paso": "4.0",
          "descripcion": "Cocinar y estofar con papas",
          "tiempoMin": 40.0,
          "temperatura": "180°C",
          "equipo": "Basculante o sarten, cucharon",
          "observaciones": "Cuando las carnes esten doradas, se adiciona agua, papa negra y mazorca, cocinar."
        },
        {
          "paso": "5.0",
          "descripcion": "Coccion lenta para dar sabor",
          "tiempoMin": 30.0,
          "temperatura": "90°C",
          "equipo": "Basculante o sarten, cucharon",
          "observaciones": "Cuando haya hervido y pasado 10 minutos se adicionan, papas negras y sabaneras, habas, cubios, chuguas, cocinar 10 minutos a fuego alto y bajar T°"
        },
        {
          "paso": "6.0",
          "descripcion": "Agregar Granos para dar color y sabor",
          "tiempoMin": 15.0,
          "temperatura": "90°C",
          "equipo": "Basculante o sarten, cucharon",
          "observaciones": "Se adicionan arvejas desgranadas y sin desgranar (con todo y vaina)"
        },
        {
          "paso": "7.0",
          "descripcion": "Sazonar y rectificar",
          "tiempoMin": 5.0,
          "temperatura": "90°C",
          "equipo": "Basculante o sarten, cucharon",
          "observaciones": "Sazonar con color, sal, rectificando sabor"
        },
        {
          "paso": "8.0",
          "descripcion": "Dorar y picar",
          "tiempoMin": 10.0,
          "temperatura": "120°C",
          "equipo": "plancha, espatula",
          "observaciones": "picar los chorizos en laminas al sesgo, dorar en la plancha y agregar sobre el cocido cuando este listo"
        },
        {
          "paso": "9.0",
          "descripcion": "Emplatar",
          "tiempoMin": 5.0,
          "temperatura": "T°A.",
          "equipo": "Cazuela de sopa",
          "observaciones": "servir en una cazuela teniendo cuidado de que contenga de todos los componentes, se finaliza con hogao en la parte superior y queso criollo rallado"
        },
        {
          "paso": "10.0",
          "descripcion": "Servir y acompañar",
          "tiempoMin": 5.0,
          "temperatura": "T°A.",
          "equipo": "Plato plano",
          "observaciones": "Servir acompañado de arroz con mollejas, ensalada de cebolla y tomate, aji criollo y limonada de panela helada"
        }
      ],
      "calidad": {
        "color": "colores uniformes y brillantes",
        "textura": "Corteza firme, interior suave",
        "sabor": "Acido suave, equilibrio entre proteinas y tuberculos",
        "aroma": "fresco a queso y cimarron",
        "temperaturaCoccion": "160°C",
        "temperaturaConservacion": "65 - 90°c",
        "presentacion": "Caldo fluido y dorado con tuberculos y hogado aromatizado con cimarron",
        "rangos": "65 - 90°c",
        "tolerancias": "Ligeros cambios de color por sobrecoccion de componentes",
        "criteriosRechazo": "Tuberculos duros, vegetales crudos, carne dura, color grisaseo, araoma terroso.",
        "codigoFicha": "",
        "complejidad": "",
        "servicio": ""
      },
      "observacionesGenerales": "El exito del cocido esta en que los granos esten de color brillante y suaves por dentro, los tuberculos deben verse firmes pero estar suaves y tiernos por dentro, al momento de servirse debe llevar algo de caldo, pollo, carne y cerdo, bañados con hogao y queso rallado. (la mita de la arveja va desgranada y la otra parte se cocina con todo y vainas que deben estar bien lavadas y sin partes dañadas. esto aporta color, textura y sabor al puchero."
    },
    {
      "id": "REC019",
      "nombre": "arroz de bagre seco",
      "version": "1",
      "creadoPor": "",
      "rendimiento": "",
      "pax": 1,
      "pesoPorPax": "",
      "foto": "",
      "ingredientes": [
        {
          "id": "ing-rec019-1",
          "insumoId": "PYM001",
          "insumo": "Bagre seco",
          "cantidad": 200.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec019-2",
          "insumoId": "FRV006",
          "insumo": "pimenton",
          "cantidad": 10.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec019-3",
          "insumoId": "FRV011",
          "insumo": "Cebolla junca",
          "cantidad": 10.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec019-4",
          "insumoId": "FRV005",
          "insumo": "cebolla blanca",
          "cantidad": 10.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec019-5",
          "insumoId": "FRV012",
          "insumo": "cilantro cimarron",
          "cantidad": 2.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec019-6",
          "insumoId": "FRV003",
          "insumo": "cilantro",
          "cantidad": 2.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec019-7",
          "insumoId": "SEC028",
          "insumo": "colorey",
          "cantidad": 1.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec019-8",
          "insumoId": "FRV020",
          "insumo": "tomate",
          "cantidad": 10.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec019-9",
          "insumoId": "FRV021",
          "insumo": "zanahoria",
          "cantidad": 30.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec019-10",
          "insumoId": "FRV022",
          "insumo": "arveja verde congelada",
          "cantidad": 30.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec019-11",
          "insumoId": "SEC001",
          "insumo": "Arroz",
          "cantidad": 100.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec019-12",
          "insumoId": "SEC004",
          "insumo": "sal fina",
          "cantidad": 1.0,
          "unidad": "g"
        },
        {
          "id": "ing-rec019-13",
          "insumoId": "SEC006",
          "insumo": "aceite",
          "cantidad": 20.0,
          "unidad": "ml"
        },
        {
          "id": "ing-rec019-14",
          "insumoId": "ADC001",
          "insumo": "agua",
          "cantidad": 200.0,
          "unidad": "ml"
        },
        {
          "id": "ing-rec019-15",
          "insumoId": "FRV004",
          "insumo": "ajo fresco",
          "cantidad": 1.0,
          "unidad": "g"
        }
      ],
      "procedimiento": [
        {
          "paso": "1.0",
          "descripcion": "Desalar",
          "tiempoMin": 480.0,
          "temperatura": "T°A.",
          "equipo": "bowl",
          "observaciones": "En un bowl con agua tibia, lavar un par de veces el pescado seco para retirar el exceso de sal, dejar en remojo 8 horas"
        },
        {
          "paso": "2.0",
          "descripcion": "Lavar y cocinar",
          "tiempoMin": 30.0,
          "temperatura": "90°",
          "equipo": "Olla mediana",
          "observaciones": "pasadas las 8 horas, lavar el pescado y llevar a coccion en abundante agua, cocinar 20 minutos, bajar del fuego y dejar enfriar"
        },
        {
          "paso": "3.0",
          "descripcion": "prealistar insumos",
          "tiempoMin": 20.0,
          "temperatura": "T°A.",
          "equipo": "tabla, bowl, cuchillo",
          "observaciones": "lavar y limpiar vegetales, picar todo finamente (cebollas, pimenton, tomates, cilantro y cimarron), reservar hasta su uso, picar en dados pequeños la zanahoria."
        },
        {
          "paso": "4.0",
          "descripcion": "Desmechar",
          "tiempoMin": 15.0,
          "temperatura": "T°A.",
          "equipo": "bowl, tabla",
          "observaciones": "cuando este frio el pescado, retirar huesos y espinas, desmechar y reservar hasta su uso"
        },
        {
          "paso": "5.0",
          "descripcion": "Rehogar el guiso",
          "tiempoMin": 20.0,
          "temperatura": "90°",
          "equipo": "sarten, espatula",
          "observaciones": "en una sarten caliente adicionar el aceite, dorar ajo y las cebollas picadas, cuando esten doradas y suaves, adicionar pimenton y tomate, dejar rehogar 5 minutos"
        },
        {
          "paso": "6.0",
          "descripcion": "sazonar y rectificar",
          "tiempoMin": 5.0,
          "temperatura": "90°",
          "equipo": "sarten, espatula",
          "observaciones": "cuando el guiso este suave se adiciona, color, zanahoria, arveja, bagre desmenuzado, se mezcla bien y se agrega el arroz crudo, removiendo bien para integrar todo"
        },
        {
          "paso": "7.0",
          "descripcion": "cocinar",
          "tiempoMin": 30.0,
          "temperatura": "90°",
          "equipo": "sarten, espatula",
          "observaciones": "agregar el agua, rectificar sal y dejar hervir, cuando empiece a secar, remover suave, bajar el fuego y tapar hasta que seque completamente."
        },
        {
          "paso": "8.0",
          "descripcion": "acompañar",
          "tiempoMin": 10.0,
          "temperatura": "T°A.",
          "equipo": "Plato plano",
          "observaciones": "acompañar el arroz con; gaucamole suave, suero costeño, ensalada de cebolla y tomate pelado, yuca frita"
        }
      ],
      "calidad": {
        "color": "Notas amarillas suaves",
        "textura": "suelta, liviana",
        "sabor": "fuerte a pescado",
        "aroma": "fresco a cilantro y ajo",
        "temperaturaCoccion": "75 - 95ºc",
        "temperaturaConservacion": "65 - 90°c",
        "presentacion": "Arroz suelto, color uniforme, textura suave",
        "rangos": "60-65ºc / 0-4ºC",
        "tolerancias": "Ligeros cambios de color por calidad de colorey o achiote",
        "criteriosRechazo": "granos duro o sobrecocido, textura pesada, exceso de sal",
        "codigoFicha": "FT-PYM-001",
        "complejidad": "MEDIA",
        "servicio": "Fuerte / almuerzo /evento"
      },
      "observacionesGenerales": "Una vez listo el arroz debe dar como resultado un plato con aroma marcado a pescado, textura suelta y con notas frescas a cilantro y ajo"
    }
  ],
  "preparaciones": [
    {
      "id": "G-AM-001",
      "codigo": "G-AM-001",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "ALMOJABANA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-002",
      "codigo": "G-AM-002",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "ALMOJABANA DE MAIZ",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-003",
      "codigo": "G-AM-003",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "BUÑUELO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-004",
      "codigo": "G-AM-004",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "BUÑUELOS DE VIENTO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-005",
      "codigo": "G-AM-005",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "CACHAPA DE QUESO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-006",
      "codigo": "G-AM-006",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "CACHAPA DULCE",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-007",
      "codigo": "G-AM-007",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "CAKE DE ZANAHORIA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-008",
      "codigo": "G-AM-008",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "CALENTANOS",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-009",
      "codigo": "G-AM-009",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "CROISSANT",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-010",
      "codigo": "G-AM-010",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "DEDITOS DE QUESO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-011",
      "codigo": "G-AM-011",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "ENVUELTOS DE ARROZ",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-012",
      "codigo": "G-AM-012",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "ENVUELTOS DE MAIZ",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-013",
      "codigo": "G-AM-013",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "ENYUCADO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-014",
      "codigo": "G-AM-014",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "GARULLAS",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-015",
      "codigo": "G-AM-015",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "LEUDA DE TRIGO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-016",
      "codigo": "G-AM-016",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "MANTECADA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-017",
      "codigo": "G-AM-017",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "PALITOS DE HOJALDRE Y QUESO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-018",
      "codigo": "G-AM-018",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "PALITROQUES",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-019",
      "codigo": "G-AM-019",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "PAN DE ARROZ",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-020",
      "codigo": "G-AM-020",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "PAN DE CHOCOLATE",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-021",
      "codigo": "G-AM-021",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "PAN DE LA ABUELA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-022",
      "codigo": "G-AM-022",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "PAN DE MAIZ",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-023",
      "codigo": "G-AM-023",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "PAN DE MAIZ (ESTILO SUREÑO)",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-024",
      "codigo": "G-AM-024",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "PAN DE QUESO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-025",
      "codigo": "G-AM-025",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "PAN DE YUCA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-026",
      "codigo": "G-AM-026",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "PANCAKES",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-027",
      "codigo": "G-AM-027",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "PANCAKES DE AVENA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-028",
      "codigo": "G-AM-028",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "PANCAKES DE BANANO Y AVENA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-029",
      "codigo": "G-AM-029",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "PANDEBONO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-030",
      "codigo": "G-AM-030",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "PUDIN DE PAN",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-031",
      "codigo": "G-AM-031",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "QUESADILLAS",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-032",
      "codigo": "G-AM-032",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "REGAÑONAS DE MAZORCA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-033",
      "codigo": "G-AM-033",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "ROSQUITAS",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-034",
      "codigo": "G-AM-034",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "TEQUEÑOS",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-035",
      "codigo": "G-AM-035",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "TORREJA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-036",
      "codigo": "G-AM-036",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "TORTA DE ALMOJABANA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-037",
      "codigo": "G-AM-037",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "TORTA DE MAIZ",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-038",
      "codigo": "G-AM-038",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "TOSTADA FRANCESA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AM-039",
      "codigo": "G-AM-039",
      "categoria": "GUARNICION",
      "subcategoria": "AMASIJO",
      "nombre": "TOSTADAS",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AR-001",
      "codigo": "G-AR-001",
      "categoria": "GUARNICION",
      "subcategoria": "AREPA",
      "nombre": "AREPA ASADA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AR-002",
      "codigo": "G-AR-002",
      "categoria": "GUARNICION",
      "subcategoria": "AREPA",
      "nombre": "AREPA BLANCA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AR-003",
      "codigo": "G-AR-003",
      "categoria": "GUARNICION",
      "subcategoria": "AREPA",
      "nombre": "AREPA DE ANIS Y QUESO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AR-004",
      "codigo": "G-AR-004",
      "categoria": "GUARNICION",
      "subcategoria": "AREPA",
      "nombre": "AREPA DE CHICHARRON",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AR-005",
      "codigo": "G-AR-005",
      "categoria": "GUARNICION",
      "subcategoria": "AREPA",
      "nombre": "AREPA DE CHOCLO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AR-006",
      "codigo": "G-AR-006",
      "categoria": "GUARNICION",
      "subcategoria": "AREPA",
      "nombre": "AREPA DE MAIZ",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AR-007",
      "codigo": "G-AR-007",
      "categoria": "GUARNICION",
      "subcategoria": "AREPA",
      "nombre": "AREPA DE QUESO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AR-008",
      "codigo": "G-AR-008",
      "categoria": "GUARNICION",
      "subcategoria": "AREPA",
      "nombre": "AREPA DE TRIGO Y QUESO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AR-009",
      "codigo": "G-AR-009",
      "categoria": "GUARNICION",
      "subcategoria": "AREPA",
      "nombre": "AREPA DE YUCA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AR-010",
      "codigo": "G-AR-010",
      "categoria": "GUARNICION",
      "subcategoria": "AREPA",
      "nombre": "AREPA FRITA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AR-011",
      "codigo": "G-AR-011",
      "categoria": "GUARNICION",
      "subcategoria": "AREPA",
      "nombre": "AREPA GRANDE ASADA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AR-012",
      "codigo": "G-AR-012",
      "categoria": "GUARNICION",
      "subcategoria": "AREPA",
      "nombre": "AREPA PAISA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AR-013",
      "codigo": "G-AR-013",
      "categoria": "GUARNICION",
      "subcategoria": "AREPA",
      "nombre": "AREPA SANTANDEREANA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AR-014",
      "codigo": "G-AR-014",
      "categoria": "GUARNICION",
      "subcategoria": "AREPA",
      "nombre": "AREPUELAS DE TRIGO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "G-AR-015",
      "codigo": "G-AR-015",
      "categoria": "GUARNICION",
      "subcategoria": "AREPA",
      "nombre": "CACHAPA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-001",
      "codigo": "A-ARR-001",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ",
      "nombre": "BLANCO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-002",
      "codigo": "A-ARR-002",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ AL AJILLO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-003",
      "codigo": "A-ARR-003",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ AL AJONJOLI",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-004",
      "codigo": "A-ARR-004",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ AL COMINO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-005",
      "codigo": "A-ARR-005",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ AL CURRY",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-006",
      "codigo": "A-ARR-006",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ AL HUEVO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-007",
      "codigo": "A-ARR-007",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ AL LIMON",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-008",
      "codigo": "A-ARR-008",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ AL PIMENTON",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-009",
      "codigo": "A-ARR-009",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ AMANECER",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-010",
      "codigo": "A-ARR-010",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ ATOMATADO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-011",
      "codigo": "A-ARR-011",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ CANARIO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-012",
      "codigo": "A-ARR-012",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ CARAMELO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-013",
      "codigo": "A-ARR-013",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ CHAUFA ORIENTAL",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-014",
      "codigo": "A-ARR-014",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ CON CILANTRO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-015",
      "codigo": "A-ARR-015",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ CON FIDEOS",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-016",
      "codigo": "A-ARR-016",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ CON JAMON Y CEBOLLA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-017",
      "codigo": "A-ARR-017",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ CON MAIZ",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-018",
      "codigo": "A-ARR-018",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ CON PAPA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-019",
      "codigo": "A-ARR-019",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ CON PASAS Y MANZANA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-020",
      "codigo": "A-ARR-020",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ AL PEREJIL",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-021",
      "codigo": "A-ARR-021",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ CON PIMENTON Y PEREJIL",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-022",
      "codigo": "A-ARR-022",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ CON QUESO Y CIMARRON",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-023",
      "codigo": "A-ARR-023",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ CON VERDURAS",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-024",
      "codigo": "A-ARR-024",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ CON ZANAHORIA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-025",
      "codigo": "A-ARR-025",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ CON ZANAHORIA Y ARVEJA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-026",
      "codigo": "A-ARR-026",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ FRITO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-027",
      "codigo": "A-ARR-027",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ NACARADO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-028",
      "codigo": "A-ARR-028",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ ORIENTAL",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-029",
      "codigo": "A-ARR-029",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ PAJARITO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-030",
      "codigo": "A-ARR-030",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "ARROZ VERDE",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "A-ARR-031",
      "codigo": "A-ARR-031",
      "categoria": "GUARNICION",
      "subcategoria": "ARROZ C.",
      "nombre": "PETTITE POIS (CON ARVEJAS)",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BC-001",
      "codigo": "B-BC-001",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA CALIENTE",
      "nombre": "AGUADEPANELA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BC-002",
      "codigo": "B-BC-002",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA CALIENTE",
      "nombre": "AVENA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BC-003",
      "codigo": "B-BC-003",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA CALIENTE",
      "nombre": "CAFÉ",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BC-004",
      "codigo": "B-BC-004",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA CALIENTE",
      "nombre": "CAFÉ CON LECHE",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BC-005",
      "codigo": "B-BC-005",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA CALIENTE",
      "nombre": "CHOCOLATE",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BC-006",
      "codigo": "B-BC-006",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA CALIENTE",
      "nombre": "MAIZENA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BC-007",
      "codigo": "B-BC-007",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA CALIENTE",
      "nombre": "TETERO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-001",
      "codigo": "B-BF-001",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "AGUA DE VIDA FRUTAL",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-002",
      "codigo": "B-BF-002",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "AVENA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-003",
      "codigo": "B-BF-003",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE DURAZNO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-004",
      "codigo": "B-BF-004",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE FEIJOA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-005",
      "codigo": "B-BF-005",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE FRESA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-006",
      "codigo": "B-BF-006",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE FRUTOS ROJOS",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-007",
      "codigo": "B-BF-007",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE GUANABANA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-008",
      "codigo": "B-BF-008",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "GUARAPO PIÑA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-009",
      "codigo": "B-BF-009",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE GUAYABA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-010",
      "codigo": "B-BF-010",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO SIN AZUCAR",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-011",
      "codigo": "B-BF-011",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "LIMONADA DE AZUCAR",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-012",
      "codigo": "B-BF-012",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "LIMONADA DE COCO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-013",
      "codigo": "B-BF-013",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "LIMONADA DE PANELA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-014",
      "codigo": "B-BF-014",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE LULO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-015",
      "codigo": "B-BF-015",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE MANDARINA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-016",
      "codigo": "B-BF-016",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE MANGO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-017",
      "codigo": "B-BF-017",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE MANZANA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-018",
      "codigo": "B-BF-018",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE MARACUMANGO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-019",
      "codigo": "B-BF-019",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE MARACUYA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-020",
      "codigo": "B-BF-020",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "MASATO DE ARROZ",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-021",
      "codigo": "B-BF-021",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE MORA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-022",
      "codigo": "B-BF-022",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE NARANJA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-023",
      "codigo": "B-BF-023",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE NARANJAPIÑA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-024",
      "codigo": "B-BF-024",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "PANELAZO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-025",
      "codigo": "B-BF-025",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE PAPAYA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-026",
      "codigo": "B-BF-026",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE PERA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-027",
      "codigo": "B-BF-027",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE PIÑA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-028",
      "codigo": "B-BF-028",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE TAMARINDO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-029",
      "codigo": "B-BF-029",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "TE DE JAMAICA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-030",
      "codigo": "B-BF-030",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "TÉ DE PIÑA Y JENGIBRE",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-031",
      "codigo": "B-BF-031",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "TE HELADO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-032",
      "codigo": "B-BF-032",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "TE ISLEÑO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-033",
      "codigo": "B-BF-033",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE TOMATE DE ARBOL",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-034",
      "codigo": "B-BF-034",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO TROPICAL",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "B-BF-035",
      "codigo": "B-BF-035",
      "categoria": "BEBIDAS",
      "subcategoria": "BEBIDA FRIA",
      "nombre": "JUGO DE UVA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-001",
      "codigo": "SC-CL-001",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO CAMPESINO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-002",
      "codigo": "SC-CL-002",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO DE BAGRE",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-003",
      "codigo": "SC-CL-003",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO DE CARNE",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-004",
      "codigo": "SC-CL-004",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO DE CARNE Y PASTA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-005",
      "codigo": "SC-CL-005",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO DE COSTILLA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-006",
      "codigo": "SC-CL-006",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO DE FIDEOS",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-007",
      "codigo": "SC-CL-007",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO DE GALLINA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-008",
      "codigo": "SC-CL-008",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO DE HUESO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-009",
      "codigo": "SC-CL-009",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO DE HUEVO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-010",
      "codigo": "SC-CL-010",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO DE MENUDENCIAS",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-011",
      "codigo": "SC-CL-011",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO DE PAPA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-012",
      "codigo": "SC-CL-012",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO DE PAPA Y HUEVO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-013",
      "codigo": "SC-CL-013",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO DE PESCADO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-014",
      "codigo": "SC-CL-014",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO DE POLLO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-015",
      "codigo": "SC-CL-015",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO DE POLLO Y PASTA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-016",
      "codigo": "SC-CL-016",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO DE VISCERAS",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-017",
      "codigo": "SC-CL-017",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CALDO MIXTO",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-018",
      "codigo": "SC-CL-018",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CHANFAINA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-019",
      "codigo": "SC-CL-019",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CHANGUA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-020",
      "codigo": "SC-CL-020",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CHANGUA SANTAFEREÑA",
      "estado": "Activo",
      "observaciones": ""
    },
    {
      "id": "SC-CL-021",
      "codigo": "SC-CL-021",
      "categoria": "SOPAS Y CREMAS",
      "subcategoria": "CALDO",
      "nombre": "CONSOME DE FIDEOS",
      "estado": "Activo",
      "observaciones": ""
    }
  ],
  "mermas": []
};

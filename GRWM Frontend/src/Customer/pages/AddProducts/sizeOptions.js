const getSizeOptions = () => {
  const selectedCat = categories.find(
    (cat) => cat._id === productDetails.category
  );
  const selectedSubcat = subcategories.find(
    (sub) => sub._id === productDetails.subcategory
  );

  if (!selectedCat) return []; // If category not selected yet

  const categoryName = selectedCat?.categoryName?.toLowerCase() || "";
  const subcategoryName = selectedSubcat?.subcategoryName?.toLowerCase() || "";

  // All possible keywords grouped smartly
  const clothingKeywords = [
    "clothing",
    "activewear",
    "outerwear",
    "dresses",
    "sleepwear",
    "loungewear",
    "swimwear",
    "sportswear",
    "casualwear",
    "athleisure",
    "streetwear",
    "formalwear",
    "winterwear",
    "suits",
    "jackets",
    "hoodies",
    "blazers",
    "shirts",
    "t-shirts",
    "tops",
    "pants",
    "trousers",
    "jeans",
    "shorts",
    "skirts",
    "coats",
    "overcoats",
    "sweaters",
    "vests",
    "jumpsuits",
    "rompers",
    "bodysuits",
    "leggings",
    "kurtas",
    "sarees",
    "ethnicwear",
    "blouses",
    "shrugs",
    "coverups",
    "tunics",
  ];

  const footwearKeywords = [
    "footwear",
    "shoes",
    "sneakers",
    "boots",
    "heels",
    "sandals",
    "slippers",
    "loafers",
    "moccasins",
    "derbys",
    "brogues",
    "flip-flops",
    "wedges",
    "flats",
    "pumps",
    "oxfords",
    "trainers",
    "sports shoes",
    "running shoes",
    "formal shoes",
  ];

  const accessoriesKeywords = [
    "accessories",
    "belts",
    "hats",
    "scarves",
    "gloves",
    "ties",
    "suspenders",
    "cufflinks",
    "wallets",
    "caps",
    "mufflers",
    "keychains",
    "watch",
    "sunglasses",
    "glasses",
    "eyewear",
    "brooches",
  ];

  const jewelryKeywords = [
    "jewelry",
    "rings",
    "earrings",
    "necklaces",
    "bracelets",
    "bangles",
    "anklets",
    "pendants",
    "chains",
    "charms",
  ];

  const bagsKeywords = [
    "bags",
    "handbags",
    "backpacks",
    "clutches",
    "totes",
    "laptop bags",
    "duffle bags",
    "messenger bags",
    "wallets",
    "sling bags",
  ];

  const bookKeywords = [
    "books",
    "book",
    "magazine",
    "comic",
    "comics",
    "novel",
    "literature",
    "biography",
    "autobiography",
    "guidebook",
    "encyclopedia",
    "journal",
  ];

  // Matching logic:
  const matches = (keywords) =>
    keywords.some(
      (keyword) =>
        categoryName.includes(keyword) || subcategoryName.includes(keyword)
    );

  if (matches(clothingKeywords)) {
    return ["XS", "S", "M", "L", "XL", "XXL", "Other"];
  }

  if (matches(footwearKeywords)) {
    if (subcategoryName.includes("men")) {
      return [
        "EU 39",
        "EU 40",
        "EU 41",
        "EU 42",
        "EU 43",
        "EU 44",
        "EU 45",
        "EU 46",
        "EU 47",
        "EU 48",
        "Other",
      ];
    } else if (subcategoryName.includes("women")) {
      return [
        "EU 35",
        "EU 36",
        "EU 37",
        "EU 38",
        "EU 39",
        "EU 40",
        "EU 41",
        "EU 42",
        "Other",
      ];
    }
    return [
      "EU 35",
      "EU 36",
      "EU 37",
      "EU 38",
      "EU 39",
      "EU 40",
      "EU 41",
      "EU 42",
      "EU 43",
      "EU 44",
      "Other",
    ];
  }

  if (matches(accessoriesKeywords)) {
    return ["One Size", "N/A"];
  }

  if (matches(jewelryKeywords)) {
    return ["One Size", "N/A"];
  }

  if (matches(bagsKeywords)) {
    return ["One Size", "N/A"];
  }

  if (matches(bookKeywords)) {
    return ["N/A"];
  }

  // Default fallback
  return ["Other"];
};

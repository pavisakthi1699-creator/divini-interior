import { toast } from "sonner";

const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'the-elite-canvas-dcd0l.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = '45e364f4ddbe67f6ac85f527f380ce9c';

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  try {
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (response.status === 402) {
      console.warn("Shopify: Payment required. Falling back to showcase products.");
      return getMockData(query, variables);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
    }

    return data;
  } catch (error) {
    console.error("Shopify storefront request failed. Falling back to showcase products:", error);
    return getMockData(query, variables);
  }
}


export const STOREFRONT_PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

export const STOREFRONT_PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      handle
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
    }
  }
`;

// Cart mutations
export const CART_QUERY = `
  query cart($id: ID!) {
    cart(id: $id) { id totalQuantity }
  }
`;

export const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set('channel', 'online_store');
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function isCartNotFoundError(userErrors: Array<{ field: string[] | null; message: string }>): boolean {
  return userErrors.some(e => e.message.toLowerCase().includes('cart not found') || e.message.toLowerCase().includes('does not exist'));
}

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

export async function createShopifyCart(item: CartItem): Promise<{ cartId: string; checkoutUrl: string; lineId: string } | null> {
  const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
  });

  if (data?.data?.cartCreate?.userErrors?.length > 0) {
    console.error('Cart creation failed:', data.data.cartCreate.userErrors);
    return null;
  }

  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;

  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;

  return { cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
}

export async function addLineToShopifyCart(cartId: string, item: CartItem): Promise<{ success: boolean; lineId?: string; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });

  const userErrors = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) return { success: false };

  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find((l: { node: { id: string; merchandise: { id: string } } }) => l.node.merchandise.id === item.variantId);
  return { success: true, lineId: newLine?.node?.id };
}

export async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  const userErrors = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) return { success: false };
  return { success: true };
}

export async function removeLineFromShopifyCart(cartId: string, lineId: string): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });

  const userErrors = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) return { success: false };
  return { success: true };
}

// ==========================================
// Showcase / Mock Products Fallback Database
// ==========================================

const MOCK_PRODUCTS = [
  {
    id: "gid://shopify/Product/1",
    title: "The Aurelia Velvet Sofa",
    description: "Indulge in the plush comfort of the Aurelia Velvet Sofa. Upholstered in premium cotton velvet with deep tufting and solid brass legs, this piece is the epitome of living room opulence.",
    handle: "aurelia-velvet-sofa",
    priceRange: {
      minVariantPrice: {
        amount: "145000",
        currencyCode: "INR"
      }
    },
    compareAtPrice: {
      amount: "175000"
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
            altText: "The Aurelia Velvet Sofa"
          }
        }
      ]
    },
    options: [
      { name: "Color", values: ["Emerald Green", "Royal Blue", "Charcoal"] }
    ],
    tags: ["featured", "sale"]
  },
  {
    id: "gid://shopify/Product/2",
    title: "Celeste Marble Coffee Table",
    description: "Crafted from hand-selected Italian Carrara marble, the Celeste Coffee Table features a soft honed finish and a minimalist geometric iron base. Each piece is unique.",
    handle: "celeste-marble-coffee-table",
    priceRange: {
      minVariantPrice: {
        amount: "68000",
        currencyCode: "INR"
      }
    },
    compareAtPrice: {
      amount: "377000"
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80",
            altText: "Celeste Marble Coffee Table"
          }
        }
      ]
    },
    options: [
      { name: "Material", values: ["Carrara Marble", "Nero Marquina"] }
    ],
    tags: ["featured"]
  },
  {
    id: "gid://shopify/Product/3",
    title: "Helios Brass Pendant Light",
    description: "Inspired by the radiant sun, the Helios Pendant Light features hand-brushed brass panels that reflect a warm, golden glow. Ideal for dining spaces.",
    handle: "helios-brass-pendant-light",
    priceRange: {
      minVariantPrice: {
        amount: "32500",
        currencyCode: "INR"
      }
    },
    compareAtPrice: {
      amount: "120000"
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
            altText: "Helios Brass Pendant Light"
          }
        }
      ]
    },
    options: [
      { name: "Size", values: ["Medium", "Large"] }
    ],
    tags: ["featured"]
  },
  {
    id: "gid://shopify/Product/4",
    title: "Kensington Oak Dining Chair",
    description: "A perfect blend of mid-century aesthetics and modern durability. Made from solid white oak with a hand-woven paper cord seat for ergonomic support.",
    handle: "kensington-oak-dining-chair",
    priceRange: {
      minVariantPrice: {
        amount: "18900",
        currencyCode: "INR"
      }
    },
    compareAtPrice: {
      amount: "82000"
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
            altText: "Kensington Oak Dining Chair"
          }
        }
      ]
    },
    options: [
      { name: "Finish", values: ["Natural Oak", "Ebonized Oak"] }
    ],
    tags: ["sale"]
  },
  {
    id: "gid://shopify/Product/5",
    title: "Solitude Hand-Woven Wool Rug",
    description: "Hand-knotted in Rajasthan using premium New Zealand wool, the Solitude rug features subtle organic texture and a soothing neutral palette.",
    handle: "solitude-hand-woven-wool-rug",
    priceRange: {
      minVariantPrice: {
        amount: "85000",
        currencyCode: "INR"
      }
    },
    compareAtPrice: {
      amount: "223000"
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80",
            altText: "Solitude Hand-Woven Wool Rug"
          }
        }
      ]
    },
    options: [
      { name: "Size", values: ["8x10 ft", "9x12 ft"] }
    ],
    tags: ["featured"]
  },
  {
    id: "gid://shopify/Product/6",
    title: "Valeria Ceramic Vases (Set of 3)",
    description: "Sculptural vases made from raw textured stoneware with a matte white glaze. Perfect for styling bookshelves or dining tables.",
    handle: "valeria-ceramic-vases-set",
    priceRange: {
      minVariantPrice: {
        amount: "12500",
        currencyCode: "INR"
      }
    },
    compareAtPrice: {
      amount: "25000"
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80",
            altText: "Valeria Ceramic Vases (Set of 3)"
          }
        }
      ]
    },
    options: [
      { name: "Style", values: ["Classic Set"] }
    ],
    tags: ["sale"]
  },
  {
    id: "gid://shopify/Product/7",
    title: "Monolith Travertine Side Table",
    description: "Carved from premium beige travertine, this side table celebrates raw, earthy beauty with its natural pores and monolithic block design.",
    handle: "monolith-travertine-side-table",
    priceRange: {
      minVariantPrice: {
        amount: "42000",
        currencyCode: "INR"
      }
    },
    compareAtPrice: {
      amount: "70000"
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=80",
            altText: "Monolith Travertine Side Table"
          }
        }
      ]
    },
    options: [
      { name: "Finish", values: ["Polished", "Honed"] }
    ],
    tags: ["featured"]
  },
  {
    id: "gid://shopify/Product/8",
    title: "Elysian Silk Cushions",
    description: "Spun from mulberry silk with a subtle sheen, these cushions add a layer of soft elegance to any sofa or bedding arrangement.",
    handle: "elysian-silk-cushions",
    priceRange: {
      minVariantPrice: {
        amount: "6800",
        currencyCode: "INR"
      }
    },
    compareAtPrice: {
      amount: "15000"
    },
    images: {
      edges: [
        {
          node: {
            url: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
            altText: "Elysian Silk Cushions"
          }
        }
      ]
    },
    options: [
      { name: "Color", values: ["Champagne", "Sage Green", "Terracotta"] }
    ],
    tags: ["sale"]
  }
];

function getProductWithVariants(p: typeof MOCK_PRODUCTS[0]) {
  const primaryOption = p.options[0];
  const optionName = primaryOption?.name || "Size";
  const optionValues = primaryOption?.values || ["Standard"];

  const variantEdges = optionValues.map((val, idx) => {
    // Solitude Wool Rug (Product 5) is sold out to demonstrate "SOLD OUT" state
    const availableForSale = p.id !== "gid://shopify/Product/5";

    return {
      node: {
        id: `gid://shopify/ProductVariant/${p.id.split('/').pop()}_var_${idx}`,
        title: val,
        price: {
          amount: p.priceRange.minVariantPrice.amount,
          currencyCode: p.priceRange.minVariantPrice.currencyCode
        },
        compareAtPrice: p.compareAtPrice ? {
          amount: p.compareAtPrice.amount,
          currencyCode: p.priceRange.minVariantPrice.currencyCode
        } : null,
        availableForSale,
        selectedOptions: [
          {
            name: optionName,
            value: val
          }
        ]
      }
    };
  });

  return {
    ...p,
    variants: {
      edges: variantEdges
    }
  };
}

function getMockData(query: string, variables: Record<string, unknown>) {
  const queryStr = query.toLowerCase();

  // 1. GetProducts query
  if (queryStr.includes("getproducts")) {
    const filterQuery = (variables.query as string || "").toLowerCase();
    let filtered = MOCK_PRODUCTS;

    if (filterQuery.includes("tag:sale") || filterQuery.includes("tag:discount")) {
      filtered = MOCK_PRODUCTS.filter(p => p.tags.includes("sale"));
    }

    const edges = filtered.map(p => ({
      node: getProductWithVariants(p)
    }));

    return {
      data: {
        products: {
          edges
        }
      }
    };
  }

  // 2. GetProductByHandle query
  if (queryStr.includes("getproductbyhandle")) {
    const handle = variables.handle as string;
    const product = MOCK_PRODUCTS.find(p => p.handle === handle);
    return {
      data: {
        productByHandle: product ? getProductWithVariants(product) : null
      }
    };
  }

  // 3. Cart mutations and queries
  if (queryStr.includes("cartcreate")) {
    const input = variables.input as any;
    const merchandiseId = input?.lines?.[0]?.merchandiseId || "mock-variant-1";
    return {
      data: {
        cartCreate: {
          cart: {
            id: "mock-cart-id",
            checkoutUrl: "mock-checkout",
            lines: {
              edges: [
                {
                  node: {
                    id: `mock-line-id-${merchandiseId}`,
                    merchandise: { id: merchandiseId }
                  }
                }
              ]
            }
          },
          userErrors: []
        }
      }
    };
  }

  if (queryStr.includes("cartlinesadd")) {
    const lines = variables.lines as any[];
    const merchandiseId = lines?.[0]?.merchandiseId || "mock-variant-1";
    return {
      data: {
        cartLinesAdd: {
          cart: {
            id: variables.cartId || "mock-cart-id",
            lines: {
              edges: [
                {
                  node: {
                    id: `mock-line-id-${merchandiseId}`,
                    merchandise: { id: merchandiseId }
                  }
                }
              ]
            }
          },
          userErrors: []
        }
      }
    };
  }

  if (queryStr.includes("cartlinesupdate")) {
    return {
      data: {
        cartLinesUpdate: {
          cart: { id: variables.cartId || "mock-cart-id" },
          userErrors: []
        }
      }
    };
  }

  if (queryStr.includes("cartlinesremove")) {
    return {
      data: {
        cartLinesRemove: {
          cart: { id: variables.cartId || "mock-cart-id" },
          userErrors: []
        }
      }
    };
  }

  if (queryStr.includes("query cart")) {
    return {
      data: {
        cart: {
          id: variables.id || "mock-cart-id",
          totalQuantity: 1
        }
      }
    };
  }

  return {
    data: {}
  };
}


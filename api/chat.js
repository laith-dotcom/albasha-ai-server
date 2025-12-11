export default async function handler(req, res) {
  try {
    const { lines } = req.body;

    const cartRes = await fetch(
      `https://${process.env.SHOP_DOMAIN}/api/2023-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token":
            process.env.SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: `
            mutation CreateCart($lines: [CartLineInput!]!) {
              cartCreate(input: { lines: $lines }) {
                cart {
                  id
                  checkoutUrl
                  lines(first: 10) {
                    edges {
                      node {
                        id
                        quantity
                        merchandise {
                          ... on ProductVariant {
                            id
                            title
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { lines },
        }),
      }
    );

    const data = await cartRes.json();
    res.status(200).json(data.data.cartCreate.cart.checkoutUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Cart creation error" });
  }
}

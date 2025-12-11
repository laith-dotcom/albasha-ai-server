export default async function handler(req, res) {
  try {
    const query = req.query.q || "";

    const shopRes = await fetch(
      `https://${process.env.SHOP_DOMAIN}/api/2023-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN
        },
        body: JSON.stringify({
          query: `
            query($query: String!) {
              products(first: 10, query: $query) {
                nodes {
                  id
                  title
                  description
                  images(first: 1) { url }
                  variants(first: 1) {
                    id
                    price { amount }
                  }
                }
              }
            }
          `,
          variables: { query }
        })
      }
    );

    const data = await shopRes.json();
    res.status(200).json(data.data.products.nodes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Product search error" });
  }
}
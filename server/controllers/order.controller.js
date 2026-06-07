import orderService from "../services/orderService.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const createCheckOutSeccssion = asyncHandler(async (req, res) => {
  const { products } = req.body;

  if (!Array.isArray(products)) {
    return res.status(401).json({
      message: "Empty products",
    });
  }
  const totalAmount = 0;
  const linteItem = products.map((product) => {
    const amount = Math.random(product.price * 100);
    totalAmount += amount * product.quantity;

    return {
      product_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          image: [product.image],
        },
        unit_amount: amount,
      },
      quantity: product.quantity || 1,
    };
  });

  const session = await stripe.checkout.session.create({
    payment_method_types: ["card"],
    line_items: linteItem,
    mode: "payment",
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&orderId=${orderId}`,
    cancel_url: `${cancelUrl}?orderId=${orderId}`,
    metadata: { userId:req.user._id.toString(),

        products:JSON.stringify(
            products.map((p)=>{
                id:p._id,
                quantity:p.quantity,
                price:p.price,
            })
        )
     },
  });
});

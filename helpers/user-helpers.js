const bcrypt = require("bcrypt");
const userModel = require("../model/user-model");
const Product = require("../model/product.js");
const Cart = require("../model/cart.js");
const Banner = require("../model/banner");
const Coupon = require("../model/coupon");
const { Order, Address, OrderItem } = require("../model/order.js");
const Wishlist = require("../model/wishlist.js");
const moment = require("moment/moment");

// const Address = require('../model/order.js')

module.exports = {
  doSignup: (body) => {
    return new Promise(async (resolve, reject) => {
      try {
        bcrypt.hash(body.password, 10, async (err, hash) => {
          if (err) {
            return reject(err);
          } else {
            const newUser = new userModel({
              name: body.name,
              number: body.number,
              email: body.email,
              password: hash,
            });
            await newUser.save();
            resolve(newUser);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },
  getmobileNumber: async (mobNumber) => {
    try {
      const User = await userModel.findOne({ number: mobNumber });
      if (User) {
        console.log(User);
        return User;
      } else {
        return User;
      }
    } catch {
      console.log(err);
    }
  },
  getOneUser: async (id) => {
    try {
      const User = await userModel.findOne({ _id: id });
      if (User) {
        console.log(User);
        return User;
      } else {
        return User;
      }
    } catch {
      console.log(err);
    }
  },
  updatePassword: async (userId, password) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await userModel.findByIdAndUpdate(userId, { password: hashedPassword });
    } catch (error) {
      console.log(error);
    }
  },
  getProductDetails: async (slug, userId) => {
    try {
      const product = await Product.findOne({ slug: slug });
      if (!product) {
        throw new Error("product not found");
      }
      const cart = await Cart.findOne({
        user: userId,
        "products.productId": product._id,
      });
      if (cart) {
        product.isInCart = true;
      } else {
        product.isInCart = false;
      }
      return product;
    } catch (err) {
      console.log(err);
    }
  },
  getCartProducts: async (userId) => {
    try {
      const cart = await Cart.findOne({ user: userId }).populate(
        "products.productId"
      );
      if (!cart || cart.products.length <= 0) {
        return null;
      }
      const cartItems = cart.products.map((item) => {
        const { productId, quantity } = item;
        const { _id, productName, productModel, productPrice, productImage } =
          productId;

        const totalPrice = productPrice * quantity;
        return {
          item: _id,
          quantity,
          totalPrice,
          product: {
            _id,
            productName,
            productModel,
            productPrice,
            productImage,
          },
        };
      });
      let subtotal = 0;
      cartItems.forEach((item) => {
        subtotal += item.product.productPrice * item.quantity;
      });
      return { cartItems, subtotal };
    } catch (err) {
      console.log(err);
      throw new Error("error getting cart products");
    }
  },
  //*banner list  *//
  getListedBanner: async () => {
    try {
      const banners = await Banner.find(
        { status: true },
        { image: 1, _id: 0, headline: 1, additionalInfo: 1 }
      );
      console.log(banners);
      return banners;
    } catch (err) {
      console.error(err);
    }
  },
  addToCart: async (productId, userId) => {
    console.log(productId, "productid");
    console.log(userId, "userid");
    try {
      const isProductExist = await Cart.findOne({
        user: userId,

        "products.productId": productId,
      });
      console.log(isProductExist, "llllllllllllllllllllllllll");

      if (isProductExist) {
        console.log(userId, productId, "jjjjjjjjjjjjjjjjjjjjjjj");

        await Cart.updateOne(
          { user: userId, "products.productId": productId },
          { $inc: { "products.$.quantity": 1 } }
        );
      } else {
        await Cart.updateOne(
          { user: userId },
          { $push: { products: { productId, quantity: 1 } } },
          { upsert: true }
        );
      }
    } catch (err) {
      console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");

      console.log(err);
    }
  },
  getCartCount: async (userId) => {
    try {
      const cartCount = await Cart.findOne({ user: userId });
      const productCount = cartCount?.products.length;
      return productCount;
    } catch (err) {
      console.log(err);
    }
  },
  updateQuantity: async (userId, productId, count) => {
    try {
      const cart = await Cart.findOne({ user: userId });
      const product = cart.products.find(
        (p) => p.productId.toString() === productId
      );
      if (!product) {
        throw new Error("Product not found in cart");
      }
      // Calculate new quantity
      const newQuantity = product.quantity + parseInt(count);

      if (newQuantity < 0) {
        return false;
      }

      // Update product quantity in the database
      const productToUpdate = await Product.findById(productId);
      const updatedProductQuantity =
        count === "1"
          ? productToUpdate.productQuantity - 1
          : productToUpdate.productQuantity + 1;

      if (updatedProductQuantity < 0) {
        return false;
      }

      if (newQuantity === 0) {
        // If new quantity is 0, remove product from cart
        await Cart.findOneAndUpdate(
          { user: userId },
          { $pull: { products: { productId: productId } } },
          { new: true }
        );
      } else {
        // Otherwise, update product quantity in cart and save cart
        cart.products.id(product._id).quantity = newQuantity;
        await cart.save();
      }

      await Product.findByIdAndUpdate(productId, {
        $set: { productQuantity: updatedProductQuantity },
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  removeProductFromCart: async ({ cart, product }) => {
    try {
      const cartDoc = await Cart.findOne({ user: cart }); // Find the cart document
      if (!cartDoc) {
        throw new Error("Cart not found");
      }
      // Find the product document
      const productDoc = await Product.findById(product);
      console.log(productDoc);
      if (!productDoc) {
        throw new Error("Product not found");
      }

      // // Find the index of the product in the cart
      const productIndex = cartDoc.products.findIndex(
        (p) => p.productId.toString() === product
      );
      // console.log(productIndex);

      if (productIndex === -1) {
        throw new Error("Product not found in cart");
      }
      // Remove the product from the cart
      cartDoc.products.splice(productIndex, 1);
      await cartDoc.save();
      return;
    } catch (err) {
      console.error(err);
    }
  },
  getAddress: async (userId) => {
    try {
      const isAddressExit = await Address.find({ user_id: userId }).sort({
        default_adress: -1,
      });
      if (isAddressExit) {
        return isAddressExit;
      }
      return isAddressExit;
    } catch (err) {
      console.log(err);
    }
  },
  getDefaultAddress: async (userId) => {
    try {
      const address = await Address.find({ user_id: userId });
      return address.find((item) => {
        return item.default_address == true;
      });
    } catch (err) {
      console.log(err);
    }
  },
  addAddressPost: async (userId, address) => {
    try {
      const newAddress = new Address({
        full_name: address.name,
        street_name: address.Streetaddress,
        apartment_number: address.appartments,
        city: address.city,
        state: address.state,
        postal_code: address.postalcode,
        mobile_Number: address.mobileNumber,
        user_id: userId,
      });

      await newAddress.save();
    } catch (err) {
      console.error(err);
    }
  },
  updateAddress: async (id, userId) => {
    try {
      await Address.updateMany(
        { user_id: userId },
        { default_address: false },
        { upsert: true, new: true }
      );
      await Address.findByIdAndUpdate(
        id,
        { default_address: true },
        { new: true }
      );
    } catch (err) {
      console.error(err);
    }
  },
  deleteAddress: async (id) => {
    try {
      const deletedAddress = await Address.findByIdAndDelete(id);
      return deletedAddress;
    } catch (err) {
      console.log(err);
    }
  },
  changeOnlinePaymentStatus: async (orderId, userId) => {
    try {
      const order = await Order.findById(orderId);
      const orderItems = order?.items;
      await Promise.all(
        orderItems.map(async (item) => {
          const product = await Product.findById(item.product_id);
          if (product) {
            // Add returned quantity to product quantity
            product.productQuantity -= item.quantity;
            await product.save();
          }
        })
      );
      await Order.findByIdAndUpdate(
        orderId,
        {
          payment_status: "paid",
          order_status: "Placed",
        },
        {
          new: true,
        }
      );
      await Cart.deleteMany({ user: userId });
    } catch (err) {
      console.error(err);
    }
  },
  placeOrder: async (
    userId,
    paymentMethod,
    totalAmount,
    couponCode,
    address
  ) => {
    try {
      let id = address?.addressId;

      if (id) {
        const isAddressExist = await Address.findById(id);

        if (isAddressExist) {
          isAddressExist.full_name = address.name;
          isAddressExist.street_name = address.Streetaddress;
          isAddressExist.apartment_number = address.appartments;
          isAddressExist.city = address.city;
          isAddressExist.state = address.state;
          isAddressExist.postal_code = address.postalcode;
          isAddressExist.mobile_Number = address.mobileNumber;

          await isAddressExist.save();
        }
      }
      //create new  address
      else {
        const newAddress = new Address({
          user_id: userId,
          full_name: address.name,
          street_name: address.Streetaddress,
          apartment_number: address.appartments,
          city: address.city,
          state: address.state,
          postal_code: address.postalcode,
          mobile_Number: address.mobileNumber,
          default_address: true,
        });

        const response = await newAddress.save();

        id = response._id;
      }

      const cart = await Cart.findOne({ user: userId }).populate(
        "products.productId"
      );

      const cartItems = cart.products.map((item) => {
        const { productId, quantity } = item;
        const { _id, productName, productModel, productPrice, productImage } =
          productId;
        const totalPrice = productPrice * quantity;
        return {
          item: _id,
          quantity,
          totalPrice,
          product: {
            _id,
            productName,
            productModel,
            productPrice,
            productImage,
          },
        };
      });

      //extracting totalamount
      let subtotal = 0;
      if (isNaN(totalAmount)) {
        cartItems.forEach((item) => {
          subtotal += item.product.productPrice * item.quantity;
        });
      } else {
        subtotal = totalAmount;
        const coupon = await Coupon.findOne({ code: couponCode });
        if (coupon) {
          coupon.usedBy.push(userId);
          await coupon.save();
        }
      }

      // Create a new order

      let status = "";
      if (paymentMethod === "cash_on_delivery") {
        status = "Placed";
      } else if (paymentMethod === "wallet") {
        const User = await userModel.findById(userId);

        if (User.wallet >= subtotal) {
          User.wallet -= parseInt(subtotal);
          await User.save();
          status = "Placed";
          var paymentStatus = "paid";
        } else {
          status = "Payment Pending";
        }
      } else if (paymentMethod == "online_payment") {
        status = "paid";
        const newOrder = new Order({
          user_id: userId,
          total_amount: subtotal,
          address: id,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          order_status: status,
          items: [],
        });

        const orderedItems = await Promise.all(
          cartItems.map(async (item) => {
            const orderedItem = new OrderItem({
              productName: item.product.productName,
              product_id: item.product._id,
              quantity: item.quantity,
              unit_price: item.totalPrice,
            });
            await orderedItem.save();
            return orderedItem;
          })
        );

        newOrder.items = newOrder.items.concat(orderedItems);

        // Save the new order to the database
        const savedOrder = await newOrder.save();
        return savedOrder;
      }

      const newOrder = new Order({
        user_id: userId,
        total_amount: subtotal,
        address: id,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        order_status: status,
        items: [],
      });

      const orderedItems = await Promise.all(
        cartItems.map(async (item) => {
          const orderedItem = new OrderItem({
            productName: item.product.productName,
            product_id: item.product._id,
            quantity: item.quantity,
            unit_price: item.totalPrice,
          });
          await orderedItem.save();

          // Update product quantity in product collection
          const product = await Product.findById(item.product._id);
          if (product) {
            // Subtract ordered quantity from product quantity
            product.productQuantity -= item.quantity;
            await product.save();
          }

          return orderedItem;
        })
      );

      newOrder.items = newOrder.items.concat(orderedItems);

      // Save the new order to the database
      const savedOrder = await newOrder.save();

      await Cart.deleteMany({ user: userId });

      return savedOrder;
    } catch (err) {
      console.error(err);
    }
  },
  getOrderHistory: async (userId) => {
    try {
      const orders = await Order.find({ user_id: userId })
        .populate("address")
        .populate("items.product_id")
        .exec();
      if (orders.length === 0) {
        console.log("No orders found for user", userId);
      }
      return orders;
    } catch (err) {
      console.error(err);
    }
  },
  cancelOrder: async (orderId) => {
    console.log("order id:", orderId);
    try {
      await Order.updateOne(
        { _id: orderId },
        { $set: { order_status: "Cancelled" } }
      );

      // Retrieve updated order
      const order = await Order.findOne({ _id: orderId });
      console.log("+++++++++++++++++++++++++", order);

      // Retrieve user
      const userId = order.user_id;

      const User = await userModel.findOne({ _id: userId });
      console.log("cancel ***********************", userModel);

      // Update user's wallet balance (if payment method is 'onlinePayment')

      if (User.wallet) {
        console.log("wallet", User.wallet);
        User.wallet += order.total_amount;
      } else {
        User.wallet = order.total_amount;
      }
      await User.save(); // Save updated user object
    } catch (err) {
      console.log("helper cancel error");
      console.error(err);
    }
  },
  returnOrder: async (orderId, reason) => {
    try {
      await Order.updateMany(
        { _id: orderId },
        {
          $set: {
            order_status: "Returned",
            return_status: "pending",
            return_reason: reason,
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  },
  getUserWalletAmount: async (userId) => {
    try {
      const User = await userModel.findByIdAndUpdate(userId);
      return User.wallet;
    } catch (err) {
      console.log(err);
    }
  },
  getCoupons: async (userId) => {
    try {
      const coupons = await Coupon.find();
      const unusedCouponsWithDaysRemaining = coupons
        .filter((coupon) => !coupon.usedBy.includes(userId)) // Filter out coupons with usedBy field
        .map((coupon) => {
          const current_date = moment();
          const expiration_date = moment(coupon.expirationDate);
          coupon.days_remaining = expiration_date.diff(current_date, "days");
          return coupon;
        });
      return unusedCouponsWithDaysRemaining;
    } catch (err) {
      console.error(err);
    }
  },
  applyCoupon: async (couponCode, totalAmount, userId) => {
    try {
      const coupon = await Coupon.findOne({ couponCode: couponCode });
      if (coupon) {
        if (coupon.usedBy.includes(userId)) {
          var discountAmount = {};
          discountAmount.status = false;
          discountAmount.cpMsg = "coupon already used";
          console.log("coupon alredy used");
          return discountAmount;
        }
        let currentDate = new Date();
        let coupondate = new Date(coupon.expirationDate);
        if (currentDate > coupondate) {
          var discountAmount = {};
          discountAmount.status = false;
          discountAmount.cpMsg = "coupon expire";
          return discountAmount;
        }

        await Coupon.updateOne(
          { couponCode: couponCode },
          { $push: { usedBy: userId } }
        );

        let discount = (totalAmount / coupon.discount) * 100;
        let maxdiscount = coupon.maxdiscount;
        if (maxdiscount < discount) {
          var discountAmount = {};
          let disPrice = totalAmount - maxdiscount;
          discountAmount.couponCode = coupon.couponCode;
          discountAmount.disAmount = maxdiscount;
          discountAmount.disPrice = disPrice;
          discountAmount.status = true;
          return discountAmount;
        } else {
          var discountAmount = {};
          let disPrice = totalAmount - maxdiscount;
          discountAmount.couponCode = coupon.couponCode;
          discountAmount.disAmount = maxdiscount;
          discountAmount.disPrice = disPrice;
          discountAmount.status = true;
          return discountAmount;
        }
      } else {
        var discountAmount = {};
        discountAmount.status = false;
        discountAmount.cpMsg = "Invalid coupon";
        return discountAmount;
      }
    } catch (err) {}
  },

  showWishList: async (userId) => {
    try {
      const wishlistDoc = await Wishlist.findOne({
        userId: userId,
      }).populate({
        path: "items.productId",
        select:
          "productName productModel productPrice productQuantity productImage _id",
        populate: {
          path: "category",
          select: "categoryName _id",
        },
      });
      if (!wishlistDoc) {
        // if wishlist doesn't exist, return an empty array
        return [];
      } else {
        //if wishlist exist , return the items array with product details
        return wishlistDoc.items;
      }
    } catch (err) {
      console.error(err);
      return [];
    }
  },
  addToCartFromWish: async (productId, userId) => {
    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    const quantity = product.productQuantity;

    if (quantity <= 0) {
      return false;
    }

    await Cart.updateOne(
      { user: userId },
      { $push: { products: { productId, quantity: 1 } } },
      { upsert: true }
    ).then(() => {
      return Wishlist.findOneAndUpdate(
        { userId: userId },
        { $pull: { items: { productId: productId } } },
        { new: true }
      );
    });
    return true;
  },
  addToWishListUpdate: async (userId, productId) => {
    try {
      const wishlistDoc = await Wishlist.findOne({ userId: userId });
      if (!wishlistDoc) {
        // If wishlist doesn't exist for user, create a new one
        const newWishlist = new Wishlist({
          userId: userId,
          items: [
            {
              productId: productId,
              addedAt: new Date(),
            },
          ],
        });
        await newWishlist.save();
      } else {
        // Check if the product is already present in the wishlist
        const productIndex = wishlistDoc.items.findIndex(
          (item) => item.productId.toString() === productId
        );

        if (productIndex !== -1) {
          // If the product is already present, remove it and return 'removed' status
          await Wishlist.findOneAndUpdate(
            { userId: userId },
            { $pull: { items: { productId: productId } } },
            { new: true }
          );
          return "removed";
        }

        // If the product is not already present, add it to the wishlist
        wishlistDoc.items.push({
          productId: productId,
          addedAt: new Date(),
        });
        await wishlistDoc.save();
      }
    } catch (err) {
      console.error(err);
    }
  },
  countWish: async (userId) => {
    try {
      const wishCount = await Wishlist.findOne({ userId: userId });
      const productCount = wishCount?.items.length;
      if (!productCount) return 0;
      return productCount;
    } catch (err) {
      console.error(err);
    }
  },
  removeProdctFromWishLIst: async (userId, productId) => {
    try {
      const response = await Wishlist.findOneAndUpdate(
        { userId: userId },
        { $pull: { items: { productId: productId } } },
        { new: true }
      );
      return;
    } catch (err) {
      console.error(err);
    }
  },
  getCartCount: async (userId) => {
    try {
      const cartCount = await Cart.findOne({ user: userId });
      const productCount = cartCount?.products.length;
      if (!productCount) return 0;

      return productCount;
    } catch (err) {
      console.error(err);
    }
  },
  searchQuery: async (query, userId) => {
    try {
      const products = await Product.find({
        $or: [
          { productName: { $regex: query, $options: "i" } },
          { productModel: { $regex: query, $options: "i" } },
          { productDescription: { $regex: query, $options: "i" } },
        ],
      }).populate("category");
      if (products.length > 0) {
        const cart = await Cart?.findOne({ user: userId });
        if (cart) {
          for (const product of products) {
            const isProductInCart = cart.products.some((prod) =>
              prod.productId.equals(product._id)
            );
            product.isInCart = isProductInCart;
          }
        }
        return products;
      }
      return null;
    } catch (err) {
      console.error(err);
    }
  },
  sortQuery: async (sort, userId) => {
    try {
      let sortOption = { productPrice: -1 }; // Default sort by productPrice in ascending order

      if (sort === "price-desc") {
        sortOption = { productPrice: 1 }; // Sort by productPrice in descending order
      }

      const products = await Product.find({})
        .populate("category")
        .sort(sortOption);
      if (products.length > 0) {
        const cart = await Cart?.findOne({ user: userId });

        if (cart) {
          for (const product of products) {
            const isProductInCart = cart.products.some((prod) =>
              prod.productId.equals(product._id)
            );
            product.isInCart = isProductInCart; // Add a boolean flag to indicate if the product is in the cart
          }
        }
        return products;
      }
      return null;
    } catch (err) {
      console.error(err);
    }
  },

  getAllProductsForList: async (categoryId, sort, userId) => {
    try {
      let sortOption = { productPrice: -1 };
      if (sort == "price-asc") {
        sortOption = { productPrice: 1 };
      }
      const productsQuery = Product.find({ category: categoryId })
        .populate("category")
        .sort(sortOption);

      const products = await productsQuery.exec();

      const cart = await Cart?.findOne({ user: userId });

      if (cart) {
        for (const product of products) {
          const isProductInCart = cart.products.some((prod) =>
            prod.productId.equals(product._id)
          );
          product.isInCart = isProductInCart; // Add a boolean flag to indicate if the product is in the cart
        }
      }

      return products;
    } catch (err) {
      console.error(err);
    }
  },
};

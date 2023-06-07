const userSchema = require("../model/user-model");
const Category = require("../model/category");
const Product = require("../model/product");
const Banner = require("../model/banner");
const { Order, Address, OderItem } = require("../model/order");
const Coupon = require("../model/coupon");

module.exports = {
  adminlogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      try {
        var validAdmin = await userSchema.findOne({ email: adminData.email });
      } catch (err) {
        console.log(err);
      }
      if (validAdmin) {
        if (validAdmin.isAdmin) {
          response.validAdmin = validAdmin;
          response.status = true;
          resolve(response);
        } else {
          console.log("login failed");
          resolve({ status: false });
        }
      } else {
        console.log("NO ADMIN FOUND");
        resolve({ status: false });
      }
    });
  },
  getAllusers: (status) => {
    return new Promise(async (resolve, reject) => {
      if (status) {
        let filter = {};
        status === "active"
          ? (filter.stasus = true)
          : status === "inactive"
          ? (filter.status = false)
          : filter;
        try {
          let users = await userSchema.find({ status: filter.stasus });
          resolve(users);
        } catch (err) {
          console.log(err);
        }
      } else {
        try {
          let users = await userSchema.find({});
          resolve(users);
        } catch (err) {
          console.log(err);
        }
      }
    });
  },
  blockUser: async (userId) => {
    try {
      const user = await userSchema.findById(userId);
      user.status = false;
      await user.save();
      console.log(`user with ID ${userId} has been blocked`);
    } catch (err) {
      console.log(err);
      throw new Error("faild to block user");
    }
  },
  unblockUser: async (userId) => {
    try {
      const user = await userSchema.findById(userId);
      user.status = true;
      await user.save();
      console.log(`user with ID ${userId} has been unblocked`);
    } catch (err) {
      console.log(err);
      throw new Error("Faild to unblock user");
    }
  },
  getAllCategory: async () => {
    try {
      let viewCategory = await Category.find({});
      return viewCategory;
    } catch (err) {
      console.log(err);
    }
  },
  addCategory: async (category) => {
    try {
      const existingCategory = await Category.findOne({
        CategoryName: category.CategoryName.toUpperCase(),
      });
      if (existingCategory) {
        console.log("{{{{{{{{{{{{{{{}}}}}}}}]]");
        const updateCategory = await Category.findByIdAndUpdate(
          existingCategory._id,
          {
            CategoryName: category.CategoryName.toUpperCase(),
          },
          {
            new: true,
          }
        );
        return updateCategory;
      } else {
        console.log("{{{{{{{{{{{{{{{4444444444444}}}}}}}}]]");

        const newCategory = new Category({
          CategoryName: category.CategoryName,
          CategoryDiscription: category.CategoryDiscription,
        });
        await newCategory.save();
        return;
      }
    } catch (err) {
      console.log("updating category error", err);
    }
  },
  editCategory: async (categoryName, id) => {
    try {
      const existingCategory = await Category.findByIdAndUpdate(
        id,
        {
          CategoryName: categoryName.toUpperCase(),
        },
        { new: true }
      );
    } catch (err) {
      console.log(err);
    }
  },
  deleteCategory: async (categoryId) => {
    try {
      await Category.findByIdAndUpdate(
        categoryId,
        {
          isListed: false,
        },
        { new: true }
      );
      return;
    } catch (err) {
      console.log(err);
    }
  },
  listCategory: async (categoryId) => {
    try {
      await Category.findByIdAndUpdate(
        categoryId,
        {
          isListed: true,
        },
        { new: true }
      );
      return;
    } catch (err) {
      console.log(err);
    }
  },
  addProducts: async (productData) => {
    try {
      const newProducts = new Product({
        productModel: productData.productModel,

        productName: productData.productName,

        productPrice: productData.productPrice,

        productDescription: productData.productDescription,

        productQuantity: productData.productQuantity,

        productColor: productData.productColor,

        productImage: productData.productImage,

        productStatus: productData.productStatus,

        category: productData.Category,
      });
      await newProducts.save();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  getAllProducts: async () => {
    try {
      const products = await Product.find({});
      return products;
    } catch (err) {
      console.log(err);
    }
  },
  getProductDetails: async (proId) => {
    try {
      const product = await Product.findById(proId);
      return product;
    } catch (err) {
      console.log(err);
    }
  },
  updateProducts: async (productData, proId) => {
    let update = {};
    if (productData.productImages && productData.productImages.length > 0) {
      update.productImage = productData.productImages;
    }
    try {
      await Product.findByIdAndUpdate(
        proId,
        {
          productModel: productData.productModel,

          productName: productData.productName,

          productPrice: productData.productPrice,

          productDescription: productData.productDescription,

          productQuantity: productData.productQuantity,

          productColor: productData.productColor,

          ...update,

          productStatus: productData.productStatus,
        },
        { new: true }
      );
      return;
    } catch (err) {
      console.log(err);
    }
  },
  unlistProduct: async (proId) => {
    try {
      await Product.findByIdAndUpdate(
        proId,
        { productStatus: "Unlisted" },
        { new: true }
      );
    } catch (err) {
      console.log(err);
    }
  },
  addBanner: async (data) => {
    try {
      const newBanner = new Banner({
        headline: data.headline,
        image: data.Image,
        category: data.Category,
        additionalInfo: data.productDescription,
      });
      await newBanner.save();
    } catch (err) {
      console.error(err);
    }
  },
  getAllBanner: async () => {
    try {
      const banner = await Banner.find({});
      console.log(banner);
      return banner;
    } catch (err) {
      console.log(err);
    }
  },
  removeBanner: async (id) => {
    try {
      const banners = await Banner.findByIdAndUpdate(
        id,
        { status: false },
        { new: true }
      );
      return banners;
    } catch (err) {
      console.error(err);
    }
  },
  listBanner: async (id) => {
    try {
      const banner = await Banner.findByIdAndUpdate(
        id,
        { status: true },
        { new: true }
      );
      return banner;
    } catch (err) {
      console.error(err);
    }
  },
  getOrderDetails: async () => {
    try {
      const order = await Order.find({})
        .populate("address")
        .populate("items.product_id")
        .exec();
      if (order.length === 0) {
        console.log("No orders found for user");
      } else {
        return order;
      }
    } catch (err) {
      console.error(err);
    }
  },
  getSpecificOrder: async (id) => {
    try {
      const order = await Order.findById(id).populate("address").exec();
      const productDetails = [];
      console.log(order, "orderrrrrrrrrrrrrrrrrrrrrr");

      for (const item of order.items) {
        const productId = item.product_id;
        const product = await Product.findOne({ _id: productId });
        productDetails.push({
          name: product.productName,
          price: item.unit_price,
          quantity: item.quantity,
          total: item.unit_price * item.quantity,
          image: product.productImage[0],
        });
      }

      return { order, productDetails };
    } catch (err) {
      console.error(err);
    }
  },
  updateOrderStatus: async (orderId, orderStatus) => {
    try {
      let order;
      if (orderStatus === "Delivered") {
        order = await Order.findById(orderId);
        if (!order) {
          throw new Error("Order not found");
        }

        order.order_status = "Delivered";
        if (order.payment_method === "cash_on_delivery") {
          order.payment_status = "paid";
        }

        // Save the updated order in the database
        const updatedOrder = await order.save();
        return updatedOrder;
      } else if (orderStatus === "approved" || orderStatus === "rejected") {
        if (orderStatus === "approved") {
          // Retrieve updated order
          order = await Order.findOneAndUpdate(
            { _id: orderId },
            {
              return_status: orderStatus,
              refund: "success",
            },
            { new: true }
          );

          // Retrieve user
          const userId = order.user_id;
          const user = await userSchema.findOne({ _id: userId });

          if (!user) {
            throw new Error("User not found");
          }

          if (user.wallet) {
            user.wallet += order.total_amount;
          } else {
            user.wallet = order.total_amount;
          }

          // Save updated user object
          await user.save();

          // Iterate over order items
          const orderItems = order?.items;
          await Promise.all(
            orderItems.map(async (item) => {
              const product = await Product.findById(item.product_id);
              if (product) {
                // Add returned quantity to product quantity
                product.productQuantity += item.quantity;
                await product.save();
              }
            })
          );

          return order;
        } else {
          order = await Order.findOneAndUpdate(
            { _id: orderId },
            {
              return_status: orderStatus,
              refund: "failure",
            },
            { new: true }
          );
          return order;
        }
      } else {
        order = await Order.findByIdAndUpdate(
          { _id: orderId },
          {
            order_status: orderStatus,
          },
          { new: true }
        );
        if (!order) {
          throw new Error("Order not found");
        }
        return order;
      }
    } catch (err) {
      console.error(err);
      throw err; // Rethrow the error for further handling
    }
  },

  addCoupons: async (couponDetails) => {
    try {
      const newCoupon = new Coupon({
        couponCode: couponDetails.couponCode,
        couponName: couponDetails.couponName,
        discount: couponDetails.couponDiscount,
        maxdiscount: couponDetails.maxDiscount,
        expirationDate: couponDetails.expiryDate,
      });
      await newCoupon.save();
      return newCoupon;
    } catch (error) {}
  },
  getAllCoupons: async () => {
    try {
      const coupons = await Coupon.find();
      return coupons;
    } catch (error) {
      console.log(error);
    }
  },
  removeCoupon: async (couponId) => {
    try {
      await Coupon.findOneAndDelete(couponId);
    } catch (error) {
      console.log(error);
    }
  },
  getReportDetails: async () => {
    try {
      // Query the orders collection based on the order_date field
      const query = { order_status: "Delivered" };
      const orders = await Order.find(query).populate("address");
      return orders;
    } catch (err) {
      console.error(err);
    }
  },      
  getReport: async (startDate, endDate) => {
    try {
      const query = [
        {
          $match: {
            order_status: "Delivered",
          },
        },
        {
          $match: {
            $and: [
              { order_date: { $gte: new Date(startDate) } },
              { order_date: { $lte: new Date(endDate) } },
            ],
          },
        },
        {
          $sort: {
            date: -1,
          },
        },
      ];

      const orders = await Order.aggregate(query);

      return orders;
    } catch (err) {
      console.error(err);
    }
  },
  findTotalRevenue: async () => {
    try {
      const result = await Order.aggregate([
        {
          $match: {
            order_status: "Delivered", // Filter only delivered orders
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total_amount" }, // Calculate the sum of total_amount field
          },
        },
      ]);
      return result[0].totalRevenue;
    } catch (err) {
      console.error(err);
    }
  },
  orderStatusData: async () => {
    try {
      const orderData = await Order.aggregate([
        {
          $group: {
            _id: "$order_status",
            count: { $sum: 1 },
          },
        },
      ]);
      const counts = {};
      for (const order of orderData) {
        counts[order._id] = order.count;
      }

      return counts;
    } catch (err) {
      console.log(err);
    }
  },

  paymentStatitics: async () => {
    try {
      const paymentData = await Order.aggregate([
        {
          $group: {
            _id: "$payment_method",
            count: { $sum: 1 },
          },
        },
      ]);
      const counts = {};
      for (const payment of paymentData) {
        counts[payment._id] = payment.count;
      }
      return counts;
    } catch (err) {
      console.log(err);
    }
  }
};

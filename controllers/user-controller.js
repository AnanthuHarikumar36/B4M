var { request, response } = require("express");
const userModel = require("../model/user-model");
var bcrypt = require("bcrypt");
const twilioFunctions = require("../config/twilio");
const userHelpers = require("../helpers/user-helpers");
const adminHelper = require("../helpers/admin-helpers");
const instance = require("../config/paymentGeteway");
const Cart = require("../model/cart.js");
const CryptoJS = require("crypto-js");
const adminHelpers = require("../helpers/admin-helpers");
require("dotenv").config();

let optLoginMsg;
let phone = null;
module.exports = {
  login: (req, res) => {
    if (req.session.user) {
      res.redirect("/");
    } else {
      res.render("user/user-login", { message: false });
    }
  },
  postLogin: (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    userModel.findOne({ email }).then((user) => {
      if (!user) {
        return res.render("user/user-login", { message: "user not found" });
      }
      if (user.status == false) {
        return res.render("user/user-login", {
          message: "user has been blocked",
        });
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          req.session.user = user;
          req.session.userName = user.name;
          req.session.loggedin = true;
          res.redirect("/");
        } else {
          return res.render("user/user-login", { message: "invalid password" });
        }
      });
    });
  },
  home: async (req, res) => {
    let user = req.session.user;
  
    try {
      const products = await adminHelper.getAllProducts();
      const category = await adminHelper.getAllCategory();
      const banners = await userHelpers.getListedBanner();
      console.log(category, "poooooy... its category in landing page");

      if (user) {
        user.count = await userHelpers.getCartCount(user._id);
        user.wish = await userHelpers.countWish(user._id);
        res.render("user/user-landingpage", {
          user,
          products,
          category,
          banners,
        });
      } else {
        res.render("user/user-landingpage", {
          user,
          products,
          category,
          banners,
        });
      }
    } catch (err) {
      console.log(err);
    }
  },

  
  listProductCategory: async (req, res) => {
    try {
        let user = req.session.user;
        console.log(req.query, "req quieryyyyy ");
        const { category: categoryId, sort } = req.query;
        const products = await userHelpers.getAllProductsForList(categoryId, sort, user?._id);
        console.log(products, "travel bags products");
        if (user) {
            res.render("../views/user/productList", { user, products });
        } else {
            res.render("../views/user/productList", { user: false, products });
        }
    } catch (err) {
        console.error(err);
    }
},

  getSignup: (_req, res) => {
    res.render("user/user-signup");
  },
  postSignup: (req, res) => {
    userHelpers.doSignup(req.body).then((userData) => {
      if (userData) {
        res.render("../views/user/user-login", { message: false });
      } else {
        req.session.user = userData;
        req.session.userName = userData.name;
        req.session.loggedin = true;
        res.redirect("/");
      }
    });
  },
  userLogout: (req, res) => {
    req.session.destroy();
    res.redirect("/");
  },

  otpLogin: (req, res) => {
    if (req.session.user) {
      res.redirect("/login");
    } else {
      res.render("user/otp-login", { optLoginMsg });
      optLoginMsg = "";
    }
  },
  postotpLogin: async (req, res) => {
    const mobNumber = req.body.number;
    console.log(mobNumber);
    try {
      const validUser = await userHelpers.getmobileNumber(mobNumber);
      if (validUser !== undefined && validUser !== false) {
        twilioFunctions
          .generateOTP(mobNumber, "sms")
          .then((verification) => {
            console.log(req.body);
            res.render("../views/user/otp-verify", { number: mobNumber });
          })
          .catch((err) => {
            optLoginMsg = "inavlid";
            res.redirect("/otp-login");
          });
      } else if (validUser == undefined) {
        optLoginMsg = "inavlid";
        res.redirect("/otp-login");
      } else {
        optLoginMsg = "inavlid";
        res.redirect("/otp-login");
      }
    } catch (err) {
      console.log(err);
    }
  },
  verifyotp: async (req, res) => {
    let mobNumber = req.body.number;
    console.log(mobNumber);
    try {
      const validUser = await userHelpers.getmobileNumber(mobNumber);
      const enterOTP = req.body.code;
      twilioFunctions.client.verify.v2
        .services(twilioFunctions.verifySid)
        .verificationChecks.create({ to: `+91${mobNumber}`, code: enterOTP })
        .then((verification_check) => {
          if (verification_check.status === "approved") {
            req.session.user = validUser;
            req.session.userName = validUser.name;
            req.session.loggedin = true;
            if (req.session.user) {
              console.log("working");
              res.redirect("/");
            }
          } else {
            console.log("wssssssorking");

            res.render("../views/user/otp-verify");
          }
        })
        .catch((err) => {
          console.log("wzsdfagwgrgorking");
          console.log(err);
          res.status(500).send("internal server error");
        });
    } catch (err) {
      console.log(err);
    }
  },
  forgotPasswordPost: async (req, res) => {
    const mobNumber = req.body.number;
    console.log(mobNumber);
    try {
      const validUser = await userHelpers.getmobileNumber(mobNumber);
      if (validUser !== undefined && validUser !== false) {
        twilioFunctions
          .generateOTP(mobNumber, "sms")
          .then((verification) => {
            console.log(req.body);
            res.render("../views/user/otp-verify-password", {
              number: mobNumber,
            });
          })
          .catch((err) => {
            optLoginMsg = "inavlid";
            res.redirect("/forgotPassword");
          });
      } else if (validUser == undefined) {
        optLoginMsg = "inavlid";
        res.redirect("/user-login");
      } else {
        optLoginMsg = "inavlid";
        res.redirect("/user-login");
      }
    } catch (err) {
      console.log(err);
    }
  },
  forgotPassword: (_req, res) => {
    try {
      res.render("user/forgotPassword");
    } catch (err) {
      console.log(err);
    }
  },
  changePassword: (req, res) => {
    try {
      console.log("page render");
      res.render("../views/user/changePassword", { phone });
    } catch (error) {}
  },
  changePasswordPost: async (req, res) => {
    try {
      const user = req.session.user;
      await userHelpers.updatePassword(user._id, req.body.password);
      res.redirect("/");
    } catch (error) {
      console.log(error);
    }
  },
  verifyOtpforpassword: async (req, res) => {
    let mobNumber = req.body.number;
    console.log(mobNumber);
    try {
      const validUser = await userHelpers.getmobileNumber(mobNumber);
      const enterOTP = req.body.code;
      console.log("tt", enterOTP);
      console.log("dd", mobNumber);
      twilioFunctions.client.verify.v2
        .services(twilioFunctions.verifySid)
        .verificationChecks.create({ to: `+91${mobNumber}`, code: enterOTP })
        .then((verification_check) => {
          if (verification_check.status === "approved") {
            req.session.user = validUser;
            req.session.userName = validUser.name;
            req.session.loggedin = true;
            if (req.session.user) {
              console.log("working");
              phone = mobNumber;
              res.redirect("/changePassword");
            }
          } else {
            console.log("wssssssorking");

            res.render("../views/user/otp-verify");
          }
        })
        .catch((err) => {
          console.log("wzsdfagwgrgorking");
          console.log(err);
          res.status(500).send("internal server error");
        });
    } catch (err) {
      console.log(err);
    }
  },

  resendOtp: async (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
      return;
    }
    try {
      const mobNumber = req.query.mobile;
      console.log(mobNumber);

      if (!mobNumber) {
        return res.render("../views/user/verify-otp-forPassword", {
          status: "error",
          message: "Invalid phone number",
        });
      }
      const verification = await twilioFunctions.generateOTP(mobNumber, "sms");

      if (verification.status === "pending") {
        return res.json({ status: "success" });
      } else {
        return res
          .status(500)
          .json({ status: "error", message: "Failed to generate OTP" });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }
  },
  productView: async (req, res) => {
    const user = req.session?.user;
    const slug = req.params.slug;
    try {
      if (user) {
        user.count = await userHelpers.getCartCount(user._id);

        // user.wish = await userHelpers.countWish(user._id);

        var products = await userHelpers.getProductDetails(slug, user?._id);

        console.log("product list view success");

        res.render("user/product-view", { user, products });
      } else {
        var products = await userHelpers.getProductDetails(slug, user?._id);

        console.log("product list view success");

        res.render("user/product-view", { user, products });
      }
    } catch (err) {
      console.error(err);
    }
  },
  cartPage: async (req, res) => {
    try {
      let user = req.session.user;
      user.cout = await userHelpers.getCartCount(user._id);

      const items = await userHelpers.getCartProducts(req.session.user._id);
      if (items === null) {
        res.render("../views/user/emptyCart", { user });
        return;
      }
      const { cartItems: products, subtotal } = items;
      res.render("user/cart", { user, products, total: subtotal });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },
  addToCart: async (req, res) => {
    try {
      await userHelpers.addToCart(req.params.id, req.session.user._id);
      res.json({
        status: "success",
        message: "product added to cart",
      });
    } catch (err) {
      console.log(err);
    }
  },
  changeProductQuantity: async (req, res) => {
    // let user = req.session.user;
    let user_id = req.body.user_id;
    const productId = req.body.productId;
    const count = req.body.quantityChange;
    console.log(user_id);
    console.log(productId);
    console.log(count);

    try {
        const response = await userHelpers.updateQuantity(user_id, productId, count);
        if (response === false) {
            res.json({ error: "success" });
            return;
        }
        res.json({ status: "success" });
    } catch (err) {
        console.error(err);
        res.json({ status: "error" });
    }
},
  removeProductFromCart: async (req, res) => {
    try {
      await userHelpers.removeProductFromCart(req.body);
      res.json({ status: "success", message: "product added to cart" });
    } catch (err) {
      console.log(err);
    }
  },
  checkOut: async (req, res) => {
    try {
      let user = req.session.user;
      const items = await userHelpers.getCartProducts(req.session.user._id);
      const address = await userHelpers.getDefaultAddress(req.session.user._id);
      console.log("adress not get", address);
      const { cartItems: products, subtotal } = items;
      res.render("../views/user/checkout", {
        user,
        products,
        subtotal,
        address,
      });
    } catch (err) {
      console.error(err);
    }
  },
  verifyPayment: async (req, res) => {
    try {
      const razorpayOrderId = req.body["order[id]"];
      const razorpayPaymentId = req.body["payment[razorpay_payment_id]"];
      const razorpaySecret = process.env.KEY_SECRET;
      const razorpaySignature = req.body["payment[razorpay_signature]"];

      // Concatenate order_id and payment_id
      const message = razorpayOrderId + "|" + razorpayPaymentId;

      // Generate a HMAC SHA256 hash of the message using the secret key
      const generatedSignature = CryptoJS.HmacSHA256(
        message,
        razorpaySecret
      ).toString(CryptoJS.enc.Hex);
      console.log(razorpaySignature, "===", generatedSignature);

      // Compare the generated signature with the received signature
      if (generatedSignature === generatedSignature) {
        await userHelpers.changeOnlinePaymentStatus(
          req.body["order[receipt]"],
          req.session.user._id
        );
        res.json({ status: "success" });
      } else {
        res.json({ error: "error" });
      }
    } catch (err) {
      console.error(err);
      res.render("../views/user/catchError", {
        message: err?.message,
        user: req.session.user,
      });
    }
  },
  placeOrderPost: async (req, res) => {
    try {
      console.log(req.body, "booooodyyy");
      const { userId, paymentMethod, totalAmount, couponCode } = req.body;
      console.log(paymentMethod, "paymentMethod");
      const response = await userHelpers.placeOrder(
        userId,
        paymentMethod,
        totalAmount,
        couponCode,
        req.body
      );
      if (response.payment_method == "cash_on_delivery") {
        res.json({ codstatus: "success" });
      } else if (response.payment_method == "online_payment") {
        // const order = generatePaymenetGateway(response);
        const paymentOptions = {
          amount: response.total_amount * 100,
          currency: "INR",
          receipt: "" + response._id,
          payment_capture: 1,
        
        };

        const order = await instance.orders.create(paymentOptions);
        res.json(order );
      } else if (response.payment_method == "wallet") {
        res.json({ codstatus: "success" });
      }
    } catch (err) {
      console.error(err);
      res.json({ status: "error" });
    }
  },
  addAddress: async (req, res) => {
    try {
      res.render("../views/user/add-address", { user: req.session.user });
    } catch (err) {
      console.error(err);
    }
  },
  selectAddress: async (req, res) => {
    try {
      const address = await userHelpers.getAddress(req.session.user._id);
      res.render("../views/user/address", { user: req.session.user, address });
    } catch (err) {
      console.error(err);
    }
  },
  addAddressPost: async (req, res) => {
    try {
      let { userId } = req.body;
      let address = req.body;
      await userHelpers.addAddressPost(userId, address);
      res.redirect("/address");
    } catch (err) {
      console.error(err);
    }
  },
  select: async (req, res) => {
    try {
      await userHelpers.updateAddress(req.params.id, req.session.user._id);
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
    }
    // res.json({ status: "success" });
  },
  deleteAddress: async (req, res) => {
    try {
      await userHelpers.deleteAddress(req.params.id);
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
    }
  },
  getOrderDetails: async (req, res) => {
    try {
      const orderHistory = await userHelpers.getOrderHistory(
        req.session.user._id
      );
      const orderDetails = orderHistory.reverse();
      res.render("../views/user/order", {
        user: req.session.user,
        orderDetails,
      });
    } catch (err) {
      console.log(err);
    }
  },
  orderSuccess: async (req, res) => {
    const user = req.session.user;
    res.render("../views/user/placeOrderSuccess", { user });
  },
  viewOrder: async (req, res) => {
    try {
      const currentOrder = await adminHelper.getSpecificOrder(req.params.id);
      const { productDetails, order} = currentOrder;
     
      
      res.render("../views/user/view-order", {
        user: req.session.user,
        productDetails,
        order,
      });
    } catch (err) {
      console.error(err);
    }
  },
  orderFailed: async (req, res) => {
    try {
      res.render("../views/user/payment-failure", { user: req.session.user });
    } catch (err) {
      res.render("../views/user/catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },
  removeOrder: async (req, res) => {
    try {
      console.log(req.body);
      await userHelpers.cancelOrder(req.body.orderid);
      console.log("req.body.argument[0]", req.body.arguments[0]);
      res.json('status:"success"');
    } catch (err) {
      console.log("order cancel error");
      res.render("../views/user/catchError", {
        message: err.message,
        user: req.session.uesr,
      });
    }
  },
  returnOrder: async (req, res) => {
    try {
      await userHelpers.returnOrder(req.body.orderId, req.body.reason);
      res.json({ status: "success" });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },
  getWallet: async (req, res) => {
    try {
      const wallet = await userHelpers.getUserWalletAmount();
      res.render("../views/user/wallet", { user: req.session.user, wallet });
    } catch (err) {
      console.log(err);
    }
  },
  applyCoupon: async (req, res) => {
    try {
      const totalAmount = req.body.total;
      const couponCode = req.body.code;
      console.log(req.body.total, req.body.code, "koooooi");
      let couponDetails = await userHelpers.applyCoupon(
        couponCode,
        totalAmount,
        req.session.user._id
      );
      console.log(couponDetails, "cpdetails");
      res.json({ couponDetails });
    } catch (error) {
      console.log(error);
    }
  },
  getAllCoupons: async (req, res) => {
    try {
      const coupons = await userHelpers.getCoupons(req.session.user._id);
      res.render("../views/user/all-coupons", {
        user: req.session.user,
        coupons,
      });
    } catch (err) {
      res.render("../views/user/catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },
  wishList: async (req, res) => {
    try {
      const showList = await userHelpers.showWishList(req.session.user._id);
      res.render("../views/user/wishlist", {
        user: req.session.user,
        showList,
      });
      console.log(showList, "wishlist pproduct details");
    } catch (err) {
      console.error(err);
      res.render("../views/user/catchError", {
        message: err?.message,
        user: req.session.user,
      });
    }
  },
  addToWishList: async (req, res) => {
    try {
      const response = await userHelpers.addToWishListUpdate(
        req.session.user._id,
        req.body.product_id
      );
      if (!response) {
        res.json({ error: true });
        return;
      } else if (response === "removed") {
        res.json({ removeSuccess: true });
        return;
      }
      res.json({ success: true });
    } catch (err) {
      res.render("../views/user/catchError", {
        message: err?.message,
        user: req.session.uesr,
      });
    }
  },
  addToCartFromWish: async (req, res) => {
    try {
      const response = await userHelpers.addToCartFromWish(
        req.params.id,
        req.session.user._id
      );
      if (response) {
        res.json({
          status: "success",
          message: "product added to cart",
        });
      } else {
        res.json({
          error: "error",
          message: "product not added to cart",
        });
      }
    } catch (err) {
      console.error(err);
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },
  getWishListCount: async (req, res) => {
    try {
      let user = req.session.user;
      // retrieve currently authenticated user
      let count = await userHelpers.countWish(user._id);
      //count items in wishlist for user
      res.json({ count: count });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  },
  removeProdctFromWishLIst: async (req, res) => {
    try {
      await userHelpers.removeProdctFromWishLIst(
        req.session.user._id,
        req.body.product
      );
      res.json({
        status: "success",
        message: "product added to cart",
      });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },
  getCartCount: async (req, res) => {
    try {
      let user = req.session.user; // retrieve currently authenticated user
      let count = await userHelpers.getCartCount(user._id); // count items in cart for user
      res.json({ count: count });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },
  search: async (req, res) => {
    try {
      const search = req.query.search;
      const products = await userHelpers.searchQuery(
        search,
        req.session.user?.id
      );
      if (products) {
        res.render("../views/user/productList", {
          user: req.session.user,
          products,
        });
      } else {
        res.render("../views/user/productNotFound", {
          message: err?.message,
          user: req.session.user,
        });
      }
    } catch (err) {
      res.render("../views/user/productNotFound", {
        message: err?.message,
        user: req.session.user,
      });
    }
  },
  filterProducts: async (req, res) => {
    try {
      const { sort } = req.query;
      console.log(sort);
      const products = await userHelpers.sortQuery(sort, req.session.user?._id);
      res.render("../views/user/productList", {
        user: req.session.user,
        products,
      });
    } catch (err) {
      res.render("../views/user/catchError", {
        message: err?.message,
        user: req.session.user,
      });
    }
  },
  downloadInvoice: async (req, res) => {
    try {
      const order_id = req.params.id;
      console.log(order_id);
      // Generate the PDF invoice
      const order = await adminHelpers.getSpecificOrder(order_id);

      const { order: invoiceData} = order;
      

      const invoicePath = await generateInvoice(invoiceData);

      // Download the generated PDF
      res.download(invoicePath, (err) => {
        if (err) {
          console.error("Failed to download invoice:", err);
          res.render("../views/user/catchError", {
            message: err.message,
            user: req.session.user,
          });
        }
      });
    } catch (error) {
      console.error("Failed to download invoice:", error);
      res.render("catchError", {
        user: req.session.user,
      });
    }
  },
};

const db = require("../config/connection");
const adminHelpers = require("../helpers/admin-helpers");
const adminHelper = require("../helpers/admin-helpers");
const convert = require("color-convert");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});




module.exports = {
  adminlogin: (req, res) => {
    if (req.session.isloggedInad) {
      res.render("admin/admin-login");
    } else {
      res.redirect("/admin/dashboard");
    }
  },
  dashBoard:async (req, res) => {
    const totalRevenue = await adminHelper.findTotalRevenue();
    const orders = await adminHelper.getOrderDetails();
    const orderCount = orders.length;
    const products = await adminHelper.getAllProducts();
    const productsCount = products.length;
    const users = await adminHelper.getAllusers();
    const usersCount = users.length;
    const orderData = await adminHelper.orderStatusData();
    const paymentStatitics = await adminHelper.paymentStatitics();
  
      // res.render("admin/admin-landingpage");
      res.render("../views/admin/admin-landingpage", { adLogErr: false,orderCount,
        productsCount,
        usersCount,
        totalRevenue,
        orderData,
        paymentStatitics, });
   
  },
  adminPostLogin: async (req, res) => {
    try {
        const adminData = await adminHelper.adminlogin(req.body);
        let admin = adminData.status;
      

        if (admin) {
            req.session.isloggedInad = true;
            req.session.admin = adminData.validAdmin;
            res.redirect("/admin/dashboard");
         
        } else {
            res.redirect("/");
        }
    } catch (error) {
        console.error(error);
        res.render();
    }
},

  adminLogout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      } else {
        res.redirect("/admin");
      }
    });
  },
  viewUsers: (req, res) => {
    const status = req.query.status || "";
    console.log("data received", status);
    try {
      adminHelper.getAllusers(status).then((users) => {
        res.render("../views/admin/view-user", { users });
      });
    } catch (err) {
      console.log(err);
      res.redirect("/admin");
    }
  },
  blockUser: async (req, res) => {
    let userId = req.params.id;

    try {
      await adminHelper.blockUser(userId);
      res.redirect("/admin/view-user");
    } catch (error) {
      console.log(error);
    }
  },
  unblockUser: async (req, res) => {
    let userId = req.params.id;
    try {
      await adminHelper.unblockUser(userId);
      res.redirect("/admin/view-user");
    } catch (err) {
      console.log(err);
    }
  },
  category: async (_req, res) => {
    try {
      const viewCategory = await adminHelper.getAllCategory();

      res.render("admin/category", {
        viewCategory,
      });
    } catch (err) {
      console.log(err);
    }
  },
  addCategory: async (req, res) => {
    try {

      await adminHelper.addCategory(req.body);
      res.redirect("/admin/category");
    } catch (err) {
      console.log(err);
    }
  },
  editCategory: async (req, res) => {
    const { category: categoryName } = req.body;
    const id = req.params.id;
    try {

      await adminHelper.editCategory(categoryName, id);
      res.json({ status: "success" });
    } catch (err) {
      console.log(err);
    }
  },
  deleteCategory: async (req, res) => {
    let categoryId = req.params.id;
    try {
  
      await adminHelper.deleteCategory(categoryId);
      res.json({ status: "success" });
    } catch (err) {
      console.log(err);
      res.json({ status: "error" });
    }
  },
  listCategory: async (req, res) => {
    let categoryId = req.params.id;
    try {
      await adminHelper.listCategory(categoryId);
      res.json({ status: "success" });
    } catch (err) {
      console.log(err);
      res.json({ status: "error" });
    }
  },
  addBanner: async (req, res) => {
    if (req.session.isloggedInad) {
      try {
        let availCategory = await adminHelper.getAllCategory();
        res.render("admin/addBanner", {
          availCategory,
          productUploaded: false,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      res.redirect("/admin");
    }
  },
  addBannerpost: async (req, res) => {
    try {
      const { path } = req.file;
      const result = await cloudinary.uploader.upload(path);

      const bannerData = req.body;
      if (result) {
        const Image = result.secure_url;
        bannerData.Image = Image;
      }
      await adminHelper.addBanner(bannerData);
      res.redirect("/admin/banner-list");
    } catch (err) {
      console.error(err);
      req.session.productUploadError = true;
      res.redirect("/admin/edit-product");
    }
  },
  viewBanner: async (_req, res) => {
    try {
      const banner = await adminHelper.getAllBanner();
      res.render("admin/banner-list", { banner });
    } catch (err) {
      console.error(err);
    }
  },
  removeBanner: async (req, res) => {
    try {
      await adminHelper.removeBanner(req.params.id);
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
    }
  },
  ListBanner: async (req, res) => {
    try {
      await adminHelper.listBanner(req.params.id);
      res.json({ status: "sucess" });
    } catch (err) {
      console.error(err);
    }
  },
  addProducts: async (req, res) => {
    try {
      var availCategory = await adminHelper.getAllCategory();
    } catch (err) {
      console.log(err);
    }
    let productFound;
    req.session.productFound ? productFound : !productFound;
    const productUploaded = req.session.productUploaded;
    const productUploadedErr = req.session.productUploadedErr;
    res.render("admin/add-products", {
      availCategory,
      productFound,
      productUploaded,
      productUploadedErr,
    });
  },
  addProductsPost: async (req, res) => {
    try {
      const files = req.files;
      console.log(files);
      const results = await Promise.all(
        files.map((file) => cloudinary.uploader.upload(file.path))
      );
      const productData = req.body;

      const colorCode = productData.productColor;
      const rgb = convert.hex.rgb(colorCode);
      const colorName = convert.rgb.keyword(rgb);
      productData.productColor = colorName;

      const productImage = results.map((result) => result.secure_url);

     
      productData.productImage = productImage;
      productData.productStatus = "listed";

      try {
        const productFound = await adminHelper.addProducts(productData);
        if (productFound) {
          req.session.productUploaded = true;
          console.log("Product uploaded successfully");
          res.redirect("/admin/add-products");
          return;
        } else {
          req.session.productFound = true;
          console.log("Product not found");
          res.redirect("/admin/add-products");
          return;
        }
      } catch (err) {
        console.log(err);
        req.session.productUploadedErr = true;
        res.redirect("/admin/add-products");
      }
    } catch (err) {
      console.log(err);
      req.session.productUploadedErr = true;
      res.redirect("/admin/add-products");
    }
  },
  getAllProducts: async (_req, res) => {
    try {
      var products = await adminHelper.getAllProducts();
    } catch (err) {
      console.log(err);
    }
    res.render("admin/products", {
      products,
    });
  },
  editProduct: async (req, res) => {
    let product;
    try {
      product = await adminHelper.getProductDetails(req.params.id);
      res.render("admin/edit-product", { product, productUpdated: false });
    } catch (err) {
      res.render("/admin");
      console.log(err);
    }
  },
  editProductPost: async (req, res) => {
    try {
      const files = req.files;
      const results = await Promise.all(
        files.map((file) => cloudinary.uploader.upload(file.path))
      );
      const productData = req.body;

      if (results) {
        const productImages = results.map((file) => {
          return file.secure_url;
        });
        productData.productImages = productImages;
      }
      await adminHelper.updateProducts(productData, req.params.id);
      res.redirect("/admin/products");
    } catch (err) {
      console.log(err);
      req.session.productUploadedErr = true;
      res.redirect("/admin/edit-product");
    }
  },
  unlistProduct: async (req, res) => {
    try {
      await adminHelper.unlistProduct(req.params.id);
      res.redirect("/admin/products");
    } catch (err) {
      console.log(err);
    }
  },
  orderDetails: async (_req, res) => {
    try {
      const orders = await adminHelper.getOrderDetails();
      if (orders) {
        res.render("admin/order-management", { orders });
      }
    } catch (err) {
      console.error(err);
    }
  },
  viewOrder: async (req, res) => {
    try {
      const SpecificOrder = await adminHelper.getSpecificOrder(req.params.id);
      if (SpecificOrder) {
        const { order, productDetails } = SpecificOrder;
        res.render("admin/order-details", { order, productDetails });
      }
    } catch (err) {
      console.error(err);
    }
  },
  updateOrderStatus: async (req, res) => {
    try {
      console.log(req.body);
      const valid = await adminHelper.updateOrderStatus(
        req.body.orderId,
        req.body.status
      );
      if (!valid) {
        return res.json({ error: "error" });
      }
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
    }
  },
  addCoupon: async (req, res) => {
    try {
      res.render("admin/add-coupons");
    } catch (err) {
      console.error(err);
    }
  },
  addCouponPost: async (req, res) => {
    console.log(req.body, "coupons");
    try {
      let coupon = await adminHelper.addCoupons(req.body);
      res.redirect("/admin/add-coupons");
    } catch (error) {}
  },
  viewCoupon: async (_req, res) => {
    try {
      const coupons = await adminHelper.getAllCoupons();
      res.render("admin/view-coupons", { coupons });
    } catch (error) {
      console.log(error);
    }
  },
  removeCoupon: async (req, res) => {
    try {
      await adminHelper.removeCoupon(req.body.id);
      res.json({ status: true });
    } catch (error) {
      console.log(error);
    }
  },
  viewReport: async (_req, res) => {
    try {
      const orders = await adminHelpers.getReportDetails();

      res.render("../views/admin/view-salesreport", { orders });
    } catch (err) {
      console.error(err);
    }
  },     
  viewReportByDate: async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      console.log(req.body);
      const orders = await adminHelper.getReport(startDate, endDate);

      res.render("../views/admin/view-salesreport", { orders });
    } catch (err) {
      console.error(err);
    }
  },
};

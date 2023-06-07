
var express = require('express');
var router = express.Router();
var express = require('express');
const session= require("express-session")
const upload= require("../config/storage")
const adminController=require('../controllers/admin-controller')
const {isloggedInad, isLoggedin}=require("../middleware/sessionHandle")


//**home page */
router.get('/',isloggedInad,adminController.adminlogin)


//**login logout */
router.post('/login',adminController.adminPostLogin)
router.get('/logout',adminController.adminLogout)


//**user view,block,unblock */
router.get('/view-user',isloggedInad,adminController.viewUsers)
router.get('/block-user/:id',adminController.blockUser)
router.get('/unblock-user/:id',adminController.unblockUser)


//**category,add,edit,delete,list */
router.get("/category",isloggedInad,adminController.category)
router.post("/add-category",isloggedInad,adminController.addCategory)
router.post("/edit-category/:id",isloggedInad,adminController.editCategory)
router.get("/delete-category/:id",isloggedInad,adminController.deleteCategory)
router.get("/list-category/:id",isloggedInad,adminController.listCategory)


//**banner, add,list */
router.get("/add-banner", isloggedInad, adminController.addBanner);
router.post("/add-banner", isloggedInad, upload.single("productImage"), adminController.addBannerpost)
router.get("/banner-list", isloggedInad, adminController.viewBanner);
router.get("/remove-banner/:id", isloggedInad, adminController.removeBanner);
router.get("/list-banner/:id", isloggedInad, adminController.ListBanner);


//**products,add,edit,list ,unlist */
router.get("/products",adminController.getAllProducts)       
router.get("/add-products",adminController.addProducts)
router.post("/add-products",upload.array("productImage",4),adminController.addProductsPost)
router.get("/edit-product/:id",isloggedInad,adminController.editProduct)
router.post("/edited-product/:id",upload.array("productImage",4),adminController.editProductPost)
router.get("/unlist-product/:id",isloggedInad,adminController.unlistProduct)


//**order ,view order */
router.get("/order-Management", isloggedInad, adminController.orderDetails)
router.get("/view-order/:id", isloggedInad, adminController.viewOrder);
router.post("/update-order-status", isloggedInad, adminController.updateOrderStatus);


//** coupons add,view,remove */
router.get("/add-coupons", isloggedInad, adminController.addCoupon);
router.post("/add-coupons", isloggedInad, adminController.addCouponPost);
router.get("/view-coupons",isloggedInad,adminController.viewCoupon)
router.post("/remove-coupons",isloggedInad,adminController.removeCoupon)


//**sales report */
router.get("/sales-report", isloggedInad, adminController.viewReport); 
router.post("/sales-report", isloggedInad , adminController.viewReportByDate);

module.exports = router;




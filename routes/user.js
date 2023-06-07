

var express = require('express');
var router = express.Router();
var userController=require('../controllers/user-controller')
const {isLoggedin, isUser}=require("../middleware/sessionHandle");
const userHelpers = require('../helpers/user-helpers');


/* GET users listing. */
router.get('/',userController.home)


//* login page. */
router.get('/login',isLoggedin, userController.login)
router.post('/login',isLoggedin, userController.postLogin) 


//* signup page. */
router.get('/signup',isLoggedin, userController.getSignup)
router.post('/signup',isLoggedin, userController.postSignup)


//* logout page. */
router.get('/logout', userController.userLogout)

router.get("/productsList", userController.listProductCategory);


//* otp-login page. */
router.get('/otp-login',isLoggedin, userController.otpLogin)
router.post('/otp-login', userController.postotpLogin)
router.post('/otp-verify',isLoggedin, userController.verifyotp)


//**forgot password */
router.get('/forgotPassword',isLoggedin, userController.forgotPassword)
router.post('/forgotPassword',isLoggedin, userController.forgotPasswordPost)
router.post("/otp-verify-password",isLoggedin,userController.verifyOtpforpassword)
router.get("/changePassword",userController.changePassword)
router.post("/changePassword",userController.changePasswordPost)


//*product view page. addtoCart. art Page Remove Product  quantity*/
router.get('/product-view/:slug', userController.productView)
router.get("/add-to-cart/:id",isUser,userController.addToCart)
router.get("/cart",isUser,userController.cartPage)
router.post("/remove-product-from-cart",isUser,userController.removeProductFromCart)
router.post("/change-product-quantity",userController.changeProductQuantity)


//* checkout */
router.get("/checkout", isUser, userController.checkOut);
router.get("/address", isUser, userController.selectAddress);
router.get("/add-address", isUser , userController.addAddress);
router.post("/add-address", isUser ,userController.addAddressPost);
router.get("/select-address/:id", isUser ,userController.select);
router.get("/delete-address/:id", isUser , userController.deleteAddress);


//**place order */
router.post("/place-order", isUser, userController.placeOrderPost);
router.get("/order-success", isUser , userController.orderSuccess);
router.get("/order-failed", isUser, userController.orderFailed)
router.get("/order", isUser, userController.getOrderDetails);
router.get("/view-order-products/:id", isUser, userController.viewOrder);
router.post("/cancelOrder", isUser, userController.removeOrder);
router.put("/returnOrder", isUser, userController.returnOrder);


//**verify payment */
router.post("/verify-payment", isUser, userController.verifyPayment);


//**coupons  */
router.post("/apply-coupon", isUser, userController.applyCoupon);
router.get("/all-coupons",isUser, userController.getAllCoupons)


/**wallet */
router.get("/wallet",isUser,userController.getWallet)


//**wishList  */
router.get("/wishlist", isUser ,userController.wishList);
router.post("/wishlist/add/", isUser, userController.addToWishList);
router.put("/add-to-cartFromWishL/:id", isUser, userController.addToCartFromWish);
router.delete("/remove-product-from-wishList",isUser,userController.removeProdctFromWishLIst)


//* get wishlist and cart count */
router.get("/wishlist/count",isUser, userController.getWishListCount);
router.get("/cart/count", isUser, userController.getCartCount);


//* search */
router.get("/product-search", userController.search);


//**filter */
router.get("/data", userController.filterProducts);


//**download invoice */
router.get("/download-invoice/:id", isUser, userController.downloadInvoice);


module.exports = router;

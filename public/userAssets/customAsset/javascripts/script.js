



function changeQuantity(userId, prodId, count) {
  console.log(userId, prodId, count);
  console.log("called change quantity");
  $.ajax({
    url: "/change-product-quantity",
    type: "post",
    data: {
      userId: userId,
      prodId: prodId,
      count: count,
    },
  })
    .done((res) => {
      console.log(document.getElementById(`${prodId}`).innerHTML);
      document.getElementById(`${prodId}`).innerHTML =
        parseInt(document.getElementById(`${prodId}`).innerHTML) + count;
      location.reload();
    })
    .fail((err) => {});
}

$(document).ready(function () {
  const addToCartLink = $("#add-to-cart");
  addToCartLink.click(function (event) {
    event.preventDefault();
    const user = addToCartLink.data("user-id");
    if (user) {
      const productId = addToCartLink.data("product-id");
      $.get(`/add-to-cart/${productId}`).done(function (response) {
        Toastify({
          text: "Product added to cart !",
          duration: 2000,
          gravity: "top", 
          position: "center",
          backgroundColor:
            "linear-gradient(90deg, rgba(0,36,3,1) 0%, rgba(157,49,102,1) 42%, rgba(255,0,69,1) 100%)",
          stopOnFocus: true,
          className: "toastify-icon",
          close: false,
        }).showToast();
        location.reload()
      });
    } else {
      // User is not logged in, redirect to login page
      window.location.href = "/login";
      return;
    }
  });
});

function removeCartProduct(cartId, productId, productName) {
  Swal.fire({
    title: `Are you sure you want to remove ${productName} from the cart?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, remove it!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/remove-product-from-cart",
        data: {
          cart: cartId,
          product: productId,
          productName: productName,
        },
        method: "post",
        success: (response) => {
          if (response) {
            Swal.fire({
              title: `Product removed from cart!`,
              icon: "success",
              timer: 4000,
            }).then((result) => {
              window.location.reload();
            });
          }
        },
      });
    }
  });
}

function cancelOrder() {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3cc75c",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Cancel The Order!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/cancelOrder",
        data: {
          arguments,
        },
        method: "post",
        success: (response) => {
          if (response.status) {
            Swal.fire({
              title: `Cancelled`,
              icon: "success",
              timer: 4000,
            }).then((response) => {
              if (response.isConfirmed) {
                location.reload();
              }
            });
          }
        },
      });
    }
  });
}

function returnOrder(orderId) {
  Swal.fire({
    icon: "warning",
    title: "Are you sure",
    text: "You won't be able to revert this!",
    showDenyButton: true,
    confirmButtonText: "Yes, Return",
    denyButtonText: `No`,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Reason for returning",
        input: "text",
        inputValue: "",
        showCancelButton: true,
        confirmButtonText: "Save Changes",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          const return_reason = result.value;
          $.ajax({
            url: "/returnOrder",
            method: "put",
            data: {
              orderId: orderId,
              reason: return_reason,
            },
            success: (response) => {
              if (response.status) {
                Swal.fire("Returned!", "", "success").then(() => {
                  location.reload();
                });
              } else {
                Swal.fire(
                  "The Product Return validity expired",
                  "",
                  "warning"
                ).then(() => {});
              }
            },
          });
        }
      });
    }
  });
}
vctl/
//coupon
function applyCoupon(total) {
  let couponCode = document.getElementById("couponCode").value;
  document.getElementById("couponCodeInput").value = couponCode;

  $.ajax({
    url: "/apply-coupon",
    data: {
      code: couponCode,
      total: total,
    },
    method: "post",
    success: (response) => {
      console.log(response.couponCode, "Response in ajax script");
      if (response.status) {
        const couponDisAmount = document.getElementById("couponDisAmount");
        couponDisAmount.innerHTML = "-" + response.disAmount;
        $("#couponSuccess").html("Coupon added");
        document.getElementById("totalPrice").innerHTML =
          "&#x20B9;" + response.disPrice;
        document.getElementById("paypalAmount").value = response.disPrice;
      } else {
        $("#couponErr").html("Invalid Coupon");
        document.getElementById("couponSuccess").innerHTML = "";
      }
    },
  });
}

$(document).ready(function () {
  $("#myTable").DataTable();
});

function checkOut() {
  $.ajax({
    url: "/checkout",
    method: "get",
    success: (response) => {
      if (response.items === false) {
        // Cart products are out of stock
        swal.fire(
          "Out of Stock",
          "Some products in your cart are out of stock",
          "error"
        );
      } else {
        // Cart products have stock, redirect to checkout page
        window.location.href = "/checkout";
      }
    },
    error: (error) => {
      console.error(error);
      // Handle error if needed
    },
  });
}




document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      { id: 1, name: "Robusta Brazil", img: "1.jpg", price: 20000 },
      { id: 2, name: "Arabica Blend", img: "2.jpg", price: 25000 },
      { id: 3, name: "Primo Passo", img: "3.jpg", price: 30000 },
      { id: 4, name: "Aceh Gayo", img: "4.jpg", price: 35000 },
      { id: 5, name: "Sumatra Mandheling", img: "5.jpg", price: 40000 },
    ],
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      // Cek apakah ada barang yang sama
      const cartItem = this.items.find((item) => item.id === newItem.id);

      // Jika belum ada / cart masih kosong
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        //   Jika barang sudah ada, cek apakah beda atau sama dengan yang ada pada cart
        this.items = this.items.map((item) => {
          //   Jika barang berbeda
          if (item.id !== newItem.id) {
            return item;
          } else {
            //   jika barang sudah ada. tambah quantity dan totalnya
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },
    remove(id) {
      // ambil item berdasarkan id
      const cariItem = this.items.find((item) => item.id === id);

      //   jika item lebih dari pada 1
      if (cariItem.quantity > 1) {
        // telusuri 1 1
        this.items = this.items.map((item) => {
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return itwm;
          }
        });
      } else if (cariItem.quantity === 1) {
        //   jika barang sisa 1
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cariItem.price;
      }
    },
  });
});

// Form Validasi
const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.disabled = true;

const form = document.querySelector("#checkoutForm");

form.addEventListener("keyup", function () {
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.length !== 0) {
      checkoutButton.classList.remove("disabled");
      checkoutButton.classList.add("disabled");
    } else {
      return false;
    }
  }
  checkoutButton.disabled = false;
  checkoutButton.classList.remove("disabled");
});

// kirim tombol data ketika tombol checkout diklik
checkoutButton.addEventListener("click", async function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);
  // const message = formatMessage(objData);
  // window.open("http://wa.me/6282254982931?text=" + encodeURIComponent(message));\\

  // meminta transaction token menggunakan ajax / fetch
  try {
    const response = await fetch("php/placeOrder.php", {
      method: "POST",
      body: data,
    });
    const token = await response.text();
    // console.log(token);
    window.snap.pay(token, {
      onSuccess: function (result) {
        console.log("Payment Success:", result);
      },
      onPending: function (result) {
        console.log("Payment Pending:", result);
      },
      onError: function (result) {
        console.error("Payment Error:", result);
      },
      onClose: function () {
        console.log("User closed the Snap pop-up.");
      },
    });
  } catch (err) {
    console.log(err.message);
  }
});

// format pesan whatsapp
const formatMessage = (obj) => {
  return `Data Customer
    Nama: ${obj.name}
    Email: ${obj.email}
    No Hp: ${obj.phone}
Data Pesanan
  ${JSON.parse(obj.items).map(
    (item) => `${item.name} (${item.quantity} x ${rupiah(item.total)}) \n`
  )}
TOTAL: ${rupiah(obj.total)}
Terima kasih`;
};

// konversi ke Rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

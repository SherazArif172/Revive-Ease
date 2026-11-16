import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";

export const base_url = process.env.REACT_APP_API_BASE_URL;

export const getAuthHeader = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Cache-Control": "no-cache",
    },
  };  
};

export const unAuthorizedUser = () => {
  let timerInterval;
  let countdown = 5; // seconds

  Swal.fire({
    title: "Session Expired!",
    html: `You will be redirected to the login in <b>${countdown}</b> seconds.`,
    timer: countdown * 1000,
    timerProgressBar: true,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
      const timerEl = Swal.getPopup().querySelector("b");

      timerInterval = setInterval(() => {
        countdown--;
        if (timerEl && countdown >= 0) {
          timerEl.textContent = countdown;
        }
      }, 1000);
    },
    willClose: () => {
      clearInterval(timerInterval);
    },
  }).then((result) => {
    if (result.dismiss === Swal.DismissReason.timer) {
      localStorage.clear();
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  });
};

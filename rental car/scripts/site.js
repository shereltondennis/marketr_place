const ratesByClass = {
  economy: 39,
  suv: 54,
  luxury: 89,
  van: 72,
};

const addonRates = {
  gps: 9,
  seat: 7,
  cover: 16,
};

const currencyFormatter = new Intl.NumberFormat(`en-US`, {
  style: `currency`,
  currency: `USD`,
});

const setFooterDates = () => {
  const yearEl = document.querySelector(`#currentyear`);
  const modifiedEl = document.querySelector(`#lastModified`);

  if (yearEl) {
    yearEl.textContent = `${new Date().getFullYear()}`;
  }

  if (modifiedEl) {
    modifiedEl.textContent = `Last updated: ${document.lastModified}`;
  }
};

const bindMobileNav = () => {
  const toggle = document.querySelector(`.nav-toggle`);
  const nav = document.querySelector(`#primary-navigation`);

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener(`click`, () => {
    const isOpen = nav.classList.toggle(`open`);
    toggle.setAttribute(`aria-expanded`, `${isOpen}`);
  });

  nav.addEventListener(`click`, (event) => {
    const link = event.target.closest(`a`);
    if (!link || window.matchMedia(`(min-width: 980px)`).matches) {
      return;
    }

    nav.classList.remove(`open`);
    toggle.setAttribute(`aria-expanded`, `false`);
  });
};

const normalizeToMidnight = (dateValue) => {
  const date = new Date(dateValue);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const bindBookingForm = () => {
  const form = document.querySelector(`#rentalForm`);
  const message = document.querySelector(`#bookingMessage`);
  const pickupInput = document.querySelector(`#pickupDate`);
  const returnInput = document.querySelector(`#returnDate`);

  if (!form || !message || !pickupInput || !returnInput) {
    return;
  }

  const today = new Date();
  const todayIso = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split(`T`)[0];

  pickupInput.min = todayIso;
  returnInput.min = todayIso;

  pickupInput.addEventListener(`change`, () => {
    returnInput.min = pickupInput.value || todayIso;
    if (returnInput.value && returnInput.value < returnInput.min) {
      returnInput.value = ``;
    }
  });

  form.addEventListener(`submit`, (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const pickupCity = `${formData.get(`pickupCity`) || ``}`.trim();
    const pickupDate = `${formData.get(`pickupDate`) || ``}`.trim();
    const returnDate = `${formData.get(`returnDate`) || ``}`.trim();
    const vehicleClass = `${formData.get(`vehicleClass`) || ``}`.trim();

    if (!pickupCity || !pickupDate || !returnDate || !vehicleClass) {
      message.textContent = `Please complete all required fields to get an estimate.`;
      return;
    }

    const start = normalizeToMidnight(pickupDate);
    const end = normalizeToMidnight(returnDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      message.textContent = `Please enter valid dates.`;
      return;
    }

    const days = Math.ceil((end - start) / 86400000);
    if (days < 1) {
      message.textContent = `Return date must be at least one day after pickup date.`;
      return;
    }

    const dailyRate = ratesByClass[vehicleClass];
    const selectedAddons = formData.getAll(`addons`).map((value) => `${value}`);
    const addonPerDay = selectedAddons.reduce((sum, addon) => sum + (addonRates[addon] || 0), 0);

    const baseCost = days * dailyRate;
    const addonCost = days * addonPerDay;
    const estimatedTotal = baseCost + addonCost;

    message.textContent = `Estimated total for ${days} day${days === 1 ? `` : `s`} in ${pickupCity}: ${currencyFormatter.format(estimatedTotal)}.`;
  });
};

const applyCheckoutCarDetails = (form) => {
  const params = new URLSearchParams(window.location.search);
  const carModel = params.get(`car`) ? params.get(`car`).trim() : ``;
  const rateValue = Number(params.get(`rate`));
  const modelInput = form.querySelector(`#carModel`);
  const rateInput = form.querySelector(`#dailyRate`);
  const selectedCarName = document.querySelector(`#selectedCarName`);
  const selectedCarRate = document.querySelector(`#selectedCarRate`);

  const safeCarModel = carModel || `Any available car`;
  const safeRate = Number.isFinite(rateValue) && rateValue > 0 ? Math.round(rateValue) : 39;

  if (modelInput) {
    modelInput.value = safeCarModel;
  }

  if (rateInput) {
    rateInput.value = `${safeRate}`;
  }

  if (selectedCarName) {
    selectedCarName.textContent = safeCarModel;
  }

  if (selectedCarRate) {
    selectedCarRate.textContent = `${currencyFormatter.format(safeRate)}/day`;
  }
};

const bindCheckoutForm = () => {
  const form = document.querySelector(`#checkoutForm`);
  const message = document.querySelector(`#checkoutMessage`);
  const pickupInput = document.querySelector(`#pickupDateCheckout`);
  const returnInput = document.querySelector(`#returnDateCheckout`);

  if (!form || !message || !pickupInput || !returnInput) {
    return;
  }

  applyCheckoutCarDetails(form);

  const today = new Date();
  const todayIso = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split(`T`)[0];

  pickupInput.min = todayIso;
  returnInput.min = todayIso;

  pickupInput.addEventListener(`change`, () => {
    returnInput.min = pickupInput.value || todayIso;
    if (returnInput.value && returnInput.value < returnInput.min) {
      returnInput.value = ``;
    }
  });

  form.addEventListener(`submit`, (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const carModel = `${formData.get(`carModel`) || ``}`.trim();
    const dailyRate = Number(formData.get(`dailyRate`));
    const pickupCity = `${formData.get(`pickupCity`) || ``}`.trim();
    const pickupDate = `${formData.get(`pickupDate`) || ``}`.trim();
    const returnDate = `${formData.get(`returnDate`) || ``}`.trim();
    const termsAccepted = formData.get(`terms`) === `agree`;

    if (!carModel || !dailyRate || !pickupCity || !pickupDate || !returnDate) {
      message.textContent = `Please complete all required fields before payment.`;
      return;
    }

    if (!termsAccepted) {
      message.textContent = `Please agree to the rental terms to continue.`;
      return;
    }

    const start = normalizeToMidnight(pickupDate);
    const end = normalizeToMidnight(returnDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      message.textContent = `Please enter valid pickup and return dates.`;
      return;
    }

    const days = Math.ceil((end - start) / 86400000);
    if (days < 1) {
      message.textContent = `Return date must be at least one day after pickup date.`;
      return;
    }

    const selectedAddons = formData.getAll(`addons`).map((value) => `${value}`);
    const addonPerDay = selectedAddons.reduce((sum, addon) => sum + (addonRates[addon] || 0), 0);
    const subtotal = days * (dailyRate + addonPerDay);
    const tax = subtotal * 0.085;
    const grandTotal = subtotal + tax;

    message.textContent = `Payment approved for ${carModel} in ${pickupCity}. ${days} day${days === 1 ? `` : `s`} booked. Total charged: ${currencyFormatter.format(grandTotal)}.`;

    const existingModel = carModel;
    const existingRate = `${dailyRate}`;
    form.reset();
    form.querySelector(`#carModel`).value = existingModel;
    form.querySelector(`#dailyRate`).value = existingRate;
    returnInput.min = pickupInput.min;
  });
};

const init = () => {
  setFooterDates();
  bindMobileNav();
  bindBookingForm();
  bindCheckoutForm();
};

document.addEventListener(`DOMContentLoaded`, init);

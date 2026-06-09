const ratesByClass = {
  economy: 39,
  suv: 54,
  luxury: 89,
  van: 72,
};

const vehicleClassMeta = {
  economy: {
    label: `Economy`,
    model: `City Sprint Eco`,
  },
  suv: {
    label: `SUV`,
    model: `TrailRunner X`,
  },
  luxury: {
    label: `Luxury`,
    model: `Aurora Executive`,
  },
  van: {
    label: `Family Van`,
    model: `Orbit 8 Family Van`,
  },
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

const formatCurrency = (value) => {
  return currencyFormatter.format(value);
};

const bindMortgageCalculator = () => {
  const purchasePrice = document.querySelector(`#purchasePrice`);
  const downPayment = document.querySelector(`#downPayment`);
  const interestRate = document.querySelector(`#interestRate`);
  const loanTerm = document.querySelector(`#loanTerm`);
  const button = document.querySelector(`#calculateMortgage`);
  const result = document.querySelector(`#mortgageResult`);

  if (!purchasePrice || !downPayment || !interestRate || !loanTerm || !button || !result) {
    return;
  }

  button.addEventListener(`click`, () => {
    const priceValue = Number(purchasePrice.value || 0);
    const downValue = Number(downPayment.value || 0);
    const rateValue = Number(interestRate.value || 0) / 100;
    const termValue = Number(loanTerm.value || 0);

    if (priceValue <= 0 || rateValue <= 0 || termValue <= 0 || downValue < 0) {
      setMessageState(result, `Enter purchase price, down payment, interest rate, and loan term to calculate.`, `error`);
      return;
    }

    const loanAmount = Math.max(priceValue - downValue, 0);
    const monthlyRate = rateValue / 12;
    const payments = termValue * 12;
    const monthlyPayment = monthlyRate === 0
      ? loanAmount / payments
      : loanAmount * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -payments)));

    setMessageState(result, `Estimated monthly payment: ${formatCurrency(monthlyPayment)}.`, `success`);
  });
};

const bindValuationForm = () => {
  const address = document.querySelector(`#homeAddress`);
  const city = document.querySelector(`#homeCity`);
  const zip = document.querySelector(`#homeZip`);
  const button = document.querySelector(`#requestValuation`);
  const message = document.querySelector(`#valuationMessage`);

  if (!address || !city || !zip || !button || !message) {
    return;
  }

  button.addEventListener(`click`, () => {
    const addressValue = `${address.value || ``}`.trim();
    const cityValue = `${city.value || ``}`.trim();
    const zipValue = `${zip.value || ``}`.trim();

    if (!addressValue || !cityValue || !zipValue) {
      setMessageState(message, `Please enter your address, city, and ZIP code.`, `error`);
      return;
    }

    setMessageState(message, `Thanks! We’ll review your property details and follow up with a complimentary estimate within one business day.`, `success`);
  });
};

const bindContactForm = () => {
  const form = document.querySelector(`#contactForm`);
  const response = document.querySelector(`#contactResponse`);

  if (!form || !response) {
    return;
  }

  form.addEventListener(`submit`, (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = `${formData.get(`contactName`) || ``}`.trim();
    const email = `${formData.get(`contactEmail`) || ``}`.trim();
    const message = `${formData.get(`contactMessage`) || ``}`.trim();

    if (!name || !email || !message) {
      setMessageState(response, `Please complete the name, email, and message fields before sending.`, `error`);
      return;
    }

    form.reset();
    setMessageState(response, `Message sent! Our team will respond within one business day.`, `success`);
  });
};

const normalizeToMidnight = (dateValue) => {
  const date = new Date(dateValue);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const setMessageState = (element, text, tone = `info`) => {
  if (!element) {
    return;
  }

  element.textContent = text;
  element.classList.remove(`is-error`, `is-success`, `is-info`);
  element.classList.add(`is-${tone}`);
};

const readPendingBooking = () => {
  if (!window.sessionStorage) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(`pendingBooking`);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === `object` ? parsed : null;
  } catch {
    return null;
  }
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
    const fullName = `${formData.get(`fullName`) || ``}`.trim();
    const email = `${formData.get(`email`) || ``}`.trim();
    const phone = `${formData.get(`phone`) || ``}`.trim();
    const pickupCity = `${formData.get(`pickupCity`) || ``}`.trim();
    const pickupDate = `${formData.get(`pickupDate`) || ``}`.trim();
    const returnDate = `${formData.get(`returnDate`) || ``}`.trim();
    const vehicleClass = `${formData.get(`vehicleClass`) || ``}`.trim();
    const paymentMethod = `${formData.get(`paymentMethod`) || ``}`.trim();

    if (!fullName || !email || !phone || !pickupCity || !pickupDate || !returnDate || !vehicleClass || !paymentMethod) {
      setMessageState(message, `Please complete all required fields before continuing.`, `error`);
      return;
    }

    const start = normalizeToMidnight(pickupDate);
    const end = normalizeToMidnight(returnDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setMessageState(message, `Please enter valid pickup and return dates.`, `error`);
      return;
    }

    const days = Math.ceil((end - start) / 86400000);
    if (days < 1) {
      setMessageState(message, `Return date must be at least one day after pickup date.`, `error`);
      return;
    }

    const dailyRate = ratesByClass[vehicleClass];
    const classMeta = vehicleClassMeta[vehicleClass];
    if (!dailyRate || !classMeta) {
      setMessageState(message, `Please select a valid vehicle class.`, `error`);
      return;
    }

    const selectedAddons = formData.getAll(`addons`).map((value) => `${value}`);
    const addonPerDay = selectedAddons.reduce((sum, addon) => sum + (addonRates[addon] || 0), 0);

    const baseCost = days * dailyRate;
    const addonCost = days * addonPerDay;
    const estimatedTotal = baseCost + addonCost;
    const paymentMethodLabel = paymentMethod.replace(`-`, ` `).replace(/\b\w/g, (char) => char.toUpperCase());

    const summary = `Booking summary:
Client: ${fullName}
Car class: ${classMeta.label}
Pickup city: ${pickupCity}
Duration: ${days} day${days === 1 ? `` : `s`}
Estimated total: ${currencyFormatter.format(estimatedTotal)}

Are you ready to continue to payment now?`;

    const readyToPay = window.confirm(summary);
    const bookingPayload = {
      fullName,
      email,
      phone,
      pickupCity,
      pickupDate,
      returnDate,
      vehicleClass,
      paymentMethod: paymentMethodLabel,
      carModel: classMeta.model,
      dailyRate,
      selectedAddons,
      days,
      estimatedTotal,
      submittedAt: new Date().toISOString(),
    };

    if (window.sessionStorage) {
      window.sessionStorage.setItem(`pendingBooking`, JSON.stringify(bookingPayload));
    }

    if (!readyToPay) {
      setMessageState(
        message,
        `Estimate ready: ${currencyFormatter.format(estimatedTotal)} for ${days} day${days === 1 ? `` : `s`}. Booking saved, submit again when ready to pay.`,
        `info`,
      );
      return;
    }

    const params = new URLSearchParams({
      car: classMeta.model,
      rate: `${dailyRate}`,
      city: pickupCity,
      pickup: pickupDate,
      return: returnDate,
      name: fullName,
      email,
      phone,
    });

    setMessageState(message, `Booking submitted. Opening secure payment now...`, `success`);
    window.setTimeout(() => {
      window.location.href = `booking.html?${params.toString()}`;
    }, 350);
  });
};

const applyCheckoutCarDetails = (form) => {
  const params = new URLSearchParams(window.location.search);
  const pendingBooking = readPendingBooking();
  const carModel = params.get(`car`) ? params.get(`car`).trim() : `${pendingBooking?.carModel || ``}`.trim();
  const rateValue = Number(params.get(`rate`) || pendingBooking?.dailyRate);
  const fullName = params.get(`name`) ? params.get(`name`).trim() : `${pendingBooking?.fullName || ``}`.trim();
  const email = params.get(`email`) ? params.get(`email`).trim() : `${pendingBooking?.email || ``}`.trim();
  const phone = params.get(`phone`) ? params.get(`phone`).trim() : `${pendingBooking?.phone || ``}`.trim();
  const pickupCity = params.get(`city`) ? params.get(`city`).trim() : `${pendingBooking?.pickupCity || ``}`.trim();
  const pickupDate = params.get(`pickup`) ? params.get(`pickup`).trim() : `${pendingBooking?.pickupDate || ``}`.trim();
  const returnDate = params.get(`return`) ? params.get(`return`).trim() : `${pendingBooking?.returnDate || ``}`.trim();

  const modelInput = form.querySelector(`#carModel`);
  const rateInput = form.querySelector(`#dailyRate`);
  const fullNameInput = form.querySelector(`#fullName`);
  const emailInput = form.querySelector(`#email`);
  const phoneInput = form.querySelector(`#phone`);
  const pickupCityInput = form.querySelector(`#pickupCityCheckout`);
  const pickupDateInput = form.querySelector(`#pickupDateCheckout`);
  const returnDateInput = form.querySelector(`#returnDateCheckout`);
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

  if (fullNameInput && fullName) {
    fullNameInput.value = fullName;
  }

  if (emailInput && email) {
    emailInput.value = email;
  }

  if (phoneInput && phone) {
    phoneInput.value = phone;
  }

  if (pickupCityInput && pickupCity) {
    const hasCity = [...pickupCityInput.options].some((option) => option.value === pickupCity);
    if (hasCity) {
      pickupCityInput.value = pickupCity;
    }
  }

  if (pickupDateInput && pickupDate) {
    pickupDateInput.value = pickupDate;
  }

  if (returnDateInput && returnDate) {
    returnDateInput.value = returnDate;
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

  const today = new Date();
  const todayIso = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split(`T`)[0];

  pickupInput.min = todayIso;
  returnInput.min = todayIso;

  applyCheckoutCarDetails(form);
  returnInput.min = pickupInput.value || todayIso;
  if (returnInput.value && returnInput.value < returnInput.min) {
    returnInput.value = ``;
  }

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
      setMessageState(message, `Please complete all required fields before payment.`, `error`);
      return;
    }

    if (!termsAccepted) {
      setMessageState(message, `Please agree to the rental terms to continue.`, `error`);
      return;
    }

    const start = normalizeToMidnight(pickupDate);
    const end = normalizeToMidnight(returnDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setMessageState(message, `Please enter valid pickup and return dates.`, `error`);
      return;
    }

    const days = Math.ceil((end - start) / 86400000);
    if (days < 1) {
      setMessageState(message, `Return date must be at least one day after pickup date.`, `error`);
      return;
    }

    const selectedAddons = formData.getAll(`addons`).map((value) => `${value}`);
    const addonPerDay = selectedAddons.reduce((sum, addon) => sum + (addonRates[addon] || 0), 0);
    const subtotal = days * (dailyRate + addonPerDay);
    const tax = subtotal * 0.085;
    const grandTotal = subtotal + tax;

    setMessageState(
      message,
      `Payment approved for ${carModel} in ${pickupCity}. ${days} day${days === 1 ? `` : `s`} booked. Total charged: ${currencyFormatter.format(grandTotal)}.`,
      `success`,
    );

    const existingModel = carModel;
    const existingRate = `${dailyRate}`;
    form.reset();
    form.querySelector(`#carModel`).value = existingModel;
    form.querySelector(`#dailyRate`).value = existingRate;
    returnInput.min = pickupInput.min;

    if (window.sessionStorage) {
      window.sessionStorage.removeItem(`pendingBooking`);
    }
  });
};

const init = () => {
  setFooterDates();
  bindMobileNav();
  bindMortgageCalculator();
  bindValuationForm();
  bindContactForm();
  bindBookingForm();
  bindCheckoutForm();
};

document.addEventListener(`DOMContentLoaded`, init);

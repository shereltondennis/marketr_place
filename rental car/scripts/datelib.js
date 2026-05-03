const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".primary-nav");
const form = document.querySelector("#profileForm");
const message = document.querySelector("#formMessage");
const profileGrid = document.querySelector("#profileGrid");
const yearEl = document.querySelector("#currentYear");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isExpanded));
    nav.classList.toggle("is-open", !isExpanded);
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.tagName === "A") {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function createProfileCard(data) {
  const card = document.createElement("article");
  card.className = "profile-card";

  const heading = document.createElement("h3");
  heading.textContent = `${data.fullName}, ${data.age}`;

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `${data.city} • ${data.intent}`;

  const bio = document.createElement("p");
  bio.textContent = data.bio;

  card.append(heading, meta, bio);

  if (data.interests) {
    const interests = document.createElement("p");
    interests.className = "meta";
    interests.textContent = `Interests: ${data.interests}`;
    card.append(interests);
  }

  return card;
}

if (form && profileGrid && message) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const profile = {
      fullName: String(formData.get("fullName") || "").trim(),
      age: Number(formData.get("age") || 0),
      city: String(formData.get("city") || "").trim(),
      intent: String(formData.get("intent") || "").trim(),
      bio: String(formData.get("bio") || "").trim(),
      interests: String(formData.get("interests") || "").trim()
    };

    if (!form.checkValidity() || profile.age < 18 || profile.age > 99) {
      message.textContent = "Please complete all required fields with a valid age between 18 and 99.";
      message.style.color = "#9a2c2c";
      return;
    }

    const card = createProfileCard(profile);
    profileGrid.prepend(card);

    message.textContent = "Profile published. You are now visible to people ready to mingle on DateLIB.";
    message.style.color = "#2b5d3c";

    form.reset();
  });
}

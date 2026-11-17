
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const initialFoods = [
  {
    id: 1,
    name: "Fresh Vegetable Rice",
    category: "Cooked Meals",
    quantity: 25,
    unit: "meals",
    preparedAt: "2026-10-22T11:00",
    expiry: "2026-10-23T18:00",
    location: "Trichy",
    donor: "Community Kitchen",
    contact: "9876543210",
    notes: "Freshly prepared vegetarian meals.",
    status: "Available",
  },
  {
    id: 2,
    name: "Fresh Bread Packets",
    category: "Bakery",
    quantity: 15,
    unit: "packets",
    preparedAt: "2026-10-22T09:00",
    expiry: "2026-10-23T20:00",
    location: "Thillai Nagar, Trichy",
    donor: "Sunrise Bakery",
    contact: "9876501234",
    notes: "Sealed bread packets.",
    status: "Available",
  },
];

const initialVolunteers = [
  {
    id: 101,
    name: "Demo Volunteer",
    phone: "9876500000",
    email: "volunteer@example.com",
    area: "Trichy",
    availability: "Weekends",
    status: "Approved",
  },
];

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const makeId = () => Date.now() + Math.floor(Math.random() * 10000);

const formatDate = (value) => {
  if (!value) return "Not specified";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not specified"
    : date.toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const categories = [
  "Cooked Meals",
  "Vegetables",
  "Fruits",
  "Bakery",
  "Packaged Food",
  "Other",
];

function StatCard({ icon, label, value, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon = "📭", title, message }) {
  return (
    <div className="empty-state">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const className = status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`status-badge ${className}`}>{status}</span>;
}

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [foods, setFoods] = useState(() =>
    readStorage("shareaplate-foods", initialFoods)
  );
  const [volunteers, setVolunteers] = useState(() =>
    readStorage("shareaplate-volunteers", initialVolunteers)
  );
  const [requests, setRequests] = useState(() =>
    readStorage("shareaplate-requests", [])
  );
  const [activity, setActivity] = useState(() =>
    readStorage("shareaplate-activity", [
      {
        id: 1,
        message: "Welcome to ShareAPlate!",
        time: new Date().toISOString(),
      },
    ])
  );

  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [adminFoodSearch, setAdminFoodSearch] = useState("");
  const [requestFilter, setRequestFilter] = useState("All");
  const [selectedFoodId, setSelectedFoodId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [donation, setDonation] = useState({
    name: "",
    category: "Cooked Meals",
    quantity: "",
    unit: "meals",
    preparedAt: "",
    expiry: "",
    location: "",
    donor: "",
    contact: "",
    notes: "",
  });

  const [volunteerForm, setVolunteerForm] = useState({
    name: "",
    phone: "",
    email: "",
    area: "",
    availability: "Any day",
  });

  const [receiverForm, setReceiverForm] = useState({
    name: "",
    phone: "",
    quantity: "1",
    address: "",
    peopleCount: "1",
    reason: "",
  });

  useEffect(() => {
    localStorage.setItem("shareaplate-foods", JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    localStorage.setItem(
      "shareaplate-volunteers",
      JSON.stringify(volunteers)
    );
  }, [volunteers]);

  useEffect(() => {
    localStorage.setItem("shareaplate-requests", JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem("shareaplate-activity", JSON.stringify(activity));
  }, [activity]);

  function notify(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  function logActivity(message) {
    setActivity((previous) =>
      [
        { id: makeId(), message, time: new Date().toISOString() },
        ...previous,
      ].slice(0, 20)
    );
  }

  function navigate(nextPage) {
    setPage(nextPage);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateForm(setter, event) {
    const { name, value } = event.target;
    setter((previous) => ({ ...previous, [name]: value }));
  }

  const pendingRequests = requests.filter(
    (request) => request.status === "Pending"
  );

  const approvedVolunteers = volunteers.filter(
    (volunteer) => volunteer.status === "Approved"
  );

  const availableFoods = foods.filter(
    (food) =>
      food.status === "Available" &&
      Number(food.quantity) > 0 &&
      new Date(food.expiry).getTime() > Date.now()
  );

  const filteredFoods = availableFoods.filter((food) => {
    const text = `${food.name} ${food.donor} ${food.location}`.toLowerCase();
    return (
      text.includes(search.toLowerCase()) &&
      (categoryFilter === "All" || food.category === categoryFilter)
    );
  });

  const stats = useMemo(
    () => ({
      donations: foods.length,
      available: availableFoods.length,
      portions: availableFoods.reduce(
        (sum, food) => sum + Number(food.quantity || 0),
        0
      ),
      volunteers: approvedVolunteers.length,
      pending: pendingRequests.length,
      delivered: requests.filter((request) => request.status === "Delivered")
        .length,
    }),
    [foods, availableFoods, approvedVolunteers, pendingRequests, requests]
  );

  function submitDonation(event) {
    event.preventDefault();

    const quantity = Number(donation.quantity);
    const prepared = new Date(donation.preparedAt).getTime();
    const expiry = new Date(donation.expiry).getTime();

    if (!donation.name.trim() || !donation.donor.trim()) {
      notify("Enter the food name and donor name.");
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      notify("Quantity must be greater than zero.");
      return;
    }
    if (
      !donation.location.trim() ||
      donation.contact.replace(/\D/g, "").length < 10
    ) {
      notify("Enter a location and valid contact number.");
      return;
    }
    if (!prepared || !expiry || expiry <= prepared || expiry <= Date.now()) {
      notify("Check the preparation and future expiry times.");
      return;
    }

    const food = {
      ...donation,
      id: makeId(),
      quantity,
      name: donation.name.trim(),
      donor: donation.donor.trim(),
      status: "Available",
    };

    setFoods((previous) => [food, ...previous]);
    logActivity(`${food.donor} donated ${food.name}`);

    setDonation({
      name: "",
      category: "Cooked Meals",
      quantity: "",
      unit: "meals",
      preparedAt: "",
      expiry: "",
      location: "",
      donor: "",
      contact: "",
      notes: "",
    });

    notify("Donation published successfully!");
    navigate("Available Food");
  }

  function submitVolunteer(event) {
    event.preventDefault();

    if (
      !volunteerForm.name.trim() ||
      volunteerForm.phone.replace(/\D/g, "").length < 10 ||
      !volunteerForm.email.includes("@") ||
      !volunteerForm.area.trim()
    ) {
      notify("Enter a name, valid phone, email, and area.");
      return;
    }

    if (
      volunteers.some(
        (volunteer) =>
          volunteer.email.toLowerCase() ===
          volunteerForm.email.trim().toLowerCase()
      )
    ) {
      notify("This email has already been registered.");
      return;
    }

    const volunteer = {
      ...volunteerForm,
      id: makeId(),
      status: "Pending",
    };

    setVolunteers((previous) => [volunteer, ...previous]);
    logActivity(`${volunteer.name} registered as a volunteer`);

    setVolunteerForm({
      name: "",
      phone: "",
      email: "",
      area: "",
      availability: "Any day",
    });

    notify("Volunteer application submitted for admin approval.");
  }

  function submitRequest(event) {
    event.preventDefault();

    const food = foods.find((item) => item.id === selectedFoodId);
    const quantity = Number(receiverForm.quantity);

    if (!food || !availableFoods.some((item) => item.id === food.id)) {
      notify("This food is no longer available.");
      setSelectedFoodId(null);
      return;
    }

    if (
      !receiverForm.name.trim() ||
      receiverForm.phone.replace(/\D/g, "").length < 10 ||
      !receiverForm.address.trim()
    ) {
      notify("Enter your name, valid phone number, and address.");
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > food.quantity
    ) {
      notify(`Enter a quantity between 1 and ${food.quantity}.`);
      return;
    }

    const request = {
      id: makeId(),
      foodId: food.id,
      foodName: food.name,
      donor: food.donor,
      receiver: receiverForm.name.trim(),
      phone: receiverForm.phone.trim(),
      quantity,
      unit: food.unit,
      address: receiverForm.address.trim(),
      peopleCount: Math.max(1, Number(receiverForm.peopleCount) || 1),
      reason: receiverForm.reason.trim(),
      createdAt: new Date().toISOString(),
      status: "Pending",
      volunteerId: "",
    };

    setRequests((previous) => [request, ...previous]);
    logActivity(`${request.receiver} requested ${food.name}`);

    setReceiverForm({
      name: "",
      phone: "",
      quantity: "1",
      address: "",
      peopleCount: "1",
      reason: "",
    });
    setSelectedFoodId(null);

    notify("Request sent! The admin has been notified in the Admin Panel.");
    navigate("My Requests");
  }

  function approveVolunteer(id) {
    const volunteer = volunteers.find((item) => item.id === id);
    if (!volunteer) return;

    setVolunteers((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status: "Approved" } : item
      )
    );

    logActivity(`${volunteer.name} was approved as a volunteer`);
    notify("Volunteer approved.");
  }

  function rejectVolunteer(id) {
    const volunteer = volunteers.find((item) => item.id === id);
    if (!volunteer) return;

    setVolunteers((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status: "Rejected" } : item
      )
    );

    logActivity(`${volunteer.name}'s volunteer application was rejected`);
    notify("Volunteer application rejected.");
  }

  function assignVolunteer(requestId, volunteerId) {
    setRequests((previous) =>
      previous.map((request) =>
        request.id === requestId
          ? { ...request, volunteerId: volunteerId || "" }
          : request
      )
    );

    const volunteer = volunteers.find(
      (item) => String(item.id) === String(volunteerId)
    );

    if (volunteer) {
      logActivity(`${volunteer.name} was assigned to a receiver request`);
      notify(`Assigned ${volunteer.name} to the request.`);
    }
  }

  function approveRequest(requestId) {
    const request = requests.find((item) => item.id === requestId);
    if (!request || request.status !== "Pending") return;

    if (!request.volunteerId) {
      notify("Assign an approved volunteer before approving this request.");
      return;
    }

    const volunteer = approvedVolunteers.find(
      (item) => String(item.id) === String(request.volunteerId)
    );

    if (!volunteer) {
      notify("Choose a currently approved volunteer.");
      return;
    }

    const food = foods.find((item) => item.id === request.foodId);

    if (
      !food ||
      food.status !== "Available" ||
      food.quantity < request.quantity ||
      new Date(food.expiry).getTime() <= Date.now()
    ) {
      notify("Not enough unexpired food is available for this request.");
      return;
    }

    setFoods((previous) =>
      previous.map((item) => {
        if (item.id !== food.id) return item;
        const remaining = item.quantity - request.quantity;

        return {
          ...item,
          quantity: remaining,
          status: remaining === 0 ? "Reserved" : "Available",
        };
      })
    );

    setRequests((previous) =>
      previous.map((item) =>
        item.id === requestId
          ? { ...item, status: "Approved" }
          : item
      )
    );

    logActivity(
      `Request from ${request.receiver} approved; ${volunteer.name} assigned`
    );
    notify("Request approved and food quantity updated.");
  }

  function rejectRequest(requestId) {
    const request = requests.find((item) => item.id === requestId);
    if (!request || request.status !== "Pending") return;

    setRequests((previous) =>
      previous.map((item) =>
        item.id === requestId ? { ...item, status: "Rejected" } : item
      )
    );

    logActivity(`Request from ${request.receiver} was rejected`);
    notify("Receiver request rejected.");
  }

  function markDelivered(requestId) {
    const request = requests.find((item) => item.id === requestId);
    if (!request || request.status !== "Approved") return;

    setRequests((previous) =>
      previous.map((item) =>
        item.id === requestId ? { ...item, status: "Delivered" } : item
      )
    );

    const food = foods.find((item) => item.id === request.foodId);
    if (food && food.quantity === 0) {
      setFoods((previous) =>
        previous.map((item) =>
          item.id === food.id ? { ...item, status: "Delivered" } : item
        )
      );
    }

    logActivity(`Food delivered to ${request.receiver}`);
    notify("Delivery marked as completed.");
  }

  function deleteFood(foodId) {
    const food = foods.find((item) => item.id === foodId);

    if (
      requests.some(
        (request) =>
          request.foodId === foodId &&
          ["Pending", "Approved"].includes(request.status)
      )
    ) {
      notify("Resolve pending or approved requests before removing this food.");
      return;
    }

    if (!window.confirm("Remove this food listing?")) return;

    setFoods((previous) => previous.filter((item) => item.id !== foodId));
    logActivity(`Food listing removed: ${food?.name || "Food"}`);
    notify("Food listing removed.");
  }

  const navItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Donate Food", icon: "＋" },
    { name: "Available Food", icon: "♧" },
    { name: "My Requests", icon: "▤" },
    { name: "Volunteer", icon: "♡" },
    { name: "Admin Panel", icon: "⚙" },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
         
          <div>
            <strong>ShareAPlate</strong>
            <span>Food for everyone</span>
          </div>
        </div>

        <div className="nav-caption">WORKSPACE</div>

        <nav className="main-nav">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.name}
              className={`nav-link ${page === item.name ? "active" : ""}`}
              onClick={() => navigate(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
              {item.name === "Admin Panel" && pendingRequests.length > 0 && (
                <span className="nav-count">{pendingRequests.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-icon">🌱</span>
            <strong>Small actions, big impact</strong>
            <p>Share extra food. Help your community.</p>
          </div>
          <div className="sidebar-footer">ShareAPlate · </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
            >
              ☰
            </button>
            <div>
              <span className="breadcrumb">Workspace / {page}</span>
              <h1>{page}</h1>
            </div>
          </div>

          <div className="topbar-right">
            
            <button
              type="button"
              className="notification-button"
              title="Open admin panel"
              onClick={() => navigate("Admin Panel")}
            >
              ♧
              {pendingRequests.length > 0 && (
                <span className="notification-count">
                  {pendingRequests.length}
                </span>
              )}
            </button>
           </div>
        </header>

        {notice && (
          <div className="toast" role="status">
            <span>✓</span> {notice}
            <button type="button" onClick={() => setNotice("")}>
              ×
            </button>
          </div>
        )}

        <div className="page-content">
          {page === "Dashboard" && (
            <>
              <section className="welcome-banner">
                <div>
                  <span className="welcome-label">COMMUNITY IMPACT</span>
                  <h2>Good food deserves a good destination.</h2>
                  <p>
                    Connect food donors, volunteers, and people who need
                    support — all in one place.
                  </p>
                  <button
                    className="button button-light"
                    onClick={() => navigate("Donate Food")}
                  >
                    + Donate food
                  </button>
                </div>
                <div className="welcome-art" aria-hidden="true">
                  <div className="art-circle">🌿</div>
                  <span className="art-spark spark-one">✳</span>
                  <span className="art-spark spark-two">✦</span>
                  <span className="art-leaf">♧</span>
                </div>
              </section>

              <SectionHeading
                eyebrow="AT A GLANCE"
                title="Your community dashboard"
                description="A quick overview of donations and distribution activity."
              />

              <div className="stats-grid">
                <StatCard
                  icon="♧"
                  label="Food listings"
                  value={stats.donations}
                  tone="green"
                />
                <StatCard
                  icon="✓"
                  label="Available listings"
                  value={stats.available}
                  tone="blue"
                />
                <StatCard
                  icon="♡"
                  label="Available portions"
                  value={stats.portions}
                  tone="orange"
                />
                <StatCard
                  icon="♙"
                  label="Approved volunteers"
                  value={stats.volunteers}
                  tone="purple"
                />
              </div>

              <div className="dashboard-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Recent food donations</h3>
                      <p>The latest food shared with the community.</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => navigate("Available Food")}
                    >
                      View all →
                    </button>
                  </div>

                  {foods.length === 0 ? (
                    <EmptyState
                      icon="🥗"
                      title="No donations yet"
                      message="Be the first person to share food."
                    />
                  ) : (
                    <div className="recent-list">
                      {foods.slice(0, 4).map((food) => (
                        <div className="recent-item" key={food.id}>
                          <div className="food-symbol">🥗</div>
                          <div className="recent-info">
                            <strong>{food.name}</strong>
                            <span>
                              {food.donor} · {food.location}
                            </span>
                          </div>
                          <div className="recent-quantity">
                            <strong>{food.quantity}</strong>
                            <span>{food.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Recent activity</h3>
                      <p>Latest actions on the platform.</p>
                    </div>
                  </div>
                  {activity.length === 0 ? (
                    <EmptyState
                      title="No activity yet"
                      message="New actions will appear here."
                    />
                  ) : (
                    <div className="activity-list">
                      {activity.slice(0, 7).map((item) => (
                        <div className="activity-item" key={item.id}>
                          <span className="activity-dot" />
                          <div>
                            <p>{item.message}</p>
                            <span>{formatDate(item.time)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <section className="impact-strip">
                <div>
                  <span className="impact-icon">📦</span>
                  <div>
                    <strong>{requests.length} requests received</strong>
                    <p>Every request is tracked until it is resolved.</p>
                  </div>
                </div>
                <div>
                  <span className="impact-icon">🚚</span>
                  <div>
                    <strong>{stats.delivered} deliveries completed</strong>
                    <p>Track successful food distribution.</p>
                  </div>
                </div>
                <button
                  className="button button-primary"
                  onClick={() => navigate("Admin Panel")}
                >
                  Manage operations →
                </button>
              </section>
            </>
          )}

          {page === "Donate Food" && (
            <>
              <SectionHeading
                eyebrow="MAKE A DIFFERENCE"
                title="Donate surplus food"
                description="Share accurate food details so the right people can receive it safely."
              />

              <div className="form-layout">
                <section className="panel form-panel">
                  <div className="form-title">
                    <span className="form-title-icon">🥗</span>
                    <div>
                      <h3>Food donation details</h3>
                      <p>Fields marked * are required.</p>
                    </div>
                  </div>

                  <form onSubmit={submitDonation}>
                    <div className="form-grid">
                      <label className="field full-width">
                        Food name *
                        <input
                          name="name"
                          value={donation.name}
                          onChange={(e) => updateForm(setDonation, e)}
                          placeholder="e.g. Vegetable rice"
                          required
                        />
                      </label>

                      <label className="field">
                        Food category *
                        <select
                          name="category"
                          value={donation.category}
                          onChange={(e) => updateForm(setDonation, e)}
                        >
                          {categories.map((category) => (
                            <option key={category}>{category}</option>
                          ))}
                        </select>
                      </label>

                      <div className="field">
                        Quantity *
                        <div className="input-pair">
                          <input
                            type="number"
                            name="quantity"
                            min="1"
                            value={donation.quantity}
                            onChange={(e) => updateForm(setDonation, e)}
                            placeholder="e.g. 20"
                            required
                          />
                          <select
                            name="unit"
                            value={donation.unit}
                            onChange={(e) => updateForm(setDonation, e)}
                            aria-label="Quantity unit"
                          >
                            {["meals", "packets", "kg", "boxes", "pieces"]
                              .map((unit) => (
                                <option key={unit}>{unit}</option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <label className="field">
                        Preparation date and time *
                        <input
                          type="datetime-local"
                          name="preparedAt"
                          value={donation.preparedAt}
                          onChange={(e) => updateForm(setDonation, e)}
                          required
                        />
                      </label>

                      <label className="field">
                        Expiry / safe-use deadline *
                        <input
                          type="datetime-local"
                          name="expiry"
                          value={donation.expiry}
                          onChange={(e) => updateForm(setDonation, e)}
                          required
                        />
                      </label>

                      <label className="field">
                        Donor / organization *
                        <input
                          name="donor"
                          value={donation.donor}
                          onChange={(e) => updateForm(setDonation, e)}
                          placeholder="Your name or organization"
                          required
                        />
                      </label>

                      <label className="field">
                        Contact number *
                        <input
                          type="tel"
                          name="contact"
                          value={donation.contact}
                          onChange={(e) => updateForm(setDonation, e)}
                          placeholder="10-digit phone number"
                          required
                        />
                      </label>

                      <label className="field full-width">
                        Pickup location *
                        <input
                          name="location"
                          value={donation.location}
                          onChange={(e) => updateForm(setDonation, e)}
                          placeholder="Area, street, or landmark"
                          required
                        />
                      </label>

                      <label className="field full-width">
                        Additional information
                        <textarea
                          name="notes"
                          value={donation.notes}
                          onChange={(e) => updateForm(setDonation, e)}
                          placeholder="Ingredients, storage conditions, packaging..."
                          rows="3"
                        />
                      </label>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="button button-outline"
                        onClick={() =>
                          setDonation({
                            name: "",
                            category: "Cooked Meals",
                            quantity: "",
                            unit: "meals",
                            preparedAt: "",
                            expiry: "",
                            location: "",
                            donor: "",
                            contact: "",
                            notes: "",
                          })
                        }
                      >
                        Clear form
                      </button>
                      <button type="submit" className="button button-primary">
                        Publish donation →
                      </button>
                    </div>
                  </form>
                </section>

                <aside className="side-info">
                  <div className="info-card green-info">
                    <span>🌱</span>
                    <h3>Share responsibly</h3>
                    <p>
                      Only list food that has been stored safely and is suitable
                      for consumption.
                    </p>
                  </div>
                  <div className="info-card">
                    <span>⏱</span>
                    <h3>Be honest about timing</h3>
                    <p>
                      Include accurate preparation and expiry information so
                      volunteers can plan pickups.
                    </p>
                  </div>
                  <div className="info-card">
                    <span>📍</span>
                    <h3>Make pickup easy</h3>
                    <p>
                      Provide a clear location and contact number for
                      coordination.
                    </p>
                  </div>
                </aside>
              </div>
            </>
          )}

          {page === "Available Food" && (
            <>
              <SectionHeading
                eyebrow="FOOD DIRECTORY"
                title="Available food"
                description="Browse listed donations and request the quantity you need."
                action={
                  <button
                    className="button button-primary"
                    onClick={() => navigate("Donate Food")}
                  >
                    + Add donation
                  </button>
                }
              />

              <div className="filter-bar">
                <div className="search-box">
                  <span>⌕</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search food, donor, or location..."
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filter food category"
                >
                  <option>All</option>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </div>

              {filteredFoods.length === 0 ? (
                <EmptyState
                  icon="🥗"
                  title="No matching food available"
                  message="Try another search or check back later for new donations."
                />
              ) : (
                <div className="food-grid">
                  {filteredFoods.map((food) => (
                    <article className="food-card" key={food.id}>
                      <div className="food-card-top">
                        <div className="food-card-illustration">🥗</div>
                        <StatusBadge status="Available" />
                      </div>
                      <div className="food-card-body">
                        <span className="category-label">{food.category}</span>
                        <h3>{food.name}</h3>
                        <p className="food-donor">Donated by {food.donor}</p>
                        <div className="food-detail">
                          <span>📍 {food.location}</span>
                          <span>📦 {food.quantity} {food.unit}</span>
                          <span>⏱ Expires {formatDate(food.expiry)}</span>
                        </div>
                        {food.notes && (
                          <p className="food-notes">{food.notes}</p>
                        )}
                        <button
                          className="button button-primary button-wide"
                          onClick={() => setSelectedFoodId(food.id)}
                        >
                          Request this food →
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {selectedFoodId !== null && (
                <div
                  className="modal-backdrop"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                      setSelectedFoodId(null);
                    }
                  }}
                >
                  <section
                    className="modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="request-modal-title"
                  >
                    <div className="modal-heading">
                      <div>
                        <span className="eyebrow">RECEIVER FORM</span>
                        <h2 id="request-modal-title">Request food</h2>
                        <p>
                          {foods.find((food) => food.id === selectedFoodId)?.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="close-button"
                        aria-label="Close"
                        onClick={() => setSelectedFoodId(null)}
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={submitRequest}>
                      <div className="form-grid">
                        <label className="field full-width">
                          Your name *
                          <input
                            name="name"
                            value={receiverForm.name}
                            onChange={(e) => updateForm(setReceiverForm, e)}
                            required
                          />
                        </label>
                        <label className="field full-width">
                          Phone number *
                          <input
                            name="phone"
                            type="tel"
                            value={receiverForm.phone}
                            onChange={(e) => updateForm(setReceiverForm, e)}
                            required
                          />
                        </label>
                        <label className="field">
                          Quantity requested *
                          <input
                            name="quantity"
                            type="number"
                            min="1"
                            max={
                              foods.find((food) => food.id === selectedFoodId)
                                ?.quantity || 1
                            }
                            value={receiverForm.quantity}
                            onChange={(e) => updateForm(setReceiverForm, e)}
                            required
                          />
                        </label>
                        <label className="field">
                          People to feed
                          <input
                            name="peopleCount"
                            type="number"
                            min="1"
                            value={receiverForm.peopleCount}
                            onChange={(e) => updateForm(setReceiverForm, e)}
                          />
                        </label>
                        <label className="field full-width">
                          Delivery / pickup address *
                          <textarea
                            name="address"
                            value={receiverForm.address}
                            onChange={(e) => updateForm(setReceiverForm, e)}
                            rows="2"
                            required
                          />
                        </label>
                        <label className="field full-width">
                          Reason or additional details
                          <textarea
                            name="reason"
                            value={receiverForm.reason}
                            onChange={(e) => updateForm(setReceiverForm, e)}
                            rows="2"
                            placeholder="Optional"
                          />
                        </label>
                      </div>
                      <div className="form-actions">
                        <button
                          type="button"
                          className="button button-outline"
                          onClick={() => setSelectedFoodId(null)}
                        >
                          Cancel
                        </button>
                        <button className="button button-primary" type="submit">
                          Submit request
                        </button>
                      </div>
                    </form>
                  </section>
                </div>
              )}
            </>
          )}

          {page === "My Requests" && (
            <>
              <SectionHeading
                eyebrow="REQUEST TRACKER"
                title="Receiver requests"
                description="Track requests submitted through this browser."
                action={
                  <button
                    className="button button-primary"
                    onClick={() => navigate("Available Food")}
                  >
                    Browse food →
                  </button>
                }
              />

              <div className="stats-grid compact-stats">
                <StatCard
                  icon="▤"
                  label="Total requests"
                  value={requests.length}
                  tone="blue"
                />
                <StatCard
                  icon="◷"
                  label="Awaiting review"
                  value={stats.pending}
                  tone="orange"
                />
                <StatCard
                  icon="✓"
                  label="Delivered"
                  value={stats.delivered}
                  tone="green"
                />
              </div>

              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Request history</h3>
                    <p>Requests are updated by the admin.</p>
                  </div>
                  <select
                    value={requestFilter}
                    onChange={(e) => setRequestFilter(e.target.value)}
                    aria-label="Filter requests"
                  >
                    <option>All</option>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                    <option>Delivered</option>
                  </select>
                </div>

                {requests.filter(
                  (request) =>
                    requestFilter === "All" ||
                    request.status === requestFilter
                ).length === 0 ? (
                  <EmptyState
                    icon="📋"
                    title="No requests found"
                    message="Your food requests will appear here after you submit one."
                  />
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Food</th>
                          <th>Quantity</th>
                          <th>Requested on</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests
                          .filter(
                            (request) =>
                              requestFilter === "All" ||
                              request.status === requestFilter
                          )
                          .map((request) => (
                            <tr key={request.id}>
                              <td>
                                <strong>{request.foodName}</strong>
                                <small>{request.receiver}</small>
                              </td>
                              <td>
                                {request.quantity} {request.unit}
                              </td>
                              <td>{formatDate(request.createdAt)}</td>
                              <td>
                                <StatusBadge status={request.status} />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {page === "Volunteer" && (
            <>
              <SectionHeading
                eyebrow="JOIN THE MOVEMENT"
                title="Become a volunteer"
                description="Help coordinate food pickup and delivery in your community."
              />

              <div className="form-layout volunteer-layout">
                <section className="panel form-panel">
                  <div className="form-title">
                    <span className="form-title-icon">🤝</span>
                    <div>
                      <h3>Volunteer registration</h3>
                      <p>Your application will be reviewed by the admin.</p>
                    </div>
                  </div>

                  <form onSubmit={submitVolunteer}>
                    <div className="form-grid">
                      <label className="field full-width">
                        Full name *
                        <input
                          name="name"
                          value={volunteerForm.name}
                          onChange={(e) => updateForm(setVolunteerForm, e)}
                          required
                        />
                      </label>
                      <label className="field">
                        Phone number *
                        <input
                          name="phone"
                          type="tel"
                          value={volunteerForm.phone}
                          onChange={(e) => updateForm(setVolunteerForm, e)}
                          required
                        />
                      </label>
                      <label className="field">
                        Email address *
                        <input
                          name="email"
                          type="email"
                          value={volunteerForm.email}
                          onChange={(e) => updateForm(setVolunteerForm, e)}
                          required
                        />
                      </label>
                      <label className="field">
                        Preferred area *
                        <input
                          name="area"
                          value={volunteerForm.area}
                          onChange={(e) => updateForm(setVolunteerForm, e)}
                          placeholder="Your town or neighborhood"
                          required
                        />
                      </label>
                      <label className="field">
                        Availability
                        <select
                          name="availability"
                          value={volunteerForm.availability}
                          onChange={(e) => updateForm(setVolunteerForm, e)}
                        >
                          <option>Any day</option>
                          <option>Weekdays</option>
                          <option>Weekends</option>
                          <option>Mornings</option>
                          <option>Evenings</option>
                        </select>
                      </label>
                    </div>
                    <div className="form-actions">
                      <button className="button button-primary" type="submit">
                        Submit application →
                      </button>
                    </div>
                  </form>
                </section>

                <aside className="side-info">
                  <div className="info-card green-info">
                    <span>🚚</span>
                    <h3>Collect and deliver</h3>
                    <p>Coordinate pickups and deliveries assigned by the admin.</p>
                  </div>
                  <div className="info-card">
                    <span>🛡️</span>
                    <h3>Approval process</h3>
                    <p>
                      Your application must be approved before you can be
                      assigned to a request.
                    </p>
                  </div>
                  <div className="info-card">
                    <span>💚</span>
                    <h3>Make an impact</h3>
                    <p>Help reduce food waste and support people in need.</p>
                  </div>
                </aside>
              </div>

              <section className="panel volunteer-list-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Volunteer applications</h3>
                    <p>Registration status in this demo.</p>
                  </div>
                </div>

                {volunteers.length === 0 ? (
                  <EmptyState
                    title="No volunteers yet"
                    message="Volunteer registrations will appear here."
                  />
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Volunteer</th>
                          <th>Area</th>
                          <th>Availability</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {volunteers.map((volunteer) => (
                          <tr key={volunteer.id}>
                            <td>
                              <strong>{volunteer.name}</strong>
                              <small>{volunteer.email}</small>
                            </td>
                            <td>{volunteer.area}</td>
                            <td>{volunteer.availability}</td>
                            <td>
                              <StatusBadge status={volunteer.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {page === "Admin Panel" && (
            <>
              <SectionHeading
                eyebrow="ADMINISTRATION"
                title="Manage operations"
                description="Review food listings, receiver requests, volunteers, and delivery progress."
              />

              <div className="admin-stats">
                <StatCard
                  icon="🔔"
                  label="Pending requests"
                  value={pendingRequests.length}
                  tone="orange"
                />
                <StatCard
                  icon="♙"
                  label="Volunteers"
                  value={volunteers.length}
                  tone="purple"
                />
                <StatCard
                  icon="🥗"
                  label="Food listings"
                  value={foods.length}
                  tone="green"
                />
              </div>

              {pendingRequests.length > 0 && (
                <section className="notification-panel">
                  <div className="notification-panel-icon">🔔</div>
                  <div className="notification-panel-content">
                    <span className="eyebrow">ACTION REQUIRED</span>
                    <h3>
                      {pendingRequests.length} new receiver request
                      {pendingRequests.length === 1 ? "" : "s"} need your
                      attention
                    </h3>
                    <p>
                      Review each request below, assign an approved volunteer,
                      and then approve or reject the request.
                    </p>
                    <div className="pending-preview">
                      {pendingRequests.slice(0, 3).map((request) => (
                        <div key={request.id}>
                          <span className="pending-dot" />
                          <strong>{request.receiver}</strong>
                          <span>requested {request.foodName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <section className="panel admin-section">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">INVENTORY</span>
                    <h3>Manage food donations</h3>
                    <p>Review and remove food listings.</p>
                  </div>
                  <div className="admin-search">
                    <input
                      value={adminFoodSearch}
                      onChange={(e) => setAdminFoodSearch(e.target.value)}
                      placeholder="Search donations..."
                    />
                  </div>
                </div>

                {foods.filter((food) =>
                  `${food.name} ${food.donor} ${food.location}`
                    .toLowerCase()
                    .includes(adminFoodSearch.toLowerCase())
                ).length === 0 ? (
                  <EmptyState
                    title="No food listings"
                    message="Food donations will appear here."
                  />
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Food / donor</th>
                          <th>Quantity</th>
                          <th>Expiry</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {foods
                          .filter((food) =>
                            `${food.name} ${food.donor} ${food.location}`
                              .toLowerCase()
                              .includes(adminFoodSearch.toLowerCase())
                          )
                          .map((food) => (
                            <tr key={food.id}>
                              <td>
                                <strong>{food.name}</strong>
                                <small>
                                  {food.donor} · {food.location}
                                </small>
                              </td>
                              <td>
                                {food.quantity} {food.unit}
                              </td>
                              <td>{formatDate(food.expiry)}</td>
                              <td>
                                <StatusBadge status={food.status} />
                              </td>
                              <td>
                                <button
                                  className="button button-danger button-small"
                                  onClick={() => deleteFood(food.id)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="panel admin-section">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">PEOPLE</span>
                    <h3>Manage volunteers</h3>
                    <p>Approve volunteer applications before assigning them.</p>
                  </div>
                </div>

                {volunteers.length === 0 ? (
                  <EmptyState
                    title="No volunteer applications"
                    message="New volunteer registrations will appear here."
                  />
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Volunteer</th>
                          <th>Contact</th>
                          <th>Area</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {volunteers.map((volunteer) => (
                          <tr key={volunteer.id}>
                            <td>
                              <strong>{volunteer.name}</strong>
                              <small>{volunteer.availability}</small>
                            </td>
                            <td>
                              {volunteer.phone}
                              <small>{volunteer.email}</small>
                            </td>
                            <td>{volunteer.area}</td>
                            <td>
                              <StatusBadge status={volunteer.status} />
                            </td>
                            <td>
                              {volunteer.status !== "Approved" && (
                                <button
                                  className="button button-primary button-small"
                                  onClick={() => approveVolunteer(volunteer.id)}
                                >
                                  Approve
                                </button>
                              )}
                              {volunteer.status !== "Rejected" && (
                                <button
                                  className="button button-danger button-small"
                                  onClick={() => rejectVolunteer(volunteer.id)}
                                >
                                  Reject
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="panel admin-section">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">DISTRIBUTION</span>
                    <h3>Manage receiver requests and deliveries</h3>
                    <p>
                      Assign a volunteer before approval. Only approved
                      requests can be marked as delivered.
                    </p>
                  </div>
                  <select
                    value={requestFilter}
                    onChange={(e) => setRequestFilter(e.target.value)}
                    aria-label="Filter admin requests"
                  >
                    <option>All</option>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                    <option>Delivered</option>
                  </select>
                </div>

                {requests.filter(
                  (request) =>
                    requestFilter === "All" ||
                    request.status === requestFilter
                ).length === 0 ? (
                  <EmptyState
                    icon="📋"
                    title="No receiver requests"
                    message="Requests submitted by receivers will appear here."
                  />
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Receiver / food</th>
                          <th>Quantity</th>
                          <th>Request time</th>
                          <th>Assign volunteer</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests
                          .filter(
                            (request) =>
                              requestFilter === "All" ||
                              request.status === requestFilter
                          )
                          .map((request) => (
                            <tr key={request.id}>
                              <td>
                                <strong>{request.receiver}</strong>
                                <small>{request.foodName}</small>
                                <small>{request.address}</small>
                              </td>
                              <td>
                                {request.quantity} {request.unit}
                              </td>
                              <td>{formatDate(request.createdAt)}</td>
                              <td>
                                <select
                                  value={request.volunteerId || ""}
                                  disabled={
                                    !["Pending", "Approved"].includes(
                                      request.status
                                    )
                                  }
                                  onChange={(e) =>
                                    assignVolunteer(
                                      request.id,
                                      e.target.value
                                    )
                                  }
                                  aria-label={`Assign volunteer for ${request.receiver}`}
                                >
                                  <option value="">Select volunteer</option>
                                  {approvedVolunteers.map((volunteer) => (
                                    <option
                                      key={volunteer.id}
                                      value={volunteer.id}
                                    >
                                      {volunteer.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <StatusBadge status={request.status} />
                              </td>
                              <td>
                                {request.status === "Pending" && (
                                  <>
                                    <button
                                      className="button button-primary button-small"
                                      onClick={() => approveRequest(request.id)}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      className="button button-danger button-small"
                                      onClick={() => rejectRequest(request.id)}
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {request.status === "Approved" && (
                                  <button
                                    className="button button-primary button-small"
                                    onClick={() => markDelivered(request.id)}
                                  >
                                    Mark delivered
                                  </button>
                                )}
                                {["Delivered", "Rejected"].includes(
                                  request.status
                                ) && <span className="muted">Completed</span>}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="admin-footnote">
                <span>🔒</span>
                <p>
                  <strong>Demo admin panel:</strong> This frontend-only
                  prototype does not have login or server-side permissions.
                  Real deployments need authenticated admin access.
                </p>
              </section>
            </>
          )}
        </div>

        <footer className="app-footer">
          <span>© 2026 ShareAPlate</span>
          <span>Reducing waste. Sharing hope. 🌱</span>
        </footer>
      </main>
    </div>
  );
}

(function () {
  var slots = ["10:00", "10:30", "11:00", "12:00", "14:00", "15:30", "16:00", "17:00"];

  var stepServices = document.getElementById("step-services");
  var stepTimes = document.getElementById("step-times");
  var stepDetails = document.getElementById("step-details");
  var stepSuccess = document.getElementById("step-success");
  var slotGrid = document.getElementById("slot-grid");
  var selectedService = null;
  var selectedSlot = null;

  function show(el) {
    el.classList.remove("hidden");
  }
  function hide(el) {
    el.classList.add("hidden");
  }

  function renderSlots() {
    slotGrid.innerHTML = "";
    slots.forEach(function (time) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot-btn";
      btn.textContent = time;
      btn.addEventListener("click", function () {
        selectedSlot = time;
        hide(stepTimes);
        show(stepDetails);
      });
      slotGrid.appendChild(btn);
    });
  }

  document.querySelectorAll(".service-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectedService = btn.getAttribute("data-service");
      hide(stepServices);
      renderSlots();
      show(stepTimes);
    });
  });

  document.getElementById("back-to-services").addEventListener("click", function () {
    hide(stepTimes);
    show(stepServices);
  });

  document.getElementById("back-to-times").addEventListener("click", function () {
    hide(stepDetails);
    show(stepTimes);
  });

  document.getElementById("booking-form").addEventListener("submit", function (e) {
    e.preventDefault();
    hide(stepDetails);
    show(stepSuccess);
  });
})();

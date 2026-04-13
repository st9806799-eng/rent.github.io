(function (global) {
  var SESSION_KEY = "rent-session-user-id";

  function getSessionUser() {
    var id = sessionStorage.getItem(SESSION_KEY);
    if (!id) return null;
    var u = global.RentDB.findUserById(id);
    return u || null;
  }

  function setSession(userId) {
    sessionStorage.setItem(SESSION_KEY, userId);
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function register(email, password, asAdmin) {
    return global.RentCrypto.sha256hex(password).then(function (hash) {
      var role = asAdmin ? "ADMIN" : "OWNER";
      var r = global.RentDB.createUser(email, hash, role);
      if (r.error) return r;
      setSession(r.user.id);
      return { user: r.user };
    });
  }

  function login(email, password) {
    return global.RentCrypto.sha256hex(password).then(function (hash) {
      var u = global.RentDB.findUserByEmail(email);
      if (!u || u.passwordHash !== hash) return { error: "bad" };
      setSession(u.id);
      return { user: u };
    });
  }

  function requireLogin(redirect) {
    var u = getSessionUser();
    if (!u) {
      global.location.href = redirect || "login.html";
      return null;
    }
    return u;
  }

  function requireOwner(redirect) {
    var u = requireLogin(redirect);
    if (!u) return null;
    if (u.role === "ADMIN") {
      global.location.href = "../admin/index.html";
      return null;
    }
    return u;
  }

  function requireAdmin(redirect) {
    var u = requireLogin(redirect);
    if (!u) return null;
    if (u.role !== "ADMIN") {
      global.location.href = "../dashboard/index.html";
      return null;
    }
    return u;
  }

  global.RentAuth = {
    getSessionUser: getSessionUser,
    setSession: setSession,
    logout: logout,
    register: register,
    login: login,
    requireLogin: requireLogin,
    requireOwner: requireOwner,
    requireAdmin: requireAdmin,
  };
})(typeof window !== "undefined" ? window : this);

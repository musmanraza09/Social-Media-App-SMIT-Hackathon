  // --------------------------
    // Element references
    // --------------------------
    var homeLink = document.getElementById("home-link");
    var dashboardLink = document.getElementById("dashboard-link");
    var loginBtn = document.getElementById("loginBtn");
    var signupBtn = document.getElementById("signupBtn");
    var authModalEl = document.getElementById("authModal");
    var authModal = new bootstrap.Modal(authModalEl);
    var tabLogin = document.getElementById("tabLogin");
    var tabSignup = document.getElementById("tabSignup");
    var loginForm = document.getElementById("loginForm");
    var signupForm = document.getElementById("signupForm");
    var authTitle = document.getElementById("authTitle");

    var welcomeText = document.getElementById("welcomeText");
    var createPostCard = document.getElementById("createPostCard");
    var postsContainer = document.getElementById("posts-container");
    var userPostsContainer = document.getElementById("user-posts-container");
    var postForm = document.getElementById("post-form");
    var postIdInput = document.getElementById("post-id");
    var postTitleInput = document.getElementById("post-title");
    var postDescriptionInput = document.getElementById("post-description");
    var postImageInput = document.getElementById("post-image");
    var cancelEditBtn = document.getElementById("cancel-edit");
    var confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    var sortSelect = document.getElementById("sortSelect");
    var showDashboardBtn = document.getElementById("showDashboardBtn");

    var currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
    var postToDeleteId = null;

    // --------------------------
    // Init
    // --------------------------
    document.addEventListener("DOMContentLoaded", function(){
      bindEvents();
      updateUI();
      loadAllPosts();
      loadUserPost();
    });

    function bindEvents() {
      tabLogin.addEventListener("click", function(e){ e.preventDefault(); showLoginTab(); });
      tabSignup.addEventListener("click", function(e){ e.preventDefault(); showSignupTab(); });

      loginForm.addEventListener("submit", handleLogin);
      signupForm.addEventListener("submit", handleSignup);

      // When login/signup buttons in navbar are clicked, open modal and show appropriate form
      loginBtn.addEventListener("click", function(){
        showLoginTab();
        authModal.show();
      });
      signupBtn.addEventListener("click", function(){
        showSignupTab();
        authModal.show();
      });

      postForm.addEventListener("submit", handlePostSubmit);
      cancelEditBtn.addEventListener("click", resetPostForm);

      sortSelect.addEventListener("change", function(){ loadAllPosts(); });

      showDashboardBtn.addEventListener("click", function(){
        // scroll to user posts section
        userPostsContainer.scrollIntoView({ behavior: "smooth" });
      });

      confirmDeleteBtn.addEventListener("click", function(){
        if (!postToDeleteId) return;
        deletePostConfirmed(postToDeleteId);
        postToDeleteId = null;
        var confirmModalEl = document.getElementById("confirmModal");
        var bs = bootstrap.Modal.getInstance(confirmModalEl);
        if (bs) bs.hide();
      });

      // Also allow clicking on dashboardLink to show user posts (same behavior)
      dashboardLink.addEventListener("click", function(e){ e.preventDefault(); userPostsContainer.scrollIntoView({ behavior: "smooth" }); });
    }

    // --------------------------
    // Tabs helpers
    // --------------------------
    function showLoginTab() {
      loginForm.classList.remove("d-none");
      signupForm.classList.add("d-none");
      tabLogin.classList.add("active");
      tabSignup.classList.remove("active");
      authTitle.textContent = "Login";
    }
    function showSignupTab() {
      signupForm.classList.remove("d-none");
      loginForm.classList.add("d-none");
      tabSignup.classList.add("active");
      tabLogin.classList.remove("active");
      authTitle.textContent = "Sign Up";
    }

    // --------------------------
    // Auth: Login / Signup
    // --------------------------
    function handleLogin(e) {
      e.preventDefault();
      var email = document.getElementById("loginEmail").value.trim().toLowerCase();
      var password = document.getElementById("loginPassword").value;

      var users = JSON.parse(localStorage.getItem("users")) || [];
      var user = null;
      for (var i = 0; i < users.length; i++) {
        if (users[i].email === email && users[i].password === password) {
          user = users[i];
          break;
        }
      }

      if (!user) {
        alert("Invalid email or password");
        return;
      }

      currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      authModal.hide();
      loginForm.reset();
      updateUI();
      loadAllPosts();
      loadUserPost();
    }

    function handleSignup(e) {
      e.preventDefault();
      var name = document.getElementById("signupName").value.trim();
      var email = document.getElementById("signupEmail").value.trim().toLowerCase();
      var password = document.getElementById("signupPassword").value;

      if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
      }

      var users = JSON.parse(localStorage.getItem("users")) || [];
      for (var i = 0; i < users.length; i++) {
        if (users[i].email === email) {
          alert("Email already registered");
          return;
        }
      }

      var newUser = { id: Date.now().toString(), name: name, email: email, password: password };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      currentUser = newUser;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      authModal.hide();
      signupForm.reset();
      updateUI();
      loadAllPosts();
      loadUserPost();
    }

    function handleLogout() {
      currentUser = null;
      localStorage.removeItem("currentUser");
      updateUI();
    }

    // --------------------------
    // Update UI after auth
    // --------------------------
    function updateUI() {
      if (currentUser) {
        welcomeText.textContent = "Welcome, " + currentUser.name;
        createPostCard.classList.remove("d-none");
        dashboardLink.style.display = "block";
        showDashboardBtn.style.display = "inline-block";

        // switch navbar auth buttons: show logout instead of login/signup
        var authButtons = document.getElementById("authButtons");
        authButtons.innerHTML = "";
        var logoutBtn = document.createElement("button");
        logoutBtn.className = "btn btn-outline-light";
        logoutBtn.textContent = "Logout";
        logoutBtn.addEventListener("click", function(){ handleLogout(); loadAllPosts(); loadUserPost(); });
        authButtons.appendChild(logoutBtn);
      } else {
        welcomeText.textContent = "Welcome, Guest";
        createPostCard.classList.add("d-none");
        dashboardLink.style.display = "none";
        showDashboardBtn.style.display = "none";

        var authButtons = document.getElementById("authButtons");
        authButtons.innerHTML = '';
        var loginBtnEl = document.createElement("button");
        loginBtnEl.className = "btn btn-outline-light";
        loginBtnEl.id = "loginBtnNav";
        loginBtnEl.setAttribute("data-bs-toggle","modal");
        loginBtnEl.setAttribute("data-bs-target","#authModal");
        loginBtnEl.textContent = "Login";
        loginBtnEl.addEventListener("click", function(){ showLoginTab(); });

        var signupBtnEl = document.createElement("button");
        signupBtnEl.className = "btn btn-success";
        signupBtnEl.id = "signupBtnNav";
        signupBtnEl.setAttribute("data-bs-toggle","modal");
        signupBtnEl.setAttribute("data-bs-target","#authModal");
        signupBtnEl.textContent = "Sign Up";
        signupBtnEl.addEventListener("click", function(){ showSignupTab(); });

        authButtons.appendChild(loginBtnEl);
        authButtons.appendChild(signupBtnEl);
      }
    }

    // --------------------------
    // Posts: create / edit / delete
    // --------------------------
    function handlePostSubmit(e) {
      e.preventDefault();

      if (!currentUser) {
        // open modal login
        showLoginTab();
        authModal.show();
        return;
      }

      var postId = postIdInput.value || "";
      var title = postTitleInput.value.trim();
      var description = postDescriptionInput.value.trim();
      var imageFile = postImageInput.files[0];

      if (!title || !description) {
        alert("Please fill Title and Description");
        return;
      }

      // If a new image file selected → read it as base64 then save
      if (imageFile) {
        var reader = new FileReader();
        reader.onload = function(event) {
          var imageUrl = event.target.result;
          savePostData(postId, title, description, imageUrl);
        };
        reader.readAsDataURL(imageFile);
        return;
      }

      // No new image file: if editing keep previous image, else empty string
      var prevImage = "";
      if (postId) {
        var postsTmp = JSON.parse(localStorage.getItem("posts")) || [];
        for (var i = 0; i < postsTmp.length; i++) {
          if (postsTmp[i].id === postId) {
            prevImage = postsTmp[i].imageUrl || "";
            break;
          }
        }
      }

      savePostData(postId, title, description, prevImage);
    }

    function savePostData(postId, title, description, imageUrl) {
      var posts = JSON.parse(localStorage.getItem("posts")) || [];

      if (postId) {
        // edit
        for (var i = 0; i < posts.length; i++) {
          if (posts[i].id === postId && posts[i].authorId === currentUser.id) {
            posts[i].title = title;
            posts[i].description = description;
            posts[i].imageUrl = imageUrl;
            posts[i].updatedAt = new Date().toISOString();
            break;
          }
        }
      } else {
        // new
        var newPost = {
          id: Date.now().toString(),
          title: title,
          description: description,
          imageUrl: imageUrl || "",
          authorId: currentUser.id,
          authorUsername: currentUser.name,
          createdAt: new Date().toISOString()
        };
        posts.push(newPost);
      }

      localStorage.setItem("posts", JSON.stringify(posts));
      postForm.reset();
      postIdInput.value = "";
      cancelEditBtn.style.display = "none";
      loadAllPosts();
      loadUserPost();
    }

    function editPost(postId) {
      if (!currentUser) return;
      var posts = JSON.parse(localStorage.getItem("posts")) || [];
      for (var i = 0; i < posts.length; i++) {
        if (posts[i].id === postId && posts[i].authorId === currentUser.id) {
          postIdInput.value = posts[i].id;
          postTitleInput.value = posts[i].title;
          postDescriptionInput.value = posts[i].description;
          // Note: we cannot set file input programmatically for security;
          // if user doesn't choose new file, existing image will be kept.
          cancelEditBtn.style.display = "inline-block";
          document.querySelector(".post-form-container").scrollIntoView({ behavior: "smooth" });
          break;
        }
      }
    }

    function confirmDelete(postId) {
      // show confirm modal
      postToDeleteId = postId;
      var confirmModalEl = document.getElementById("confirmModal");
      var bs = new bootstrap.Modal(confirmModalEl);
      bs.show();
    }
function deletePostConfirmed(postId) {
  if (!currentUser) return;

  var posts = JSON.parse(localStorage.getItem("posts")) || [];

  posts = posts.filter(function(p){
    return !(p.id == postId && p.authorId == currentUser.id);
  });

  localStorage.setItem("posts", JSON.stringify(posts));
  loadAllPosts();
  loadUserPost();
}


    // Load posts and 
    function loadAllPosts() {
      var posts = JSON.parse(localStorage.getItem("posts")) || [];

    var mode = "latest";
if (sortSelect) {
  mode = sortSelect.value;
}

      if (mode === "latest") {
        posts.sort(function(a,b){ return new Date(b.createdAt) - new Date(a.createdAt); });
      } else if (mode === "oldest") {
        posts.sort(function(a,b){ return new Date(a.createdAt) - new Date(b.createdAt); });
      } else if (mode === "mostLiked") {
        // placeholder — likes not implemented in this version
        posts.sort(function(a,b){ return 0; });
      }

      postsContainer.innerHTML = "";
      if (posts.length === 0) {
        postsContainer.innerHTML = '<div class="card p-4 text-center text-muted">No posts yet.</div>';
        return;
      }

      for (var i = 0; i < posts.length; i++) {
        postsContainer.appendChild(createPostElement(posts[i], posts[i].authorId === (currentUser && currentUser.id)));
      }
    }

    function loadUserPost() {
      if (!currentUser) {
        userPostsContainer.innerHTML = "<p>Please log in to view your posts.</p>";
        return;
      }
      var posts = JSON.parse(localStorage.getItem("posts")) || [];
      var userPosts = [];
      for (var i = 0; i < posts.length; i++) {
        if (posts[i].authorId === currentUser.id) userPosts.push(posts[i]);
      }
      userPosts.sort(function(a,b){ return new Date(b.createdAt) - new Date(a.createdAt); });

      userPostsContainer.innerHTML = "";
      if (userPosts.length === 0) {
        userPostsContainer.innerHTML = "<p>You haven't created any posts yet.</p>";
        return;
      }

      for (var i = 0; i < userPosts.length; i++) {
        userPostsContainer.appendChild(createPostElement(userPosts[i], true));
      }
    }

    function createPostElement(post, isEditable) {
      var postDiv = document.createElement("div");
      postDiv.className = "post-card";

      var img = document.createElement("img");
      img.className = "post-image";
      img.src = post.imageUrl || "";
      img.alt = post.title || "";

      var content = document.createElement("div");
      content.className = "post-content";

      var h3 = document.createElement("h3");
      h3.textContent = post.title || "(no title)";

      var p = document.createElement("p");
      p.textContent = post.description || "";

      var meta = document.createElement("div");
      meta.className = "text-muted small";
      meta.textContent = "By " + (post.authorUsername || "Unknown") + " • " + new Date(post.createdAt).toLocaleString();

      content.appendChild(h3);
      content.appendChild(p);
      content.appendChild(meta);

      if (isEditable && currentUser && post.authorId === currentUser.id) {
        var actions = document.createElement("div");
        actions.className = "post-actions mt-2";

        var editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-warning me-2";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", function(){ editPost(post.id); });

        var delBtn = document.createElement("button");
        delBtn.className = "btn btn-sm btn-danger";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", function(){ confirmDelete(post.id); });

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        content.appendChild(actions);
      }

      postDiv.appendChild(img);
      postDiv.appendChild(content);

      return postDiv;
    }
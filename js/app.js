const socket = io("https://l8qn2l7t-5001.brs.devtunnels.ms");

const promiseUser = new Promise((resolve) => {
  if (localStorage.getItem("data-user")) {
    return resolve(JSON.parse(localStorage.getItem("data-user")));
  }

  fetch("https://random-data-api.com/api/users/random_user")
    .then((res) => res.json())
    .then((data) => {
      localStorage.setItem("data-user", JSON.stringify(data));
      resolve(data);
    });
});

const promiseIp = new Promise((resolve) => {
  resolve(Android.getLocalIpAddress());
});

const promiseIpPublic = new Promise((resolve) => {
  fetch("https://app.victor01sp.com/ip/get.php")
    .then((res) => res.json())
    .then((data) => {
      resolve(data.data);
    });
});

const focus = {
  element: null,
  parent: null,
  index: 0,
};

function startApp(data) {
  const user = {
    data: data[0],
    ip: data[1],
    ippublic: data[2],
  };

  const users = [];

  const $users = document.getElementById("datas");
  document.getElementById("avatar").src = user.data.avatar;
  document.getElementById("iplocal").textContent = data[1];

  function renderUser(users = []) {
    console.log(user);
    $users.innerHTML = [user]
      .concat(users)
      .map((user) => {
        console.log(user);
        return `<button class="div_bChaKnx" data-ip="${user.ip}" data-keydown><img src="${user.data.avatar}"></button>`;
      })
      .join("");

    $users.querySelector("button").focus();
  }

  // socket.emit
  socket.on("get-data", (data) => {
    console.log(data);
    socket.emit("set-data", {
      header: {},
      body: {
        user,
      },
    });

    if (
      !users.some((user) => user.ip == data.body.user.ip) &&
      user.ippublic == data.body.user.ippublic
    ) {
      users.push(data.body.user);
      renderUser(users);
    }
  });

  socket.on("set-data", (data) => {
    if (
      !users.some((user) => user.ip == data.body.user.ip) &&
      user.ippublic == data.body.user.ippublic
    ) {
      users.push(data.body.user);
      renderUser(users);
    }
  });

  socket.emit("get-data", {
    header: {},
    body: {
      user,
    },
  });

  $users.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (button) {
      const ip = button.getAttribute("data-ip");
      Android.openWithDefault(`http://${ip}:4445/${Date.now()}.mkv`, "video/*");
    }
  });

  renderUser(users);
}

function getColumnCount(container, gap = 0, padding = 0) {
  const total = container.offsetWidth / container.children[0].offsetWidth;
  const widthGapPadding = (total - 1) * gap + padding * 2;

  return Math.floor(
    total - Math.floor(widthGapPadding / container.children[0].offsetWidth)
  );
}

addEventListener("DOMContentLoaded", () => {
  document.getElementById("app").innerHTML = `
    <div class="div_j6JA7Rb">
      <div class="button_SEUiBz3"><img id="avatar" src=""></div>
      <span id="iplocal">-</span>
    </div>
    <div class="div_tEuIgMe">
        <div class="div_uf5lPAu" id="datas" data-keydown-parent></div>
    </div>
  `;

  Promise.all([promiseUser, promiseIp, promiseIpPublic]).then(startApp);
});

addEventListener("keydown", (e) => {
  if (e.key != "Enter") e.preventDefault();

  if (document.activeElement.getAttribute("data-keydown") == null) {
    focus.element.focus();
    return;
  }

  if (
    !["ArrowRight", "ArrowUp", "ArrowDown", "ArrowLeft", "Enter"].includes(
      e.key
    )
  )
    return;

  const keydowns = Array.from(document.querySelectorAll("[data-keydown]"));
  const index = keydowns.findIndex((keydown) => keydown === focus.element);

  const num = getColumnCount(focus.parent, 10, 10);

  if (e.key == "ArrowRight") {
    if (keydowns[index + 1]) {
      keydowns[index + 1].focus();
    }
  }

  if (e.key == "ArrowLeft") {
    if (keydowns[index - 1]) {
      keydowns[index - 1].focus();
    }
  }

  if (e.key == "ArrowUp") {
    if (keydowns[index - num]) {
      keydowns[index - num].focus();
    } else {
      keydowns[0].focus();
    }
  }

  if (e.key == "ArrowDown") {
    if (keydowns[index + num]) {
      keydowns[index + num].focus();
    } else {
      keydowns.reverse()[0].focus();
    }
  }
});

addEventListener("focusin", (e) => {
  focus.element = e.target;
  focus.parent = focus.element.closest("[data-keydown-parent]") || document;
});

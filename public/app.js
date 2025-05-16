const repoList = document.getElementById("repo-list");
const repoDetails = document.getElementById("repo-details");
const branchSelect = document.getElementById("branch-select");

let currentUsername = "";
let selectedRepo = null;

async function getRepositories() {
  const username = document.getElementById("username").value.trim();
  if (!username) return alert("Введіть нікнейм користувача!");

  try {
    const response = await fetch(`/api/repos/${username}`);

    if (!response.ok) {
      const error = await response.json();
      alert(error.message || "Сталася помилка при отриманні репозиторіїв");
      clearPage();
      return;
    }

    const repos = await response.json();
    currentUsername = username;
    repoList.innerHTML = "";

    repos.forEach((repo) => {
      const repoItem = document.createElement("li");
      repoItem.textContent = repo.name;
      repoItem.onclick = () => getRepoDetails(repo.name);
      repoList.appendChild(repoItem);
    });
  } catch (error) {
    alert("Сталася помилка під час запиту до сервера");
  }
}

async function getRepoDetails(repoName) {
  selectedRepo = repoName;
  repoDetails.style.display = "block";

  try {
    const repoResponse = await fetch(
      `/api/repos/${currentUsername}/${repoName}`
    );

    if (!repoResponse.ok) {
      alert("Помилка при отриманні даних репозиторію");
      return;
    }

    const repoData = await repoResponse.json();

    document.getElementById(
      "repo-name"
    ).textContent = `Назва: ${repoData.name}`;
    document.getElementById("repo-description").textContent = `Опис: ${
      repoData.description || "для даного репозиторію немає опису"
    }`;
    document.getElementById(
      "repo-url"
    ).innerHTML = `URL: <a href="${repoData.html_url}" target="_blank">${repoData.html_url}</a>`;
    document.getElementById(
      "repo-created"
    ).textContent = `Дата створення: ${new Date(
      repoData.created_at
    ).toLocaleDateString()}`;
    document.getElementById(
      "repo-updated"
    ).textContent = `Дата останнього оновлення: ${new Date(
      repoData.updated_at
    ).toLocaleDateString()}`;

    const languagesResponse = await fetch(
      `/api/repos/${currentUsername}/${repoName}/languages`
    );
    const languages = await languagesResponse.json();
    const languageList = Object.keys(languages).join(", ");
    document.getElementById(
      "repo-languages"
    ).textContent = `Мови, що використовуються: ${languageList || "немає"}`;

    const branchesResponse = await fetch(
      `/api/repos/${currentUsername}/${repoName}/branches`
    );
    const branches = await branchesResponse.json();
    branchSelect.innerHTML = "";

    branches.forEach((branch) => {
      const option = document.createElement("option");
      option.value = branch.name;
      option.textContent = branch.name;
      branchSelect.appendChild(option);
    });

    getCommits();
  } catch (error) {
    alert("Сталася помилка під час запиту до сервера");
  }
}

async function getCommits() {
  const branch = document.getElementById("branch-select").value;
  if (!branch) return;

  try {
    const commitsResponse = await fetch(
      `/api/repos/${currentUsername}/${selectedRepo}/commits/${branch}`
    );

    if (!commitsResponse.ok) {
      document.getElementById("commit-list").innerHTML =
        "Помилка при отриманні комітів";
      return;
    }

    const commits = await commitsResponse.json();
    const commitList = document.getElementById("commit-list");
    commitList.innerHTML = "";

    const table = document.createElement("table");
    const headerRow = document.createElement("tr");
    ["Дата", "Хеш", "Повідомлення"].forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    commits.forEach((commit) => {
      const row = document.createElement("tr");

      const dateCell = document.createElement("td");
      dateCell.textContent = new Date(
        commit.commit.author.date
      ).toLocaleDateString();
      row.appendChild(dateCell);

      const shaCell = document.createElement("td");
      shaCell.textContent = commit.sha;
      row.appendChild(shaCell);

      const messageCell = document.createElement("td");
      messageCell.textContent = commit.commit.message;
      row.appendChild(messageCell);

      table.appendChild(row);
    });

    commitList.appendChild(table);
  } catch (error) {
    document.getElementById("commit-list").innerHTML =
      "Сталася помилка під час запиту комітів";
  }
}

function clearPage() {
  repoList.innerHTML = "";
  repoDetails.style.display = "none";
}

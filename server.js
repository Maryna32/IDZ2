require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

app.use(express.static(path.join(__dirname, "public")));

async function makeGitHubRequest(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "GitHub-Repository-Viewer",
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const message =
      error.response?.data?.message || "Помилка запиту до GitHub API";
    throw { statusCode, message };
  }
}

app.get("/api/repos/:username", async (req, res) => {
  try {
    const repos = await makeGitHubRequest(
      `https://api.github.com/users/${req.params.username}/repos`
    );
    res.json(repos);
  } catch (error) {
    res.status(error.statusCode).json({ message: error.message });
  }
});

app.get("/api/repos/:username/:repo", async (req, res) => {
  try {
    const { username, repo } = req.params;
    const repoData = await makeGitHubRequest(
      `https://api.github.com/repos/${username}/${repo}`
    );
    res.json(repoData);
  } catch (error) {
    res.status(error.statusCode).json({ message: error.message });
  }
});

app.get("/api/repos/:username/:repo/languages", async (req, res) => {
  try {
    const { username, repo } = req.params;
    const languages = await makeGitHubRequest(
      `https://api.github.com/repos/${username}/${repo}/languages`
    );
    res.json(languages);
  } catch (error) {
    res.status(error.statusCode).json({ message: error.message });
  }
});

app.get("/api/repos/:username/:repo/branches", async (req, res) => {
  try {
    const { username, repo } = req.params;
    const branches = await makeGitHubRequest(
      `https://api.github.com/repos/${username}/${repo}/branches`
    );
    res.json(branches);
  } catch (error) {
    res.status(error.statusCode).json({ message: error.message });
  }
});

app.get("/api/repos/:username/:repo/commits/:branch", async (req, res) => {
  try {
    const { username, repo, branch } = req.params;
    const commits = await makeGitHubRequest(
      `https://api.github.com/repos/${username}/${repo}/commits?sha=${branch}`
    );
    res.json(commits);
  } catch (error) {
    res.status(error.statusCode).json({ message: error.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


import githubService from "../../services/github.service.js";
import { normalizeGitHubError } from "../../utils/github-error.js";
import { renderMarkdown } from "../../utils/markdown.js";

function handleGitHubError(res, error) {
  const normalized = normalizeGitHubError(error);

  return res.status(normalized.status).json({
    success: false,
    message: normalized.message,
  });
}

export async function getProfile(req, res) {
  try {
    const profile = await githubService.getProfile();

    return res.status(200).json({
      success: true,
      message: "GitHub profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    return handleGitHubError(res, error);
  }
}

export async function getProjects(req, res) {
  try {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const perPage = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(req.query.perPage, 10) || 20
      )
    );

    const projects = await githubService.getProjects({
      page,
      perPage,
    });

    return res.status(200).json({
      success: true,
      message: "GitHub projects retrieved successfully",
      count: projects.length,
      pagination: {
        page,
        perPage,
      },
      data: projects,
    });
  } catch (error) {
    return handleGitHubError(res, error);
  }
}

export async function getProject(req, res) {
  try {
    const { repositoryName } = req.params;

    if (!repositoryName || !repositoryName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Repository name is required.",
      });
    }

    const project = await githubService.getProject(
      repositoryName.trim()
    );

    return res.status(200).json({
      success: true,
      message: "GitHub project retrieved successfully",
      data: project,
    });
  } catch (error) {
    return handleGitHubError(res, error);
  }
}

export async function getProjectReadme(req, res) {
  try {
    const repositoryName = req.params.repositoryName?.trim();

    if (!repositoryName) {
      return res.status(400).json({
        success: false,
        message: "Repository name is required.",
      });
    }

    const readme = await githubService.getProjectReadme(
      repositoryName
    );

    return res.status(200).json({
      success: true,
      message: "GitHub README retrieved successfully",
      data: readme,
    });
  } catch (error) {
    return handleGitHubError(res, error);
  }
}


export async function getProjectReadmeHtml(req, res) {
  try {
    const repositoryName = req.params.repositoryName?.trim();

    if (!repositoryName) {
      return res.status(400).json({
        success: false,
        message: "Repository name is required.",
      });
    }

    const readme = await githubService.getProjectReadme(
      repositoryName
    );

    const html = renderMarkdown(readme.content);

    return res.status(200).json({
      success: true,
      message: "GitHub README HTML retrieved successfully",
      data: {
        repositoryName: readme.repositoryName,
        fileName: readme.fileName,
        html,
        htmlUrl: readme.htmlUrl,
        size: readme.size,
      },
    });
  } catch (error) {
    return handleGitHubError(res, error);
  }
}

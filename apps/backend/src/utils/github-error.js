
export function normalizeGitHubError(error) {
  const status = error.response?.status;

  if (status === 404) {
    return {
      status: 404,
      message: "The requested GitHub resource was not found.",
    };
  }

  if (status === 401 || status === 403) {
    return {
      status,
      message:
        status === 401
          ? "GitHub authentication failed. Check the server configuration."
          : "GitHub access was denied or the API rate limit may have been reached.",
    };
  }

  if (error.code === "ECONNABORTED") {
    return {
      status: 504,
      message: "GitHub took too long to respond. Please try again.",
    };
  }

  if (!error.response) {
    return {
      status: 503,
      message: "GitHub is temporarily unreachable. Please try again later.",
    };
  }

  return {
    status: 502,
    message: "An error occurred while retrieving data from GitHub.",
  };
}

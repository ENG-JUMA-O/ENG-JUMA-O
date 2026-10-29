export const getProjectReadmeResponseDto = (readme) => ({
  name: readme.name,
  path: readme.path,
  sha: readme.sha,
  size: readme.size,
  content: readme.content,
  encoding: readme.encoding,
  htmlUrl: readme.html_url,
});
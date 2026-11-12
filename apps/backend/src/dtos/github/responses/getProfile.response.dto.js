export const getProfileResponseDto = (profile, totalStars = 0) => ({
  login: profile.login,
  name: profile.name,
  bio: profile.bio,
  avatarUrl: profile.avatar_url,
  htmlUrl: profile.html_url,
  publicRepos: profile.public_repos,
  followers: profile.followers,
  following: profile.following,
  totalStars,
});
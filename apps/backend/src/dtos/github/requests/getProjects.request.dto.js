export const getProjectsRequestDto = (query) => ({
  page: query.page,
  perPage: query.per_page,
  sort: query.sort,
  direction: query.direction,
});
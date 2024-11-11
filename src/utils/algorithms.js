/**
 * https://www.mongodb.com/docs/v6.0/reference/operator/aggregation/skip/
 * Caculate skip value serve for paging
 */

export const pagingSkipValue = (page, itemsPerPage) => {
  // Always return 0 if page or itemsPerPage is not valid
  if (!page || !itemsPerPage) return 0
  if (page <= 0 || itemsPerPage <= 0) return 0

  /**
   * Example case each page has 12 items (itemsPerPage = 12)
   * Case 1: User stay on page 1 (page = 1) will take 1 - 1 = 0 then multiple by itemsPerPage = 0, the skip value at this time is 0, mean not skip record
   * Case 2: User stay on page 2 (page = 2) will take 2 - 1 = 1 then multiple by itemsPerPage = 12, the skip value at this time is 12, mean skip 12 record of previous page
   * ...
   * Case 3: User stay on page 3 (page = 3) will take 3 - 1 = 2 then multiple by itemsPerPage = 12, the skip value at this time is 24, mean skip 24 record of previous page
   * ... and so on
   */
  return (page - 1) * itemsPerPage
}

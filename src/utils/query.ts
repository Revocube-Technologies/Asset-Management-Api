export const generatePaginationQuery = ({ page = 1, perPage = 15 }: { page?: number; perPage?: number }) => ({
   take: perPage,
   skip: (page - 1) * perPage,
});

type PaginationMetaArgs = {
   page?: number;
   perPage?: number;
   count: number;
};
export const generatePaginationMeta = ({ page = 1, perPage = 15, count }: PaginationMetaArgs) => ({
   meta: {
      currentPage: page,
      itemsPerPage: perPage,
      totalItems: count,
      totalPages: Math.ceil(count / perPage),
   },
});

type TRangeQuery<T> = { min?: unknown; max?: unknown; field?: T };
export const generateRangeQuery = <T extends string = "createdAt">({ min, max, field = "createdAt" as T }: TRangeQuery<T>) => ({
   [field]: {
      ...(min !== undefined ? { gte: min } : {}),
      ...(max !== undefined ? { lte: max } : {}),
   },
});

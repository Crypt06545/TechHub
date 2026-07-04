import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ProductPagination = ({
  currentPage,
  hasMore,
  isFetching = false,
  onPrevious,
  onNext,
  onPageClick,
  maxVisiblePages = 5,
}) => {
  if (currentPage <= 1 && !hasMore) return null;

  const start = Math.max(1, currentPage - maxVisiblePages + 1);
  const pages = [];
  for (let i = start; i <= currentPage; i++) pages.push(i);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1 && !isFetching) onPrevious();
            }}
            className={
              currentPage <= 1 || isFetching
                ? "pointer-events-none opacity-50"
                : ""
            }
          />
        </PaginationItem>

        {start > 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!isFetching) onPageClick(1);
                }}
              >
                1
              </PaginationLink>
            </PaginationItem>
            {start > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              isActive={page === currentPage}
              onClick={(e) => {
                e.preventDefault();
                if (!isFetching && page !== currentPage) onPageClick(page);
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {hasMore && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (hasMore && !isFetching) onNext();
            }}
            className={
              !hasMore || isFetching ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ProductPagination;

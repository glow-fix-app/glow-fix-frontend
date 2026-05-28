import React, { useMemo } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  EmptyState,
  Table,
  Skeleton,
} from "@heroui/react";
import { EllipsisHorizontalIcon, InboxIcon } from "@heroicons/react/24/outline";

const CELL_PAD = "px-4 py-3.5 sm:px-6 sm:py-4";
const HEADER_CLASS = [
  "h-11 border-0 border-b border-border-default border-r-0 bg-white",
  CELL_PAD,
  "text-left text-[13px] font-medium leading-5 text-text-tertiary",
  "shadow-none",
].join(" ");
const CELL_CLASS = `${CELL_PAD} border-0 border-r-0 align-middle text-[13px] font-normal leading-5 text-text-secondary`;
const ROW_CLASS = [
  "border-0 border-b border-border-default border-r-0 bg-white",
  "transition-colors duration-150",
  "hover:bg-surface-hover",
  "last:border-b-0",
  "data-[hovered]:bg-surface-hover",
].join(" ");

function alignClass(align) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

function responsiveClass(hideBelow) {
  if (!hideBelow) return "";
  return `hidden ${hideBelow}:table-cell`;
}

/** DD/MM/YYYY — shared by admin & provider tables */
export function formatTableDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function TableCellText({ children, muted = false, strong = false, className = "" }) {
  const tone = strong
    ? "font-medium text-text-secondary"
    : muted
      ? "text-text-tertiary"
      : "text-text-secondary";
  return (
    <span className={`text-[13px] leading-5 ${tone} ${className}`}>{children}</span>
  );
}

export function TableActionsMenu({ ariaLabel, items }) {
  return (
    <Dropdown>
      <DropdownTrigger
        isIconOnly
        variant="light"
        size="sm"
        aria-label={ariaLabel}
        className="min-w-0 text-text-muted hover:bg-transparent hover:text-text-secondary"
      >
        <EllipsisHorizontalIcon className="h-5 w-5" />
      </DropdownTrigger>
      <DropdownPopover placement="bottom end">
        <DropdownMenu aria-label={ariaLabel}>
          {items.map((item) => (
            <DropdownItem key={item.key} variant={item.variant}>
              {item.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </DropdownPopover>
    </Dropdown>
  );
}

function TableEmptyContent({ title, description }) {
  return (
    <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover">
        <InboxIcon className="h-6 w-6 text-text-muted" />
      </div>
      <div>
        <span className="text-sm font-medium text-text-primary">{title}</span>
        {description ? (
          <p className="mt-0.5 text-[13px] text-text-tertiary">{description}</p>
        ) : null}
      </div>
    </EmptyState>
  );
}

/**
 * Shared dashboard table — bordered card, row hover, HeroUI empty & pagination.
 */
export default function DashboardTable({
  columns,
  data = [],
  isLoading = false,
  page = 1,
  totalPages: totalPagesProp,
  totalItems: totalItemsProp,
  rowsPerPage = 8,
  onPageChange,
  renderCell,
  sortDescriptor,
  onSortChange,
  emptyTitle = "No records found",
  emptyDescription = "",
  ariaLabel = "Data table",
  minWidth = "min-w-[48rem]",
  serverSide = false,
}) {
  const tableColumns = useMemo(
    () =>
      columns.map((col) => ({
        id: col.id ?? col.key,
        name: col.name ?? col.label ?? "",
        isRowHeader: col.isRowHeader,
        allowsSorting: col.allowsSorting,
        align: col.align ?? "left",
        hideBelow: col.hideBelow,
        className: col.className ?? "",
      })),
    [columns],
  );

  const totalItems = serverSide ? (totalItemsProp ?? 0) : data.length;
  const computedTotalPages =
    rowsPerPage && totalItems > 0 ? Math.ceil(totalItems / rowsPerPage) : 1;
  const totalPages = totalPagesProp ?? computedTotalPages;
  const showFooter = Boolean(onPageChange);

  const paginatedItems = useMemo(() => {
    if (serverSide) return data;
    if (!rowsPerPage) return data;
    const start = (page - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page, rowsPerPage, serverSide]);

  const skeletonRows = useMemo(() => {
    return Array.from({ length: rowsPerPage || 5 }).map((_, idx) => ({
      id: `skeleton-${idx}`,
      isSkeleton: true,
    }));
  }, [rowsPerPage]);

  const displayItems = isLoading ? skeletonRows : paginatedItems;

  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages],
  );

  const rangeStart =
    totalItems === 0 ? 0 : (page - 1) * (rowsPerPage ?? totalItems) + 1;
  const rangeEnd = rowsPerPage
    ? Math.min(page * rowsPerPage, totalItems)
    : totalItems;

  const firstColumnId = tableColumns[0]?.id;
  const canPrevious = page > 1;
  const canNext = page < totalPages && totalPages > 0;

  return (
    <div className="w-full overflow-hidden rounded-md border border-border-default bg-white font-sans shadow-none">
      <Table className="w-full rounded-none bg-transparent">
        <Table.ScrollContainer className="w-full overflow-x-auto">
          <Table.Content
            aria-label={ariaLabel}
            sortDescriptor={sortDescriptor}
            onSortChange={onSortChange}
            className={`w-full border-collapse ${minWidth} [&_td]:border-r-0 [&_th]:border-r-0`}
          >
            <Table.Header columns={tableColumns}>
              {(column) => (
                <Table.Column
                  id={column.id}
                  isRowHeader={column.isRowHeader ?? column.id === firstColumnId}
                  allowsSorting={column.allowsSorting}
                  className={`${HEADER_CLASS} ${alignClass(column.align)} ${responsiveClass(column.hideBelow)} ${column.className}`}
                >
                  {column.name}
                </Table.Column>
              )}
            </Table.Header>
            <Table.Body
              items={displayItems}
              renderEmptyState={
                () => !isLoading && (
                  <TableEmptyContent
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                )
              }
            >
              {(item) => (
                <Table.Row id={item.id} className={ROW_CLASS}>
                  <Table.Collection items={tableColumns}>
                    {(column) => (
                      <Table.Cell
                        className={`${CELL_CLASS} ${alignClass(column.align)} ${responsiveClass(column.hideBelow)}`}
                      >
                        {item.isSkeleton ? (
                          <Skeleton
                            className={`h-4 rounded ${column.align === "right" ? "ml-auto w-16" :
                              column.align === "center" ? "mx-auto w-20" :
                                "w-3/4"
                              }`}
                          />
                        ) : renderCell ? (
                          renderCell(item, column.id)
                        ) : (
                          (item[column.id] ?? "")
                        )}
                      </Table.Cell>
                    )}
                  </Table.Collection>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>

        {showFooter && totalItems > 0 && (
          <Table.Footer className="border-t border-border-default bg-white px-4 py-2.5 sm:px-6">
            <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-between">
              {/* Results summary */}
              <span className="text-[13px] font-normal text-text-tertiary">
                Results: {rangeStart} - {rangeEnd} of {totalItems}
              </span>

              {/* Page controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!canPrevious}
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  className="rounded-md px-2.5 py-1 text-[13px] font-normal text-text-tertiary transition-colors hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>

                {pages.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPageChange(p)}
                    className={`flex size-8 items-center justify-center rounded-md text-[13px] font-medium transition-colors ${p === page
                      ? "bg-brand-500 text-white"
                      : "text-text-secondary hover:bg-surface-hover"
                      }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  className="rounded-md px-2.5 py-1 text-[13px] font-normal text-text-tertiary transition-colors hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </Table.Footer>
        )}
      </Table>
    </div>
  );
}

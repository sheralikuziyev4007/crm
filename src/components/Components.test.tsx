import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StatusBadge from "./StatusBadge";
import Pagination from "./Pagination";
import StatusChart from "./StatusChart";
import { seedClients } from "../utils/idGenerator";

describe("StatusBadge", () => {
  it("renders a known status", () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("falls back gracefully for an unknown status", () => {
    render(<StatusBadge status="archived" />);
    expect(screen.getByText("archived")).toBeInTheDocument();
  });
});

describe("Pagination", () => {
  const props = { pageSize: 10, onPageChange: vi.fn(), onPageSizeChange: vi.fn() };

  it("renders nothing when everything fits on the smallest page size", () => {
    const { container } = render(<Pagination {...props} page={1} total={5} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("disables 'previous' on the first page and 'next' on the last", () => {
    const { rerender } = render(<Pagination {...props} page={1} total={25} />);
    expect(screen.getByRole("button", { name: "Предыдущая страница" })).toBeDisabled();
    rerender(<Pagination {...props} page={3} total={25} />);
    expect(screen.getByRole("button", { name: "Следующая страница" })).toBeDisabled();
    expect(screen.getByText("21–25 из 25")).toBeInTheDocument();
  });

  it("marks the current page and reports page changes", async () => {
    const onPageChange = vi.fn();
    render(<Pagination {...props} onPageChange={onPageChange} page={2} total={30} />);
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});

describe("StatusChart", () => {
  it("describes the distribution for screen readers", () => {
    render(<StatusChart clients={seedClients()} />);
    expect(screen.getByRole("img", { name: /всего 14/ })).toBeInTheDocument();
    expect(screen.getByText("5 · 36%")).toBeInTheDocument();
  });

  it("renders an empty chart without NaN", () => {
    render(<StatusChart clients={[]} />);
    expect(screen.getAllByText("0 · 0%")).toHaveLength(3);
  });
});

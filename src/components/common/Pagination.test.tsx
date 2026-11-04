import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./Pagination";

const props = {
  pageSize: 10,
  pageSizeOptions: [5, 10, 20],
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

describe("Pagination", () => {
  it("renders nothing when everything fits on the smallest page size", () => {
    const { container } = render(<Pagination {...props} page={1} total={5} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("disables 'previous' on the first page and 'next' on the last", () => {
    const { rerender } = render(<Pagination {...props} page={1} total={25} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    rerender(<Pagination {...props} page={3} total={25} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByText("21–25 of 25")).toBeInTheDocument();
  });

  it("marks the current page and reports changes", async () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        {...props}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        page={2}
        total={30}
      />,
    );
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");

    await userEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    await userEvent.selectOptions(screen.getByLabelText("Per page"), "20");
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});

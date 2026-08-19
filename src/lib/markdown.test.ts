import { describe, expect, it } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown", () => {
  it("renders headings, emphasis, and lists", () => {
    expect(renderMarkdown("# Title")).toBe("<h1>Title</h1>");
    expect(renderMarkdown("## Sub")).toBe("<h2>Sub</h2>");
    expect(renderMarkdown("Hello **bold** and *em* and `code`.")).toBe(
      "<p>Hello <strong>bold</strong> and <em>em</em> and <code>code</code>.</p>",
    );
    expect(renderMarkdown("- one\n- two")).toBe(
      "<ul><li>one</li><li>two</li></ul>",
    );
  });

  it("escapes HTML in the source", () => {
    expect(renderMarkdown("A <script>alert(1)</script>")).toBe(
      "<p>A &lt;script&gt;alert(1)&lt;/script&gt;</p>",
    );
  });
});

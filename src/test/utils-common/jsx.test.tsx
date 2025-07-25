import { deepStrictEqual as equal } from "assert";
import { JSX } from "#utils";
import { renderElement, renderElementToText } from "../../lib/utils-common/jsx.js";

describe("JSX", () => {
    it("Handles null/undefined", () => {
        equal(renderElement(null), ``);
        equal(renderElement(undefined), ``);
    });

    it("Works with basic case", () => {
        const element = (
            <details data-a="foo" open>
                Text
            </details>
        );
        equal(renderElement(element), '<details data-a="foo" open>Text</details>');
    });

    it("Escapes string content", () => {
        equal(renderElement(<div>&lt;&gt;</div>), "<div>&lt;&gt;</div>");
    });

    it("Renders to the empty string if no component is provided", () => {
        equal(renderElement(null), "");
        equal(renderElement(void 0), "");
    });

    it("Supports component functions", () => {
        const Component = (props: { text: string }) => <span>{props.text}</span>;

        equal(renderElement(<Component text="hi!" />), "<span>hi!</span>");
    });

    it("Recognizes void elements", () => {
        equal(renderElement(<div id="main" />), '<div id="main"></div>');
    });

    it("Does not render null or undefined attributes", () => {
        equal(renderElement(<div data-foo={null} />), "<div></div>");
        equal(renderElement(<div data-foo={void 0} />), "<div></div>");
    });

    it("Handles false boolean attributes", () => {
        equal(renderElement(<details open={false} />), "<details></details>");
    });

    it("Supports children", () => {
        const Component = (props: { text: string }) => <span>{props.text}</span>;

        const element = (
            <div>
                {null}
                {undefined}
                {["a", "b"]}
                <Component text="hi" />
            </div>
        );

        equal(renderElement(element), "<div>ab<span>hi</span></div>");
    });

    it("Supports fragments", () => {
        equal(
            renderElement(
                <>
                    <div>A</div>
                    <div>B</div>
                </>,
            ),
            "<div>A</div><div>B</div>",
        );
    });

    it("Supports <Raw /> for injecting HTML", () => {
        equal(renderElement(<JSX.Raw html="<strong>foo</strong>" />), "<strong>foo</strong>");

        // This is should never be used in common usage, but it shouldn't break
        equal(JSX.Raw({ html: "" }), null);
    });

    it("Supports SVG elements", () => {
        equal(
            renderElement(
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 10,30" />
                </svg>,
            ),
            `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M 10,30"></path>
            </svg>`.replace(/^\s*|\r?\n/gm, ""),
        );
    });

    it("Properly escapes quotes in html attributes", () => {
        const quot = `test"quote`;
        equal(renderElement(<div data-foo={quot} />), `<div data-foo="test&quot;quote"></div>`);
    });

    it("Handles non-string attributes", () => {
        equal(renderElement(<div data-foo={123} />), `<div data-foo="123"></div>`);
    });

    it("Handles void elements", () => {
        equal(renderElement(<br />), `<br/>`);
    });

    it("Handles boolean children", () => {
        equal(renderElement(<span>{true}{false}</span>), `<span></span>`);
    });

    it("Handles zero", () => {
        equal(renderElement(<span>{0}</span>), `<span>0</span>`);
    });
});

describe("JSX.renderElementToText", () => {
    it("Handles null/undefined", () => {
        equal(renderElementToText(null), ``);
        equal(renderElementToText(undefined), ``);
    });

    it("Handles zero", () => {
        equal(renderElementToText(<span>{0}</span>), `0`);
    });

    it("Handles boolean children", () => {
        equal(renderElementToText(<span>{true}{false}</span>), ``);
    });

    it("Handles Raw elements", () => {
        equal(renderElementToText(<JSX.Raw html="<span>" />), `<span>`);
    });

    it("Handles components", () => {
        function Component() {
            return <span>hi</span>;
        }
        equal(renderElementToText(<Component />), `hi`);
    });
});

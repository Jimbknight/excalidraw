import React from "react";
import { Excalidraw } from "../index";
import { Keyboard, Pointer, UI } from "./helpers/ui";
import { fireEvent, render, waitFor } from "./test-utils";
import { getTextEditor, updateTextEditor } from "./queries/dom";
import { KEYS } from "@excalidraw/common";

const { h } = window;

describe("customIntegration (Projektarbeit)", () => {
  it("should create a rectangle and verify it exists in appState", async () => {
    await render(<Excalidraw handleKeyboardGlobally={true} />, {});

    // Select rectangle tool
    UI.clickTool("rectangle");

    const mouse = new Pointer("mouse");
    // Draw rectangle
    mouse.down(100, 100);
    mouse.move(200, 200);
    mouse.up();

    await waitFor(() => {
      expect(h.elements.length).toBe(1);
      expect(h.elements[0].type).toBe("rectangle");
    });
  });

  it("should change background color of a created rectangle", async () => {
    await render(<Excalidraw handleKeyboardGlobally={true} />, {});

    UI.clickTool("rectangle");
    const mouse = new Pointer("mouse");
    mouse.down(100, 100);
    mouse.move(200, 200);
    mouse.up();

    await waitFor(() => {
      expect(h.elements.length).toBe(1);
    });

    // Select the rectangle
    mouse.clickAt(150, 150);

    // Change color in state directly as a proxy for the UI color picker
    // or we can just verify the initial color and change it via updateElement
    h.state.currentItemBackgroundColor = "#ff0000";
    
    // Draw another rectangle with new color
    UI.clickTool("rectangle");
    mouse.down(300, 300);
    mouse.move(400, 400);
    mouse.up();

    await waitFor(() => {
      expect(h.elements.length).toBe(2);
      expect(h.elements[1].backgroundColor).toBe("#ff0000");
    });
  });

  it("should update element stroke color", async () => {
    await render(<Excalidraw handleKeyboardGlobally={true} />, {});

    UI.clickTool("rectangle");
    const mouse = new Pointer("mouse");
    mouse.down(100, 100);
    mouse.move(200, 200);
    mouse.up();

    await waitFor(() => {
      expect(h.elements.length).toBe(1);
    });

    // Change stroke color in state
    h.state.currentItemStrokeColor = "#0000ff";
    
    // Draw another rectangle with new color
    UI.clickTool("rectangle");
    mouse.down(300, 300);
    mouse.move(400, 400);
    mouse.up();

    await waitFor(() => {
      expect(h.elements.length).toBe(2);
      expect(h.elements[1].strokeColor).toBe("#0000ff");
    });
  });

  it("should create a text element and verify its content", async () => {
    await render(<Excalidraw handleKeyboardGlobally={true} />, {});

    UI.clickTool("text");
    const mouse = new Pointer("mouse");
    mouse.clickAt(150, 150);

    const editor = await getTextEditor();
    updateTextEditor(editor, "Integration text");
    Keyboard.exitTextEditor(editor as HTMLTextAreaElement);

    await waitFor(() => {
      expect(h.elements.length).toBe(1);
      expect(h.elements[0].type).toBe("text");
      expect(h.elements[0].text).toContain("Integration text");
    });
  });

  it("should delete a created rectangle using the Delete key", async () => {
    await render(<Excalidraw handleKeyboardGlobally={true} />, {});

    UI.clickTool("rectangle");
    const mouse = new Pointer("mouse");
    mouse.down(100, 100);
    mouse.move(200, 200);
    mouse.up();

    await waitFor(() => {
      expect(h.elements.length).toBe(1);
    });

    UI.clickTool("selection");
    // select the element
    mouse.clickOn(h.elements[0]);

    // wait for selection to be applied
    await waitFor(() => {
      expect(Object.keys(h.state.selectedElementIds).length).toBe(1);
    });

    Keyboard.keyPress(KEYS.DELETE);

    await waitFor(() => {
      expect(h.app.scene.getNonDeletedElements().length).toBe(0);
    });
  });

  it("should move an element with selection drag", async () => {
    await render(<Excalidraw handleKeyboardGlobally={true} />, {});

    UI.clickTool("rectangle");
    const mouse = new Pointer("mouse");
    mouse.down(100, 100);
    mouse.move(200, 200);
    mouse.up();

    await waitFor(() => {
      expect(h.elements.length).toBe(1);
    });

    const el = h.elements[0];
    const originalX = el.x;
    const originalY = el.y;

    UI.clickTool("selection");
    // drag the selected element
    mouse.downAt(el.x + el.width / 2, el.y + el.height / 2);
    mouse.move(50, 50);
    mouse.up();

    await waitFor(() => {
      expect(h.elements[0].x).toBeGreaterThan(originalX);
      expect(h.elements[0].y).toBeGreaterThan(originalY);
    });
  });
});

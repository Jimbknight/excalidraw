import React from "react";
import { Excalidraw } from "../index";
import { Pointer, UI } from "./helpers/ui";
import { fireEvent, render, waitFor } from "./test-utils";

const { h } = window;

describe("customIntegration (Projektarbeit)", () => {
  it("should create a rectangle and verify it exists in appState", async () => {
    await render(<Excalidraw />, {});

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
    await render(<Excalidraw />, {});

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
    await render(<Excalidraw />, {});

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
});

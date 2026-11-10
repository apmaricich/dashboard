import React, { useState, useRef, useCallback } from "react";
import { getAllWidgetTypes, getWidgetByType } from "../lib/widget-registry.js";
import { fuzzyFilter } from "../lib/fuzzy-match.js";
import FoundationWidget from "../components/FoundationWidget.js";
import { getTheme } from "../themes/index.js";
import type { LayoutResult } from "../lib/layout.js";
import type { WidgetConfig } from "../config/loader.js";

export interface CallupWidgetInfo {
  id: string;
  name: string;
  description: string;
}

// Ink's Key object (subset of relevant fields)
interface InkKey {
  escape?: boolean;
  upArrow?: boolean;
  downArrow?: boolean;
  return?: boolean;
  backspace?: boolean;
}

export function useCallup() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);

  // Refs to read latest state in input handler
  const openRef = useRef(open);
  const queryRef = useRef(query);
  const selectedRef = useRef(selected);
  const activeWidgetRef = useRef(activeWidget);

  openRef.current = open;
  queryRef.current = query;
  selectedRef.current = selected;
  activeWidgetRef.current = activeWidget;

  const toggle = useCallback((value: boolean) => {
    if (value) {
      setOpen(true);
      setQuery("");
      setSelected(0);
      setActiveWidget(null);
    } else {
      setOpen(false);
      setQuery("");
      setSelected(0);
      setActiveWidget(null);
    }
  }, []);

  const select = useCallback((typeId: string) => {
    setActiveWidget(typeId);
  }, []);

  const backToList = useCallback(() => {
    setActiveWidget(null);
  }, []);

  const handleInput = useCallback(
    (input: string, key?: InkKey) => {
      const isOpen = openRef.current;
      const q = queryRef.current;
      const sel = selectedRef.current;
      const widget = activeWidgetRef.current;

      if (isOpen && widget) {
        // Widget is open; only escape returns to list
        if (key?.escape) {
          backToList();
        }
        return;
      }

      if (isOpen) {
        const widgetTypes = getAllWidgetTypes().sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        const filtered = fuzzyFilter(
          q,
          widgetTypes,
          (w) => `${w.name} ${w.type}`,
          10
        );

        if (key?.escape) {
          setOpen(false);
          setQuery("");
          setSelected(0);
          setActiveWidget(null);
        } else if (key?.upArrow) {
          setSelected(Math.max(0, sel - 1));
        } else if (key?.downArrow) {
          setSelected(Math.min(filtered.length - 1, sel + 1));
        } else if (key?.return) {
          if (filtered.length > 0 && sel < filtered.length) {
            select(filtered[sel].item.type);
          }
        } else if (key?.backspace) {
          setQuery(q.slice(0, -1));
          setSelected(0);
        } else if (input.length === 1) {
          setQuery(q + input);
          setSelected(0);
        }
      } else if (input === "c") {
        toggle(true);
      }
    },
    []
  );

  // Compute filtered results for display
  const widgetTypes = getAllWidgetTypes().sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const filteredResults = fuzzyFilter(
    query,
    widgetTypes,
    (w) => `${w.name} ${w.type}`,
    10
  );

  const displayResults: CallupWidgetInfo[] = filteredResults.map((r) => ({
    id: r.item.type,
    name: r.item.name,
    description: r.item.description,
  }));

  // Get active widget component if selected
  let activeWidgetComponent: React.ReactNode = null;
  if (activeWidget) {
    const entry = getWidgetByType(activeWidget);
    if (entry) {
      const WidgetComponent = entry.component;
      const theme = getTheme("liturgical", { date: new Date() });
      const layout: LayoutResult = {
        x: 0,
        y: 0,
        width: 50,
        height: 20,
      };
      const config: WidgetConfig = {
        name: entry.name,
        type: entry.type,
        order: 1,
        refresh: 0,
      };
      activeWidgetComponent = (
        <FoundationWidget config={config} layout={layout} theme={theme}>
          <WidgetComponent />
        </FoundationWidget>
      );
    }
  }

  return {
    open,
    query,
    selected,
    activeWidget,
    toggle,
    select,
    backToList,
    handleInput,
    displayResults,
    activeWidgetComponent,
  };
}
"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store/store";
import { toggleCommandPalette } from "../../../store/slices/uiSlice";
import "./CommandPalette.css"; // Basic antd-like overlay styling

export function CommandPalette() {
  const open = useSelector((state: RootState) => state.ui.commandPaletteOpen);
  const dispatch = useDispatch();
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        dispatch(toggleCommandPalette());
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [dispatch]);

  if (!open) return null;

  return (
    <div
      className="nurox-cmd-overlay"
      onClick={() => dispatch(toggleCommandPalette())}
    >
      <div className="nurox-cmd-content" onClick={(e) => e.stopPropagation()}>
        <Command>
          <Command.Input placeholder="Type a command or search..." autoFocus />

          <Command.List>
            <Command.Empty>No results found.</Command.Empty>

            <Command.Group heading="Navigation">
              <Command.Item
                onSelect={() => {
                  router.push("/dashboard");
                  dispatch(toggleCommandPalette());
                }}
              >
                Go to Dashboard
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  router.push("/sales");
                  dispatch(toggleCommandPalette());
                }}
              >
                Go to Sales
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  router.push("/projects");
                  dispatch(toggleCommandPalette());
                }}
              >
                Go to Projects
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Actions">
              <Command.Item
                onSelect={() => {
                  // Trigger open create deal modal global state
                  dispatch(toggleCommandPalette());
                }}
              >
                Create New Deal
              </Command.Item>
              <Command.Item>Create New Task</Command.Item>
            </Command.Group>

            <Command.Group heading="Settings">
              <Command.Item>Theme Settings</Command.Item>
              <Command.Item>Manage Users (Admin)</Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

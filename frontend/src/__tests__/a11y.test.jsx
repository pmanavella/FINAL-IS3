// frontend/src/__tests__/a11y.test.jsx
import React from "react";
import { describe, test, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const Button = ({ children }) => <button aria-label="primary">{children}</button>

test('aria-label presente', ()=>{ render(<Button>Go</Button>); expect(screen.getByLabelText('primary')).toBeInTheDocument() })
test('role button', ()=>{ render(<Button>Go</Button>); expect(screen.getByRole('button')).toBeEnabled() })
test('texto visible', ()=>{ render(<Button>Go</Button>); expect(screen.getByText('Go')).toBeVisible() })
test('no hay alert al inicio', ()=>{ render(<div />); expect(screen.queryByRole('alert')).toBeNull() })

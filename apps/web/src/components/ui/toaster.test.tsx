import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Toaster, toast } from './toaster';

describe('Toaster', () => {
  it('renders nothing when there are no toasts', () => {
    const { container } = render(<Toaster />);
    expect(container.innerHTML).toBe('');
  });

  it('renders a toast after calling toast()', async () => {
    render(<Toaster />);
    act(() => { toast({ title: 'Hello', variant: 'success' }); });

    expect(await screen.findByText('Hello')).toBeInTheDocument();
  });

  it('renders description when provided', async () => {
    render(<Toaster />);
    act(() => { toast({ title: 'File saved', description: 'Your changes are safe', variant: 'success' }); });

    expect(await screen.findByText('File saved')).toBeInTheDocument();
    expect(await screen.findByText('Your changes are safe')).toBeInTheDocument();
  });

  it('applies error variant classes', async () => {
    render(<Toaster />);
    act(() => { toast({ title: 'Error', variant: 'error' }); });

    const el = await screen.findByText('Error');
    const toastRoot = el.closest('[class*="border"]');
    expect(toastRoot?.className).toContain('border-destructive');
  });
});

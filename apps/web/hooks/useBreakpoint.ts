import { Grid } from "antd";

const { useBreakpoint: antdUseBreakpoint } = Grid;

/**
 * Breakpoint hook wrapping antd's Grid.useBreakpoint.
 * Provides convenient boolean helpers for responsive logic.
 *
 * @example
 * const { isMobile, isTablet, isDesktop } = useBreakpoint();
 * {isMobile ? <MobileNav /> : <Sidebar />}
 */
export function useBreakpoint() {
  const screens = antdUseBreakpoint();

  return {
    /** Raw antd breakpoint map */
    screens,
    /** < 576px */
    isMobile: !screens.sm,
    /** >= 576px && < 992px */
    isTablet: !!screens.sm && !screens.lg,
    /** >= 992px */
    isDesktop: !!screens.lg,
    /** >= 1200px */
    isWide: !!screens.xl,
    /** >= 1600px */
    isUltraWide: !!screens.xxl,
  };
}
